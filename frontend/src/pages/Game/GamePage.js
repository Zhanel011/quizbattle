import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import './GamePage.css';

function GamePage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await API.get(`/topics/${topicId}/questions`);
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [topicId]);

  const handleNext = useCallback(async (forcedAnswer = null) => {
    const answer = forcedAnswer ?? selected;
    const question = questions[current];

    const newAnswers = [...answers, {
      question_id: question.id,
      answer: answer || null,
    }];
    setAnswers(newAnswers);
    setSelected(null);
    setTimeLeft(30);

    if (current + 1 >= questions.length) {
      setFinished(true);
      try {
        await API.post('/games/submit', {
          game_id: parseInt(gameId),
          answers: newAnswers,
          time_spent: totalTime,
        });
        navigate(`/results/${gameId}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCurrent(prev => prev + 1);
    }
  }, [selected, questions, current, answers, gameId, totalTime, navigate]);

  // Timer
  useEffect(() => {
    if (loading || finished || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext(null);
          return 30;
        }
        return prev - 1;
      });
      setTotalTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, finished, questions, handleNext]);

  if (loading) return (
    <div className="game-loading">
      <div className="spinner"></div>
      <p>Loading questions...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="game-loading"><p>No questions found.</p></div>
  );

  const question = questions[current];
  const progress = ((current) / questions.length) * 100;
  const timerColor = timeLeft > 15 ? '#10b981' : timeLeft > 7 ? '#f59e0b' : '#ef4444';

  const options = [
    { key: 'a', text: question.option_a },
    { key: 'b', text: question.option_b },
    { key: 'c', text: question.option_c },
    { key: 'd', text: question.option_d },
  ];

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-progress-info">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="game-body">
        <div className="timer-circle" style={{ borderColor: timerColor }}>
          <span style={{ color: timerColor }}>{timeLeft}</span>
        </div>

        <div className="question-card">
          <div className="question-number">Q{current + 1}</div>
          <h2>{question.question_text}</h2>
        </div>

        <div className="options-grid">
          {options.map(opt => (
            <button
              key={opt.key}
              className={`option-btn ${selected === opt.key ? 'selected' : ''}`}
              onClick={() => setSelected(opt.key)}
            >
              <span className="option-key">{opt.key.toUpperCase()}</span>
              <span className="option-text">{opt.text}</span>
            </button>
          ))}
        </div>

        <button
          className="next-btn"
          onClick={() => handleNext()}
          disabled={finished}
        >
          {current + 1 === questions.length ? '🏁 Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

export default GamePage;