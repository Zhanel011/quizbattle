import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './ChatPage.css';

function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [invites, setInvites] = useState([]);
  const ws = useRef(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get('/users');
      setUsers(res.data.filter(u => u.id !== user.id));
    };
    const fetchInvites = async () => {
      const res = await API.get('/invitations/my');
      setInvites(res.data);
    };
    fetchUsers();
    fetchInvites();

    // WebSocket
    ws.current = new WebSocket('ws://localhost:5000');
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: 'register', userId: user.id }));
    };
    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === 'message') {
          setMessages(prev => [...prev, data.data]);
        }

        if (data.type === 'invite') {
          setInvites(prev => [...prev, data.invite]);
        }

        // Отправитель приглашения получает уведомление и переходит в игру
        if (data.type === 'invite_response' && data.status === 'accepted') {
          if (data.game_id && data.topic_id) {
            navigate(`/game/${data.game_id}?topic=${data.topic_id}`);
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };
    return () => ws.current?.close();
  }, [user.id]);

  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      const res = await API.get(`/messages/${selectedUser.id}`);
      setMessages(res.data);
      await API.put(`/messages/read/${selectedUser.id}`);
    };
    fetchMessages();
  }, [selectedUser]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser) return;
    try {
      const res = await API.post('/messages/send', {
        receiver_id: selectedUser.id,
        content: text,
      });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const respondInvite = async (invite, status) => {
    try {
      const res = await API.put(`/invitations/respond/${invite.id}`, { status });
      setInvites(prev => prev.filter(i => i.id !== invite.id));
      if (status === 'accepted' && res.data.game_id) {
        navigate(`/game/${res.data.game_id}?topic=${invite.topic_id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при ответе на приглашение');
    }
  };

  return (
    <div className="chat-container">
      <Navbar />
      <div className="chat-body">
        <div className="chat-sidebar">
          <div className="sidebar-title">Players</div>

          {invites.length > 0 && (
            <div className="invites-section">
              <div className="invites-title">⚡ Battle Invites</div>
              {invites.map(inv => (
                <div className="invite-card" key={inv.id}>
                  <p><b>{inv.sender_name}</b> invited you to <b>{inv.topic_name}</b></p>
                  <div className="invite-actions">
                    <button className="accept-btn" onClick={() => respondInvite(inv, 'accepted')}>Accept</button>
                    <button className="decline-btn" onClick={() => respondInvite(inv, 'declined')}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="users-list">
            {users.map(u => (
              <div
                key={u.id}
                className={`user-item ${selectedUser?.id === u.id ? 'active' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <div className="user-avatar">{u.username[0].toUpperCase()}</div>
                <div className="user-item-info">
                  <span className="user-item-name">{u.username}</span>
                  <span className="user-item-score">⭐ {u.total_score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-header-avatar">{selectedUser.username[0].toUpperCase()}</div>
                <div>
                  <div className="chat-header-name">{selectedUser.username}</div>
                  <div className="chat-header-score">⭐ {selectedUser.total_score} pts</div>
                </div>
              </div>

              <div className="messages-area">
                {messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.sender_id === user.id ? 'mine' : 'theirs'}`}>
                    {msg.is_invite && <span className="invite-tag">⚡ Battle Invite</span>}
                    <div className="message-bubble">{msg.content}</div>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEnd}></div>
              </div>

              <div className="chat-input-area">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-empty">
              <span>💬</span>
              <p>Select a player to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;