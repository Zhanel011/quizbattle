const pool = require('../db/pool');

const getAllUsers = async (req, res) => {
  try {
    const requester = req.user;
    let query;

    if (requester.role === 'admin' || requester.role === 'moderator') {
      // Admin/moderator видят всех
      query = 'SELECT id, email, username, role, total_score, games_played, games_won, created_at FROM users ORDER BY total_score DESC';
    } else {
      // Обычный пользователь видит только других пользователей (не admin/moderator)
      query = "SELECT id, email, username, role, total_score, games_played, games_won, created_at FROM users WHERE role = 'user' ORDER BY total_score DESC";
    }

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, role, total_score, games_played, games_won, created_at FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'admin' && requester.role !== 'moderator')
      return res.status(403).json({ message: 'Access denied' });

    // Moderator can only delete regular users
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (target.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    if (requester.role === 'moderator' && target.rows[0].role !== 'user')
      return res.status(403).json({ message: 'Moderators can only delete regular users' });

    if (target.rows[0].role === 'admin')
      return res.status(403).json({ message: 'Cannot delete an admin account' });

    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Only admin can change roles
const changeRole = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'admin')
      return res.status(403).json({ message: 'Only admins can change roles' });

    const { role } = req.body;
    if (!['user', 'moderator'].includes(role))
      return res.status(400).json({ message: 'Invalid role. Allowed: user, moderator' });

    const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (target.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    if (target.rows[0].role === 'admin')
      return res.status(403).json({ message: 'Cannot change admin role' });

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const changeRole = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can change roles' });

    const { role } = req.body;
    if (!['user', 'moderator'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getUserById, deleteUser, changeRole };


