import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdSearch, MdAdd, MdEdit, MdDelete, MdVisibility,
  MdFitnessCenter, MdPublish, MdUnpublished, MdSettings,
  MdSchool, MdArticle, MdVideoLibrary, MdImage, MdQuiz
} from 'react-icons/md';
import {
  getTrainingModules, getTrainingCategories,
  deleteTrainingModule, toggleTrainingPublish
} from '../api/admin';
import '../styles/training.css';

const CHIP_ICONS = {
  articles:      <MdArticle style={{ fontSize: 10 }} />,
  audio_video:   <MdVideoLibrary style={{ fontSize: 10 }} />,
  image:         <MdImage style={{ fontSize: 10 }} />,
  questionnaire: <MdQuiz style={{ fontSize: 10 }} />,
};
const CHIP_LABELS = {
  articles:      'Article',
  audio_video:   'Media',
  image:         'Image',
  questionnaire: 'Quiz',
};

export default function TrainingManagement() {
  const navigate = useNavigate();
  const [modules, setModules]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filters, setFilters]     = useState({ q: '', category_id: '', is_published: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, module: null });
  const [actionLoading, setActionLoading] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filters.q)           params.q           = filters.q;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.is_published !== '') params.is_published = filters.is_published;
      const res = await getTrainingModules(params);
      setModules(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  useEffect(() => {
    getTrainingCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.module) return;
    setActionLoading('delete-' + deleteModal.module.id);
    try {
      await deleteTrainingModule(deleteModal.module.id);
      setDeleteModal({ open: false, module: null });
      fetchModules();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePublish = async (mod, e) => {
    e.stopPropagation();
    setActionLoading('pub-' + mod.id);
    try {
      await toggleTrainingPublish(mod.id);
      fetchModules();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="tm-page">

      {/* Header */}
      <div className="tm-page-header">
        <div className="tm-page-title-row">
          <h1 className="tm-page-title">Trainings Management</h1>
          <span className="tm-count-badge">{total}</span>
        </div>
        <div className="tm-header-icons">
          <button className="tm-icon-btn" title="Settings"><MdSettings /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="tm-filters">
        <div className="tm-search-wrap">
          <MdSearch className="tm-search-icon" />
          <input
            className="tm-search"
            placeholder="Search training..."
            value={filters.q}
            onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
          />
        </div>

        <select
          className="tm-select"
          value={filters.category_id}
          onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}
        >
          <option value="">All category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          className="tm-select"
          value={filters.is_published}
          onChange={e => setFilters(f => ({ ...f, is_published: e.target.value }))}
        >
          <option value="">Status: All</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </select>

        <button className="tm-create-btn" onClick={() => navigate('/training/new')}>
          <MdAdd /> Create Training
        </button>
      </div>

      {/* Grid */}
      <div className="tm-grid">
        {loading && <div className="tm-loading">Loading trainings...</div>}
        {!loading && modules.length === 0 && (
          <div className="tm-empty">
            <MdSchool style={{ fontSize: 40, color: 'var(--border)', display: 'block', margin: '0 auto 8px' }} />
            No training modules found. Create your first training!
          </div>
        )}
        {!loading && modules.map(mod => (
          <TrainingCard
            key={mod.id}
            mod={mod}
            actionLoading={actionLoading}
            onView={() => navigate(`/training/${mod.id}`)}
            onEdit={e => { e.stopPropagation(); navigate(`/training/${mod.id}/edit`); }}
            onDelete={e => { e.stopPropagation(); setDeleteModal({ open: true, module: mod }); }}
            onTogglePublish={e => handleTogglePublish(mod, e)}
          />
        ))}
      </div>

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, module: null })}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Delete Training</div>
            <div className="modal-desc">
              Are you sure you want to delete <strong>{deleteModal.module?.title}</strong>?
              This action cannot be undone.
            </div>
            <div className="modal-btns">
              <button className="modal-btn modal-btn-cancel" onClick={() => setDeleteModal({ open: false, module: null })}>
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={handleDelete}
                disabled={actionLoading === 'delete-' + deleteModal.module?.id}
              >
                {actionLoading === 'delete-' + deleteModal.module?.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrainingCard({ mod, onView, onEdit, onDelete, onTogglePublish, actionLoading }) {
  const categories   = mod.categories || [];
  const sessionCount = mod.total_sessions ?? mod.sessions?.length ?? 0;
  const contentTypes = mod.content_types || [];
  const { completed_sessions = 0, unique_users = 0 } = mod.progress_stats || {};

  const avgPct = unique_users > 0 && sessionCount > 0
    ? Math.min(100, Math.round((completed_sessions / (sessionCount * unique_users)) * 100))
    : 0;

  const createdDate = mod.created_at
    ? new Date(mod.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const expiryDate = mod.expiry_date
    ? new Date(mod.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const isLoading = actionLoading === 'pub-' + mod.id;

  return (
    <div className="tc-card" onClick={onView} style={{ cursor: 'pointer' }}>

      {/* Thumbnail */}
      <div className="tc-card-img-wrap">
        {mod.thumbnail_url
          ? <img src={mod.thumbnail_url} alt={mod.title} className="tc-card-img" />
          : <div className="tc-card-img-ph"><MdSchool /></div>
        }
        <div className="tc-card-img-overlay">
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <span className={`tc-badge ${mod.is_published ? 'tc-badge-published' : 'tc-badge-draft'}`}>
              {mod.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          {categories[0] && (
            <span className="tc-badge tc-badge-category">{categories[0].name}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="tc-card-body">
        <div className="tc-card-title">{mod.title}</div>
        {mod.short_description && (
          <div className="tc-card-desc">{mod.short_description}</div>
        )}

        {/* Content type chips */}
        {contentTypes.length > 0 && (
          <div className="tc-content-types">
            {contentTypes.map(ct => (
              <span key={ct} className={`tc-content-chip ${ct}`}>
                {CHIP_ICONS[ct]} {CHIP_LABELS[ct] || ct}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="tc-card-meta">
          <span>Created: {createdDate}</span>
          {expiryDate && <span>Expiry: {expiryDate}</span>}
          {unique_users > 0 && (
            <span>{unique_users} user{unique_users !== 1 ? 's' : ''} started</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="tc-progress-wrap">
          <div className="tc-progress-label">
            <span>Completion</span>
            <span>{avgPct}%</span>
          </div>
          <div className="tc-progress-bar">
            <div className="tc-progress-fill" style={{ width: `${avgPct}%` }} />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="tc-card-footer" onClick={e => e.stopPropagation()}>
        <span className="tc-sessions-count">
          <MdFitnessCenter /> {sessionCount} unit{sessionCount !== 1 ? 's' : ''}
        </span>
        <div className="tc-action-spacer" />
        <button
          className="tc-action-btn publish-btn"
          title={mod.is_published ? 'Unpublish' : 'Publish'}
          onClick={onTogglePublish}
          disabled={isLoading}
        >
          {mod.is_published ? <MdUnpublished /> : <MdPublish />}
        </button>
        <button className="tc-action-btn view" title="View" onClick={onView}>
          <MdVisibility />
        </button>
        <button className="tc-action-btn" title="Edit" onClick={onEdit}>
          <MdEdit />
        </button>
        <button className="tc-action-btn delete" title="Delete" onClick={onDelete}>
          <MdDelete />
        </button>
      </div>
    </div>
  );
}
