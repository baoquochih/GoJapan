import axios from 'axios';
import db from '../config/db.js';

// Groq API — Free tier: 14,400 req/day, không bị giới hạn region
// Docs: https://console.groq.com/docs/openai
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant"; // Nhanh nhất, miễn phí

/**
 * Gọi Groq API (OpenAI-compatible format)
 */
async function callGroq(userMessage, history, systemInstruction) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_key_here') {
        throw new Error("GROQ_API_KEY chưa được cấu hình trong .env");
    }

    // Chuyển history từ Gemini format sang OpenAI format
    const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts?.[0]?.text || h.content || ''
        })),
        { role: "user", content: userMessage }
    ];

    const response = await axios.post(GROQ_API_URL, {
        model: GROQ_MODEL,
        messages,
        max_tokens: 600,
        temperature: 0.7,
    }, {
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        timeout: 15000
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from Groq");
    return text;
}

/**
 * Lấy lịch sử chat của user
 */
export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const [history] = await db.query(
            "SELECT role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC",
            [userId]
        );
        res.json(history);
    } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error.message);
        res.status(500).json({ message: "Không thể lấy lịch sử chat" });
    }
};

/**
 * Xử lý tin nhắn mới và gọi AI
 */
export const sendChatMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ message: "Tin nhắn không được để trống" });
        }

        const cleanMsg = message.trim();

        // 1. Lưu tin nhắn User vào database
        await db.query(
            "INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'user', ?)",
            [userId, cleanMsg]
        );

        // 2. Lấy lịch sử gần nhất (tối đa 10 messages = 5 cặp hỏi-đáp)
        const [recentRows] = await db.query(
            "SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
            [userId]
        );
        const allMsgs = recentRows.reverse();
        // Bỏ tin nhắn cuối (chính là tin vừa lưu) — sẽ gửi trực tiếp qua API
        const historyMsgs = allMsgs.slice(0, allMsgs.length - 1);

        // Build valid history: bắt đầu = user, xen kẽ, kết thúc = model
        const validHistory = [];
        let expectRole = 'user';
        for (const msg of historyMsgs) {
            if (msg.role === expectRole) {
                validHistory.push({ role: msg.role, parts: [{ text: msg.content }] });
                expectRole = expectRole === 'user' ? 'model' : 'user';
            }
        }
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role !== 'model') {
            validHistory.pop();
        }

        // 3. Tìm context từ DB
        let contextInfo = "";
        try {
            const sanitize = (s) => s.replace(/['"`;\\\n\r]/g, '').trim().slice(0, 50);
            const clean = sanitize(cleanMsg);

            if (clean.length === 1) {
                const [km] = await db.query(
                    "SELECT Character, Meaning, Onyomi, Kunyomi FROM kanji WHERE Character = ? LIMIT 1",
                    [clean]
                );
                if (km.length > 0) {
                    contextInfo += `Kanji ${km[0].Character}: nghĩa="${km[0].Meaning}", On=${km[0].Onyomi}, Kun=${km[0].Kunyomi}. `;
                }
            }

            const keyword = clean.split(/\s+/).find(w => /^[a-zA-Z]{2,20}$/.test(w));
            if (keyword) {
                const [vm] = await db.query(
                    "SELECT Word, Furigana, Meaning FROM vocabulary WHERE Meaning LIKE ? LIMIT 3",
                    [`%${keyword}%`]
                );
                if (vm.length > 0) {
                    contextInfo += `Từ vựng liên quan: ${vm.map(v => `${v.Word}(${v.Furigana})=${v.Meaning}`).join(', ')}. `;
                }
            }
        } catch (dbErr) {
            console.warn("DB context lookup skipped:", dbErr.message);
        }

        // 4. System prompt
        const systemInstruction = [
            "Bạn là trợ lý học tiếng Nhật GoJapan AI. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn.",
            "Chỉ trả lời về tiếng Nhật (Kana, Từ vựng, Kanji, ngữ pháp). Câu hỏi không liên quan hãy lịch sự từ chối.",
            contextInfo ? `Thông tin từ cơ sở dữ liệu GoJapan: ${contextInfo}` : "",
            "Dùng furigana khi ví dụ. Trả lời tối đa 3-4 câu trừ khi được yêu cầu giải thích chi tiết."
        ].filter(Boolean).join("\n");

        // 5. Gọi AI
        let aiResponse;
        try {
            aiResponse = await callGroq(cleanMsg, validHistory, systemInstruction);
            console.log(`✅ Groq OK — ${aiResponse.length} chars`);
        } catch (aiErr) {
            const status = aiErr.response?.status;
            const errMsg = aiErr.response?.data?.error?.message || aiErr.message;
            console.error(`❌ Groq ${status || 'ERR'}:`, errMsg?.slice(0, 150));

            if (status === 429) {
                aiResponse = "⚠️ AI đang quá tải, vui lòng thử lại sau vài giây nhé!";
            } else if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
                aiResponse = "⚠️ Chưa cấu hình GROQ_API_KEY trong file .env của backend.";
            } else {
                aiResponse = "Mình đang gặp sự cố kỹ thuật. Vui lòng thử lại sau!";
            }
        }

        // 6. Lưu response vào DB
        await db.query(
            "INSERT INTO chat_messages (user_id, role, content) VALUES (?, 'model', ?)",
            [userId, aiResponse]
        );

        res.json({ content: aiResponse });

    } catch (error) {
        console.error("Chat API error:", error.message);
        res.status(500).json({ message: "Lỗi server, vui lòng thử lại" });
    }
};
