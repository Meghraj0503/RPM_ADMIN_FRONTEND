import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuestionnaireDetail, getQuestionnaireTargetUsers, assignQuestionnaire } from '../api/admin';
import { MdArrowBack, MdClose, MdEdit } from 'react-icons/md';

export default function QuestionnaireAssign() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [tmpl, setTmpl] = useState(null);
  
  const [targets, setTargets] = useState({ highPriority: [], mandatory: [], allUsers: [] });
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [showSchedule, setShowSchedule] = useState(false);
  
  // Date/Time States matching actual functionality
  const currentDate = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Clock picker state
  const [clockMode, setClockMode] = useState('hours');
  const [hour, setHour] = useState('7');   // string — allows free editing
  const [minuteStr, setMinuteStr] = useState('00'); // string for free editing
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState('AM');

  // Helper func to get calendar days
  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDay = date.getDay();
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: new Date(year, month, 0).getDate() - firstDay + i + 1, isCurrentMonth: false });
    }
    while (date.getMonth() === month) {
        days.push({ day: date.getDate(), isCurrentMonth: true });
        date.setDate(date.getDate() + 1);
    }
    let j = 1;
    while (days.length % 7 !== 0) {
        days.push({ day: j++, isCurrentMonth: false });
    }
    return days;
  };

  const calendarDays = getDaysInMonth(viewMonth.getFullYear(), viewMonth.getMonth());

  const handleDayClick = (d) => {
     if (d.isCurrentMonth) {
        const yy = viewMonth.getFullYear();
        const mm = String(viewMonth.getMonth() + 1).padStart(2, '0');
        const dd = String(d.day).padStart(2, '0');
        setScheduleDate(`${yy}-${mm}-${dd}`);
     }
  };

  // Build time string whenever hour/minute/ampm changes
  const buildTime = (h, m, ap) => {
     let hNum = parseInt(h) || 0;
     if (ap === 'PM' && hNum < 12) hNum += 12;
     if (ap === 'AM' && hNum === 12) hNum = 0;
     return `${String(hNum).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Initialize scheduleTime on mount with defaults so Confirm check passes
  useEffect(() => {
     setScheduleTime(buildTime(hour, minute, ampm));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep scheduleTime in sync (minute is the numeric source of truth)
  useEffect(() => {
     setScheduleTime(buildTime(hour, minute, ampm));
     setMinuteStr(String(minute).padStart(2, '0')); // keep display in sync when dial clicked
  }, [hour, minute, ampm]);

  useEffect(() => {
    Promise.all([
      getQuestionnaireDetail(id),
      getQuestionnaireTargetUsers(id)
    ])
      .then(([tmplRes, targetsRes]) => {
        setTmpl(tmplRes.data);
        setTargets(targetsRes.data);
        
        const { assignedUserIds, existingScheduledFor } = targetsRes.data;

        // Pre-select: prefer already-assigned users, otherwise default to High Priority + Mandatory
        if (assignedUserIds && assignedUserIds.length > 0) {
          setSelectedIds(new Set(assignedUserIds));
        } else {
          const defaultSet = new Set();
          targetsRes.data.highPriority.forEach(u => defaultSet.add(u.id));
          targetsRes.data.mandatory.forEach(u => defaultSet.add(u.id));
          setSelectedIds(defaultSet);
        }

        // Pre-fill schedule date and time if a schedule already exists
        if (existingScheduledFor) {
          const d = new Date(existingScheduledFor);
          const yy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setScheduleDate(`${yy}-${mm}-${dd}`);

          let h = d.getHours();
          const m = d.getMinutes();
          const ap = h >= 12 ? 'PM' : 'AM';
          if (h > 12) h -= 12;
          if (h === 0) h = 12;
          setHour(String(h).padStart(2, '0'));
          setMinute(m);
          setMinuteStr(String(m).padStart(2, '0'));
          setAmpm(ap);
        }
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load assignment data');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleUser = (userId) => {
    const nextSet = new Set(selectedIds);
    if (nextSet.has(userId)) nextSet.delete(userId);
    else nextSet.add(userId);
    setSelectedIds(nextSet);
  };

  const handleSelectAll = () => {
    const allUserIds = [
      ...targets.highPriority.map(u => u.id),
      ...targets.mandatory.map(u => u.id),
      ...targets.allUsers.map(u => u.id)
    ];
    if (selectedIds.size === allUserIds.length && allUserIds.length > 0) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(allUserIds)); // Select all
    }
  };

  const handleAssign = async (isScheduled = false) => {
    if (selectedIds.size === 0) {
      alert('Please select at least one user');
      return;
    }

    let scheduled_for = null;
    if (isScheduled) {
      if (!scheduleDate || !scheduleTime) {
        alert('Please fill out date and time');
        return;
      }
      // Build a proper Date object and send full ISO string with timezone so DB is correct
      const localDateTimeStr = `${scheduleDate}T${scheduleTime}`;
      const dateObj = new Date(localDateTimeStr);
      if (isNaN(dateObj.getTime())) {
        alert('Invalid date or time. Please re-select.');
        return;
      }
      scheduled_for = dateObj.toISOString(); // correct UTC timestamp
    }

    const payload = {
      userIds: Array.from(selectedIds),
      scheduled_for,
      priority: 'High',      // For simplification, could vary per user
      is_mandatory: true
    };

    try {
      await assignQuestionnaire(id, payload);
      alert('Questionnaire assigned successfully!');
      navigate('/questionnaires');
    } catch {
      alert('Assignment failed');
    }
  };

  if (loading) return <div className="full-center" style={{ minHeight: 400 }}><div className="spinner" /></div>;
  if (!tmpl) return <div>Template not found</div>;

  return (
    <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 120px)' }}>
      {/* LEFT: Preview */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
          <MdArrowBack size={24} style={{ cursor: 'pointer', marginRight: 16 }} onClick={() => navigate('/questionnaires')} />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{tmpl.title}</h2>
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, background: '#FAFAFA' }}>
           <div style={{ background: '#fff', padding: 30, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative' }}>
              <MdEdit 
                 size={20} 
                 style={{ position: 'absolute', top: 30, right: 30, color: '#6B7280', cursor: 'pointer' }} 
                 onClick={() => navigate(`/questionnaires/${id}/edit`)}
                 title="Edit Questionnaire"
              />
              <h1 style={{ fontSize: 24, marginBottom: 24 }}>{tmpl.title}</h1>
              {tmpl.questions?.map((q, i) => (
                <div key={q.id} style={{ marginBottom: 24 }}>
                   <p style={{ fontWeight: 600, marginBottom: 12 }}>{i + 1}. {q.question_text}</p>
                   {['Short Answer', 'Paragraph'].includes(q.question_type) && (
                     <div style={{ borderBottom: '1px dashed #D1D5DB', width: '80%', padding: '12px 0', color: '#9CA3AF', fontSize: 13 }}>
                       {q.question_type === 'Short Answer' ? 'Short answer text...' : 'Long answer text...'}
                     </div>
                   )}
                   {['Multiple Choice', 'Checkboxes'].includes(q.question_type) && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                       {q.options_json?.map((opt, oIndex) => (
                         <label key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                           <input type={q.question_type === 'Multiple Choice' ? 'radio' : 'checkbox'} disabled />
                           {opt}
                         </label>
                       ))}
                     </div>
                   )}
                   {q.question_type === 'Dropdown' && (
                     <select disabled style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                        <option>Select option...</option>
                        {q.options_json?.map((opt, oIndex) => <option key={oIndex}>{opt}</option>)}
                     </select>
                   )}
                   {q.question_type === 'Rating' && (
                     <div style={{ display: 'flex', gap: 8 }}>
                       {[1,2,3,4,5,6,7,8,9,10].map(n => (
                         <div key={n} style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#6B7280' }}>
                           {n}
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* RIGHT: Assignment */}
      <div style={{ width: 380, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="text" placeholder="Forward to" style={{ flex: 1, padding: '10px 16px', borderRadius: 30, border: '1px solid #E5E7EB', outline: 'none' }} />
        </div>
        
        <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
             <span onClick={handleSelectAll} style={{ color: '#00eebe', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Select All</span>
          </div>
          
          <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' }}>High Priority</h4>
          {targets.highPriority.length === 0 && <p style={{ fontSize: 13, color: '#D1D5DB', fontStyle: 'italic', margin: '0 0 20px 0' }}>None</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
             {targets.highPriority.map(u => (
               <div key={`hp-${u.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {(u?.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D23' }}>{u?.name || 'Unknown User'}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>Risk Indicator</div>
                    </div>
                  </div>
                  <input type="checkbox" style={{ cursor: 'pointer', width: 16, height: 16 }} checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} />
               </div>
             ))}
          </div>

          <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' }}>Mandatory (Program Based)</h4>
          {targets.mandatory.length === 0 && <p style={{ fontSize: 13, color: '#D1D5DB', fontStyle: 'italic', margin: '0 0 20px 0' }}>None</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
             {targets.mandatory.map(u => (
               <div key={`md-${u.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E0E7FF', color: '#4338CA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {(u?.name || 'U').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D23' }}>{u.name || 'Unknown User'}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{u.program || 'Active Program'}</div>
                    </div>
                  </div>
                  <input type="checkbox" style={{ cursor: 'pointer', width: 16, height: 16 }} checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} />
               </div>
             ))}
          </div>

          <h4 style={{ margin: '0 0 12px 0', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase' }}>All Users</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {targets.allUsers.map(u => (
               <div key={`all-${u.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F3F4F6', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {(u?.name || 'U').charAt(0)}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1D23' }}>{u.name || 'Unknown User'}</div>
                  </div>
                  <input type="checkbox" style={{ cursor: 'pointer', width: 16, height: 16 }} checked={selectedIds.has(u.id)} onChange={() => toggleUser(u.id)} />
               </div>
             ))}
          </div>

        </div>

        <div style={{ padding: 20, borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {scheduleDate && scheduleTime ? (
            <div style={{ width: '100%' }}>
              <div style={{ background: '#FDE68A', padding: '12px 16px', borderRadius: 8, fontSize: 14, color: '#92400E', fontWeight: 500, textAlign: 'center', marginBottom: 16 }}>
                Schedule at : {scheduleDate}, {scheduleTime}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => handleAssign(true)}
                  style={{ padding: '12px 40px', background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 238, 190, 0.3)' }}
                >
                  Schedule
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
              <button 
                onClick={() => handleAssign(false)}
                style={{ padding: '12px 60px', background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 238, 190, 0.3)' }}
              >
                Send
              </button>
              <button 
                onClick={() => setShowSchedule(true)}
                style={{ padding: '8px', background: 'transparent', border: 'none', fontSize: 14, fontWeight: 500, color: '#00eebe', cursor: 'pointer' }}
              >
                Schedule
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM SCHEDULE MODAL MATCHING SCREENSHOT */}
      {showSchedule && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 24, width: 620, padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700, color: '#1A1D23' }}>Schedule Questionnaire</h3>
            
            <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
              
              {/* Custom Functional Calendar Left Pane */}
              <div style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                       <span style={{ color: '#9CA3AF', cursor: 'pointer', padding: 4 }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}>&lt;</span>
                       <span style={{ color: '#9CA3AF', cursor: 'pointer', padding: 4 }} onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}>&gt;</span>
                    </div>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px', textAlign: 'center', fontSize: 13, color: '#4B5563', marginBottom: 8, fontWeight: 600 }}>
                    {['S','M','T','W','T','F','S'].map((d, i) => <div key={`dw-${i}`}>{d}</div>)}
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px', textAlign: 'center', fontSize: 13, color: '#4B5563' }}>
                    {calendarDays.map((d, idx) => {
                       const mappedDateStr = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                       const isSelected = scheduleDate === mappedDateStr;
                       return (
                         <div key={idx} 
                            onClick={() => handleDayClick(d)}
                            style={{ 
                                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', cursor: d.isCurrentMonth ? 'pointer' : 'default',
                                background: isSelected && d.isCurrentMonth ? '#00eebe' : 'transparent',
                                color: isSelected && d.isCurrentMonth ? '#000' : (!d.isCurrentMonth) ? '#D1D5DB' : '#4B5563',
                                borderRadius: '50%', fontWeight: isSelected && d.isCurrentMonth ? 700 : 500
                            }}>
                             {d.day}
                         </div>
                       )
                    })}
                 </div>
              </div>

              {/* Custom Functional Clock Right Pane */}
              <div style={{ flex: 1, border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
                    {/* Hour input — string state allows clearing/retyping freely */}
                    <input 
                       type="text"
                       maxLength={2}
                       value={hour}
                       placeholder="07"
                       onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setHour(raw);
                       }}
                       onBlur={(e) => {
                          let val = parseInt(e.target.value) || 7;
                          if (val < 1) val = 1;
                          if (val > 12) val = 12;
                          setHour(String(val).padStart(2, '0'));
                       }}
                       onFocus={() => setClockMode('hours')}
                       style={{ background: clockMode === 'hours' ? '#ECFDF5' : '#F3F4F6', color: clockMode === 'hours' ? '#059669' : '#1A1D23', fontSize: 32, fontWeight: 300, padding: '0 12px', borderRadius: 8, outline: 'none', border: 'none', width: 64, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 24, fontWeight: 300 }}>:</span>
                     {/* Minute input — string state for free editing */}
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span 
                           onClick={() => { const v = Math.min(59, minute + 1); setMinute(v); setMinuteStr(String(v).padStart(2,'0')); }}
                           style={{ cursor: 'pointer', fontSize: 16, color: '#9CA3AF', lineHeight: 1, userSelect: 'none' }}>▲</span>
                        <input 
                           type="text"
                           maxLength={2}
                           value={minuteStr}
                           placeholder="00"
                           onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '');
                              setMinuteStr(raw); // allow typing freely
                           }}
                           onBlur={() => {
                              let val = parseInt(minuteStr);
                              if (isNaN(val) || val < 0) val = 0;
                              if (val > 59) val = 59;
                              setMinute(val);
                              setMinuteStr(String(val).padStart(2, '0'));
                           }}
                           onFocus={() => setClockMode('minutes')}
                           style={{ background: clockMode === 'minutes' ? '#ECFDF5' : '#F3F4F6', color: clockMode === 'minutes' ? '#059669' : '#1A1D23', fontSize: 32, fontWeight: 300, padding: '0 12px', borderRadius: 8, outline: 'none', border: 'none', width: 64, textAlign: 'center' }}
                        />
                        <span 
                           onClick={() => { const v = Math.max(0, minute - 1); setMinute(v); setMinuteStr(String(v).padStart(2,'0')); }}
                           style={{ cursor: 'pointer', fontSize: 16, color: '#9CA3AF', lineHeight: 1, userSelect: 'none' }}>▼</span>
                     </div>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12, border: '1px solid #E5E7EB', borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}>
                       <div onClick={() => setAmpm('AM')} style={{ background: ampm === 'AM' ? '#00eebe' : '#fff', color: ampm === 'AM' ? '#000' : '#9CA3AF', padding: '4px 10px', fontWeight: 600 }}>AM</div>
                       <div onClick={() => setAmpm('PM')} style={{ background: ampm === 'PM' ? '#00eebe' : '#fff', color: ampm === 'PM' ? '#000' : '#9CA3AF', padding: '4px 10px', fontWeight: 600 }}>PM</div>
                    </div>
                 </div>

                 {/* Analog Clock Dial */}
                 <div style={{ width: 140, height: 140, borderRadius: '50%', background: '#F9FAFB', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* Tick Generation */}
                    {clockMode === 'hours' ? 
                       [12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
                          const angle = (i * 30 - 90) * (Math.PI / 180);
                          const r = 54;
                          const x = 70 + r * Math.cos(angle) - 6;
                          const y = 70 + r * Math.sin(angle) - 8;
                          const isSelected = hour === n || (hour === 0 && n === 12);
                          return (
                             <div key={`h-${n}`} onClick={() => setHour(n === 12 ? 12 : n)} style={{ position: 'absolute', left: x, top: y, fontSize: 11, color: isSelected ? '#00eebe' : '#9CA3AF', fontWeight: isSelected ? 700 : 400, cursor: 'pointer', padding: 4, transform: 'translate(-2px, -2px)' }}>
                                {n}
                             </div>
                          )
                       })
                     : [0,5,10,15,20,25,30,35,40,45,50,55].map((n, i) => {
                          // These are the outer dial labels at 5-min increments
                          const angle = (i * 30 - 90) * (Math.PI / 180);
                          const r = 54;
                          const x = 70 + r * Math.cos(angle) - 6;
                          const y = 70 + r * Math.sin(angle) - 8;
                          const isSelected = minute >= n && minute < n + 5;
                          return (
                             <div key={`m-${n}`} onClick={() => setMinute(n)} style={{ position: 'absolute', left: x, top: y, fontSize: 11, color: isSelected ? '#00eebe' : '#9CA3AF', fontWeight: isSelected ? 700 : 400, cursor: 'pointer', padding: 4, transform: 'translate(-2px, -2px)' }}>
                                {String(n).padStart(2,'0')}
                             </div>
                          )
                     })
                    }
                    {/* Center dot */}
                    <div style={{ width: 6, height: 6, background: '#00eebe', borderRadius: '50%', position: 'absolute', zIndex: 2 }} />
                    
                    {/* Hands */}
                    {(() => {
                       const angle = clockMode === 'hours' ? ((hour % 12) * 30 - 90) : (minute * 6 - 90);
                       const rotation = angle + 90;
                       return (
                          <div style={{ width: 2, height: 40, background: '#00eebe', position: 'absolute', bottom: '50%', transformOrigin: 'bottom center', transform: `rotate(${rotation}deg)` }} />
                       )
                    })()}
                 </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button 
                onClick={() => setShowSchedule(false)}
                style={{ padding: '10px 40px', background: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: 30, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                   if (!scheduleDate || !scheduleTime) {
                      alert('Please select both a valid date and time.');
                      return;
                   }
                   setShowSchedule(false); 
                }}
                style={{ padding: '10px 40px', background: '#00eebe', color: '#000', border: 'none', borderRadius: 30, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
