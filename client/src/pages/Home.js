import React, { useEffect, useState } from 'react';
import { api } from '../api';
import './Home.css';

const QUOTES = [
  "Every goodbye makes the next hello closer.",
  "It's not goodbye, it's see you later.",
  "Some people come into our lives and leave footprints on our hearts.",
  "The memories we made together are the best souvenirs.",
  "Not all those who wander are lost — some are just starting a new adventure.",
];

export default function Home({ onNav }) {
  const [stats, setStats] = useState({ memories: 0, photos: 0, videos: 0, feedbacks: 0 });
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    api.get('/api/stats').then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 3,
      emoji: ['🌸', '✨', '💛', '🎉', '🌟', '💫', '🍂', '🎊'][Math.floor(Math.random() * 8)],
      size: 14 + Math.random() * 14,
    }));
    setConfetti(items);
  }, []);

  return (
    <div className="home">
      {/* Confetti particles */}
      <div className="confetti-wrap" aria-hidden>
        {confetti.map(c => (
          <span
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              fontSize: `${c.size}px`,
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">🎊 A Beautiful Chapter Ends</div>
        <h1 className="hero-title">
          Farewell,<br />
          <span className="hero-highlight">Wonderbiz</span>
          <br />Family 💛
        </h1>
        <p className="hero-quote">"{quote}"</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onNav('memories')}>
            📝 Share a Memory
          </button>
          <button className="btn btn-ghost" onClick={() => onNav('feedback')}>
            💌 Leave a Message
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        {[
          { icon: '💌', count: stats.memories, label: 'Memories', tab: 'memories' },
          { icon: '📸', count: stats.photos, label: 'Photos', tab: 'photos' },
          { icon: '🎬', count: stats.videos, label: 'Videos', tab: 'videos' },
          { icon: '💛', count: stats.feedbacks, label: 'Messages', tab: 'feedback' },
        ].map(s => (
          <button key={s.tab} className="stat-card" onClick={() => onNav(s.tab)}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-count">{s.count}</div>
            <div className="stat-label">{s.label}</div>
          </button>
        ))}
      </section>

      {/* About section */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-text">
            <h2>A Place to<br /><em>Remember & Cherish</em></h2>
            <p>
              This space is dedicated to the incredible journey at Wonderbiz — the late nights,
              the laughs, the wins, and the bonds that made it all worth it.
            </p>
            <p>
              Share your favorite memories, upload team photos and videos, and leave a farewell
              message for someone who made your time here unforgettable.
            </p>
            <button className="btn btn-primary" onClick={() => onNav('photos')}>
              📸 Browse Photos
            </button>
          </div>
          <div className="about-illustration">
            <div className="illustration-card card">
              <div className="ill-emoji">🌟</div>
              <h3>The Wonderbiz Way</h3>
              <p>Where ideas became products and colleagues became family.</p>
              <div className="ill-tags">
                <span>#innovation</span>
                <span>#teamwork</span>
                <span>#memories</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
