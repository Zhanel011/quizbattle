import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import AuthPage from './pages/Auth/AuthPage';
import HomePage from './pages/Home/HomePage';
import TopicsPage from './pages/Topics/TopicsPage';
import GamePage from './pages/Game/GamePage';
import ChatPage from './pages/Chat/ChatPage';
import ResultsPage from './pages/Results/ResultsPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import AdminPage from './pages/Admin/AdminPage';
import ProfilePage from './pages/Profile/ProfilePage';

// Только для авторизованных
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

// Только для admin и moderator
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && (user.role === 'admin' || user.role === 'moderator')
    ? children
    : <Navigate to="/home" />;
};

// Только для обычных пользователей (не admin/moderator)
const UserOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role === 'admin' || user.role === 'moderator') return <Navigate to="/admin" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        {/* Только для обычных игроков */}
        <Route path="/home" element={<UserOnlyRoute><HomePage /></UserOnlyRoute>} />
        <Route path="/topics" element={<UserOnlyRoute><TopicsPage /></UserOnlyRoute>} />
        <Route path="/game/:gameId" element={<UserOnlyRoute><GamePage /></UserOnlyRoute>} />
        <Route path="/chat" element={<UserOnlyRoute><ChatPage /></UserOnlyRoute>} />
        <Route path="/results/:gameId" element={<UserOnlyRoute><ResultsPage /></UserOnlyRoute>} />
        <Route path="/leaderboard" element={<UserOnlyRoute><LeaderboardPage /></UserOnlyRoute>} />

        {/* Только для обычных игроков */}
<Route path="/profile" element={<UserOnlyRoute><ProfilePage /></UserOnlyRoute>} />

        {/* Только для admin и moderator */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
