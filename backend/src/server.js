import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import axios from 'axios';

dotenv.config();

import db from './config/db.js';
import { initializeIndexes } from './config/add_indexes.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(compression());

const allowedOrigins = [
    'https://gojapan.abc-xyz.tech',
    'https://go-japan-fsnk.vercel.app',
    'https://go-japan-fsnk-2gf3tg8k2-baoquochih.vercel.app',
    'https://go-japan-fsnk-ox5x025g0-baoquochih.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    return allowedOrigins.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?vercel\.app$/i.test(origin);
};

const corsOptions = {
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize performance indexes first
initializeIndexes();

// Khởi tạo bảng login history (nếu chưa có) cho tính năng Visit Calendar
db.query(`
    CREATE TABLE IF NOT EXISTS user_login_history (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        UserID INT NOT NULL,
        LoginDate DATE NOT NULL,
        UNIQUE KEY unique_user_date (UserID, LoginDate),
        FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE CASCADE
    )
`).catch((err) => console.error('Table init error:', err));

// Initialize feedback table if not exists
db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        rating VARCHAR(20) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        image_data LONGTEXT,
        upvotes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(UserID) ON DELETE SET NULL
    )
`).catch((err) => console.error('Feedback table init error:', err));

// Initialize chat history table if not exists
db.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        role ENUM('user', 'model') NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(UserID) ON DELETE CASCADE
    )
`).catch((err) => console.error('Chat table init error:', err));

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại port ${PORT}`);

        const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || `http://localhost:${PORT}/api/lessons`;
        setInterval(() => {
            axios.get(KEEP_ALIVE_URL)
                .then(() => console.log('[Keep-Alive] Ping successful'))
                .catch((err) => console.error('[Keep-Alive] Ping failed', err.message));
        }, 14 * 60 * 1000);
    });
}

export default app;