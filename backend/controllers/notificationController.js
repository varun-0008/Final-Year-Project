const db = require('../config/db');

// Get all notifications for current user
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    const unreadCountRes = await db.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    const unreadCount = parseInt(unreadCountRes.rows[0].count, 10);

    return res.json({
      notifications: result.rows,
      unread_count: unreadCount
    });
  } catch (err) {
    console.error('Error getting notifications:', err);
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Error marking notification read:', err);
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    return res.status(500).json({ error: 'Failed to update notifications.' });
  }
};

// Clear notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await db.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    return res.json({ message: 'Notification removed.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ error: 'Failed to delete notification.' });
  }
};
