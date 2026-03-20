import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import '../pages/Memories.css';
import './Videos.css';

function VideoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', author: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const fileRef = useRef();

  const handle = async (e) => {
    e.preventDefault();
    if (!file) { toast('Please select a video', 'error'); return; }
    if (!form.author) { toast('Please enter your name', 'error'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('video', file);
    fd.append('title', form.title || 'Team Video');
    fd.append('author', form.author);
    const result = await api.postForm('/api/videos', fd);
    setLoading(false);
    if (result.id) { onSave(result); toast('Video uploaded! 🎬'); }
    else toast('Failed to upload video', 'error');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Upload a Video 🎬</div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Your Name</label>
            <input placeholder="e.g. Varad" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Video Title</label>
            <input placeholder="e.g. Our last team lunch 🍕" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Video File</label>
            <div className="upload-area" onClick={() => fileRef.current.click()}>
              {file ? (
                <div>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
                  <div style={{ fontWeight: 600 }}>{file.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
                  <div style={{ fontWeight: 600 }}>Click to choose a video</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
                    MP4, MOV, AVI, WEBM up to 100MB
                  </div>
                </>
              )}
            </div>
            <input type="file" accept="video/*" ref={fileRef}
              onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : '🎬 Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VideoCard({ video, onDelete }) {
  return (
    <div className="video-card card fade-up">
      <div className="video-wrapper">
        <video controls preload="metadata">
          <source src={api.mediaUrl(video.url)} />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="video-info">
        <div className="video-meta">
          <div>
            <h3 className="video-title">{video.title}</h3>
            <div className="video-author">Uploaded by {video.author}</div>
            <div className="video-date">
              {new Date(video.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
          </div>
          <button className="btn btn-danger" onClick={() => onDelete(video.id)}
            style={{ padding: '8px 12px', fontSize: 14, alignSelf: 'flex-start' }}>🗑</button>
        </div>
      </div>
    </div>
  );
}

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/api/videos').then(d => { setVideos(d); setLoading(false); });
  };
  useEffect(load, []);

  const onSave = (v) => { setVideos(prev => [v, ...prev]); setShowModal(false); };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    await api.delete(`/api/videos/${id}`);
    setVideos(prev => prev.filter(v => v.id !== id));
    toast('Video deleted');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Team Videos</h1>
          <p className="page-subtitle">Relive the best moments 🎬</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          🎥 Upload Video
        </button>
      </div>

      {loading ? <div className="spinner" /> : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>No videos yet</h3>
          <p>Upload your first team video to start the collection!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Upload Video</button>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map((v, i) => (
            <div key={v.id} style={{ animationDelay: `${i * 0.08}s` }}>
              <VideoCard video={v} onDelete={onDelete} />
            </div>
          ))}
        </div>
      )}

      {showModal && <VideoModal onClose={() => setShowModal(false)} onSave={onSave} />}
    </div>
  );
}
