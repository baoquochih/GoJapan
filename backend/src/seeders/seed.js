import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình kết nối Database sử dụng biến môi trường từ .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT.trim(), 10) : 4000,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
    database: process.env.DB_NAME || 'japanese_learning_db',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
};

// Hàm chia nhỏ mảng thành các phần bằng nhau (mỗi phần 20 items)
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

async function migrateData() {
    const connection = await mysql.createConnection(dbConfig);
    console.log("🚀 Bắt đầu quá trình Migration...");

    try {
        // --- 0. CLEAR EXISTING DATA ---
        console.log("🧹 Đang dọn dẹp dữ liệu cũ...");
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        await connection.execute('TRUNCATE TABLE `statistic`');
        await connection.execute('TRUNCATE TABLE `quiz_sessions`');
        await connection.execute('TRUNCATE TABLE `quiz_items`');
        await connection.execute('TRUNCATE TABLE `quiz`');
        await connection.execute('TRUNCATE TABLE `vocabulary`');
        await connection.execute('TRUNCATE TABLE `kanji`');
        await connection.execute('TRUNCATE TABLE `kana`');
        await connection.execute('TRUNCATE TABLE `lesson`');
        
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        console.log("✅ Dọn dẹp hoàn tất.");

        // --- 1. MIGRATION VOCABULARY AND QUIZZES ---
        const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
        for (const lvl of levels) {
            const vocabPath = path.join(__dirname, `../../data/vocabulary/${lvl}.json`);
            if (fs.existsSync(vocabPath)) {
                const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
                const chunks = chunkArray(data, 20); // Chia 20 từ mỗi bài

                for (let i = 0; i < chunks.length; i++) {
                    const jlptCode = lvl.toUpperCase();
                    
                    // Assign difficulty based on ENUM requirements
                    let difficulty = 'Normal';
                    if (['N5', 'N4', 'N3'].includes(jlptCode)) {
                        difficulty = 'Hard';
                    } else if (['N2', 'N1'].includes(jlptCode)) {
                        difficulty = 'Instant Death';
                    }

                    // 1.1 Create Lesson
                    const [resLesson] = await connection.execute(
                        "INSERT INTO `lesson` (JLPT_Level, Title, Type) VALUES (?, ?, ?)",
                        [jlptCode, `Vocabulary ${jlptCode} - Lesson ${i + 1}`, 'Vocabulary']
                    );
                    const lessonId = resLesson.insertId;

                    // 1.2 Create Quiz
                    const [resQuiz] = await connection.execute(
                        "INSERT INTO `quiz` (QuizTitle, Difficulty) VALUES (?, ?)",
                        [`Quiz Vocabulary ${jlptCode} - Lesson ${i + 1}`, difficulty]
                    );
                    const quizId = resQuiz.insertId;

                    for (const item of chunks[i]) {
                        const [resVocab] = await connection.execute(
                            "INSERT INTO `vocabulary` (LessonID, Word, Furigana, Meaning) VALUES (?, ?, ?, ?)",
                            [
                                lessonId,
                                item.kanji || item.kana,
                                item.kana,
                                item.waller_definition
                            ]
                        );
                        const vocabId = resVocab.insertId;

                        await connection.execute(
                            "INSERT INTO `quiz_items` (QuizID, VocabID) VALUES (?, ?)",
                            [quizId, vocabId]
                        );
                    }
                }
                console.log(`✅ Đã nạp xong Vocabulary & Quizzes ${lvl}`);
            }
        }

        // --- 2. MIGRATION KANJI AND QUIZZES ---
        for (const lvl of levels) {
            const kanjiPath = path.join(__dirname, `../../data/kanji/${lvl.toUpperCase()}.json`);
            if (fs.existsSync(kanjiPath)) {
                const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));
                const chunks = chunkArray(data, 20);

                for (let i = 0; i < chunks.length; i++) {
                    const jlptCode = lvl.toUpperCase();
                    
                    let difficulty = 'Hard';
                    if (['N2', 'N1'].includes(jlptCode)) {
                        difficulty = 'Instant Death';
                    }

                    // 2.1 Create Lesson
                    const [resLesson] = await connection.execute(
                        "INSERT INTO `lesson` (JLPT_Level, Title, Type) VALUES (?, ?, ?)",
                        [jlptCode, `Kanji ${jlptCode} - Lesson ${i + 1}`, 'Kanji']
                    );
                    const lessonId = resLesson.insertId;

                    // 2.2 Create Quiz
                    const [resQuiz] = await connection.execute(
                        "INSERT INTO `quiz` (QuizTitle, Difficulty) VALUES (?, ?)",
                        [`Quiz Kanji ${jlptCode} - Lesson ${i + 1}`, difficulty]
                    );
                    const quizId = resQuiz.insertId;

                    for (const item of chunks[i]) {
                        const [resKanji] = await connection.execute(
                            "INSERT INTO `Kanji` (LessonID, `Character`, Onyomi, Kunyomi, Meaning) VALUES (?, ?, ?, ?, ?)",
                            [
                                lessonId,
                                item.kanjiChar,
                                item.onyomi.join(', '),
                                item.kunyomi.join(', '),
                                item.meanings.join(', ')
                            ]
                        );
                        const kanjiId = resKanji.insertId;

                        await connection.execute(
                            "INSERT INTO `Quiz_Items` (QuizID, KanjiID) VALUES (?, ?)",
                            [quizId, kanjiId]
                        );
                    }
                }
                console.log(`✅ Đã nạp xong Kanji & Quizzes ${lvl}`);
            }
        }

        // --- 3. MIGRATION ALPHABET (KANA) AND QUIZZES ---
        const alphabets = ['hiragana', 'katakana'];
        for (const type of alphabets) {
            const kanaPath = path.join(__dirname, `../../data/alphabet/${type}.json`);
            if (fs.existsSync(kanaPath)) {
                const data = JSON.parse(fs.readFileSync(kanaPath, 'utf8'));
                const chunks = chunkArray(data, 20);

                for (let i = 0; i < chunks.length; i++) {
                    // Alphabets are set to 'Normal' difficulty
                    const jlptCode = 'N5'; 
                    // 3.1 Create Lesson
                    const [resLesson] = await connection.execute(
                        "INSERT INTO `lesson` (JLPT_Level, Title, Type) VALUES (?, ?, ?)",
                        [jlptCode, `${type.charAt(0).toUpperCase() + type.slice(1)} - Bài ${i + 1}`, 'Kana']
                    );
                    const lessonId = resLesson.insertId;

                    // 3.2 Create Quiz
                    const [resQuiz] = await connection.execute(
                        "INSERT INTO `quiz` (QuizTitle, Difficulty) VALUES (?, ?)",
                        [`Quiz ${type.charAt(0).toUpperCase() + type.slice(1)} - Bài ${i + 1}`, 'Normal']
                    );
                    const quizId = resQuiz.insertId;

                    for (const item of chunks[i]) {
                        const [resKana] = await connection.execute(
                            "INSERT INTO `Kana` (LessonID, `Character`, Romaji) VALUES (?, ?, ?)",
                            [lessonId, item.content, item.meaning]
                        );
                        const kanaId = resKana.insertId;

                        await connection.execute(
                            "INSERT INTO `Quiz_Items` (QuizID, KanaID) VALUES (?, ?)",
                            [quizId, kanaId]
                        );
                    }
                }
                console.log(`✅ Đã nạp xong Alphabet & Quizzes: ${type}`);
            }
        }

        console.log("🎉 Hoàn thành nạp dữ liệu (Lessons, Content, Quizzes) thành công!");

    } catch (error) {
        console.error("❌ Lỗi trong quá trình migration:", error);
    } finally {
        await connection.end();
    }
}

migrateData();