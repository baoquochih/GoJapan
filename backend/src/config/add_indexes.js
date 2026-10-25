import db from './db.js';

export const initializeIndexes = async () => {
    try {
        console.log("Checking and adding database indexes...");
        const queries = [
            `CREATE INDEX idx_vocab_lesson ON vocabulary(LessonID)`,
            `CREATE INDEX idx_kanji_lesson ON kanji(LessonID)`,
            `CREATE INDEX idx_kana_lesson ON kana(LessonID)`,
            `CREATE INDEX idx_quiz_items_quiz ON quiz_items(QuizID)`,
            `CREATE INDEX idx_user_email ON user(Email)`, // Optimize login
            `CREATE INDEX idx_user_username ON user(Username)`
        ];

        for (let query of queries) {
            try {
                await db.query(query);
                console.log(`[OK] Executed ${query}`);
            } catch (err) {
                // Ignore duplicate index errors (ER_DUP_KEYNAME code 1061)
                if (err.code === 'ER_DUP_KEYNAME') {
                    // It already exists, silently ignore
                } else {
                    console.error(`[Warn] Could not add index: ${err.message}`);
                }
            }
        }
        console.log("Indexes check complete.");
    } catch (e) {
        console.error("Index init failed:", e.message);
    }
};
