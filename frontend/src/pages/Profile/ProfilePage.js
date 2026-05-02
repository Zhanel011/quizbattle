import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await API.get('/games/history');
        setGames(res.data.slice(0, 10)); // последние 10 игр
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const winRate = user?.games_played > 0
    ? Math.round((user.games_won / user.games_played) * 100)
    : 0;

  const getRoleColor = (role) => {
    if (role === 'admin') return { color: '#f87171', bg: 'rgba(239,68,68,0.15)' };
    if (role === 'moderator') return { color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' };
    return { color: '#818cf8', bg: 'rgba(99,102,241,0.15)' };
  };

  const badge = getRoleColor(user?.role);

  const formatTime = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="profile-container">
      <Navbar />
      <div className="profile-content">

        {/* Profile card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.username}</div>
            <div className="profile-email">{user?.email}</div>
            <span
              className="profile-role-badge"
              style={{ color: badge.color, background: badge.bg }}
            >
              {user?.role === 'admin' ? '👑' : user?.role === 'moderator' ? '🛡' : '🎮'} {user?.role}
            </span>
          </div>
          <div className="profile-joined">
            Joined {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Stats grid */}
        <div className="profile-stats">
          <div className="pstat-card">
            <span className="pstat-icon">🎮</span>
            <span className="pstat-value">{user?.games_played || 0}</span>
            <span className="pstat-label">Games Played</span>
          </div>
          <div className="pstat-card">
            <span className="pstat-icon">🏆</span>
            <span className="pstat-value">{user?.games_won || 0}</span>
            <span className="pstat-label">Games Won</span>
          </div>
          <div className="pstat-card">
            <span className="pstat-icon">⭐</span>
            <span className="pstat-value">{user?.total_score || 0}</span>
            <span className="pstat-label">Total Score</span>
          </div>
          <div className="pstat-card">
            <span className="pstat-icon">📊</span>
            <span className="pstat-value">{winRate}%</span>
            <span className="pstat-label">Win Rate</span>
          </div>
        </div>

        {/* Game history — only for regular users */}
        {user?.role === 'user' && (
          <div className="profile-history">
            <div className="history-title">🕹 Recent Games</div>
            {loading ? (
              <div className="history-loading">Loading...</div>
            ) : games.length === 0 ? (
              <div className="history-empty">
                <p>No games yet. <span onClick={() => navigate('/topics')}>Start playing!</span></p>
              </div>
            ) : (
              <div className="history-list">
                <div className="history-header">
                  <span>Topic</span>
                  <span>Mode</span>
                  <span>Score</span>
                  <span>Time</span>
                  <span>Result</span>
                </div>
                {games.map(game => {
                  const isPlayer1 = game.player1_id === user.id;
                  const myScore = isPlayer1 ? game.player1_score : game.player2_score;
                  const myTime = isPlayer1 ? game.player1_time : game.player2_time;
                  const isWin = game.winner_id === user.id;
                  const isDraw = game.status === 'finished' && !game.winner_id && game.mode === 'versus';

                  let resultLabel = '—';
                  let resultClass = '';
                  if (game.status === 'finished') {
                    if (game.mode === 'solo') { resultLabel = 'Solo'; resultClass = 'solo'; }
                    else if (isDraw) { resultLabel = 'Draw'; resultClass = 'draw'; }
                    else if (isWin) { resultLabel = 'Win'; resultClass = 'win'; }
                    else { resultLabel = 'Loss'; resultClass = 'loss'; }
                  } else if (game.status === 'cancelled') {
                    resultLabel = 'Cancelled'; resultClass = 'cancelled';
                  }

                  return (
                    <div className="history-row" key={game.id}>
                      <span className="history-topic">{game.topic_name}</span>
                      <span className="history-mode">{game.mode}</span>
                      <span className="history-score">{myScore ?? '—'}/10</span>
                      <span className="history-time">{formatTime(myTime)}</span>
                      <span className={`history-result ${resultClass}`}>{resultLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;
