import db from '../src/config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function getCols() {
    const [rows] = await db.query('DESCRIBE user');
    console.log(rows.map(r => r.Field));
    process.exit(0);
}
getCols();
