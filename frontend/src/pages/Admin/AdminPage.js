import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './AdminPage.css';

function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, admins: 0, moderators: 0, players: 0 });

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/users');
      const data = res.data;
      setUsers(data);
      setStats({
        total: data.length,
        admins: data.filter(u => u.role === 'admin').length,
        moderators: data.filter(u => u.role === 'moderator').length,
        players: data.filter(u => u.role === 'user').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete "${username}"?`)) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const changeRole = async (userId, newRole) => {
    if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error changing role');
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: { color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
      moderator: { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
      user: { color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
    };
    return map[role] || map.user;
  };

  // Moderator can delete only regular users (not admins, not other moderators, not self)
  const canDelete = (targetUser) => {
    if (targetUser.id === user?.id) return false;
    if (isAdmin) return targetUser.role !== 'admin';
    if (isModerator) return targetUser.role === 'user';
    return false;
  };

  // Only admin can change roles, and only for non-admin users
  const canChangeRole = (targetUser) => {
    return isAdmin && targetUser.id !== user?.id && targetUser.role !== 'admin';
  };

  return (
    <div className="admin-container">
      <Navbar />
      <div className="admin-content">
        <div className="admin-header">
          <div>
            <h1>{isAdmin ? '👑' : '🛡'} <span>{isAdmin ? 'Admin Panel' : 'Moderator Panel'}</span></h1>
            <p>
              {isAdmin
                ? 'Full access — manage users, change roles, delete accounts'
                : 'Moderator access — view users, delete regular player accounts'}
            </p>
          </div>
          <div className="admin-role-badge">
            {isAdmin ? '👑 Admin' : '🛡 Moderator'}
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="astat-icon">👥</span>
            <span className="astat-value">{stats.total}</span>
            <span className="astat-label">Total Users</span>
          </div>
          <div className="admin-stat-card">
            <span className="astat-icon">👑</span>
            <span className="astat-value">{stats.admins}</span>
            <span className="astat-label">Admins</span>
          </div>
          <div className="admin-stat-card">
            <span className="astat-icon">🛡</span>
            <span className="astat-value">{stats.moderators}</span>
            <span className="astat-label">Moderators</span>
          </div>
          <div className="admin-stat-card">
            <span className="astat-icon">🎮</span>
            <span className="astat-value">{stats.players}</span>
            <span className="astat-label">Players</span>
          </div>
        </div>

        {/* Users table */}
        <div className="admin-table-wrapper">
          <div className="admin-table-title">All Users</div>
          {loading ? (
            <div className="admin-loading">Loading...</div>
          ) : (
            <div className="admin-table">
              <div className="admin-table-header">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Games</span>
                <span>Score</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {users.map(u => {
                const badge = getRoleBadge(u.role);
                return (
                  <div className="admin-row" key={u.id}>
                    <span className="admin-username">
                      {u.username}
                      {u.id === user?.id && <span className="you-tag">You</span>}
                    </span>
                    <span className="admin-email">{u.email}</span>
                    <span className="admin-role-cell">
                      <span
                        className="admin-role"
                        style={{ color: badge.color, background: badge.bg }}
                      >
                        {u.role}
                      </span>
                      {/* Role change dropdown — admin only */}
                      {canChangeRole(u) && (
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="moderator">moderator</option>
                        </select>
                      )}
                    </span>
                    <span className="admin-cell">{u.games_played}</span>
                    <span className="admin-cell admin-score">{u.total_score}</span>
                    <span className="admin-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                    <span className="admin-actions-cell">
                      {canDelete(u) ? (
                        <button
                          className="delete-btn"
                          onClick={() => deleteUser(u.id, u.username)}
                        >
                          🗑 Delete
                        </button>
                      ) : (
                        <span className="no-action">—</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;