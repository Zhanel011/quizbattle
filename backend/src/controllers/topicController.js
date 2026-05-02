const pool = require('../db/pool');

const getTopics = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM topics ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getQuestions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM questions WHERE topic_id = $1 ORDER BY RANDOM() LIMIT 10',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTopics, getQuestions };