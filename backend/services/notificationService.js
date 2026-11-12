const db = require('../config/db');

/**
 * Dispatches an in-app notification to a user, with optional logging/email hook
 */
async function sendNotification({ userId, title, message, type = 'general' }) {
  try {
    const res = await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, title, message, type, is_read, created_at`,
      [userId, title, message, type]
    );

    console.log(`🔔 [Notification] Sent [${type}] to user #${userId}: "${title}"`);
    return res.rows[0];
  } catch (err) {
    console.error('Error dispatching notification:', err);
    return null;
  }
}

/**
 * Broadcasts an announcement or alert to all registered students
 */
async function broadcastNotification({ title, message, type = 'announcement' }) {
  try {
    const studentsRes = await db.query(`SELECT id FROM users WHERE role = 'student'`);
    const promises = studentsRes.rows.map(s => 
      sendNotification({ userId: s.id, title, message, type })
    );
    await Promise.all(promises);
    console.log(`📢 [Broadcast] Delivered "${title}" to ${studentsRes.rowCount} students.`);
    return studentsRes.rowCount;
  } catch (err) {
    console.error('Error broadcasting notification:', err);
    return 0;
  }
}

module.exports = {
  sendNotification,
  broadcastNotification
};
