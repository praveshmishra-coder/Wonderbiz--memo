import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import './Memories.css';

const EMOJIS = ['💭', '😄', '🥹', '💡', '🎉', '🌟', '💪', '🙏', '❤️', '🚀', '🎯', '☕'];

const USER_ID = `user_${Math.random().toString(36).slice(2, 9)}`;

function MemoryCard({ memory, onDelete, onLike }) {
  const liked = memory.likedBy?.includes(USER_ID);
  return (
    <div className="memory-card card fade-up">
      <div className="memory-header">
        <span className="memory-emoji">{memory.emoji}</span>
        <div>
          <div className="memory-author">{memory.author}</div>
          <div className="memory-date">
            {new Date(memory.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </div>
        </div>
        <button className="memory-delete btn-danger btn" onClick={() => onDelete(memory.id)}>🗑</button>
      </div>
      <h3 className="memory-title">{memory.title}</h3>
      <p className="memory-content">{memory.content}</p>
      <div className="memory-footer">
        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={() => onLike(memory.id)}
        >
          {liked ? '❤️' : '🤍'} {memory.likes}
        </button>
      </div>
    </div>
  );
}

function MemoryModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', content: '', author: '', emoji: '💭' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.author) {
      toast('Please fill in all fields', 'error'); return;
    }
    setLoading(true);
    const result = await api.post('/api/memories', form);
    setLoading(false);
    if (result.id) { onSave(result); toast('Memory shared! 💌'); }
    else toast('Failed to save memory', 'error');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Share a Memory ✨</div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Your Name</label>
            <input placeholder="e.g. Rahul Sharma" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Memory Title</label>
            <input placeholder="Give your memory a title..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Your Memory</label>
            <textarea placeholder="Tell us about this special moment..." rows={5} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Choose an Emoji</label>
            <div className="emoji-picker">
              {EMOJIS.map(em => (
                <button type="button" key={em}
                  className={`emoji-opt ${form.emoji === em ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, emoji: em }))}
                >{em}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '💌 Share Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/api/memories').then(d => { setMemories(d); setLoading(false); });
  };
  useEffect(load, []);

  const onSave = (m) => { setMemories(prev => [m, ...prev]); setShowModal(false); };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this memory?')) return;
    await api.delete(`/api/memories/${id}`);
    setMemories(prev => prev.filter(m => m.id !== id));
    toast('Memory removed');
  };

  const onLike = async (id) => {
    const updated = await api.patch(`/api/memories/${id}/like`, { userId: USER_ID });
    if (updated.id) setMemories(prev => prev.map(m => m.id === id ? updated : m));
  };

  return (
    <div className="page memories-page">
      <div className="page-header">
        <div>
          <h1>Resignation Memories</h1>
          <p className="page-subtitle">The moments that made Wonderbiz unforgettable</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ✍️ Share a Memory
        </button>
      </div>

      {loading ? <div className="spinner" /> : memories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💭</div>
          <h3>No memories yet</h3>
          <p>Be the first to share a memory from your time at Wonderbiz!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Share a Memory</button>
        </div>
      ) : (
        <div className="memories-grid">
          {memories.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${i * 0.07}s` }}>
              <MemoryCard memory={m} onDelete={onDelete} onLike={onLike} />
            </div>
          ))}
        </div>
      )}

      {showModal && <MemoryModal onClose={() => setShowModal(false)} onSave={onSave} />}
    </div>
  );
}
