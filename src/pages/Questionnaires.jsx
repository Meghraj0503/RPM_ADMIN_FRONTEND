import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuestionnaires, deleteQuestionnaire } from '../api/admin';
import { MdEdit, MdDelete, MdRemoveRedEye } from 'react-icons/md';
import { BsArrowReturnRight } from 'react-icons/bs';

export default function Questionnaires() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('One-Time');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getQuestionnaires();
      setItems(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to load questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this questionnaire template completely?')) return;
    try {
      await deleteQuestionnaire(id);
      fetchData();
    } catch {
      alert('Delete failed');
    }
  };

  const filtered = items.filter(i => (tab === 'One-Time' ? i.type === 'One-Time' : i.type === 'Recurring'));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1A1D23' }}>Questionnaires</h1>
        <button 
          onClick={() => navigate('/questionnaires/new')}
          style={{ background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          + Create Que
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#F9FAFB', padding: 4, borderRadius: 30, display: 'inline-flex' }}>
          <button 
            onClick={() => setTab('One-Time')}
            style={{ 
              padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === 'One-Time' ? '#00eebe' : 'transparent', color: tab === 'One-Time' ? '#000' : '#6B7280'
            }}>
            One-Time Questionnaires
          </button>
          <button 
            onClick={() => setTab('Recurring')}
            style={{ 
              padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === 'Recurring' ? '#00eebe' : 'transparent', color: tab === 'Recurring' ? '#000' : '#6B7280'
            }}>
            Recurring Questionnaires
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#000', fontWeight: 700 }}>
              <th style={{ padding: '0 12px 8px', width: 40 }}><input type="checkbox" style={{ borderRadius: 4, border: '1px solid #D1D5DB' }} /></th>
              <th style={{ padding: '0 12px 8px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'left' }}>Created On</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'left' }}>Created By</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'left' }}>Scheduled D/T</th>
              <th style={{ padding: '0 12px 8px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign:'center', padding: 32 }}><div className="spinner"/></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9CA3AF', padding: 32 }}>No questionnaires in this tab</td></tr>
            ) : filtered.map(q => (
              <tr key={q.id} style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderRadius: 8 }}>
                <td style={{ padding: '16px 12px', borderRadius: '8px 0 0 8px' }}><input type="checkbox" style={{ borderRadius: 4, border: '1px solid #D1D5DB' }} /></td>
                <td style={{ padding: '16px 12px', fontWeight: 500, color: '#1A1D23' }}>{q.title}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{ background: '#E0E7FF', color: '#4338CA', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {q.category}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', color: '#4B5563' }}>{new Date(q.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                <td style={{ padding: '16px 12px', color: '#6B7280' }}>{q.created_by}</td>
                <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                  {q.status === 'Scheduled' ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ background: '#FEF3C7', color: '#B45309', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Scheduled</span>
                       <span style={{ color: '#F59E0B', fontSize: 12, fontWeight: 500 }}>{q.assignment_count} users</span>
                     </div>
                  ) : q.status === 'Assigned' ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span style={{ background: '#CCFBF1', color: '#0F766E', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Assigned</span>
                       <span style={{ color: '#10B981', fontSize: 12, fontWeight: 500 }}>{q.assignment_count} users</span>
                     </div>
                  ) : (
                     <BsArrowReturnRight size={16} color="#9CA3AF" style={{ marginLeft: 20 }} />
                  )}
                </td>
                <td style={{ padding: '16px 12px', color: '#4B5563' }}>
                   {q.scheduled_for ? new Date(q.scheduled_for).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'center', borderRadius: '0 8px 8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <MdEdit size={18} style={{ cursor: 'pointer', color: '#6B7280' }} title="Edit" onClick={() => navigate(`/questionnaires/${q.id}/edit`)} />
                    <MdRemoveRedEye size={18} style={{ cursor: 'pointer', color: '#6B7280' }} title="View / Assign" onClick={() => navigate(`/questionnaires/${q.id}/assign`)} />
                    <MdDelete size={18} style={{ cursor: 'pointer', color: '#EF4444' }} title="Delete" onClick={() => handleDelete(q.id)} />
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
