import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';
import '../pages/Memories.css';
import './Photos.css';

function PhotoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ caption: '', author: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const fileRef = useRef();

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handle = async (e) => {
    e.preventDefault();
    if (!file) { toast('Please select a photo', 'error'); return; }
    if (!form.author) { toast('Please enter your name', 'error'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('photo', file);
    fd.append('caption', form.caption);
    fd.append('author', form.author);
    const result = await api.postForm('/api/photos', fd);
    setLoading(false);
    if (result.id) { onSave(result); toast('Photo uploaded! 📸'); }
    else toast('Failed to upload photo', 'error');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Upload a Photo 📸</div>
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Your Name</label>
            <input placeholder="e.g. Priya Mehta" value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Caption (optional)</label>
            <input placeholder="What's happening in this photo?" value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Photo</label>
            <div className="upload-area" onClick={() => fileRef.current.click()}>
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8 }} />
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                  <div style={{ fontWeight: 600 }}>Click to choose a photo</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
                    JPG, PNG, GIF, WEBP up to 100MB
                  </div>
                </>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileRef} onChange={onFile} style={{ display: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : '📸 Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose, onPrev, onNext }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lb-nav lb-prev" onClick={e => { e.stopPropagation(); onPrev(); }}>‹</button>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <img src={api.mediaUrl(photo.url)} alt={photo.caption} />
        <div className="lightbox-info">
          <span className="lb-author">{photo.author}</span>
          {photo.caption && <p className="lb-caption">{photo.caption}</p>}
          <span className="lb-date">
            {new Date(photo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
      <button className="lb-nav lb-next" onClick={e => { e.stopPropagation(); onNext(); }}>›</button>
    </div>
  );
}

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    api.get('/api/photos').then(d => { setPhotos(d); setLoading(false); });
  };
  useEffect(load, []);

  const onSave = (p) => { setPhotos(prev => [p, ...prev]); setShowModal(false); };

  const onDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo?')) return;
    await api.delete(`/api/photos/${id}`);
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (lightboxIdx !== null) setLightboxIdx(null);
    toast('Photo deleted');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Team Photos</h1>
          <p className="page-subtitle">Moments frozen in time 📸</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          📷 Upload Photo
        </button>
      </div>

      {loading ? <div className="spinner" /> : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h3>No photos yet</h3>
          <p>Upload your first team photo to start the gallery!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Upload Photo</button>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((p, i) => (
            <div key={p.id} className="photo-item card" onClick={() => setLightboxIdx(i)}>
              <img src={api.mediaUrl(p.url)} alt={p.caption || 'Team photo'} loading="lazy" />
              <div className="photo-overlay">
                <div className="photo-overlay-info">
                  <span className="photo-author">{p.author}</span>
                  {p.caption && <p className="photo-caption">{p.caption}</p>}
                </div>
                <button className="photo-delete" onClick={e => onDelete(p.id, e)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <PhotoModal onClose={() => setShowModal(false)} onSave={onSave} />}
      {lightboxIdx !== null && (
        <Lightbox
          photo={photos[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i - 1 + photos.length) % photos.length)}
          onNext={() => setLightboxIdx(i => (i + 1) % photos.length)}
        />
      )}
    </div>
  );
}
