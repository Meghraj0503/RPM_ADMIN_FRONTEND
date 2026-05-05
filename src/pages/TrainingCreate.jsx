import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdArrowBack, MdAdd, MdDelete, MdEdit, MdExpandMore, MdExpandLess,
  MdImage, MdArticle, MdVideoLibrary, MdQuiz, MdSmartphone,
  MdClose, MdMusicNote, MdCheckCircle, MdSchool
} from 'react-icons/md';
import {
  getTrainingCategories, createTrainingCategory,
  createTrainingModule, getTrainingModuleById, updateTrainingModule,
  toggleTrainingPublish, getAdminArticles, uploadFile
} from '../api/admin';
import '../styles/training.css';

const TOPIC_TYPES = [
  { key: 'articles',      label: 'Articles',       Icon: MdArticle },
  { key: 'audio_video',   label: 'Audio/Video',    Icon: MdVideoLibrary },
  { key: 'image',         label: 'Image',          Icon: MdImage },
  { key: 'questionnaire', label: 'Questionnaires', Icon: MdQuiz },
];

const Q_TYPES = ['Multiple choice', 'Checkboxes', 'Dropdown', 'Short Answer', 'Paragraph', 'Rating'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// ─── URL type helpers ─────────────────────────────────────────────────────────
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^?&/\s]+)/);
  return m ? m[1] : null;
}
function getVimeoId(url) {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}
function isDirectVideo(url) { return /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url || ''); }
function isDirectAudio(url) { return /\.(mp3|wav|ogg|aac|flac|m4a)(\?|$)/i.test(url || ''); }

// ─── Smart Video Player ───────────────────────────────────────────────────────
function VideoPlayer({ url, iframeHeight = 150 }) {
  if (!url) return null;
  const ytId = getYouTubeId(url);
  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}`}
        style={{ width: '100%', height: iframeHeight, borderRadius: 6, border: 'none', marginTop: 4 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    );
  }
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}`}
        style={{ width: '100%', height: iframeHeight, borderRadius: 6, border: 'none', marginTop: 4 }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video"
      />
    );
  }
  if (isDirectVideo(url)) {
    return <video controls src={url} style={{ width: '100%', maxHeight: iframeHeight, borderRadius: 6, marginTop: 4, display: 'block' }} />;
  }
  // Unknown link — show a clickable preview
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="media-link-preview">
      <MdVideoLibrary style={{ fontSize: 16 }} /> Open video link ↗
    </a>
  );
}

// ─── Smart Audio Player ───────────────────────────────────────────────────────
function AudioPlayer({ url }) {
  if (!url) return null;
  if (isDirectAudio(url)) {
    return <audio controls src={url} style={{ width: '100%', height: 32, marginTop: 4, display: 'block' }} />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="media-link-preview">
      <MdMusicNote style={{ fontSize: 16 }} /> Open audio link ↗
    </a>
  );
}

// ─── Smart Image ─────────────────────────────────────────────────────────────
function SmartImage({ url, style, className }) {
  const [errored, setErrored] = useState(false);
  if (!url) return null;
  if (errored) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="media-link-preview" style={{ marginTop: 4 }}>
        <MdImage style={{ fontSize: 16 }} /> Open image link ↗
      </a>
    );
  }
  return (
    <img src={url} alt="" className={className} style={style}
      onError={() => setErrored(true)} />
  );
}

// ─── Rich Text Editor ──────────────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value || '';
    }
  }, []); // eslint-disable-line

  const execCmd = (cmd, val) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val || null);
  };

  return (
    <div className="tce-rte-wrap">
      <div className="tce-rte-toolbar">
        {[['bold','B'],['italic','I'],['underline','U'],['strikeThrough','S']].map(([cmd, lbl]) => (
          <button key={cmd} type="button" className="tce-rte-btn"
            onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}>
            <span style={
              cmd === 'bold'         ? { fontWeight: 700 }
              : cmd === 'italic'     ? { fontStyle: 'italic' }
              : cmd === 'underline'  ? { textDecoration: 'underline' }
              : { textDecoration: 'line-through' }
            }>{lbl}</span>
          </button>
        ))}
        <button type="button" className="tce-rte-btn"
          onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} title="List">¶</button>
        <button type="button" className="tce-rte-btn"
          onMouseDown={e => { e.preventDefault(); execCmd('formatBlock', 'h3'); }} title="Heading">Tt</button>
      </div>
      <div
        ref={ref}
        className="tce-rte-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || 'Type description...'}
        onInput={() => onChange(ref.current?.innerText || '')}
      />
    </div>
  );
}

