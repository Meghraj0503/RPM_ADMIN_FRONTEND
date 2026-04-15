import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdCloudUpload, MdArrowBack } from 'react-icons/md';
import { getArticle, createArticle, updateArticle, uploadFile } from '../api/admin';

const CATEGORIES = ['Nutrition', 'Movement', 'Sleep', 'Mental Health', 'Spiritual Wellbeing'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function ArticleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '', author_name: '', category: 'Nutrition', estimated_read_time: '', content: '', cover_image_url: '', is_published: false
  });
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Schedule state
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedEnabled, setSchedEnabled] = useState(false);

  useEffect(() => {
    if (id) {
      getArticle(id).then(res => {
        if (res.data && res.data.article) {
          const art = res.data.article;
          setForm(art);
          // Restore scheduled date/time if any
          if (art.scheduled_publish_at) {
            const d = new Date(art.scheduled_publish_at);
            setSchedDate(d.toISOString().split('T')[0]);
            setSchedTime(d.toTimeString().slice(0, 5));
            setSchedEnabled(true);
          }
        }
      }).catch(() => { alert('Failed to load article'); navigate('/articles'); });
    }
  }, [id, navigate]);

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = async (file) => {
    setFileError('');
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File exceeds 50MB limit.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadFile(formData);
      setForm(prev => ({ ...prev, cover_image_url: res.data.url }));
    } catch {
      setFileError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (e, mode) => {
    // mode: 'draft' | 'publish' | 'schedule'
    e.preventDefault();
    if (!form.title || !form.author_name || !form.content) {
      alert('Please fill out all required fields.');
      return;
    }
    if (mode === 'schedule') {
      if (!schedDate || !schedTime) {
        alert('Please select a Schedule Date and Time first.');
        return;
      }
      const scheduledAt = new Date(`${schedDate}T${schedTime}:00`);
      if (scheduledAt <= new Date()) {
        alert('Scheduled time must be in the future.');
        return;
      }
    }
    setSaving(true);
    const payload = { ...form };
    if (mode === 'draft') {
      payload.is_published = false;
      payload.scheduled_publish_at = null;
    } else if (mode === 'publish') {
      payload.is_published = true;
      payload.scheduled_publish_at = null;
    } else if (mode === 'schedule') {
      payload.is_published = false;
      payload.scheduled_publish_at = new Date(`${schedDate}T${schedTime}:00`).toISOString();
    }
    try {
      if (id) await updateArticle(id, payload);
      else await createArticle(payload);
      navigate('/articles');
    } catch {
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{id ? 'Edit Article' : 'New Article'}</h1>
        <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0, marginTop: 4 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/articles')}>Articles</span> &gt; {id ? 'Edit Article' : 'New Article'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
        
        {/* Left Form */}
        <div style={{ background: '#fff', padding: 32, borderRadius: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Title</label>
            <input className="form-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ borderRadius: 12, padding: '14px 16px' }} />
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Author Name</label>
            <input className="form-input" placeholder="Dr. Anjali Mehta" value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} style={{ borderRadius: 12, padding: '14px 16px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ borderRadius: 12, padding: '14px 16px' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Estimated read</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" placeholder="5" value={form.estimated_read_time} onChange={e => setForm({ ...form, estimated_read_time: e.target.value })} style={{ borderRadius: 12, padding: '14px 16px', paddingRight: 80 }} />
                <span style={{ position: 'absolute', right: 16, top: 14, color: '#9CA3AF', fontSize: 14 }}>Minutes</span>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Cover</label>
            <div 
              onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
              style={{ border: '2px dashed #00C9A7', borderRadius: 12, background: '#F0FDF8', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
              {uploading ? (
                <div style={{ color: '#00C9A7', fontWeight: 600 }}>Uploading...</div>
              ) : form.cover_image_url ? (
                <div>
                    <img src={form.cover_image_url} alt="Cover" style={{ maxHeight: 120, borderRadius: 8 }} />
                    <p style={{ marginTop: 12, color: '#00C9A7', fontSize: 13, fontWeight: 500 }}>Click or drag to replace image/video</p>
                </div>
              ) : (
                <>
                  <MdCloudUpload size={32} color="#00C9A7" style={{ marginBottom: 10 }} />
                  <div style={{ color: '#00C9A7', fontWeight: 500 }}>Drop image or click to upload</div>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]) }} style={{ display: 'none' }} accept="image/*,video/*,audio/*" />
            </div>
            {fileError && <div style={{ color: '#FF5C5C', fontSize: 12, marginTop: 8 }}>{fileError}</div>}
            
            <div style={{ marginTop: 12 }}>
                <span style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 4 }}>Or provide a direct URL (optional):</span>
                <input className="form-input" placeholder="https://example.com/image.jpg" value={form.cover_image_url} onChange={e => setForm({...form, cover_image_url: e.target.value})} style={{ borderRadius: 8, padding: '10px 12px' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 24 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Content</label>
            <textarea className="form-input" rows={12} placeholder="Start writing your articles" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} style={{ borderRadius: 12, padding: '16px' }} />
          </div>

          {/* ── Schedule Article Section ── */}
          <div style={{ marginTop: 24, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: schedEnabled ? 16 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Schedule Article</span>
              </div>
              {/* toggle switch */}
              <div
                onClick={() => setSchedEnabled(v => !v)}
                style={{ width: 42, height: 24, borderRadius: 12, background: schedEnabled ? '#00C9A7' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, left: schedEnabled ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {schedEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>Date</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <input
                      type="date"
                      value={schedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setSchedDate(e.target.value)}
                      style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: schedDate ? '#111' : '#9CA3AF', flex: 1 }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 6 }}>Time</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={e => setSchedTime(e.target.value)}
                      style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: schedTime ? '#111' : '#9CA3AF', flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {schedEnabled && schedDate && schedTime && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#00C9A7', fontWeight: 600 }}>
                ✓ Article will auto-publish on {new Date(`${schedDate}T${schedTime}`).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: 320, height: 650, borderRadius: 40, border: '12px solid #1A1D23', background: '#fff', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            {/* Dynamic Island Mock */}
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 100, height: 26, background: '#1A1D23', borderRadius: 20, zIndex: 10 }}></div>
            
            <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 40 }}>
              {form.cover_image_url ? (
                <img src={form.cover_image_url} alt="Cover" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: 220, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>No Cover</div>
              )}
              
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <span style={{ background: '#FFF0F0', color: '#FF5C5C', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>{form.category || 'Category'}</span>
                  <span style={{ color: '#6B7280', fontSize: 11, display: 'flex', alignItems: 'center' }}>{form.estimated_read_time || '0'} min read</span>
                </div>
                
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.3 }}>{form.title || 'Untitled Article'}</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00C9A7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                    {form.author_name ? form.author_name[0] : 'A'}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{form.author_name || 'Author Name'}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                <div style={{ fontSize: 13, lineHeight: 1.6, color: '#4B5563', whiteSpace: 'pre-wrap' }}>
                  {form.content || 'Content will appear here...'}
                </div>
              </div>
            </div>
          </div>

          {/* Status badge */}
          {id && form.publish_status === 'scheduled' && form.scheduled_publish_at && (
            <div style={{ marginBottom: 16, padding: '10px 16px', background: '#FFF8EC', border: '1px solid #FFB020', borderRadius: 10, fontSize: 13, color: '#B45309', textAlign: 'center' }}>
              ⏰ Scheduled to publish on {new Date(form.scheduled_publish_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, width: '100%', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={(e) => handlePublish(e, 'draft')} disabled={saving} style={{ 
                background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB', borderRadius: 30, padding: '14px 20px', 
                fontSize: 15, fontWeight: 600, cursor: 'pointer', flex: 1 
              }}>Save Draft</button>
              <button onClick={(e) => handlePublish(e, 'publish')} disabled={saving} style={{ 
                background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, padding: '14px 20px', 
                fontSize: 15, fontWeight: 700, cursor: 'pointer', flex: 1, boxShadow: '0 8px 16px rgba(0,238,190,0.2)' 
              }}>Publish Now</button>
            </div>
            {schedEnabled && (
              <button
                onClick={(e) => handlePublish(e, 'schedule')}
                disabled={saving || !schedDate || !schedTime}
                style={{
                  width: '100%', background: schedDate && schedTime ? '#00C9A7' : '#D1D5DB',
                  color: schedDate && schedTime ? '#fff' : '#9CA3AF',
                  border: 'none', borderRadius: 30, padding: '14px 20px',
                  fontSize: 15, fontWeight: 700, cursor: schedDate && schedTime ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Schedule · {schedDate && schedTime ? new Date(`${schedDate}T${schedTime}`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' at ' + schedTime : 'set date & time above'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
