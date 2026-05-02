import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const isStaff = isAdmin || isModerator;

  // Обычный пользователь видит игровые страницы
  // Admin/Moderator видят только свою панель и профиль
  const navItems = isStaff
    ? [
        { path: '/admin', label: isAdmin ? 'Admin Panel' : 'Mod Panel', icon: isAdmin ? '👑' : '🛡' },
      ]
    : [
        { path: '/home', label: 'Home', icon: '🏠' },
        { path: '/topics', label: 'Topics', icon: '🎯' },
        { path: '/chat', label: 'Chat', icon: '💬' },
        { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
        { path: '/profile', label: 'Profile', icon: '👤' },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate(isStaff ? '/admin' : '/home')}>
        <span>⚡</span>
        <span className="logo-text">Quiz<b>Battle</b></span>
      </div>

      <div className="navbar-links">
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="username">{user?.username}</span>
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
