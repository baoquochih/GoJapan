import db from '../config/db.js';

// POST /api/feedback - Submit new feedback
export const createFeedback = async (req, res) => {
    const { user_id, rating, category, description, image_data } = req.body;

    if (!rating || !category || !description) {
        return res.status(400).json({ error: 'rating, category, and description are required.' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO feedback (user_id, rating, category, description, image_data)
             VALUES (?, ?, ?, ?, ?)`,
            [user_id || null, rating, category, description, image_data || null]
        );
        res.status(201).json({ message: 'Feedback submitted successfully!', id: result.insertId });
    } catch (err) {
        console.error('Error creating feedback:', err);
        res.status(500).json({ error: 'Failed to submit feedback.' });
    }
};

// GET /api/feedback - Retrieve all feedback for community feed
export const getFeedbacks = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                f.id,
                f.rating,
                f.category,
                f.description,
                f.image_data,
                f.upvotes,
                f.created_at,
                COALESCE(u.Username, 'Anonymous') AS author_name,
                NULL AS author_avatar
            FROM feedback f
            LEFT JOIN user u ON f.user_id = u.UserID
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching feedbacks:', err);
        res.status(500).json({ error: 'Failed to fetch feedbacks.' });
    }
};

// PATCH /api/feedback/:id/upvote - Upvote a feedback post
export const upvoteFeedback = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute(`UPDATE feedback SET upvotes = upvotes + 1 WHERE id = ?`, [id]);
        res.json({ message: 'Upvoted!' });
    } catch (err) {
        console.error('Error upvoting feedback:', err);
        res.status(500).json({ error: 'Failed to upvote.' });
    }
};
