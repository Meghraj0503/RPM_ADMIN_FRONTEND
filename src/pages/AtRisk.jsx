import React, { useEffect, useState } from 'react';
import { getAtRiskUsers } from '../api/admin';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export default function AtRisk() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAtRiskUsers().then((res) => {
      setData(res.data.at_risk_users || []);
    }).catch(() => setData([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>At-Risk Users</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 36, height: 36, background: '#fff', border: '1px solid #E5E7EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ position: 'absolute', top: 8, right: 10, width: 6, height: 6, background: '#FF5C5C', borderRadius: '50%' }}></span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <div style={{ width: 36, height: 36, background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="#4B5563" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px 24px', width: 48 }}><input type="checkbox" style={{ accentColor: '#00C9A7', width: 16, height: 16 }} /></th>
                <th style={{ padding: '16px 8px', fontSize: 13, fontWeight: 600, color: '#4B5563' }}>Name</th>
                <th style={{ padding: '16px 8px', fontSize: 13, fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>SpO2 &gt; 90%</th>
                <th style={{ padding: '16px 8px', fontSize: 13, fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Heart Rate &lt; 120 bpm</th>
                <th style={{ padding: '16px 8px', fontSize: 13, fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Risk-Status</th>
                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#4B5563', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading users...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No at-risk users found.</td></tr>
              ) : data.map((user, i) => (
                <tr key={user.user_id || i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                  </td>
                  <td style={{ padding: '16px 8px', fontSize: 14, fontWeight: 500, color: '#111827' }}>{user.name}</td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{ background: '#FFF0F0', color: '#FF5C5C', fontWeight: 600, fontSize: 13, padding: '6px 20px', borderRadius: 20 }}>{user.spo2}</span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{ background: '#FFF0F0', color: '#FF5C5C', fontWeight: 600, fontSize: 13, padding: '6px 20px', borderRadius: 20 }}>{user.heart_rate}</span>
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                    <span style={{ color: '#FF5C5C', fontWeight: 600, fontSize: 14 }}>{user.risk_status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/users/${user.user_id}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#4B5563' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <MdOutlineRemoveRedEye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        {data.length > 0 && (
          <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E5E7EB', background: '#FAFAFA' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>Showing 1–{data.length} of {data.length} results</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}>‹</button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#00C9A7', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>1</button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 12 }}>2</button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 12 }}>3</button>
              <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF' }}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
