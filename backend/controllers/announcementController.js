const db = require('../config/db');
const { broadcastNotification } = require('../services/notificationService');

// Get all announcements (open to all authenticated users)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.name AS author_name 
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );
    return res.json({ announcements: result.rows });
  } catch (err) {
    console.error('Error getting announcements:', err);
    return res.status(500).json({ error: 'Failed to retrieve announcements.' });
  }
};

// Librarian: Create announcement with optional broadcast notification
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, broadcast = true } = req.body;
    const adminId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const insertRes = await db.query(
      `INSERT INTO announcements (title, content, category, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), content.trim(), category || 'general', adminId]
    );

    const announcement = insertRes.rows[0];

    if (broadcast) {
      const notifType = category === 'holiday' ? 'holiday_announcement' : (category === 'new_arrival' ? 'new_arrival' : 'announcement');
      await broadcastNotification({
        title: `Library Notice: ${title}`,
        message: content.length > 120 ? content.substring(0, 117) + '...' : content,
        type: notifType
      });
    }

    return res.status(201).json({
      message: 'Announcement posted successfully!',
      announcement
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    return res.status(500).json({ error: 'Failed to publish announcement.' });
  }
};

// Librarian: Delete announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM announcements WHERE id = $1`, [id]);
    return res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    return res.status(500).json({ error: 'Failed to delete announcement.' });
  }
};
