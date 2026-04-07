import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import db from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Main API Router
app.use('/api', routes);

// Global Error Handler Middleware (must be after routes)
app.use(errorHandler);

async function initAndStart() {
    try {
        // Khởi tạo bảng login history (nếu chưa có) cho tính năng Visit Calendar
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_login_history (
                ID INT AUTO_INCREMENT PRIMARY KEY,
                UserID INT NOT NULL,
                LoginDate DATE NOT NULL,
                UNIQUE KEY unique_user_date (UserID, LoginDate),
                FOREIGN KEY (UserID) REFERENCES user(UserID) ON DELETE CASCADE
            )
        `);
        console.log('user_login_history table ready.');
    } catch (err) {
        console.error('user_login_history table init error:', err.message);
    }

    try {
        // Initialize feedback table if not exists
        await db.query(`
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
        `);
        console.log('feedback table ready.');
    } catch (err) {
        console.error('feedback table init error:', err.message);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server đang chạy tại port ${PORT}`);
    });
}

initAndStart();