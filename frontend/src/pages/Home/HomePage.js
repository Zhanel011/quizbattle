import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import './HomePage.css';

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: '🎯', title: 'Choose Your Topic', desc: 'Pick from IT, Sports, Biology and more categories to test your knowledge.' },
    { icon: '⚡', title: 'Real-time Battles', desc: 'Challenge other players to live quiz battles and see who answers faster.' },
    { icon: '🏆', title: 'Climb the Leaderboard', desc: 'Earn points, win matches and rise to the top of the global rankings.' },
    { icon: '💬', title: 'Chat & Invite', desc: 'Message other players directly and send quiz battle invitations through chat.' },
  ];

  const audience = [
    { icon: '🎓', title: 'Students', desc: 'Test your academic knowledge while having fun' },
    { icon: '🧑‍💻', title: 'Tech Enthusiasts', desc: 'Prove your IT expertise against others' },
    { icon: '🏅', title: 'Sports Fans', desc: 'Show off your sports trivia knowledge' },
    { icon: '🧠', title: 'Knowledge Seekers', desc: 'Anyone who loves learning and competing' },
  ];

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-circle h1"></div>
          <div className="hero-circle h2"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">⚡ Real-time Quiz Platform</div>
          <h1>Welcome back, <span>{user?.username}</span>!</h1>
          <p>Challenge players, test your knowledge, and climb to the top. Pick a topic and start your battle now.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/topics')}>
              🎯 Start Playing
            </button>
            <button className="btn-secondary" onClick={() => navigate('/leaderboard')}>
              🏆 Leaderboard
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{user?.games_played || 0}</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user?.games_won || 0}</span>
              <span className="stat-label">Games Won</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user?.total_score || 0}</span>
              <span className="stat-label">Total Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>What is <span>QuizBattle?</span></h2>
        <p>QuizBattle is a real-time multiplayer quiz platform where players compete head-to-head in knowledge battles. Answer questions faster and more accurately than your opponent to win!</p>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>How It <span>Works</span></h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience Section */}
      <section className="audience-section">
        <h2>Who Is It <span>For?</span></h2>
        <div className="audience-grid">
          {audience.map((a, i) => (
            <div className="audience-card" key={i}>
              <span className="audience-icon">{a.icon}</span>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Battle?</h2>
        <p>Jump into a quiz, challenge your friends, and prove you're the smartest player!</p>
        <button className="btn-primary large" onClick={() => navigate('/topics')}>
          🚀 Play Now
        </button>
      </section>
    </div>
  );
}

export default HomePage;