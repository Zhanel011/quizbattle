const pool = require('../db/pool');

const sendInvite = async (req, res) => {
  const sender_id = req.user.id;
  const { receiver_id, topic_id } = req.body;
  try {
    const gameRes = await pool.query(
      `INSERT INTO games (topic_id, mode, player1_id, player2_id, status)
       VALUES ($1, 'versus', $2, $3, 'waiting') RETURNING *`,
      [topic_id, sender_id, receiver_id]
    );
    const game = gameRes.rows[0];

    const inviteRes = await pool.query(
      `INSERT INTO invitations (sender_id, receiver_id, topic_id, game_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [sender_id, receiver_id, topic_id, game.id]
    );
    const invite = inviteRes.rows[0];

    const senderRes = await pool.query('SELECT username FROM users WHERE id=$1', [sender_id]);
    const senderName = senderRes.rows[0].username;
    const topicRes = await pool.query('SELECT name FROM topics WHERE id=$1', [topic_id]);
    const topicName = topicRes.rows[0].name;

    await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, is_invite, invite_id)
       VALUES ($1,$2,$3,true,$4)`,
      [sender_id, receiver_id, `${senderName} invited you to a quiz battle! Topic: ${topicName}`, invite.id]
    );

    // Уведомить получателя через WebSocket
    const clients = req.app.get('clients');
    const receiverWs = clients.get(receiver_id);
    if (receiverWs) {
      receiverWs.send(JSON.stringify({
        type: 'invite',
        invite: { ...invite, sender_name: senderName, topic_name: topicName },
        game
      }));
    }

    res.status(201).json({ invite, game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const respondInvite = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'declined'
  const invite_id = req.params.id;
  try {
    const inviteRes = await pool.query('SELECT * FROM invitations WHERE id=$1', [invite_id]);
    const invite = inviteRes.rows[0];
    if (!invite) return res.status(404).json({ message: 'Invitation not found' });

    await pool.query(
      'UPDATE invitations SET status=$1, responded_at=NOW() WHERE id=$2',
      [status, invite_id]
    );

    if (status === 'accepted') {
      await pool.query(
        'UPDATE games SET status=$1, started_at=NOW() WHERE id=$2',
        ['in_progress', invite.game_id]
      );
    } else {
      await pool.query('UPDATE games SET status=$1 WHERE id=$2', ['cancelled', invite.game_id]);
    }

    // Уведомить отправителя через WebSocket — теперь передаём topic_id!
    const clients = req.app.get('clients');
    const senderWs = clients.get(invite.sender_id);
    if (senderWs) {
      senderWs.send(JSON.stringify({
        type: 'invite_response',
        status,
        game_id: invite.game_id,
        topic_id: invite.topic_id   // <-- это было нужно!
      }));
    }

    res.json({ message: `Invitation ${status}`, game_id: invite.game_id, topic_id: invite.topic_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyInvites = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT i.*, u.username as sender_name, t.name as topic_name
       FROM invitations i
       JOIN users u ON i.sender_id = u.id
       JOIN topics t ON i.topic_id = t.id
       WHERE i.receiver_id = $1 AND i.status = 'pending'
       ORDER BY i.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendInvite, respondInvite, getMyInvites };