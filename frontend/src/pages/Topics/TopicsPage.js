import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './TopicsPage.css';

function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteSent, setInviteSent] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await API.get('/topics');
        setTopics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handlePlay = async (topic) => {
    try {
      const gameRes = await API.post('/games/create', {
        topic_id: topic.id,
        mode: 'solo',
      });
      navigate(`/game/${gameRes.data.id}?topic=${topic.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (topic) => {
    setSelected(topic);
    setInviteSent(null);
    try {
      const res = await API.get('/users');
      // Убираем себя из списка
      setUsers(res.data.filter(u => u.id !== user.id));
    } catch (err) {
      console.error(err);
    }
    setShowInviteModal(true);
  };

  const sendInvite = async (targetUser) => {
    try {
      await API.post('/invitations/send', {
        receiver_id: targetUser.id,
        topic_id: selected.id,
      });
      setInviteSent(targetUser.username);
      // Закрываем модал через 1.5 секунды
      setTimeout(() => setShowInviteModal(false), 1500);
    } catch (err) {
      console.error(err);
      alert('Failed to send invitation');
    }
  };

  const topicColors = {
    1: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', accent: '#6366f1' },
    2: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', accent: '#10b981' },
    3: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', accent: '#f59e0b' },
  };

  return (
    <div className="topics-container">
      <Navbar />
      <div className="topics-content">
        <div className="topics-header">
          <h1>Choose a <span>Topic</span></h1>
          <p>Select a category and start your quiz battle. Play solo or invite a friend!</p>
        </div>

        {loading ? (
          <div className="loading">Loading topics...</div>
        ) : (
          <div className="topics-grid">
            {topics.map(topic => {
              const colors = topicColors[topic.id] || topicColors[1];
              return (
                <div
                  className="topic-card"
                  key={topic.id}
                  style={{ background: colors.bg, borderColor: colors.border }}
                >
                  <div className="topic-icon">{topic.icon}</div>
                  <h2 style={{ color: colors.accent }}>{topic.name}</h2>
                  <p>{topic.description}</p>
                  <div className="topic-info">
                    <span>📝 10 Questions</span>
                    <span>⏱ 30 sec each</span>
                  </div>
                  <div className="topic-buttons">
                    <button
                      className="btn-play"
                      style={{ background: colors.accent }}
                      onClick={() => handlePlay(topic)}
                    >
                      ▶ Play Solo
                    </button>
                    <button
                      className="btn-invite"
                      onClick={() => handleInvite(topic)}
                    >
                      ✉ Invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>⚡ Invite a Player</h3>
            <p>Topic: <span>{selected?.name}</span></p>

            {inviteSent ? (
              <div className="invite-success">
                ✅ Invitation sent to <b>{inviteSent}</b>!
              </div>
            ) : (
              <>
                {users.length === 0 ? (
                  <div className="no-users">No other players available right now.</div>
                ) : (
                  <div className="users-list">
                    {users.map(u => (
                      <div className="user-row" key={u.id}>
                        <div className="user-row-info">
                          <span className="user-row-name">{u.username}</span>
                          <span className="user-row-score">⭐ {u.total_score} pts · {u.games_played} games</span>
                        </div>
                        <button onClick={() => sendInvite(u)}>Invite</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button className="modal-close" onClick={() => setShowInviteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicsPage;