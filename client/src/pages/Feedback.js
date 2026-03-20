import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import '../pages/Memories.css';
import './Feedback.css';

const ROLES = [
  'Team Member', 'Manager', 'Tech Lead', 'Designer', 'Developer',
  'QA Engineer', 'Product Manager', 'HR', 'Intern', 'Other'
];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          type="button" key={n}
          className={`star ${n <= (hover || value) ? 'filled' : ''}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >★</button>
      ))}
    </div>
  );
}

function FeedbackModal({ onClose, onSave }) {
  const [form, setForm] = useState({ author: '', role: 'Team Member', message: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    if (!form.author || !form.message) {
      toast('Please fill in all fields', 'error'); return;
    }
    setLoading(true);
    const result = await api.post('/api/feedbacks', form);
    setLoading(false);
    if (result.id) { onSave(result); toast('Message posted! 💛'); }
    else toast('Failed to post message', 'error');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Leave a Farewell Message 💛</div>
        <form onSubmit={handle}>
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input placeholder="e.g. Siddhesh" value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Your Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Your Message</label>
            <textarea
              placeholder="Share your feelings, memories, wishes… write from your heart 💛"
              rows={5} value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>How was our bond?</label>
            <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : '💛 Post Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeedbackCard({ fb, onDelete, index }) {
  const colors = [
    '#FFF9E8', '#FFF0F0', '#F0FFF4', '#F0F4FF', '#FFF5F0',
    '#F5F0FF', '#F0FFFF', '#FFFEF0',
  ];
  const bg = colors[index % colors.length];

  return (
    <div className="fb-card card fade-up" style={{ background: bg }}>
      <div className="fb-header">
        <div className="fb-avatar">
          {fb.author.charAt(0).toUpperCase()}
        </div>
        <div className="fb-meta">
          <div className="fb-author">{fb.author}</div>
          <div className="fb-role">{fb.role}</div>
        </div>
        <div className="fb-stars">
          {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
        </div>
        <button className="btn btn-danger" onClick={() => onDelete(fb.id)}
          style={{ padding: '6px 10px', fontSize: 13, marginLeft: 'auto' }}>🗑</button>
      </div>
      <p className="fb-message">"{fb.message}"</p>
      <div className="fb-date">
        {new Date(fb.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </div>
    </div>
  );
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/api/feedbacks').then(d => { setFeedbacks(d); setLoading(false); });
  };
  useEffect(load, []);

  const onSave = (fb) => { setFeedbacks(prev => [fb, ...prev]); setShowModal(false); };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await api.delete(`/api/feedbacks/${id}`);
    setFeedbacks(prev => prev.filter(f => f.id !== id));
    toast('Message deleted');
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Farewell Wall 💛</h1>
          <p className="page-subtitle">Messages from the heart</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ✍️ Leave a Message
        </button>
      </div>

      {/* Summary banner */}
      {feedbacks.length > 0 && (
        <div className="fb-summary">
          <div className="fb-summary-item">
            <div className="fbs-num">{feedbacks.length}</div>
            <div className="fbs-label">Messages</div>
          </div>
          <div className="fb-summary-divider" />
          <div className="fb-summary-item">
            <div className="fbs-num">{avgRating}</div>
            <div className="fbs-label">Avg. Bond Rating</div>
          </div>
          <div className="fb-summary-divider" />
          <div className="fb-summary-item">
            <div className="fbs-num">
              {'★'.repeat(Math.round(parseFloat(avgRating) || 0))}
            </div>
            <div className="fbs-label">Out of 5 stars</div>
          </div>
        </div>
      )}

      {loading ? <div className="spinner" /> : feedbacks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💛</div>
          <h3>No messages yet</h3>
          <p>Be the first to leave a farewell message!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Leave a Message</button>
        </div>
      ) : (
        <div className="fb-grid">
          {feedbacks.map((fb, i) => (
            <div key={fb.id} style={{ animationDelay: `${i * 0.06}s` }}>
              <FeedbackCard fb={fb} onDelete={onDelete} index={i} />
            </div>
          ))}
        </div>
      )}

      {showModal && <FeedbackModal onClose={() => setShowModal(false)} onSave={onSave} />}
    </div>
  );
}
