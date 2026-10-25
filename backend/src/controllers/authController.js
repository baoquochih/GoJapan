import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.UserID, email: user.Email }, 
        process.env.JWT_SECRET || 'secret_access_key', 
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.UserID }, 
        process.env.JWT_REFRESH_SECRET || 'secret_refresh_key', 
        { expiresIn: '7d' }
    );
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        // Check if user exists
        const [existing] = await db.query('SELECT * FROM user WHERE Email = ? OR Username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "User with this email or username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO user (Username, Email, PasswordHash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully", userId: result.insertId });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const [users] = await db.query('SELECT * FROM user WHERE Email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.PasswordHash);
        
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Tracker cho calendar streak: ghi nhận lượt đăng nhập hôm nay
        await db.query('INSERT IGNORE INTO user_login_history (UserID, LoginDate) VALUES (?, CURDATE())', [user.UserID]);

        // Save refresh token to DB. Expiry logic: current time + 7 days
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await db.query(
            'INSERT INTO refreshtokens (UserID, Token, ExpiryDate) VALUES (?, ?, ?)',
            [user.UserID, refreshToken, expiryDate]
        );

        // Don't send password hash back
        delete user.PasswordHash;

        res.json({
            message: "Login successful",
            user,
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: "Refresh token is required" });

        // Verify token exists in database and is not expired
        const [savedTokens] = await db.query('SELECT * FROM refreshtokens WHERE Token = ?', [token]);
        if (savedTokens.length === 0) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const savedToken = savedTokens[0];
        if (new Date() > new Date(savedToken.ExpiryDate)) {
            // Delete expired token
            await db.query('DELETE FROM refreshtokens WHERE TokenID = ?', [savedToken.TokenID]);
            return res.status(403).json({ message: "Refresh token expired" });
        }

        jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'secret_refresh_key', (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token signature" });
            
            // Generate new access token
            const accessToken = jwt.sign(
                { id: decoded.id }, 
                process.env.JWT_SECRET || 'secret_access_key', 
                { expiresIn: '15m' }
            );
            
            res.json({ accessToken });
        });
    } catch (error) {
        console.error("Refresh token error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Refresh token is required for logout" });

        await db.query('DELETE FROM refreshtokens WHERE Token = ?', [token]);
        
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        // Authenticated user ID is attached by authMiddleware
        const userId = req.user.id;

        // Tracker cho calendar streak: nếu user fetch profile (mở app) -> ghi nhận visit
        await db.query('INSERT IGNORE INTO user_login_history (UserID, LoginDate) VALUES (?, CURDATE())', [userId]);
        
        const [users] = await db.query(
            'SELECT UserID, Username, Email, CurrentStreak, LongestStreak, LastActivityDate, CreatedAt FROM user WHERE UserID = ?', 
            [userId]
        );

        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        res.json(users[0]);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username } = req.body;
        
        if (!username) return res.status(400).json({ message: "No fields to update provided" });

        await db.query('UPDATE user SET Username = ? WHERE UserID = ?', [username, userId]);
        
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Google token is required" });

        // access_token from useGoogleLogin → call Google userinfo endpoint
        const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const email = data.email;
        const name = data.name;

        // check if user exists
        let user;
        const [users] = await db.query('SELECT * FROM user WHERE Email = ?', [email]);
        
        if (users.length === 0) {
            // register new user with random password
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            
            const [result] = await db.query(
                'INSERT INTO user (Username, Email, PasswordHash) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            
            const [newUsers] = await db.query('SELECT * FROM user WHERE UserID = ?', [result.insertId]);
            user = newUsers[0];
        } else {
            user = users[0];
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await db.query('INSERT IGNORE INTO user_login_history (UserID, LoginDate) VALUES (?, CURDATE())', [user.UserID]);

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        await db.query(
            'INSERT INTO refreshtokens (UserID, Token, ExpiryDate) VALUES (?, ?, ?)',
            [user.UserID, refreshToken, expiryDate]
        );

        delete user.PasswordHash;
        res.json({ message: "Google Login successful", user, accessToken, refreshToken });
    } catch (error) {
        console.error("Google login error:", error.response ? error.response.data : error.message);
        res.status(500).json({ 
            message: "Google login verification failed", 
            error: error.response ? error.response.data : error.message,
            stack: error.stack
        });
    }
};

export const facebookLogin = async (req, res) => {
    try {
        const { accessToken, email, name } = req.body;
        if (!accessToken) return res.status(400).json({ message: "Facebook access token is required" });

        // verify with FB graph API
        const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
        
        const userEmail = data.email || email || `${data.id}@facebook.com`;
        const userName = data.name || name || 'Facebook User';

        let user;
        const [users] = await db.query('SELECT * FROM user WHERE Email = ?', [userEmail]);
        
        if (users.length === 0) {
            // register
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);
            
            const [result] = await db.query(
                'INSERT INTO user (Username, Email, PasswordHash) VALUES (?, ?, ?)',
                [userName, userEmail, hashedPassword]
            );
            
            const [newUsers] = await db.query('SELECT * FROM user WHERE UserID = ?', [result.insertId]);
            user = newUsers[0];
        } else {
            user = users[0];
        }

        const newAccessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await db.query('INSERT IGNORE INTO user_login_history (UserID, LoginDate) VALUES (?, CURDATE())', [user.UserID]);

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        await db.query(
            'INSERT INTO refreshtokens (UserID, Token, ExpiryDate) VALUES (?, ?, ?)',
            [user.UserID, refreshToken, expiryDate]
        );

        delete user.PasswordHash;
        res.json({ message: "Facebook Login successful", user, accessToken: newAccessToken, refreshToken });
    } catch (error) {
        console.error("Facebook login error:", error);
        res.status(500).json({ message: "Facebook login verification failed" });
    }
};
