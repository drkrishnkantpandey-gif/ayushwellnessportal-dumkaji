const db = require('../db');

/**
 * Get all notifications for the user
 */
exports.getAllNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
    const userId = req.user.id;
    const notifId = req.params.id;
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [notifId, userId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
};
