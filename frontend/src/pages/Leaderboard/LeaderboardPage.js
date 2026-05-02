import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRankIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="lb-container">
      <Navbar />
      <div className="lb-content">
        <div className="lb-header">
          <h1>🏆 <span>Leaderboard</span></h1>
          <p>Top players ranked by total score</p>
        </div>

        {loading ? (
          <div className="lb-loading">Loading...</div>
        ) : (
          <>
            {/* Top 3 */}
            {users.length >= 3 && (
              <div className="podium">
                <div className="podium-item second">
                  <div className="podium-avatar">🥈</div>
                  <div className="podium-name">{users[1]?.username}</div>
                  <div className="podium-score">{users[1]?.total_score} pts</div>
                  <div className="podium-block p2"></div>
                </div>
                <div className="podium-item first">
                  <div className="podium-crown">👑</div>
                  <div className="podium-avatar">🥇</div>
                  <div className="podium-name">{users[0]?.username}</div>
                  <div className="podium-score">{users[0]?.total_score} pts</div>
                  <div className="podium-block p1"></div>
                </div>
                <div className="podium-item third">
                  <div className="podium-avatar">🥉</div>
                  <div className="podium-name">{users[2]?.username}</div>
                  <div className="podium-score">{users[2]?.total_score} pts</div>
                  <div className="podium-block p3"></div>
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="lb-table">
              <div className="lb-table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Games</span>
                <span>Wins</span>
                <span>Score</span>
              </div>
              {users.map((u, index) => (
                <div
                  className={`lb-row ${u.id === user?.id ? 'my-row' : ''} ${index < 3 ? 'top-row' : ''}`}
                  key={u.id}
                >
                  <span className="lb-rank">{getRankIcon(index)}</span>
                  <span className="lb-username">
                    {u.username}
                    {u.id === user?.id && <span className="you-badge">You</span>}
                    <span className={`lb-role ${u.role}`}>{u.role}</span>
                  </span>
                  <span className="lb-stat">{u.games_played}</span>
                  <span className="lb-stat">{u.games_won}</span>
                  <span className="lb-score">{u.total_score} pts</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPage;
