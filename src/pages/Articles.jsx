import React, { useEffect, useState } from 'react';
import { getAdminArticles, publishArticle, unpublishArticle, deleteArticle } from '../api/admin';
import { MdAdd, MdSearch, MdEdit, MdRemoveRedEye, MdDeleteOutline, MdDirectionsRun } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function Articles() {
  const [articles, setArticles]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();

  const fetchArticles = () => {
    setLoading(true);
    getAdminArticles()
      .then(res => setArticles(res.data.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, []);

  const togglePublish = async (a) => {
    try {
      if (a.is_published) await unpublishArticle(a.id);
      else await publishArticle(a.id);
      fetchArticles();
    } catch { alert('Toggle failed'); }
  };

  const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this article?')) {
          try {
              await deleteArticle(id);
              fetchArticles();
          } catch { alert('Failed to delete'); }
      }
  };

  const filtered = articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.author_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1A1D23' }}>Education Content</h1>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* Top Bar inside Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <MdSearch style={{ position: 'absolute', left: 16, top: 12, color: '#9CA3AF' }} size={20} />
            <input 
              placeholder="Search article" 
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 30, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <button 
            onClick={() => navigate('/articles/new')} 
            style={{ background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdAdd size={20} /> New Article
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: '2px solid #F3F4F6', color: '#6B7280' }}>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Cover</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Title</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Author</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Category</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Est Read</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Status</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Published</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="full-center"><div className="spinner" /></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No articles found.</td></tr>
            ) : filtered.map((a) => (
              <tr key={a.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                <td style={{ padding: '12px' }}>
                  <img src={a.cover_image_url || 'https://via.placeholder.com/60x40?text=Cover'} alt="Cover" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 600, color: '#1A1D23', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</td>
                <td style={{ padding: '12px', color: '#4B5563' }}>{a.author_name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#EFF6FF', color: '#3B82F6', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 500 }}>
                    <MdDirectionsRun /> {a.category}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#6B7280' }}>{a.estimated_read_time || 0} min</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span 
                    onClick={a.publish_status === 'scheduled' ? undefined : () => togglePublish(a)}
                    style={{ 
                      background: a.publish_status === 'scheduled' ? '#FFEABD' : a.is_published ? '#E8FBF7' : '#F3F4F6', 
                      color: a.publish_status === 'scheduled' ? '#FF9F43' : a.is_published ? '#00C9A7' : '#9CA3AF', 
                      borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, cursor: a.publish_status === 'scheduled' ? 'default' : 'pointer' 
                    }}>
                    {a.publish_status === 'scheduled' ? 'Scheduled' : a.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#6B7280' }}>
                  {a.publish_status === 'scheduled' && a.scheduled_publish_at 
                    ? `Sched: ${new Date(a.scheduled_publish_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' , year: 'numeric'})}` 
                    : a.published_at 
                      ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                      : '—'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <MdEdit size={18} style={{ cursor: 'pointer' }} onClick={() => navigate(`/articles/${a.id}/edit`)} />
                    <MdRemoveRedEye size={18} style={{ cursor: 'pointer' }} onClick={() => navigate(`/articles/${a.id}/edit`)} />
                    <MdDeleteOutline size={18} style={{ cursor: 'pointer', color: '#FF5C5C' }} onClick={() => handleDelete(a.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
