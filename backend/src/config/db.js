import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST ? process.env.DB_HOST.trim() : 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT.trim(), 10) : 3306,
    user: process.env.DB_USER ? process.env.DB_USER.trim() : 'root',
    password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : '',
    database: process.env.DB_NAME ? process.env.DB_NAME.trim() : '',
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0   
});

export default pool;