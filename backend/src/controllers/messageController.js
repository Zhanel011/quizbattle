const pool = require('../db/pool');

const getConversation = async (req, res) => {
  const user1 = req.user.id;
  const user2 = parseInt(req.params.userId);
  try {
    const result = await pool.query(
      `SELECT m.*, u.username as sender_name FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id=$1 AND m.receiver_id=$2)
          OR (m.sender_id=$2 AND m.receiver_id=$1)
       ORDER BY m.created_at ASC`,
      [user1, user2]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const sendMessage = async (req, res) => {
  const sender_id = req.user.id;
  const { receiver_id, content, is_invite, invite_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, is_invite, invite_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [sender_id, receiver_id, content, is_invite || false, invite_id || null]
    );
    const msg = result.rows[0];

    // Send via WebSocket
    const clients = req.app.get('clients');
    const receiverWs = clients.get(receiver_id);
    if (receiverWs) {
      receiverWs.send(JSON.stringify({ type: 'message', data: msg }));
    }

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const markRead = async (req, res) => {
  const receiver_id = req.user.id;
  const sender_id = req.params.userId;
  try {
    await pool.query(
      'UPDATE messages SET is_read=true WHERE sender_id=$1 AND receiver_id=$2',
      [sender_id, receiver_id]
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getConversation, sendMessage, markRead };
