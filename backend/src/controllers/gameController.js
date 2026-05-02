const pool = require('../db/pool');

const createGame = async (req, res) => {
  const { topic_id, mode, player2_id } = req.body;
  const player1_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO games (topic_id, mode, player1_id, player2_id, status, started_at)
       VALUES ($1, $2, $3, $4, 'in_progress', NOW()) RETURNING *`,
      [topic_id, mode || 'solo', player1_id, player2_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const submitAnswers = async (req, res) => {
  const { game_id, answers, time_spent } = req.body;
  const user_id = req.user.id;
  try {
    const gameRes = await pool.query('SELECT * FROM games WHERE id = $1', [game_id]);
    const game = gameRes.rows[0];
    if (!game) return res.status(404).json({ message: 'Game not found' });

    let score = 0;
    for (const ans of answers) {
      const qRes = await pool.query('SELECT correct_answer FROM questions WHERE id = $1', [ans.question_id]);
      const correct = qRes.rows[0]?.correct_answer;
      const is_correct = correct === ans.answer;
      if (is_correct) score++;
      await pool.query(
        'INSERT INTO game_answers (game_id, user_id, question_id, answer, is_correct) VALUES ($1,$2,$3,$4,$5)',
        [game_id, user_id, ans.question_id, ans.answer, is_correct]
      );
    }

    const isPlayer1 = game.player1_id === user_id;
    if (isPlayer1) {
      await pool.query('UPDATE games SET player1_score=$1, player1_time=$2 WHERE id=$3', [score, time_spent, game_id]);
    } else {
      await pool.query('UPDATE games SET player2_score=$1, player2_time=$2 WHERE id=$3', [score, time_spent, game_id]);
    }

    // Update user stats
    await pool.query(
      'UPDATE users SET total_score = total_score + $1, games_played = games_played + 1 WHERE id = $2',
      [score, user_id]
    );

    // If solo game — finish immediately
    if (game.mode === 'solo') {
      await pool.query(
        'UPDATE games SET status=$1, winner_id=$2, finished_at=NOW() WHERE id=$3',
        ['finished', user_id, game_id]
      );
      await pool.query('UPDATE users SET games_won = games_won + 1 WHERE id = $1', [user_id]);
    } else {
      // Versus: check if both players submitted
      const updated = await pool.query('SELECT * FROM games WHERE id = $1', [game_id]);
      const g = updated.rows[0];
      const bothDone = g.player1_score !== null && g.player2_score !== null &&
                       g.player1_time !== null && g.player2_time !== null;
      if (bothDone) {
        let winner_id = g.player1_score > g.player2_score ? g.player1_id :
                        g.player2_score > g.player1_score ? g.player2_id : null;
        await pool.query(
          'UPDATE games SET status=$1, winner_id=$2, finished_at=NOW() WHERE id=$3',
          ['finished', winner_id, game_id]
        );
        if (winner_id) {
          await pool.query('UPDATE users SET games_won = games_won + 1 WHERE id = $1', [winner_id]);
        }
      }
    }

    res.json({ score, total: answers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getGameResult = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.*, 
        u1.username as player1_name, u2.username as player2_name,
        w.username as winner_name, t.name as topic_name
       FROM games g
       LEFT JOIN users u1 ON g.player1_id = u1.id
       LEFT JOIN users u2 ON g.player2_id = u2.id
       LEFT JOIN users w ON g.winner_id = w.id
       LEFT JOIN topics t ON g.topic_id = t.id
       WHERE g.id = $1`,
      [req.params.gameId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Game not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserGames = async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT g.*, t.name as topic_name,
        u1.username as player1_name, u2.username as player2_name
       FROM games g
       LEFT JOIN topics t ON g.topic_id = t.id
       LEFT JOIN users u1 ON g.player1_id = u1.id
       LEFT JOIN users u2 ON g.player2_id = u2.id
       WHERE g.player1_id = $1 OR g.player2_id = $1
       ORDER BY g.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createGame, submitAnswers, getGameResult, getUserGames };
