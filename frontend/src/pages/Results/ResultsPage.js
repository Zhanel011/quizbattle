import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './ResultsPage.css';

function ResultsPage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await API.get(`/games/result/${gameId}`);
        setResult(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [gameId]);

  if (loading) return (
    <div className="results-loading">
      <div className="spinner"></div>
      <p>Loading results...</p>
    </div>
  );

  if (!result) return (
    <div className="results-loading"><p>Result not found.</p></div>
  );

  const isPlayer1 = result.player1_id === user?.id;
  const myScore = isPlayer1 ? result.player1_score : result.player2_score;
  const myTime = isPlayer1 ? result.player1_time : result.player2_time;
  const total = 10;
  const percentage = Math.round((myScore / total) * 100);

  const getEmoji = () => {
    if (percentage === 100) return '🏆';
    if (percentage >= 70) return '🎉';
    if (percentage >= 40) return '👍';
    return '💪';
  };

  const getMessage = () => {
    if (percentage === 100) return 'Perfect Score!';
    if (percentage >= 70) return 'Great Job!';
    if (percentage >= 40) return 'Good Effort!';
    return 'Keep Practicing!';
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="results-container">
      <div className="results-bg">
        <div className="results-circle r1"></div>
        <div className="results-circle r2"></div>
      </div>

      <div className="results-content">
        <div className="results-emoji">{getEmoji()}</div>
        <h1>{getMessage()}</h1>
        <p className="results-topic">Topic: <span>{result.topic_name}</span></p>

        {/* Score Circle */}
        <div className="score-circle">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#6366f1"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="score-text">
            <span className="score-number">{myScore}/{total}</span>
            <span className="score-pct">{percentage}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="results-stats">
          <div className="result-stat">
            <span className="rstat-icon">✅</span>
            <span className="rstat-value">{myScore}</span>
            <span className="rstat-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="rstat-icon">❌</span>
            <span className="rstat-value">{total - myScore}</span>
            <span className="rstat-label">Wrong</span>
          </div>
          <div className="result-stat">
            <span className="rstat-icon">⏱</span>
            <span className="rstat-value">{formatTime(myTime)}</span>
            <span className="rstat-label">Time</span>
          </div>
          <div className="result-stat">
            <span className="rstat-icon">⭐</span>
            <span className="rstat-value">+{myScore}</span>
            <span className="rstat-label">Points</span>
          </div>
        </div>

        {/* Versus result */}
        {result.mode === 'versus' && result.player2_id && (
          <div className="versus-result">
            <h3>Battle Result</h3>
            <div className="versus-row">
              <div className={`versus-player ${result.winner_id === result.player1_id ? 'winner' : ''}`}>
                <span className="vp-name">{result.player1_name}</span>
                <span className="vp-score">{result.player1_score} pts</span>
                {result.winner_id === result.player1_id && <span className="winner-badge">👑 Winner</span>}
              </div>
              <span className="vs-text">VS</span>
              <div className={`versus-player ${result.winner_id === result.player2_id ? 'winner' : ''}`}>
                <span className="vp-name">{result.player2_name}</span>
                <span className="vp-score">{result.player2_score} pts</span>
                {result.winner_id === result.player2_id && <span className="winner-badge">👑 Winner</span>}
              </div>
            </div>
            {!result.winner_id && <p className="draw-text">🤝 It's a Draw!</p>}
          </div>
        )}

        {/* Buttons */}
        <div className="results-buttons">
          <button className="btn-primary" onClick={() => navigate('/topics')}>
            🎯 Play Again
          </button>
          <button className="btn-secondary" onClick={() => navigate('/leaderboard')}>
            🏆 Leaderboard
          </button>
          <button className="btn-secondary" onClick={() => navigate('/home')}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;