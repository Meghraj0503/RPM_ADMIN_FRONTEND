import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  getUserDetail, getUserAuditTrail, assignSubscription, suspendSubscription, reactivateSubscription,
  updateUserMedicalProfile, updateUserLifestyle, changeUserStatus, changeProgram, getEnrollmentHistory,
  getUserDevices, assignDevice, removeDevice
} from '../api/admin';
import { MdArrowBack, MdFileDownload, MdDeleteOutline, MdEdit, MdDirectionsRun, MdMonitorHeart, MdLocalFireDepartment, MdNightlightRound, MdEmojiFoodBeverage, MdLocalBar, MdSmokingRooms, MdSearch, MdClose, MdSwapHoriz, MdPersonRemove, MdWarningAmber } from 'react-icons/md';
import { PieChart, Pie, Cell } from 'recharts';
import VitalsSection from '../components/VitalsSection';

const VITAL_COLORS = {
  heart_rate: '#FF5C5C', hrv: '#2D9EF0', spo2: '#00C9A7',
  steps: '#FFB020', sleep_hours: '#6366F1', active_calories: '#F97316'
};



function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [audit, setAudit] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  // Modals
  const [changeProgramModal, setChangeProgramModal] = useState(false);
  const [removeProgramModal, setRemoveProgramModal] = useState(false);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [changeProgramData, setChangeProgramData] = useState({ program_name: '', start_date: new Date().toISOString().split('T')[0], reason: '' });

  const [subModal, setSubModal] = useState(false);
  const [subDays, setSubDays] = useState(30);

  const [medModal, setMedModal] = useState(false);
  const [editType, setEditType] = useState('');
  const [editList, setEditList] = useState([]);
  const [editInput, setEditInput] = useState('');

  const [lifeModal, setLifeModal] = useState(false);
  const [lifeData, setLifeData] = useState({ diet_type: '', physical_activity_level: '', smoking_status: '', alcohol_consumption: '' });

  // Device assignment state
  const [deviceList, setDeviceList] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ mac_address: '', nickname: '' });
  const [deviceSaving, setDeviceSaving] = useState(false);

  // Audit trail filters
  const [auditCategory, setAuditCategory] = useState('All Changes');
  const [auditFrom, setAuditFrom] = useState('');
  const [auditTo, setAuditTo] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [expandedAudit, setExpandedAudit] = useState({}); // { id: bool }
  const AUDIT_PAGE_SIZE = 20;

  const fetchData = () => {
    setLoading(true);
    Promise.all([getUserDetail(id, { days }), getUserAuditTrail(id), getEnrollmentHistory(id)])
      .then(([d, a, h]) => {
        setData(d.data);
        setAudit(a.data.history || []);
        setEnrollmentHistory(h.data.history || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchDevices = () => {
    getUserDevices(id).then(r => setDeviceList(r.data.devices || [])).catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [id, days]);

  useEffect(() => {
    if (activeTab === 'devices') fetchDevices();
  }, [activeTab, id]);

  const handleAssignDevice = async () => {
    if (!deviceForm.mac_address.trim()) return alert('Device Serial Number is required');
    setDeviceSaving(true);
    try {
      await assignDevice(id, deviceForm);
      setDeviceForm({ mac_address: '', nickname: '' });
      setShowAssignForm(false);
      fetchDevices();
      fetchData(); // refresh audit
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to assign device');
    } finally { setDeviceSaving(false); }
  };

  const handleRemoveDevice = async (devId) => {
    if (!window.confirm('Remove this device?')) return;
    await removeDevice(id, devId);
    fetchDevices();
    fetchData();
  };

  // Audit helpers
  const AUDIT_CATEGORIES = ['All Changes', 'Personal Info', 'Medical', 'Lifestyle', 'Program', 'Device'];
  const CATEGORY_COLORS = {
    'Personal Info': { bg: '#E8F5FF', color: '#2D9EF0' },
    'Medical': { bg: '#FFF0F0', color: '#FF5C5C' },
    'Lifestyle': { bg: '#FFF8EC', color: '#FFB020' },
    'Program': { bg: '#E8FBF7', color: '#00C9A7' },
    'Device': { bg: '#FFF3E0', color: '#F97316' },
    'Other': { bg: '#F3F4F6', color: '#6B7280' }
  };
  const filteredAudit = audit.filter(a => {
    if (auditCategory !== 'All Changes' && a.category !== auditCategory) return false;
    if (auditFrom && new Date(a.created_at) < new Date(auditFrom)) return false;
    if (auditTo) { const d = new Date(auditTo); d.setHours(23,59,59,999); if (new Date(a.created_at) > d) return false; }
    return true;
  });
  const totalPages = Math.ceil(filteredAudit.length / AUDIT_PAGE_SIZE);
  const pagedAudit = filteredAudit.slice((auditPage-1)*AUDIT_PAGE_SIZE, auditPage*AUDIT_PAGE_SIZE);
  // Group by date
  const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(l => {
      const key = new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(l);
    });
    return groups;
  };
  const auditGroups = groupByDate(pagedAudit);
  const formatAuditChanges = (log) => {
    const j = log.changes_json || {};
    const entries = [];
    Object.entries(j).filter(([k]) => !['user_id','admin_id'].includes(k)).forEach(([k, v]) => {
      if (v !== null && typeof v === 'object' && ('old' in v || 'new' in v)) {
        entries.push([k, v.old, v.new]);
      } else {
        entries.push([k, null, v]);
      }
    });
    return entries;
  };
  const formatActionLabel = (type) => {
    const m = { PROFILE_UPDATED: 'Profile updated', USER_CREATED: 'User created', ACTIVATED: 'Account activated',
      DEACTIVATED: 'Account deactivated', MEDICAL_PROFILE_UPDATED: 'Medical profile updated', LIFESTYLE_UPDATED: 'Lifestyle updated',
      PROGRAM_CHANGED: 'Program changed', REMOVED_FROM_PROGRAM: 'Removed from program',
      DEVICE_ASSIGNED: 'Device assigned', DEVICE_REMOVED: 'Device removed' };
    return m[type] || type;
  };

  const handleAssignSub = async () => {
    try { await assignSubscription(id, { validity_days: subDays }); setSubModal(false); fetchData(); }
    catch { alert('Failed to assign'); }
  };
  const handleSuspend = async () => {
    await suspendSubscription(id); fetchData();
  };

  const handleChangeProgram = async () => {
    if (!changeProgramData.program_name.trim()) return alert('Please enter a program name');
    try {
      await changeProgram(id, changeProgramData);
      setChangeProgramModal(false);
      setChangeProgramData({ program_name: '', start_date: new Date().toISOString().split('T')[0], reason: '' });
      fetchData();
    } catch { alert('Failed to change program'); }
  };

  const handleRemoveProgram = async () => {
    try {
      await suspendSubscription(id, { reason: 'Removed by admin' });
      setRemoveProgramModal(false);
      fetchData();
    } catch { alert('Failed to remove from program'); }
  };
  const handleReactivate = async () => {
    await reactivateSubscription(id); fetchData();
  };
  const toggleStatus = async (status) => {
    await changeUserStatus(id, { is_active: status }); fetchData();
  };

  const handleEditClick = (type) => {
    setEditType(type);
    if (type === 'conditions') setEditList((u.user_medical_conditions || []).map(c => c.condition_name));
    else if (type === 'medications') setEditList((u.user_medications || []).map(m => m.medication_name));
    else setEditList((u.user_allergies || []).map(a => a.allergy_name));
    setMedModal(true);
    setEditInput('');
  };

  const handleListAdd = (e) => {
    if (e.key === 'Enter' && editInput.trim()) {
      setEditList([...editList, editInput.trim()]);
      setEditInput('');
    }
  };

  const handleListRemove = (index) => {
    setEditList(editList.filter((_, i) => i !== index));
  };

  const saveMedProfile = async () => {
    try {
      let finalEditList = [...editList];
      if (editInput.trim()) {
        finalEditList.push(editInput.trim());
      }
      const payload = {
        conditions: editType === 'conditions' ? finalEditList : undefined,
        medications: editType === 'medications' ? finalEditList : undefined,
        allergies: editType === 'allergies' ? finalEditList : undefined
      };
      await updateUserMedicalProfile(id, payload);
      setMedModal(false);
      fetchData();
    } catch { alert('Failed to update medical profile'); }
  };

  const openLifeModal = () => {
    const l = data.user?.user_lifestyle || {};
    setLifeData({
      diet_type: l.diet_type || '',
      physical_activity_level: l.physical_activity_level || '',
      smoking_status: l.smoking_status || '',
      alcohol_consumption: l.alcohol_consumption || ''
    });
    setLifeModal(true);
  };

  const saveLifeProfile = async () => {
    try {
      await updateUserLifestyle(id, lifeData);
      setLifeModal(false);
      fetchData();
    } catch { alert('Failed to update lifestyle'); }
  };

  if (loading && !data) return <div className="full-center"><div className="spinner" /></div>;
  if (!data?.user) return <div style={{ padding: 32, color: '#FF5C5C' }}>User not found.</div>;

  const u = data.user;
  const profile = u.user_profile || {};
  const vitals = data.vitals || [];
  const qs = data.questionnaires || [];
  const devices = u.user_devices || [];
  const sub = u.user_subscription;

  const age = profile.date_of_birth ? Math.floor((new Date() - new Date(profile.date_of_birth)) / 31557600000) : '—';

  const SIDEBAR_TABS = [
    { key: 'personal', label: 'Personal Information' },
    { key: 'health', label: 'Health Profile' },
    { key: 'lifestyle', label: 'Lifestyle Details' },
    { key: 'enrollment', label: 'Program Enrollment' },
    { key: 'devices', label: 'Device Assignment' },
    { key: 'questionnaires', label: 'Questionnaires' },
    { key: 'audit', label: 'Audit Trail' }
  ];

  return (
    <div style={{ background: '#F9FAFB', minHeight: 'calc(100vh - 64px)', padding: '24px 32px' }}>
      
      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/users')} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, color: '#1A1D23' }}>
            <MdArrowBack />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1A1D23' }}>{u.name || 'Unknown'}</h1>
              <span style={{ background: '#00C9A7', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Active</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>User ID : {u.id}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#6B7280' }}><MdFileDownload /></button>
          <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 22, color: '#6B7280' }}><MdDeleteOutline /></button>
          <button onClick={() => setActiveTab('audit')} style={{ border: '1px solid #E5E7EB', background: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View History</button>
        </div>
      </div>

      <div style={{ background: '#F3F4F6', borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C9A7' }}></span> All changes saved</div>
        <div>Last saved : Just now</div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        
        {/* Left Sub-Sidebar */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SIDEBAR_TABS.map(tab => {
              const active = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: 24, border: active ? '1px solid #00C9A7' : '1px solid transparent',
                  background: active ? '#fff' : 'transparent', color: active ? '#1A1D23' : '#9CA3AF',
                  fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: active ? '#E8FBF7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: active ? '#00C9A7' : '#D1D5DB' }}></span>
                  </div>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Content */}
        <div style={{ flex: 1, minWidth: 0, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 32, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          
          {/* ────────────────────────── PERSONAL INFO ────────────────────────── */}
          {activeTab === 'personal' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Personal Information</h2>
                <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Name</div><div style={{ fontSize: 14, fontWeight: 500 }}>{u.name || '—'}</div></div>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Phone</div><div style={{ fontSize: 14, fontWeight: 500 }}>{u.phone_number || '—'}</div></div>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Gender</div><div style={{ fontSize: 14, fontWeight: 500 }}>{profile.gender || '—'}</div></div>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Email ID</div><div style={{ fontSize: 14, fontWeight: 500 }}>{u.email || '—'}</div></div>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Date of Birth</div><div style={{ fontSize: 14, fontWeight: 500 }}>{profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div></div>
                <div><div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Age</div><div style={{ fontSize: 14, fontWeight: 500 }}>{age} years</div></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
                {/* BMI Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7', fontSize: 18 }}><MdDirectionsRun /></div>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>BMI</div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.bmi || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Normal weight</div>
                </div>
                {/* Height Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7', fontSize: 18 }}><MdDirectionsRun /></div>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>Height</div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.height || '—'}<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}> {profile?.height_unit || '—'}</span></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Normal height</div>
                </div>
                {/* Weight Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7', fontSize: 18 }}><MdDirectionsRun /></div>
                    <div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>Weight</div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{profile.weight || '—'}<span style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}> {profile?.weight_unit || '—'}</span></div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>Normal weight</div>
                </div>
              </div>



              <div style={{ background: '#F9FAFB', borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>Account Status</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: u.is_active ? '#1A1D23' : '#FF5C5C' }}>{u.is_active ? 'Account Active' : 'Account Deactivated'}</h3>
                  <div style={{ background: u.is_active ? '#00C9A7' : '#FF5C5C', color: '#fff', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }}></span>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 20px 0' }}>This user can log in to the AAYU mobile app and access their health program.</p>
                <button onClick={() => toggleStatus(!u.is_active)} style={{ background: u.is_active ? '#FFF0F0' : '#E8FBF7', color: u.is_active ? '#FF5C5C' : '#00C9A7', border: 'none', borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: u.is_active ? '#FF5C5C' : '#00C9A7' }}></span>
                  {u.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                </button>
              </div>
            </div>
          )}

          {/* ────────────────────────── HEALTH PROFILE ────────────────────────── */}
          {activeTab === 'health' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Health Profile</h2>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <button style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Vitals</h3>
                  <div style={{ display: 'flex', gap: 0, border: '1px solid #E5E7EB', borderRadius: 20, overflow: 'hidden' }}>
                    {[7, 30, 90].map(d => (
                      <button key={d} onClick={() => setDays(d)} style={{
                        padding: '6px 16px', fontSize: 11, fontWeight: days === d ? 700 : 500,
                        background: days === d ? '#00C9A7' : '#fff', color: days === d ? '#fff' : '#6B7280',
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit'
                      }}>{d < 10 ? `0${d}` : d} Days</button>
                    ))}
                  </div>
                </div>
                
                <VitalsSection vitals={vitals} days={days} bmi={profile.bmi} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Conditions Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Medical Conditions</h3>
                    <button onClick={() => handleEditClick('conditions')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {(u.user_medical_conditions || []).map((c, i) => <span key={i} style={{ background: '#FFF0F0', color: '#FF5C5C', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 500 }}>{c.condition_name}</span>)}
                  </div>
                </div>

                {/* Medications Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Medications</h3>
                    <button onClick={() => handleEditClick('medications')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {(u.user_medications || []).map((m, i) => <span key={i} style={{ background: '#EBF5FF', color: '#2D9EF0', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 500 }}>{m.medication_name}</span>)}
                  </div>
                </div>

                {/* Allergies Card */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Allergies</h3>
                    <button onClick={() => handleEditClick('allergies')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {(u.user_allergies || []).map((a, i) => <span key={i} style={{ background: '#FFF8EC', color: '#FFB020', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 500 }}>{a.allergy_name}</span>)}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ────────────────────────── LIFESTYLE DETAILS ────────────────────────── */}
          {activeTab === 'lifestyle' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Lifestyle Details</h2>
                <button onClick={openLifeModal} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280' }}><MdEdit /></button>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Diet Type</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E8FBF7', padding: '6px 16px', borderRadius: 20 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdEmojiFoodBeverage color="#00C9A7" size={12} /></div>
                    <span style={{ fontSize: 13, color: '#00C9A7', fontWeight: 500 }}>{u.user_lifestyle?.diet_type || 'None'}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Physical activity level</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{u.user_lifestyle?.physical_activity_level || '—'}</div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdLocalBar color="#00C9A7" size={14} /></div>
                    <div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>Alcohol</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.user_lifestyle?.alcohol_consumption || '—'}</div>
                    </div>
                  </div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MdSmokingRooms color="#00C9A7" size={14} /></div>
                    <div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>Smoking</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{u.user_lifestyle?.smoking_status || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────── PROGRAM ENROLLMENT ────────────────────────── */}
          {activeTab === 'enrollment' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0' }}>Program Enrollment</h2>

              {/* Main Program Card */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 28, background: '#fff', marginBottom: 20 }}>
                {sub && sub.status === 'Active' ? (
                  <div style={{ display: 'flex', gap: 32 }}>
                    {/* Left Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00C9A7', display: 'inline-block' }}></span>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{sub.program_name || 'Wellness Program 2025'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Enrollment Date</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{sub.start_date ? new Date(sub.start_date).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Enrolled by</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{sub.enrolled_by || 'System Auto'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Duration</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{sub.validity_days ? `${sub.validity_days} days Active` : '—'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Role</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Participant</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Last Activity</div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Today at 11:32 am</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Questionnaires Donut + Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16, minWidth: 200 }}>
                      <span style={{ background: '#00C9A7', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>Active</span>
                      {/* Donut */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Questionnaires</div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <PieChart width={100} height={100}>
                            <Pie data={[{v: qs.length || 3},{v: Math.max(0,10-(qs.length||3))}]} cx={45} cy={45} innerRadius={30} outerRadius={45} startAngle={90} endAngle={-270} dataKey="v">
                              <Cell fill="#00C9A7" />
                              <Cell fill="#F3F4F6" />
                            </Pie>
                          </PieChart>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{qs.length || 3}</div>
                            <div style={{ fontSize: 9, color: '#9CA3AF' }}>completed</div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        onClick={() => { setChangeProgramData(p => ({ ...p, program_name: '' })); setChangeProgramModal(true); }}
                        style={{ background: '#00C9A7', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                      >
                        <MdSwapHoriz size={18} /> Change Program
                      </button>
                      <button
                        onClick={() => setRemoveProgramModal(true)}
                        style={{ background: '#fff', color: '#FF5C5C', border: '1px solid #FF5C5C', borderRadius: 24, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                      >
                        <MdPersonRemove size={18} /> Remove From Program
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <p style={{ color: '#9CA3AF', marginBottom: 14 }}>No program assigned.</p>
                    <button style={{ background: '#00C9A7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 24, fontWeight: 600, cursor: 'pointer' }} onClick={() => setChangeProgramModal(true)}>Assign Program</button>
                  </div>
                )}
              </div>

              {/* Articles Engagement Metrics */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 28, background: '#fff', marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 20px 0' }}>Articles engagement metrics</h3>
                <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                  {/* Donut */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>Engagement activity</div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <PieChart width={120} height={120}>
                        <Pie data={[{v:3},{v:7}]} cx={55} cy={55} innerRadius={35} outerRadius={55} startAngle={90} endAngle={-270} dataKey="v">
                          <Cell fill="#00C9A7" /><Cell fill="#F3F4F6" />
                        </Pie>
                      </PieChart>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>3</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF' }}>completed</div>
                      </div>
                    </div>
                  </div>
                  {/* Articles list */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#1A1D23' }}>Articles this week</div>
                    {[
                      'Glycaemic load in Indian diets',
                      'Breathing for anxiety relief',
                      'HRV and late dinner'
                    ].map((title, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C9A7' }}></span>
                          </div>
                          <span style={{ fontSize: 13 }}>{title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#6B7280' }}>Read</span>
                          <span style={{ fontSize: 12, color: '#00C9A7', fontWeight: 600 }}>Saved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enrollment History */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, background: '#fff', overflow: 'hidden' }}>
                <div
                  onClick={() => setHistoryOpen(!historyOpen)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', cursor: 'pointer', borderBottom: historyOpen ? '1px solid #E5E7EB' : 'none' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Enrollment History</span>
                  <span style={{ fontSize: 18, color: '#9CA3AF', transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>⌃</span>
                </div>
                {historyOpen && (
                  <div style={{ padding: '0 24px 24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          {['Program', 'Role', 'Enrolled', 'Remove', 'Remove by'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '12px 8px', color: '#6B7280', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {enrollmentHistory.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#9CA3AF' }}>No history yet</td></tr>
                        ) : enrollmentHistory.map((log, i) => (
                          <tr key={i}>
                            <td style={{ padding: '12px 8px' }}>{log.program_name || '—'}</td>
                            <td style={{ padding: '12px 8px' }}>Participant</td>
                            <td style={{ padding: '12px 8px' }}>{log.created_at ? new Date(log.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '12px 8px' }}>{log.action}</td>
                            <td style={{ padding: '12px 8px' }}>System Auto</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────── DEVICE ASSIGNMENT ────────────────────────── */}
          {activeTab === 'devices' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0' }}>Wearable Device Assignment</h2>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>Manage smartwatch connections for automatic health data sync</p>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, background: '#fff', minHeight: 320 }}>
                {!showAssignForm && deviceList.length === 0 && (
                  <div style={{ textAlign: 'center', paddingTop: 48 }}>
                    {/* Watch icon */}
                    <div style={{ width: 72, height: 72, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="20" y="18" width="24" height="28" rx="6" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                        <rect x="24" y="12" width="16" height="8" rx="2" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                        <rect x="24" y="44" width="16" height="8" rx="2" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                        <circle cx="32" cy="32" r="6" stroke="#D1D5DB" strokeWidth="1.5" fill="none"/>
                        <line x1="32" y1="28" x2="32" y2="32" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                        <line x1="32" y1="32" x2="35" y2="32" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>No device assigned</div>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 24 }}>Assign a Fastrack or Titan smartwatch to<br/>enable automatic health data sync.</p>
                    <button
                      onClick={() => setShowAssignForm(true)}
                      style={{ background: '#00C9A7', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 28px', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >+ Assign Device</button>
                  </div>
                )}

                {/* Existing devices list */}
                {!showAssignForm && deviceList.length > 0 && (
                  <div>
                    {deviceList.map((d, i) => (
                      <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
                              <rect x="20" y="18" width="24" height="28" rx="6" stroke="#00C9A7" strokeWidth="2.5" fill="none"/>
                              <circle cx="32" cy="32" r="5" stroke="#00C9A7" strokeWidth="2" fill="none"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{d.nickname || d.device_name || 'Smartwatch'}</div>
                            <div style={{ fontSize: 12, color: '#6B7280' }}>{d.mac_address}</div>
                            {d.assigned_at && <div style={{ fontSize: 11, color: '#9CA3AF' }}>Assigned {new Date(d.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                          </div>
                        </div>
                        <button onClick={() => handleRemoveDevice(d.id)} style={{ background: '#FFF0F0', color: '#FF5C5C', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowAssignForm(true)}
                      style={{ marginTop: 8, background: '#00C9A7', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    >+ Assign Another Device</button>
                  </div>
                )}

                {/* Assign Form */}
                {showAssignForm && (
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px 0' }}>Assign New Device</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Device Serial Number <span style={{ color: '#FF5C5C' }}>*</span></label>
                        <input
                          type="text"
                          value={deviceForm.mac_address}
                          onChange={e => setDeviceForm(f => ({ ...f, mac_address: e.target.value }))}
                          placeholder="Search name, Phone"
                          style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                        />
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>Supported device series: Fastrack · TITAN · FSI · Optimus · Reflex</div>
                      </div>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Device Nickname (Optional)</label>
                        <input
                          type="text"
                          value={deviceForm.nickname}
                          onChange={e => setDeviceForm(f => ({ ...f, nickname: e.target.value }))}
                          placeholder="Search name, Phone"
                          style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button onClick={handleAssignDevice} disabled={deviceSaving} style={{ background: '#00C9A7', color: '#fff', border: 'none', borderRadius: 24, padding: '12px 32px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>{deviceSaving ? 'Saving...' : 'Save Changes'}</button>
                      <button onClick={() => { setShowAssignForm(false); setDeviceForm({ mac_address: '', nickname: '' }); }} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 24, padding: '12px 32px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────── QUESTIONNAIRES ────────────────────────── */}
          {activeTab === 'questionnaires' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px 0' }}>Questionnaires</h2>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, background: '#fff' }}>
                {qs.length === 0 ? (
                  <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 32 }}>No questionnaire submissions yet.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                        {['#', 'Submitted', 'Status', 'Total Score'].map((h, i) => (
                          <th key={i} style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {qs.map((q, i) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                          <td style={{ padding: '14px 12px', color: '#9CA3AF' }}>{i + 1}</td>
                          <td style={{ padding: '14px 12px' }}>{q.completed_at ? new Date(q.completed_at).toLocaleDateString('en-IN') : '—'}</td>
                          <td style={{ padding: '14px 12px' }}>
                            <span style={{ background: q.status === 'Completed' ? '#E8FBF7' : '#FFF8EC', color: q.status === 'Completed' ? '#00C9A7' : '#FFB020', borderRadius: 20, padding: '4px 12px', fontWeight: 600, fontSize: 11 }}>
                              {q.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 12px', fontWeight: 600 }}>{q.overall_score ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────── AUDIT TRAIL ────────────────────────── */}
          {activeTab === 'audit' && (
            <div>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>History — {u?.name || 'User'}</h2>
                <button
                  onClick={() => { const csv = audit.map(a => `${a.created_at},${a.category},${a.action_type},${JSON.stringify(a.changes_json)}`).join('\n'); const blob = new Blob([`Date,Category,Action,Details\n${csv}`], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='audit_log.csv'; a.click(); }}
                  style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 24, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >↑ Export Audit Log (CSV)</button>
              </div>

              {/* Filters row */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <input type="date" value={auditFrom} onChange={e => { setAuditFrom(e.target.value); setAuditPage(1); }} style={{ padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }} placeholder="DD-MM-YYYY" />
                <span style={{ color: '#9CA3AF' }}>→</span>
                <input type="date" value={auditTo} onChange={e => { setAuditTo(e.target.value); setAuditPage(1); }} style={{ padding: '8px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none' }} placeholder="DD-MM-YYYY" />
                <select value={auditCategory} onChange={e => { setAuditCategory(e.target.value); setAuditPage(1); }} style={{ padding: '8px 16px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                  {AUDIT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <div style={{ flex: 1 }} />
                {[7,30,90,'All Time'].map(d => (
                  <button key={d} onClick={() => { if (d === 'All Time') { setAuditFrom(''); setAuditTo(''); } else { const from = new Date(); from.setDate(from.getDate()-d); setAuditFrom(from.toISOString().split('T')[0]); setAuditTo(''); } setAuditPage(1); }} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B7280', padding: '4px 8px' }}>{d === 7 ? '07 Days' : d === 30 ? '30 Days' : d === 90 ? '90 Days' : 'All Time'}</button>
                ))}
              </div>

              {/* Count */}
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>{filteredAudit.length} changes recorded · Showing {Math.min((auditPage-1)*AUDIT_PAGE_SIZE+1, filteredAudit.length)}–{Math.min(auditPage*AUDIT_PAGE_SIZE, filteredAudit.length)}</div>

              {/* Date-grouped entries */}
              {filteredAudit.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No audit records found.</div>
              ) : Object.entries(auditGroups).map(([date, logs]) => (
                <div key={date} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{date}</span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>{logs.length} change{logs.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
                    {logs.map((log, li) => {
                      const tag = CATEGORY_COLORS[log.category] || CATEGORY_COLORS['Other'];
                      const expanded = expandedAudit[log.id];
                      const changes = formatAuditChanges(log);
                      const time = new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
                      return (
                        <div key={log.id || li} style={{ borderBottom: li < logs.length-1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div
                            onClick={() => setExpandedAudit(p => ({ ...p, [log.id]: !p[log.id] }))}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ background: tag.bg, color: tag.color, borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{log.category || 'Other'}</span>
                              <span style={{ fontSize: 13 }}>{formatActionLabel(log.action_type)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ fontSize: 12, color: '#6B7280' }}>Admin {time}</span>
                              <span style={{ color: '#9CA3AF', fontSize: 16 }}>{expanded ? '∧' : '∨'}</span>
                            </div>
                          </div>
                          {expanded && (
                            <div style={{ background: '#FAFAFA', padding: '16px 20px 20px', borderTop: '1px solid #F3F4F6' }}>
                              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 10 }}>Change Details</div>
                              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#9CA3AF', fontWeight: 500 }}>Field</th>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#9CA3AF', fontWeight: 500 }}>Old Value</th>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', color: '#9CA3AF', fontWeight: 500 }}>New Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {changes.length === 0 ? (
                                    <tr><td colSpan={3} style={{ padding: 8, color: '#9CA3AF' }}>No details recorded</td></tr>
                                  ) : changes.map(([k, oldV, newV], ci) => (
                                    <tr key={ci}>
                                      <td style={{ padding: '6px 8px', fontWeight: 500, textTransform: 'capitalize' }}>{k.replace(/_/g,' ')}</td>
                                      <td style={{ padding: '6px 8px', color: '#6B7280' }}>
                                        {oldV == null || oldV === '' || (Array.isArray(oldV) && oldV.length === 0) ? '—' : (typeof oldV === 'object' ? JSON.stringify(oldV) : String(oldV))}
                                      </td>
                                      <td style={{ padding: '6px 8px' }}>
                                        {newV == null || newV === '' || (Array.isArray(newV) && newV.length === 0) ? '—' : (typeof newV === 'object' ? JSON.stringify(newV) : String(newV))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 12 }}>Modified · Session ID: ADM-{log.admin_id} · {new Date(log.created_at).toLocaleString('en-IN')}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
                  <button onClick={() => setAuditPage(p => Math.max(1,p-1))} disabled={auditPage===1} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>‹</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setAuditPage(p)} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: auditPage===p ? '#00C9A7' : '#fff', color: auditPage===p ? '#fff' : '#1A1D23', cursor: 'pointer', fontWeight: 600, border: auditPage===p ? 'none' : '1px solid #E5E7EB' }}>{p}</button>
                  ))}
                  {totalPages > 5 && <span style={{ color: '#9CA3AF' }}>... {totalPages}</span>}
                  <button onClick={() => setAuditPage(p => Math.min(totalPages,p+1))} disabled={auditPage===totalPages} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>›</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Subscription Modal */}
      {subModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>Assign Subscription</h3>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Validity Period (days)</label>
            <input type="number" min={1} max={365} value={subDays} onChange={e => setSubDays(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ background: '#00C9A7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', flex: 1 }} onClick={handleAssignSub}>Assign</button>
              <button style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', flex: 1 }} onClick={() => setSubModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Profile Modal */}
      {medModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 640, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>
              {editType === 'conditions' ? 'Medical Conditions' : editType === 'medications' ? 'Medications' : 'Allergies'}
            </h3>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  value={editInput} 
                  onChange={e => setEditInput(e.target.value)} 
                  onKeyDown={handleListAdd}
                  placeholder={`Type ${editType === 'conditions' ? 'a condition' : editType === 'medications' ? 'a medication' : 'an allergy'} to add...`}
                  style={{ width: '100%', padding: '12px 20px', border: '1px solid #E5E7EB', borderRadius: 24, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} 
                />
                <MdSearch style={{ position: 'absolute', right: 20, top: 12, fontSize: 20, color: '#9CA3AF' }} />
              </div>
              <button 
                onClick={() => {
                  if (editInput.trim()) {
                    setEditList([...editList, editInput.trim()]);
                    setEditInput('');
                  }
                }}
                style={{ background: '#00C9A7', color: '#fff', border: 'none', borderRadius: 24, padding: '0 24px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, minHeight: 40 }}>
              {editList.map((item, index) => (
                <span 
                  key={index} 
                  style={{ 
                    background: editType === 'conditions' ? '#FFF0F0' : editType === 'medications' ? '#EBF5FF' : '#FFF8EC', 
                    color: editType === 'conditions' ? '#FF5C5C' : editType === 'medications' ? '#2D9EF0' : '#FFB020', 
                    borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 8
                  }}
                >
                  {item}
                  <MdClose 
                    onClick={() => handleListRemove(index)} 
                    style={{ cursor: 'pointer', fontSize: 16, opacity: 0.8 }} 
                  />
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ background: '#00C9A7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 24, fontWeight: 600, cursor: 'pointer' }} onClick={saveMedProfile}>Save Changes</button>
              <button style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '10px 24px', borderRadius: 24, fontWeight: 600, cursor: 'pointer' }} onClick={() => setMedModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle Modal */}
      {lifeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>Edit Lifestyle Details</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Diet Type</label>
              <input type="text" value={lifeData.diet_type} onChange={e => setLifeData({ ...lifeData, diet_type: e.target.value })} placeholder="e.g. Vegetarian" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Physical Activity Level</label>
              <input type="text" value={lifeData.physical_activity_level} onChange={e => setLifeData({ ...lifeData, physical_activity_level: e.target.value })} placeholder="e.g. Moderate" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Smoking</label>
              <input type="text" value={lifeData.smoking_status} onChange={e => setLifeData({ ...lifeData, smoking_status: e.target.value })} placeholder="e.g. No, Occasional" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Alcohol</label>
              <input type="text" value={lifeData.alcohol_consumption} onChange={e => setLifeData({ ...lifeData, alcohol_consumption: e.target.value })} placeholder="e.g. Occasional" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ background: '#00C9A7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', flex: 1 }} onClick={saveLifeProfile}>Save Changes</button>
              <button style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', flex: 1 }} onClick={() => setLifeModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Change Program Modal */}
      {changeProgramModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700 }}>Change Program Enrollment</h3>
            {sub?.program_name && sub?.status === 'Active' && (
              <div style={{ background: '#FFF9EC', border: '1px solid #FFE9B3', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: '#8B6914' }}>Current : <strong>{sub.program_name}</strong></span>
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>New Program <span style={{ color: '#FF5C5C' }}>*</span></label>
              <input type="text" value={changeProgramData.program_name} onChange={e => setChangeProgramData(p => ({ ...p, program_name: e.target.value }))} placeholder="Select New Program" style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>New Enrollment Date</label>
              <input type="date" value={changeProgramData.start_date} onChange={e => setChangeProgramData(p => ({ ...p, start_date: e.target.value }))} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>Reason for Change (Optional)</label>
              <textarea value={changeProgramData.reason} onChange={e => setChangeProgramData(p => ({ ...p, reason: e.target.value }))} rows={4} placeholder="Enter reason..." style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setChangeProgramModal(false)} style={{ flex: 1, background: '#fff', border: '1px solid #E5E7EB', padding: '12px', borderRadius: 24, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleChangeProgram} style={{ flex: 1, background: '#00C9A7', color: '#fff', border: 'none', padding: '12px', borderRadius: 24, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Remove From Program Modal */}
      {removeProgramModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#FFF0F0', borderRadius: 12, padding: '12px 20px', marginBottom: 20 }}>
              <MdWarningAmber size={20} color="#FF5C5C" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#FF5C5C' }}>Remove from Program?</span>
            </div>
            <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.6, marginBottom: 4 }}>
              Removing <strong>{u?.name || 'this user'}</strong> from <strong>{sub?.program_name || 'the program'}</strong> will stop active tracking and monitoring. Historical data will be preserved.
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 28 }}>This action can be reversed by re-enrolling the user.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={handleRemoveProgram} style={{ background: '#00C9A7', color: '#fff', border: 'none', padding: '14px', borderRadius: 24, fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' }}>Remove From Program</button>
              <button onClick={() => setRemoveProgramModal(false)} style={{ background: '#fff', border: '1px solid #E5E7EB', padding: '14px', borderRadius: 24, fontWeight: 600, fontSize: 14, cursor: 'pointer', width: '100%' }}>Keep In Program</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
