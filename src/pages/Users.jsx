import React, { useEffect, useState } from 'react';
import { getUsers, exportData } from '../api/admin';
import { MdSearch, MdRemoveRedEye, MdAccessTime, MdFileDownload } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const PROGRAM_OPTS  = [{ value: '', label: 'Program' }, { value: 'wellness2025', label: 'Wellness 2025' }, { value: 'diabetes', label: 'Diabetes Management' }, { value: 'heart', label: 'Heart Health' }, { value: 'postop', label: 'Post-Op Recovery' }];
const ACTIVITY_OPTS = [{ value: '', label: 'Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
const Q_OPTS        = [{ value: '', label: 'Q-Status' }, { value: 'Completed', label: 'Completed' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Pending', label: 'Pending' }];
const ENROLL_OPTS   = [{ value: '', label: 'Enrollment Status' }, { value: 'enrolled', label: 'Enrolled' }, { value: 'suspended', label: 'Suspended' }, { value: 'completed', label: 'Completed' }, { value: 'dropped', label: 'Dropped Out' }];

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filters
  const [program,        setProgram]        = useState('');
  const [activityStatus, setActivityStatus] = useState('');
  const [qStatus,        setQStatus]        = useState('');
  const [enrollStatus,   setEnrollStatus]   = useState('');

  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    getUsers({ search, page, limit: 8, activity_status: activityStatus, q_status: qStatus, program, enroll_status: enrollStatus })
      .then(res => { setUsers(res.data.users || []); setTotal(res.data.total || 0); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, page, activityStatus, qStatus, program, enrollStatus]);

  const handleExport = async (format) => {
    try {
      const payload = { ids: Array.from(selectedIds), format };
      const res = await exportData('users', payload);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Users_Export_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch { alert('Export failed'); }
  };

  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(users.map(u => u.id)));
    else setSelectedIds(new Set());
  };

  const getLastActiveDetails = (dateStr) => {
    if (!dateStr) return { text: 'Unknown', bg: '#F3F4F6', color: '#6B7280' };
    const date = new Date(dateStr);
    const diffHours = (new Date() - date) / (1000 * 60 * 60);
    if (diffHours < 24) return { text: 'Today', bg: '#FFF0F0', color: '#FF5C5C' };
    if (diffHours < 48) return { text: '1 hr ago', bg: '#EFF6FF', color: '#3B82F6' };
    return { text: `${Math.floor(diffHours/24)} days ago`, bg: '#F3F4F6', color: '#6B7280' };
  };

  const getQStatusFmt = (qStatus) => {
    if (!qStatus) return { text: '1/4', color: '#FF5C5C' };
    if (qStatus === 'Completed') return { text: '4/4', color: '#00C9A7' };
    return { text: '3/4', color: '#FFB020' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1A1D23' }}>Users</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleExport('csv')} style={{ background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdFileDownload size={18} /> Export CSV
          </button>
          <button onClick={() => handleExport('pdf')} style={{ background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdFileDownload size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* Search + Filter Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <MdSearch style={{ position: 'absolute', left: 16, top: 12, color: '#9CA3AF' }} size={20} />
            <input 
              placeholder="Search name, Phone" 
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: 30, border: '1px solid #E5E7EB', background: '#F9FAFB', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          
          <select value={program} onChange={e => { setProgram(e.target.value); setPage(1); }} style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 30, background: '#F9FAFB', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
            {PROGRAM_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          
          <select value={activityStatus} onChange={e => { setActivityStatus(e.target.value); setPage(1); }} style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 30, background: '#F9FAFB', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
            {ACTIVITY_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          
          <select value={qStatus} onChange={e => { setQStatus(e.target.value); setPage(1); }} style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 30, background: '#F9FAFB', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
            {Q_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          
          <select value={enrollStatus} onChange={e => { setEnrollStatus(e.target.value); setPage(1); }} style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 30, background: '#F9FAFB', fontSize: 13, color: '#4B5563', cursor: 'pointer', outline: 'none' }}>
            {ENROLL_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: '2px solid #F3F4F6', color: '#6B7280' }}>
              <th style={{ padding: '16px 12px', width: 40 }}><input type="checkbox" onChange={toggleAll} style={{ cursor: 'pointer' }}/></th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Name</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Phone</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Program</th>
              <th style={{ padding: '16px 12px', textAlign: 'left', fontWeight: 700, fontSize: 12 }}>Enrolled</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Last Active</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Q-Status</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="full-center"><div className="spinner" /></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No users found</td></tr>
            ) : users.map(u => {
              const latestQ = u.user_questionnaires?.[0];
              const act = getLastActiveDetails(u.last_login_at);
              const qs  = getQStatusFmt(latestQ?.status);
              
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                  <td style={{ padding: '16px 12px' }}>
                    <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelection(u.id)} style={{ cursor: 'pointer', borderRadius: 4, width: 16, height: 16, border: '1px solid #D1D5DB' }} />
                  </td>
                  <td style={{ padding: '16px 12px', fontWeight: 600, color: '#1A1D23' }}>{u.name || 'Unknown User'}</td>
                  <td style={{ padding: '16px 12px', color: '#4B5563' }}>{u.phone_number}</td>
                  <td style={{ padding: '16px 12px', color: '#4B5563' }}>Wellness 2025</td>
                  <td style={{ padding: '16px 12px', color: '#4B5563' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: act.bg, color: act.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                      <MdAccessTime size={14} /> {act.text}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: qs.color, fontSize: 14 }}>
                    <span style={{ background: '#F9FAFB', padding: '6px 12px', borderRadius: 20 }}>{qs.text}</span>
                  </td>
                  <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                    <MdRemoveRedEye size={20} style={{ cursor: 'pointer', color: '#9CA3AF' }} onClick={() => navigate(`/users/${u.id}`)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, paddingBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>&lt;</button>
            <span style={{ background: '#00eebe', color: '#000', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{page}</span>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }} onClick={() => setPage(p => p + 1)} disabled={users.length < 8}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
