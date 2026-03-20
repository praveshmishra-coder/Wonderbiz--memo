import React, { useState, useEffect } from 'react';
import './Navbar.css';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'memories', label: 'Memories', icon: '💌' },
  { id: 'photos', label: 'Photos', icon: '📸' },
  { id: 'videos', label: 'Videos', icon: '🎬' },
  { id: 'feedback', label: 'Farewell Wall', icon: '💛' },
];

export default function Navbar({ active, onNav }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span className="brand-icon">✨</span>
          <div>
            <div className="brand-title">Wonderbiz</div>
            <div className="brand-sub">Farewell Memories</div>
          </div>
        </div>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-link ${active === t.id ? 'active' : ''}`}
              onClick={() => { onNav(t.id); setMenuOpen(false); }}
            >
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
