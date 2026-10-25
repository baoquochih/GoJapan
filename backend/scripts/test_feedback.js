import db from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function getFeedbacks() {
    try {
        const [rows] = await db.query('SELECT * FROM feedback');
        console.log('Total feedbacks in DB:', rows.length);
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getFeedbacks();