// ─── Article Topic Editor (two-panel) ─────────────────────────────────────────
function ArticleTopicEditor({ value, onChange }) {
  const coverRef          = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]   = useState(false);
  const timer             = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile(fd);
      onChange({ ...(value || {}), thumbnail_url: res.data.url });
    } catch { /* silently ignore */ } finally { setCoverUploading(false); }
  };

  const search = useCallback((q) => {
    clearTimeout(timer.current);
    if (!q) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await getAdminArticles({ q, limit: 8 });
        setResults(res.data.data || res.data || []);
        setOpen(true);
      } catch { setResults([]); }
    }, 300);
  }, []);

  const pick = (article) => {
    onChange({
      article_id:    article.id,
      title:         article.title,
      body:          article.content || '',
      thumbnail_url: article.cover_image_url || value?.thumbnail_url || '',
    });
    setQuery(article.title);
    setOpen(false);
  };

  return (
    <div className="article-editor-wrap">
      {/* Left: cover image */}
      <div>
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
        <div className="article-cover-upload" onClick={() => coverRef.current?.click()} title={coverUploading ? 'Uploading...' : 'Upload cover image'}>
          {value?.thumbnail_url
            ? <img src={value.thumbnail_url} alt="" />
            : <div className="article-cover-placeholder">
                <MdImage />
              </div>
          }
        </div>
        <div className="article-cover-label">{coverUploading ? 'Uploading…' : 'Cover image'}</div>
      </div>

      {/* Right: search + inline fields */}
      <div className="article-editor-fields">
        {/* Library search */}
        <div className="article-search-wrap">
          <input
            className="topic-editor-input"
            placeholder="Search articles from library..."
            value={query}
            onChange={e => { setQuery(e.target.value); search(e.target.value); }}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && results.length > 0 && (
            <div className="article-search-dropdown">
              {results.map(a => (
                <div key={a.id} className="article-search-item" onMouseDown={() => pick(a)}>
                  {a.cover_image_url
                    ? <img src={a.cover_image_url} className="article-search-thumb" alt="" />
                    : <div className="article-search-thumb" style={{ background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><MdArticle /></div>
                  }
                  <div>
                    <div className="article-search-title">{a.title}</div>
                    <div className="article-search-cat">{a.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {value?.article_id && (
          <div className="article-selected-pill">
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value.title}</span>
            <span className="article-selected-clear"
              onClick={() => { onChange({ article_id: null, title: '', body: '', thumbnail_url: value?.thumbnail_url || '' }); setQuery(''); }}>
              ×
            </span>
          </div>
        )}

        <div className="article-or-divider">or write inline</div>

        <input
          className="topic-editor-input"
          placeholder="Article title"
          value={value?.title || ''}
          onChange={e => onChange({ ...(value || {}), article_id: null, title: e.target.value })}
        />
        <textarea
          className="topic-editor-textarea"
          placeholder="Article body text..."
          value={value?.body || ''}
          onChange={e => onChange({ ...(value || {}), article_id: null, body: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── Media Item (single audio/video) ──────────────────────────────────────────
function MediaItem({ item, idx, onUpdate, onRemove }) {
  const fileRef            = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile(fd);
      onUpdate(idx, 'url', res.data.url);
      if (!item.title) onUpdate(idx, 'title', file.name.replace(/\.[^/.]+$/, ''));
    } catch { /* silently ignore */ } finally { setUploading(false); }
  };

  return (
    <div className="media-item-card">
      <div className="media-item-header">
        <div className="media-type-tabs">
          {['video', 'audio'].map(t => (
            <button key={t} type="button"
              className={`media-type-tab ${item.media_type === t ? 'active' : ''}`}
              onClick={() => onUpdate(idx, 'media_type', t)}>
              {t === 'video' ? '▶ Video' : '♪ Audio'}
            </button>
          ))}
        </div>
        <button type="button" className="media-item-remove" onClick={() => onRemove(idx)}><MdClose /></button>
      </div>

      <input
        className="topic-editor-input"
        placeholder="Title"
        value={item.title}
        onChange={e => onUpdate(idx, 'title', e.target.value)}
      />

      <div className="media-upload-row">
        <input
          ref={fileRef}
          type="file"
          accept={item.media_type === 'video' ? 'video/*' : 'audio/*'}
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
        <button type="button" className="media-upload-btn"
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload file'}
        </button>
        <span className="media-or-text">or</span>
        <input
          className="media-url-input"
          placeholder="Paste URL..."
          value={item.url}
          onChange={e => onUpdate(idx, 'url', e.target.value)}
        />
      </div>

      {item.url && item.media_type === 'video' && <VideoPlayer url={item.url} iframeHeight={140} />}
      {item.url && item.media_type === 'audio' && <AudioPlayer url={item.url} />}

      <input
        className="topic-editor-input"
        placeholder="Duration (e.g. 2:30)"
        value={item.duration || ''}
        onChange={e => onUpdate(idx, 'duration', e.target.value)}
        style={{ width: 130 }}
      />
    </div>
  );
}

// ─── Media Editor (audio/video list) ─────────────────────────────────────────
function MediaEditor({ items, onChange }) {
  const update = (idx, field, val) =>
    onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const add    = () => onChange([...items, { id: Date.now(), title: '', url: '', media_type: 'video', duration: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="media-editor-list">
        {items.map((item, idx) => (
          <MediaItem key={item.id} item={item} idx={idx} onUpdate={update} onRemove={remove} />
        ))}
      </div>
      <button type="button" className="add-item-btn" onClick={add}>
        <MdAdd /> Add Audio/Video
      </button>
    </div>
  );
}

// ─── Image Item (single image) ────────────────────────────────────────────────
function ImageItem({ item, idx, onUpdate, onRemove }) {
  const fileRef            = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile(fd);
      onUpdate(idx, 'url', res.data.url);
      if (!item.title) onUpdate(idx, 'title', file.name.replace(/\.[^/.]+$/, ''));
    } catch { /* silently ignore */ } finally { setUploading(false); }
  };

  return (
    <div className="image-item-card">
      <div className="media-item-header">
        <input
          className="topic-editor-input"
          style={{ flex: 1 }}
          placeholder="Caption / title"
          value={item.title}
          onChange={e => onUpdate(idx, 'title', e.target.value)}
        />
        <button type="button" className="media-item-remove" onClick={() => onRemove(idx)}><MdClose /></button>
      </div>

      <div className="media-upload-row">
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <button type="button" className="media-upload-btn"
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <span className="media-or-text">or</span>
        <input
          className="media-url-input"
          placeholder="Paste URL..."
          value={item.url}
          onChange={e => onUpdate(idx, 'url', e.target.value)}
        />
      </div>

      {item.url
        ? <SmartImage url={item.url} className="image-preview-thumb" />
        : <div className="image-preview-ph"><MdImage /></div>
      }
    </div>
  );
}

// ─── Image Editor ─────────────────────────────────────────────────────────────
function ImageEditor({ items, onChange }) {
  const update = (idx, field, val) =>
    onChange(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const add    = () => onChange([...items, { id: Date.now(), title: '', url: '' }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div className="media-editor-list">
        {items.map((item, idx) => (
          <ImageItem key={item.id} item={item} idx={idx} onUpdate={update} onRemove={remove} />
        ))}
      </div>
      <button type="button" className="add-item-btn" onClick={add}>
        <MdAdd /> Add Image
      </button>
    </div>
  );
}

const CHOICE_TYPES = ['Multiple choice', 'Checkboxes', 'Dropdown'];

// ─── Questionnaire Editor ─────────────────────────────────────────────────────
function QuestionnaireEditor({ questions, onChange }) {
  const addQ    = () => onChange([...questions, { id: Date.now(), text: '', type: 'Multiple choice', options: ['', ''] }]);
  const removeQ = (i) => onChange(questions.filter((_, idx) => idx !== i));
  const updateQ = (i, field, val) => onChange(questions.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  // When switching type: preserve options only for choice→choice, clear for non-choice
  const switchType = (qi, newType) => {
    const isChoice = CHOICE_TYPES.includes(newType);
    onChange(questions.map((q2, idx) => {
      if (idx !== qi) return q2;
      return {
        ...q2,
        type: newType,
        options: isChoice
          ? (q2.options && q2.options.some(o => o) ? q2.options : ['', ''])
          : [],
      };
    }));
  };

  const addOpt  = (i) => updateQ(i, 'options', [...(questions[i].options || []), '']);
  const updateOpt = (qi, oi, val) => {
    const opts = [...questions[qi].options];
    opts[oi] = val;
    updateQ(qi, 'options', opts);
  };
  const removeOpt = (qi, oi) =>
    updateQ(qi, 'options', questions[qi].options.filter((_, i) => i !== oi));

  return (
    <div className="q-builder">
      {questions.map((q, qi) => (
        <div key={q.id} className="q-builder-item">
          <div className="q-item-header">
            <input
              className="q-item-text"
              placeholder={`Question ${qi + 1}`}
              value={q.text}
              onChange={e => updateQ(qi, 'text', e.target.value)}
            />
            <select className="q-type-select" value={q.type} onChange={e => switchType(qi, e.target.value)}>
              {Q_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <button type="button" className="q-remove-btn" onClick={() => removeQ(qi)}><MdClose /></button>
          </div>

          {CHOICE_TYPES.includes(q.type) && (
            <div className="q-options">
              {(q.options || []).map((opt, oi) => (
                <div key={oi} className="q-option-row">
                  <div className={`q-opt-indicator${q.type === 'Checkboxes' ? ' checkbox' : ''}`} />
                  <input
                    className="q-opt-input"
                    value={opt}
                    placeholder={`Option ${oi + 1}`}
                    onChange={e => updateOpt(qi, oi, e.target.value)}
                  />
                  <button type="button" className="q-opt-remove" onClick={() => removeOpt(qi, oi)}><MdClose /></button>
                </div>
              ))}
              <button type="button" className="q-add-option" onClick={() => addOpt(qi)}>+ Add option</button>
            </div>
          )}
          {q.type === 'Rating' && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>
              ★ Rating scale 1–5 — user selects a star rating
            </div>
          )}
          {q.type === 'Short Answer' && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>
              — Short text response field
            </div>
          )}
          {q.type === 'Paragraph' && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 4 }}>
              — Long paragraph response field
            </div>
          )}
        </div>
      ))}
      <button type="button" className="q-add-question" onClick={addQ}>
        <MdAdd /> Add Question
      </button>
    </div>
  );
}

// ─── Topic Editor (pending / not yet confirmed) ───────────────────────────────
function TopicEditor({ topic, onUpdate, onConfirm, onCancel }) {
  return (
    <div className="add-topic-section">
      <div className="add-topic-title">Select content type:</div>
      <div className="topic-type-grid">
        {TOPIC_TYPES.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={`topic-type-btn ${topic.type === key ? 'active' : ''}`}
            onClick={() => onUpdate({ ...topic, type: key, data: topic.type === key ? topic.data : {} })}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {topic.type && (
        <div className="topic-editor-area">
          {topic.type === 'articles' && (
            <ArticleTopicEditor
              value={topic.data}
              onChange={data => onUpdate({ ...topic, data })}
            />
          )}
          {topic.type === 'audio_video' && (
            <MediaEditor
              items={topic.data?.items || []}
              onChange={items => onUpdate({ ...topic, data: { items } })}
            />
          )}
          {topic.type === 'image' && (
            <ImageEditor
              items={topic.data?.items || []}
              onChange={items => onUpdate({ ...topic, data: { items } })}
            />
          )}
          {topic.type === 'questionnaire' && (
            <QuestionnaireEditor
              questions={topic.data?.questions || []}
              onChange={questions => onUpdate({ ...topic, data: { questions } })}
            />
          )}
        </div>
      )}

      <div className="topic-editor-actions">
        {onCancel && (
          <button type="button" className="topic-cancel-btn" onClick={onCancel}>Cancel</button>
        )}
        {topic.type && (
          <button type="button" className="topic-confirm-btn" onClick={onConfirm}>
            <MdCheckCircle style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Confirm
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Confirmed Topic Preview ──────────────────────────────────────────────────
function ConfirmedTopic({ topic, index, onEdit, onDelete }) {
  const typeInfo = TOPIC_TYPES.find(t => t.key === topic.type) || {};
  const label    = `Topic ${String(index + 1).padStart(2, '0')}`;

  return (
    <div className="topic-confirmed">
      <div className="topic-conf-header">
        <span className="topic-conf-label">{label}</span>
        <span className={`topic-type-badge ${topic.type}`}>{typeInfo.label || topic.type}</span>
        <div className="topic-conf-actions">
          <button type="button" className="topic-conf-btn" onClick={onEdit} title="Edit"><MdEdit /></button>
          <button type="button" className="topic-conf-btn del" onClick={onDelete} title="Delete"><MdDelete /></button>
        </div>
      </div>

      <div className="topic-conf-body">
        {topic.type === 'articles' && (
          <div>
            <div className="topic-article-row">
              <div className="topic-article-thumb">
                {topic.data?.thumbnail_url
                  ? <img src={topic.data.thumbnail_url} alt="" />
                  : <MdArticle />
                }
              </div>
              <div className="topic-article-info">
                <h4>{topic.data?.title || 'Article'}</h4>
                <p>{topic.data?.body || ''}</p>
              </div>
            </div>
            <div className="topic-article-links">
              <span className="topic-article-link" style={{ cursor: 'default' }} title="Display link — users tap this to browse the articles library in the app">See all articles</span>
              <span className="topic-article-link" style={{ cursor: 'default' }} title="Display link — users tap this to read the full article in the app">Read More</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              ↑ These links are displayed to users in the mobile app
            </div>
          </div>
        )}

        {topic.type === 'audio_video' && (
          <div className="topic-media-list">
            {(topic.data?.items || []).map(item => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div className="topic-media-row">
                  <div className={`topic-media-icon ${item.media_type || 'video'}`}>
                    {item.media_type === 'audio' ? <MdMusicNote /> : <MdVideoLibrary />}
                  </div>
                  <div>
                    <div className="topic-media-title">{item.title || 'Media'}</div>
                    {item.duration && <div className="topic-media-sub">{item.duration}</div>}
                  </div>
                </div>
                {item.url && item.media_type === 'video' && <VideoPlayer url={item.url} iframeHeight={120} />}
                {item.url && item.media_type === 'audio' && <AudioPlayer url={item.url} />}
              </div>
            ))}
            {!topic.data?.items?.length && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No media added</p>
            )}
          </div>
        )}

        {topic.type === 'image' && (
          <div className="topic-media-list">
            {(topic.data?.items || []).map(item => (
              <div key={item.id} style={{ marginBottom: 6 }}>
                <div className="topic-media-row">
                  {item.url
                    ? <div className="topic-media-icon image"><MdImage /></div>
                    : <div className="topic-media-icon image"><MdImage /></div>
                  }
                  <div className="topic-media-title">{item.title || 'Image'}</div>
                </div>
                {item.url && <SmartImage url={item.url} style={{ width: '100%', maxHeight: 80, borderRadius: 6, objectFit: 'cover', marginTop: 4 }} />}
              </div>
            ))}
            {!topic.data?.items?.length && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No images added</p>
            )}
          </div>
        )}

        {topic.type === 'questionnaire' && (
          <div className="topic-q-list">
            {(topic.data?.questions || []).map((q, qi) => (
              <div key={q.id || qi} className="topic-q-row">
                <div className="topic-q-text">
                  {q.text || `Question ${qi + 1}`}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 5, fontWeight: 400 }}>({q.type})</span>
                </div>
                {CHOICE_TYPES.includes(q.type) && (
                  <div className="topic-q-opts">
                    {(q.options || []).filter(o => o).slice(0, 4).map((opt, oi) => (
                      <span key={oi} className="topic-q-opt">{opt}</span>
                    ))}
                  </div>
                )}
                {q.type === 'Rating' && (
                  <div style={{ fontSize: 10, color: 'var(--primary)' }}>★★★★★ (1–5)</div>
                )}
                {(q.type === 'Short Answer' || q.type === 'Paragraph') && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {q.type === 'Short Answer' ? '— Short text' : '— Paragraph'}
                  </div>
                )}
              </div>
            ))}
            {!topic.data?.questions?.length && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No questions added</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Unit Block ───────────────────────────────────────────────────────────────
function UnitBlock({ unit, unitIndex, onUpdate, onDelete }) {
  const [expanded, setExpanded]             = useState(true);
  const [pendingTopic, setPendingTopic]     = useState(null);
  const [editingTopicIdx, setEditingTopicIdx] = useState(null);

  const updateTitle = (val) => onUpdate({ ...unit, title: val });
  const startAdd    = ()    => setPendingTopic({ type: null, data: {} });

  const confirmPending = () => {
    if (!pendingTopic?.type) return;
    onUpdate({ ...unit, topics: [...unit.topics, { ...pendingTopic, id: Date.now() }] });
    setPendingTopic(null);
  };

  const startEdit = (idx) => {
    setPendingTopic({ ...unit.topics[idx] });
    setEditingTopicIdx(idx);
  };

  const confirmEdit = () => {
    if (!pendingTopic?.type) return;
    onUpdate({ ...unit, topics: unit.topics.map((t, i) => i === editingTopicIdx ? { ...pendingTopic } : t) });
    setPendingTopic(null);
    setEditingTopicIdx(null);
  };

  const deleteTopic = (idx) =>
    onUpdate({ ...unit, topics: unit.topics.filter((_, i) => i !== idx) });

  return (
    <div className="unit-block">
      <div className="unit-header" onClick={() => setExpanded(e => !e)}>
        <span className="unit-label">Unit {String(unitIndex + 1).padStart(2, '0')} :</span>
        <input
          className="unit-title-input"
          placeholder="Enter unit title"
          value={unit.title}
          onClick={e => e.stopPropagation()}
          onChange={e => updateTitle(e.target.value)}
        />
        <div className="unit-header-actions">
          <button type="button" className="unit-icon-btn del"
            onClick={e => { e.stopPropagation(); onDelete(); }} title="Remove unit">
            <MdDelete />
          </button>
          <button type="button" className="unit-icon-btn"
            onClick={e => { e.stopPropagation(); setExpanded(x => !x); }}>
            {expanded ? <MdExpandLess /> : <MdExpandMore />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="unit-body">
          {unit.topics.map((topic, ti) => {
            if (editingTopicIdx === ti && pendingTopic) {
              return (
                <TopicEditor
                  key={topic.id}
                  topic={pendingTopic}
                  onUpdate={setPendingTopic}
                  onConfirm={confirmEdit}
                  onCancel={() => { setPendingTopic(null); setEditingTopicIdx(null); }}
                />
              );
            }
            return (
              <ConfirmedTopic
                key={topic.id}
                topic={topic}
                index={ti}
                onEdit={() => startEdit(ti)}
                onDelete={() => deleteTopic(ti)}
              />
            );
          })}

          {pendingTopic && editingTopicIdx === null && (
            <TopicEditor
              topic={pendingTopic}
              onUpdate={setPendingTopic}
              onConfirm={confirmPending}
              onCancel={() => setPendingTopic(null)}
            />
          )}

          {!pendingTopic && (
            <button type="button" className="unit-add-topic-btn" onClick={startAdd}>
              <MdAdd /> Add Topic
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Mobile Preview — Topic Detail Screen ────────────────────────────────────
function MobileTopicDetail({ topic, onBack }) {
  const typeInfo = TOPIC_TYPES.find(t => t.key === topic.type) || {};
  return (
    <>
      <div className="mp-detail-back" onClick={onBack}>‹ Back</div>
      <span className={`mp-type-badge ${topic.type}`} style={{ marginBottom: 6, display: 'inline-block' }}>
        {typeInfo.label}
      </span>

      {topic.type === 'articles' && (
        <>
          {topic.data?.thumbnail_url && (
            <img src={topic.data.thumbnail_url} className="mp-cover" alt=""
              onError={e => { e.target.style.display = 'none'; }} />
          )}
          <div className="mp-title">{topic.data?.title || 'Article'}</div>
          <div className="mp-content-text" style={{ lineHeight: 1.5 }}>{topic.data?.body || ''}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 8, color: 'var(--primary)', fontWeight: 700 }}>See all articles</span>
            <span style={{ fontSize: 8, color: 'var(--primary)', fontWeight: 700 }}>Read More</span>
          </div>
        </>
      )}

      {topic.type === 'audio_video' && (
        <div>
          {(topic.data?.items || []).map((it, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div className="mp-content-title">{it.title || 'Media'}{it.duration ? ` · ${it.duration}` : ''}</div>
              {it.url && it.media_type === 'video' && <VideoPlayer url={it.url} iframeHeight={100} />}
              {it.url && it.media_type === 'audio' && <AudioPlayer url={it.url} />}
              {!it.url && (
                <div style={{ padding: 6, background: 'var(--bg-main)', borderRadius: 4, textAlign: 'center', color: 'var(--text-muted)', fontSize: 9 }}>
                  {it.media_type === 'video' ? '▶ Video' : '♪ Audio'} — no file yet
                </div>
              )}
            </div>
          ))}
          {!topic.data?.items?.length && <div className="mp-content-text">No media added</div>}
        </div>
      )}

      {topic.type === 'image' && (
        <div>
          {(topic.data?.items || []).map((it, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              {it.url
                ? <SmartImage url={it.url} style={{ width: '100%', borderRadius: 4, objectFit: 'cover' }} />
                : <div style={{ height: 50, background: 'var(--bg-main)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <MdImage style={{ fontSize: 20 }} />
                  </div>
              }
              {it.title && <div className="mp-content-text" style={{ marginTop: 2 }}>{it.title}</div>}
            </div>
          ))}
          {!topic.data?.items?.length && <div className="mp-content-text">No images added</div>}
        </div>
      )}

      {topic.type === 'questionnaire' && (
        <div>
          {(topic.data?.questions || []).map((q, qi) => {
            const isChoice = CHOICE_TYPES.includes(q.type);
            return (
              <div key={q.id || qi} style={{ marginBottom: 8, padding: '6px 8px', background: 'var(--bg-main)', borderRadius: 4 }}>
                <div className="mp-content-title">{q.text || `Q${qi + 1}`}</div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 4 }}>{q.type}</div>
                {isChoice && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {(q.options || []).filter(o => o).map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: q.type === 'Checkboxes' ? 2 : '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                        <span style={{ fontSize: 8, color: 'var(--text-primary)' }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {q.type === 'Dropdown' && (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 3, padding: '2px 5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>Select option…</span>
                    <span style={{ fontSize: 8 }}>▾</span>
                  </div>
                )}
                {q.type === 'Rating' && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 13, color: '#D1D5DB' }}>☆</span>)}
                  </div>
                )}
                {q.type === 'Short Answer' && (
                  <div style={{ height: 14, borderBottom: '1px solid var(--border)', marginTop: 4, width: '70%' }} />
                )}
                {q.type === 'Paragraph' && (
                  <div style={{ height: 28, border: '1px solid var(--border)', borderRadius: 3, marginTop: 4 }} />
                )}
              </div>
            );
          })}
          {!topic.data?.questions?.length && <div className="mp-content-text">No questions added</div>}
        </div>
      )}
    </>
  );
}

// ─── Mobile Preview — Topic List Screen ──────────────────────────────────────
function MobileTopicList({ form, units, unit, previewUnitIdx, onSelectUnit, onSelectTopic }) {
  return (
    <>
      {form.thumbnail_url
        ? <img src={form.thumbnail_url} className="mp-cover" alt="" onError={e => { e.target.style.display = 'none'; }} />
        : <div className="mp-cover-ph"><MdSchool /></div>
      }
      {form.title && <div className="mp-title">{form.title}</div>}
      {form.short_description && <div className="mp-desc">{form.short_description}</div>}

      {/* Unit tabs — dynamic, one per unit */}
      {units.length > 0 && (
        <div className="mp-unit-tabs">
          {units.map((u, i) => (
            <button
              key={i}
              type="button"
              className={`mp-unit-tab${previewUnitIdx === i ? ' active' : ''}`}
              onClick={() => onSelectUnit(i)}
            >
              Unit {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      )}

      {unit ? (
        <>
          <div className="mp-unit-label">{unit.title || 'Untitled Unit'}</div>
          {unit.topics.map((topic, ti) => {
            const typeInfo = TOPIC_TYPES.find(t => t.key === topic.type) || {};
            const IconComp = typeInfo.Icon || MdSchool;
            const subtitle =
              topic.type === 'articles'    ? (topic.data?.title || 'Article') :
              topic.type === 'audio_video' ? `${topic.data?.items?.length || 0} media file(s)` :
              topic.type === 'image'       ? `${topic.data?.items?.length || 0} image(s)` :
                                             `${topic.data?.questions?.length || 0} question(s)`;
            return (
              <div key={ti} className="mp-topic-card" onClick={() => onSelectTopic(ti)}>
                <div className={`mp-topic-icon ${topic.type}`}>
                  <IconComp style={{ fontSize: 12 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mp-content-title">Topic {String(ti + 1).padStart(2, '0')}</div>
                  <div className="mp-content-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {subtitle}
                  </div>
                </div>
                <span className={`mp-type-badge ${topic.type}`} style={{ flexShrink: 0 }}>{typeInfo.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>›</span>
              </div>
            );
          })}
          {unit.topics.length === 0 && (
            <div className="mp-empty"><MdSmartphone /><span>Add topics to see preview</span></div>
          )}
        </>
      ) : (
        <div className="mp-empty"><MdSmartphone /><span>Add topics to see preview</span></div>
      )}
    </>
  );
}

// ─── Mobile Preview ───────────────────────────────────────────────────────────
function MobilePreview({ form, units, activeUnitIdx }) {
  const [previewUnitIdx, setPreviewUnitIdx] = useState(activeUnitIdx || 0);
  const [selectedTopicIdx, setSelectedTopicIdx] = useState(null);

  // React derived-state pattern: detect prop change during render via ref,
  // call setState inline (React discards & immediately re-renders — no effect needed).
  const prevActiveRef = useRef(activeUnitIdx);
  if (prevActiveRef.current !== activeUnitIdx) {
    prevActiveRef.current = activeUnitIdx;
    setPreviewUnitIdx(activeUnitIdx || 0);
    setSelectedTopicIdx(null);
  }

  const unit = units[previewUnitIdx] || units[0];
  const topicsLen = unit?.topics?.length ?? 0;

  // Auto-clear detail if the selected topic was removed
  const safeTopicIdx = selectedTopicIdx !== null && selectedTopicIdx < topicsLen
    ? selectedTopicIdx : null;

  const handleSelectUnit = (idx) => {
    setPreviewUnitIdx(idx);
    setSelectedTopicIdx(null);
  };

  const selectedTopic = selectedTopicIdx !== null ? unit?.topics[selectedTopicIdx] : null;

  return (
    <div className="preview-panel">
      <span className="preview-label">
        <MdSmartphone style={{ verticalAlign: 'middle', marginRight: 4 }} />
        Preview
      </span>

      <div className="mobile-frame">
        <div className="mobile-notch" />
        <div className="mobile-screen">
          <div className="mobile-inner">
            {selectedTopic
              ? <MobileTopicDetail topic={selectedTopic} onBack={() => setSelectedTopicIdx(null)} />
              : <MobileTopicList
                  form={form}
                  units={units}
                  unit={unit}
                  previewUnitIdx={previewUnitIdx}
                  onSelectUnit={handleSelectUnit}
                  onSelectTopic={setSelectedTopicIdx}
                />
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrainingCreate() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = !!id;
  const fileInput = useRef(null);

  const [step, setStep]         = useState(1);
  const [moduleId, setModuleId] = useState(id || null);
  const [isPublished, setIsPublished] = useState(false);
  const [form, setForm]         = useState({
    title: '', short_description: '', thumbnail_url: '',
    category_ids: [], expiry_date: '', difficulty_level: 'Intermediate'
  });
  const [units, setUnits]       = useState([{ id: Date.now(), title: '', topics: [] }]);
  const [activeUnitIdx, setActiveUnitIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal]     = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [saving, setSaving]         = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    getTrainingCategories().then(r => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getTrainingModuleById(id).then(res => {
      const mod = res.data;
      setIsPublished(mod.is_published || false);
      setForm({
        title:            mod.title || '',
        short_description: mod.short_description || '',
        thumbnail_url:    mod.thumbnail_url || '',
        category_ids:     (mod.categories || []).map(c => c.id),
        expiry_date:      mod.expiry_date || '',
        difficulty_level: mod.difficulty_level || 'Intermediate',
      });
      const loaded = (mod.sessions || []).map((s, i) => ({
        id:     s.id || Date.now() + i,
        title:  s.title || '',
        topics: s.content_json?.topics || [],
      }));
      setUnits(loaded.length > 0 ? loaded : [{ id: Date.now(), title: '', topics: [] }]);
      setStep(2);
    }).catch(e => { console.error(e); setError('Failed to load training module.'); });
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadFile(fd);
      setForm(f => ({ ...f, thumbnail_url: res.data.url }));
    } catch { setError('Image upload failed.'); } finally { setUploading(false); }
  };

  const handleNext = () => {
    if (!form.title.trim()) { setError('Please enter a title.'); return; }
    setError('');
    setStep(2);
  };

  const buildPayload = () => ({
    title:             form.title,
    short_description: form.short_description,
    thumbnail_url:     form.thumbnail_url,
    category_ids:      form.category_ids,
    expiry_date:       form.expiry_date || null,
    difficulty_level:  form.difficulty_level,
    sessions: units.map((u, i) => ({
      title:        u.title || `Unit ${i + 1}`,
      content_json: { topics: u.topics },
    })),
  });

  const handleSaveDraft = async () => {
    setSaving(true); setError('');
    try {
      const payload = buildPayload();
      if (moduleId) {
        await updateTrainingModule(moduleId, payload);
      } else {
        const res = await createTrainingModule(payload);
        setModuleId(res.data.id);
      }
      navigate('/training');
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    setPublishing(true); setError('');
    try {
      const payload = buildPayload();
      let mid = moduleId;
      if (mid) {
        await updateTrainingModule(mid, payload);
      } else {
        const res = await createTrainingModule(payload);
        mid = res.data.id;
        setModuleId(mid);
      }
      if (!isPublished) {
        await toggleTrainingPublish(mid);
      }
      navigate('/training');
    } catch (e) {
      setError(e.response?.data?.error || 'Publish failed.');
    } finally { setPublishing(false); }
  };

  const addUnit = () => {
    const newIdx = units.length;
    setUnits(u => [...u, { id: Date.now(), title: '', topics: [] }]);
    setActiveUnitIdx(newIdx);
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await createTrainingCategory({ name: newCatName.trim() });
      setCategories(c => [...c, res.data]);
      setForm(f => ({ ...f, category_ids: [...f.category_ids, res.data.id] }));
      setNewCatName('');
      setCatModal(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create category.');
    }
  };

  const breadcrumb = isEdit ? 'Training / Edit Training' : 'Training / New Training';
  const pageTitle  = isEdit ? 'Edit Training' : 'Create New Training';

  return (
    <div className="tce-page">

      {/* Header */}
      <div className="tce-header">
        <button className="tce-back-btn" onClick={() => navigate('/training')} title="Back">
          <MdArrowBack />
        </button>
        <div className="tce-header-text">
          <h1>{pageTitle}</h1>
          <div className="tce-breadcrumb">{breadcrumb}</div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, borderLeft: '3px solid var(--danger)' }}>
          {error}
        </div>
      )}

      {/* ── Step 1 ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="tce-step1">

          {/* Thumbnail upload */}
          <div className="tce-upload-row">
            <div className="tce-upload-preview" onClick={() => fileInput.current?.click()} style={{ cursor: 'pointer' }}>
              {form.thumbnail_url
                ? <img src={form.thumbnail_url} alt="" />
                : <div className="tce-upload-placeholder"><MdImage /><span>No image</span></div>
              }
            </div>
            <div className="tce-upload-info">
              <p>This image will appear on the Explore page as the module cover. File must be less than 5 MB.</p>
              <input ref={fileInput} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <button type="button" className="tce-upload-btn" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="tce-field">
            <label className="tce-label">Title *</label>
            <input
              className="tce-input"
              placeholder="Enter training title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="tce-field">
            <label className="tce-label">Description</label>
            <RichEditor
              value={form.short_description}
              onChange={val => setForm(f => ({ ...f, short_description: val }))}
              placeholder="Type description..."
            />
          </div>

          {/* Difficulty + Expiry */}
          <div className="tce-row">
            <div className="tce-field">
              <label className="tce-label">Difficulty Level</label>
              <select
                className="tce-select"
                value={form.difficulty_level}
                onChange={e => setForm(f => ({ ...f, difficulty_level: e.target.value }))}
              >
                {DIFFICULTY_LEVELS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="tce-field">
              <label className="tce-label">Expiry Date</label>
              <input
                type="date"
                className="tce-input"
                value={form.expiry_date}
                onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Category */}
          <div className="tce-field">
            <div className="tce-cat-row">
              <label className="tce-label">Category</label>
              <span className="tce-cat-link" onClick={() => setCatModal(true)}>+ Create New Category</span>
            </div>
            <select
              className="tce-select"
              value={form.category_ids[0] || ''}
              onChange={e => setForm(f => ({ ...f, category_ids: e.target.value ? [parseInt(e.target.value)] : [] }))}
            >
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <button type="button" className="tce-next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      )}

      {/* ── Step 2 ────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="tce-step2">

          {/* Left: Builder */}
          <div className="tce-builder">

            {/* Module info card */}
            <div className="tce-module-card">
              {form.thumbnail_url
                ? <img src={form.thumbnail_url} className="tce-module-card-img" alt="" />
                : <div className="tce-module-card-img-ph"><MdSchool /></div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`tce-module-card-badge${isPublished ? ' published' : ''}`}>
                  {isPublished ? 'Published' : 'Draft'}
                </div>
                <div className="tce-module-card-title">{form.title || 'Untitled Training'}</div>
                {form.short_description && (
                  <div className="tce-module-card-desc">{form.short_description}</div>
                )}
              </div>
              <button type="button" className="tce-back-btn" style={{ flexShrink: 0 }} onClick={() => setStep(1)} title="Edit details">
                <MdEdit style={{ fontSize: 16 }} />
              </button>
            </div>

            {/* Units */}
            {units.map((unit, idx) => (
              <UnitBlock
                key={unit.id}
                unit={unit}
                unitIndex={idx}
                onUpdate={updated => {
                  setUnits(u => u.map((x, i) => i === idx ? updated : x));
                  setActiveUnitIdx(idx);
                }}
                onDelete={() => {
                  if (units.length === 1) return;
                  setUnits(u => u.filter((_, i) => i !== idx));
                  setActiveUnitIdx(Math.max(0, idx - 1));
                }}
              />
            ))}

            {/* Add unit */}
            <div className="builder-bottom">
              <button type="button" className="builder-add-btn" onClick={addUnit}>
                <MdAdd /> Add Unit
              </button>
            </div>
          </div>

          {/* Right: Preview + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <MobilePreview form={form} units={units} activeUnitIdx={activeUnitIdx} />
            <div className="tce-action-row">
              <button type="button" className="tce-draft-btn" onClick={handleSaveDraft} disabled={saving || publishing}>
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button type="button" className="tce-publish-btn" onClick={handlePublish} disabled={saving || publishing}>
                {publishing ? 'Publishing…' : isPublished ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {catModal && (
        <div className="modal-overlay" onClick={() => setCatModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Category</div>
            <label className="modal-input-label">Category Name</label>
            <input
              className="modal-input"
              placeholder="e.g. Nutrition"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateCategory()}
              autoFocus
            />
            <div className="modal-btns">
              <button className="modal-btn modal-btn-cancel" onClick={() => setCatModal(false)}>Cancel</button>
              <button className="modal-btn modal-btn-primary" onClick={handleCreateCategory}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
