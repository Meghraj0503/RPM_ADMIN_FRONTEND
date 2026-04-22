import React, { useState, useEffect, useCallback } from 'react';
import { exportData, getExportHistory } from '../api/admin';
import { MdDownload, MdOutlineCheck, MdOutlineCheckBoxOutlineBlank, MdRefresh } from 'react-icons/md';

// ─── Reusable controlled checkbox ───────────────────────────────────────────
function Checkbox({ label, checked, onChange }) {
  return (
    <label
      onClick={onChange}
      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4B5563', cursor: 'pointer', marginBottom: 8, userSelect: 'none' }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
        background: checked ? '#00C9A7' : '#fff',
        border: checked ? 'none' : '1.5px solid #D1D5DB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s'
      }}>
        {checked && <MdOutlineCheck color="#fff" size={13} />}
      </div>
      {label}
    </label>
  );
}

// ─── Date input with calendar icon ──────────────────────────────────────────
function DateInput({ label, value, onChange }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 36px 10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none', color: value ? '#111' : '#9CA3AF' }}
        />
      </div>
    </div>
  );
}

// ─── Small file-size formatter ───────────────────────────────────────────────
function fmtSize(kb) {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

// ─── Export Type badge colors ───────────────────────────────────────────────
const TYPE_COLORS = {
  vitals:          { bg: '#E8FBF7', color: '#00C9A7', label: 'Vitals' },
  questionnaires:  { bg: '#E8F5FF', color: '#2D9EF0', label: 'Questionnaire' },
  summary:         { bg: '#FFF8EC', color: '#FFB020', label: 'Summary' },
};

// ─── Programs list ──────────────────────────────────────────────────────────
const PROGRAMS = ['All Programs', 'Awareness', 'Wellness Program 2025', 'Diabetes Management', 'Cardiac Care'];

// ════════════════════════════════════════════════════════════════════════════
export default function ExportData() {
  // ── vitals state
  const [vFrom, setVFrom]     = useState('');
  const [vTo, setVTo]         = useState('');
  const [vProgram, setVProgram] = useState('All Programs');
  const [vFields, setVFields] = useState({
    heart_rate: true, spo2: true, steps: true,
    sleep: true, hrv: true, calories: true, activity_minutes: true
  });

  // ── questionnaire state
  const [qFrom, setQFrom]     = useState('');
  const [qTo, setQTo]         = useState('');
  const [qProgram, setQProgram] = useState('All Programs');
  const [qType, setQType]     = useState('All');
  const [qFields, setQFields] = useState({
    domain_scores: true, total_score: true,
    individual_responses: true, submission_timestamps: true
  });

  // ── summary state
  const [sFrom, setSFrom]     = useState('');
  const [sTo, setSTo]         = useState('');
  const [sProgram, setSProgram] = useState('All Programs');
  const [sFields, setSFields] = useState({
    cohort_overview: true, kpi_charts: true, q_completion_stats: true,
    at_risk_summary: true, score_trends: true, individual_user_profiles: true
  });

  // ── loading / progress per card
  const [gen, setGen]         = useState({ vitals: false, questionnaires: false, summary: false });
  const [prog, setProg]       = useState({ vitals: 0, questionnaires: 0, summary: 0 });

  // ── history
  const [history, setHistory] = useState([]);
  const [histOpen, setHistOpen] = useState(true);
  const [histLoading, setHistLoading] = useState(true);

  const loadHistory = useCallback(() => {
    setHistLoading(true);
    getExportHistory()
      .then(r => setHistory(r.data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // ── toggle all checkboxes for a given state setter
  const toggleAll = (fields, setFields, allOn) => {
    setFields(Object.fromEntries(Object.keys(fields).map(k => [k, allOn])));
  };

  const toggle = (setFields, key) => setFields(f => ({ ...f, [key]: !f[key] }));

  // ── animated progress then real download ────────────────────────────────
  const handleGenerate = async (type, payload) => {
    setGen(g => ({ ...g, [type]: true }));
    setProg(p => ({ ...p, [type]: 0 }));

    // Animate to ~80% before waiting for the API
    let fakeP = 0;
    const iv = setInterval(() => {
      fakeP = Math.min(fakeP + 20, 80);
      setProg(p => ({ ...p, [type]: fakeP }));
      if (fakeP >= 80) clearInterval(iv);
    }, 300);

    try {
      const res = await exportData(type, payload);
      clearInterval(iv);
      setProg(p => ({ ...p, [type]: 100 }));

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Refresh history
      setTimeout(() => {
        loadHistory();
        setGen(g => ({ ...g, [type]: false }));
        setProg(p => ({ ...p, [type]: 0 }));
      }, 800);
    } catch (err) {
      clearInterval(iv);
      alert('Export failed. Please try again.');
      setGen(g => ({ ...g, [type]: false }));
      setProg(p => ({ ...p, [type]: 0 }));
    }
  };

  // ─── shared card chrome ─────────────────────────────────────────────────
  const Card = ({ children }) => (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 10 }}>{children}</div>
  );

  // const GenerateBtn = ({ type, onClick }) => {
  //   const isRunning = gen[type];
  //   const pct       = prog[type];
  //   return (
  //     <div style={{ marginTop: 'auto' }}>
  //       <button
  //         onClick={onClick}
  //         disabled={isRunning}
  //         style={{
  //           width: '100%', background: '#00C9A7', color: '#fff', border: 'none',
  //           borderRadius: 24, padding: '12px', fontSize: 14, fontWeight: 700,
  //           cursor: isRunning ? 'default' : 'pointer',
  //           position: 'relative', overflow: 'hidden', display: 'flex',
  //           alignItems: 'center', justifyContent: 'center', gap: 8
  //         }}
  //       >
  //         {isRunning && (
  //           <div style={{
  //             position: 'absolute', left: 0, top: 0, bottom: 0,
  //             background: 'rgba(255,255,255,0.25)', width: `${pct}%`,
  //             transition: 'width 0.3s ease'
  //           }} />
  //         )}
  //         <MdDownload size={18} />
  //         {isRunning ? `Generating ${pct}%…` : 'Generate Report'}
  //       </button>
  //       {isRunning && (
  //         <div style={{ height: 3, background: '#E5E7EB', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
  //           <div style={{ height: '100%', background: '#00C9A7', width: `${pct}%`, transition: 'width 0.3s' }} />
  //         </div>
  //       )}
  //     </div>
  //   );
  // };
const GenerateBtn = ({ type, onClick, onEmailClick }) => {
  const isRunning = gen[type];
  const pct = prog[type];

  return (
    <div style={{ marginTop: "auto" }}>
      
      {/* Buttons Row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 10
        }}
      >
        {/* Generate Report */}
        <button
          onClick={onClick}
          disabled={isRunning}
          style={{
            flex: 1,
            background: "#00C9A7",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            padding: "12px",
            fontSize: 14,
            fontWeight: 700,
            cursor: isRunning ? "default" : "pointer",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          {isRunning && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                background: "rgba(255,255,255,0.25)",
                width: `${pct}%`,
                transition: "width 0.3s ease"
              }}
            />
          )}

          <MdDownload size={18} />
          {isRunning ? `${pct}%` : "Generate Report"}
        </button>

        {/* Email Report */}
        <button
          onClick={onEmailClick}
          disabled={isRunning}
          style={{
            flex: 1,
            background: "#00C9A7",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            padding: "12px",
            fontSize: 14,
            fontWeight: 700,
            cursor: isRunning ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          📧 Email Report
        </button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div
          style={{
            height: 3,
            background: "#E5E7EB",
            borderRadius: 2,
            marginTop: 8,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#00C9A7",
              width: `${pct}%`,
              transition: "width 0.3s"
            }}
          />
        </div>
      )}
    </div>
  );
};
  // ─── date pair ──────────────────────────────────────────────────────────
  const DateRow = ({ from, setFrom, to, setTo }) => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
      <DateInput label="From" value={from} onChange={setFrom} />
      <span style={{ color: '#9CA3AF', paddingBottom: 10 }}>→</span>
      <DateInput label="To"   value={to}   onChange={setTo}   />
    </div>
  );

  const ProgramSelect = ({ value, onChange }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>Program</label>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', cursor: 'pointer' }}
      >
        {PROGRAMS.map(p => <option key={p}>{p}</option>)}
      </select>
    </div>
  );

  const allVOn   = Object.values(vFields).every(Boolean);
  const allVOff  = Object.values(vFields).every(v => !v);
  const allSOn   = Object.values(sFields).every(Boolean);

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px 0' }}>Data Export</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Generate and download program reports for analysis.</p>
        </div>
        <button
          onClick={loadHistory}
          style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 24, padding: '8px 18px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <MdRefresh size={16} /> Export History
        </button>
      </div>

      {/* ── 3 Export Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28, alignItems: 'start' }}>

        {/* ── VITALS ── */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Vitals Data Export</div>
          <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 18 }}>
            Export wearable &amp; manual vitals — Heart Rate, SpO2, Steps, Sleep, HRV, Calories, Activity Minutes.
          </p>
          <DateRow from={vFrom} setFrom={setVFrom} to={vTo} setTo={setVTo} />
          <ProgramSelect value={vProgram} onChange={setVProgram} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionLabel>Vitals to Include</SectionLabel>
            <span
              onClick={() => toggleAll(vFields, setVFields, !allVOn)}
              style={{ fontSize: 11, color: '#00C9A7', fontWeight: 600, cursor: 'pointer' }}
            >{allVOn ? 'Deselect all' : 'Select all'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
            <Checkbox label="Heart Rate"     checked={vFields.heart_rate}       onChange={() => toggle(setVFields, 'heart_rate')} />
            <Checkbox label="SpO2"           checked={vFields.spo2}             onChange={() => toggle(setVFields, 'spo2')} />
            <Checkbox label="Steps"          checked={vFields.steps}            onChange={() => toggle(setVFields, 'steps')} />
            <Checkbox label="Sleep"          checked={vFields.sleep}            onChange={() => toggle(setVFields, 'sleep')} />
            <Checkbox label="HRV"            checked={vFields.hrv}              onChange={() => toggle(setVFields, 'hrv')} />
            <Checkbox label="Calories"       checked={vFields.calories}         onChange={() => toggle(setVFields, 'calories')} />
            <Checkbox label="Activity Mins"  checked={vFields.activity_minutes} onChange={() => toggle(setVFields, 'activity_minutes')} />
          </div>

          <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 8 }}>
            {Object.values(vFields).filter(Boolean).length} of {Object.keys(vFields).length} fields selected
          </div>
          <GenerateBtn type="vitals" onClick={() => handleGenerate('vitals', {
            fields:    Object.keys(vFields).filter(k => vFields[k]),
            date_from: vFrom || undefined,
            date_to:   vTo   || undefined,
            program:   vProgram
          })} />
        </Card>

        {/* ── QUESTIONNAIRES ── */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Questionnaire Responses</div>
          <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 18 }}>
            Export questionnaire submission data including domain scores, total CELEBRATIONS scores, and timestamps.
          </p>
          <DateRow from={qFrom} setFrom={setQFrom} to={qTo} setTo={setQTo} />
          <ProgramSelect value={qProgram} onChange={setQProgram} />

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>Questionnaire Type</label>
            <select
              value={qType} onChange={e => setQType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', cursor: 'pointer' }}
            >
              <option>All</option>
              <option>CELEBRATIONS</option>
              <option>Weekly Check-in</option>
            </select>
          </div>

          <SectionLabel>Include</SectionLabel>
          <div style={{ marginBottom: 20 }}>
            <Checkbox label="Domain scores"        checked={qFields.domain_scores}        onChange={() => toggle(setQFields, 'domain_scores')} />
            <Checkbox label="Total score"          checked={qFields.total_score}          onChange={() => toggle(setQFields, 'total_score')} />
            <Checkbox label="Individual responses" checked={qFields.individual_responses} onChange={() => toggle(setQFields, 'individual_responses')} />
            <Checkbox label="Submission timestamps" checked={qFields.submission_timestamps} onChange={() => toggle(setQFields, 'submission_timestamps')} />
          </div>

          <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 8 }}>
            {Object.values(qFields).filter(Boolean).length} of {Object.keys(qFields).length} fields selected
          </div>
          <GenerateBtn type="questionnaires" onClick={() => handleGenerate('questionnaires', {
            fields:    Object.keys(qFields).filter(k => qFields[k]),
            date_from: qFrom || undefined,
            date_to:   qTo   || undefined,
            program:   qProgram,
            qType
          })} />
        </Card>

        {/* ── PROGRAM SUMMARY ── */}
        <Card>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Program Summary Report</div>
          <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5, marginBottom: 18 }}>
            Generate a report with cohort overview, KPI trends, Q-completion stats, and at-risk user summary.
          </p>
          <DateRow from={sFrom} setFrom={setSFrom} to={sTo} setTo={setSTo} />
          <ProgramSelect value={sProgram} onChange={setSProgram} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionLabel>Include in Report</SectionLabel>
            <span
              onClick={() => toggleAll(sFields, setSFields, !allSOn)}
              style={{ fontSize: 11, color: '#00C9A7', fontWeight: 600, cursor: 'pointer' }}
            >{allSOn ? 'Deselect all' : 'Select all'}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Checkbox label="Cohort overview"       checked={sFields.cohort_overview}        onChange={() => toggle(setSFields, 'cohort_overview')} />
            <Checkbox label="KPI charts"             checked={sFields.kpi_charts}             onChange={() => toggle(setSFields, 'kpi_charts')} />
            <Checkbox label="Q-completion stats"     checked={sFields.q_completion_stats}     onChange={() => toggle(setSFields, 'q_completion_stats')} />
            <Checkbox label="At-risk summary"        checked={sFields.at_risk_summary}        onChange={() => toggle(setSFields, 'at_risk_summary')} />
            <Checkbox label="Score trends"           checked={sFields.score_trends}           onChange={() => toggle(setSFields, 'score_trends')} />
            <Checkbox label="Individual user profiles" checked={sFields.individual_user_profiles} onChange={() => toggle(setSFields, 'individual_user_profiles')} />
          </div>

          <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: 8 }}>
            {Object.values(sFields).filter(Boolean).length} of {Object.keys(sFields).length} fields selected
          </div>
          <GenerateBtn type="summary" onClick={() => handleGenerate('summary', {
            fields:    Object.keys(sFields).filter(k => sFields[k]),
            date_from: sFrom || undefined,
            date_to:   sTo   || undefined,
            program:   sProgram
          })} />
        </Card>

      </div>

      {/* ── Recent Exports ── */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Exports</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{history.length} record{history.length !== 1 ? 's' : ''}</span>
            <button onClick={loadHistory} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}><MdRefresh size={16} /></button>
            <button onClick={() => setHistOpen(h => !h)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 16 }}>{histOpen ? '∧' : '∨'}</button>
          </div>
        </div>

        {histOpen && (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {['File Name', 'Type', 'Fields Exported', 'Size', 'Rows', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', fontWeight: 500, color: '#6B7280', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {histLoading ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>Loading…</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9CA3AF' }}>No exports yet. Generate one above!</td></tr>
              ) : history.map((h, i) => {
                const tc = TYPE_COLORS[h.export_type] || { bg: '#F3F4F6', color: '#6B7280', label: h.export_type };
                const date = new Date(h.created_at);
                return (
                  <tr key={h.id || i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 500 }}>{h.file_name}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ background: tc.bg, color: tc.color, padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: 11 }}>{tc.label}</span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 12 }}>
                      {Array.isArray(h.fields_exported) && h.fields_exported[0] === 'all'
                        ? 'All fields'
                        : (h.fields_exported || []).join(', ')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#6B7280' }}>{fmtSize(h.file_size_kb || 0)}</td>
                    <td style={{ padding: '14px 20px', color: '#6B7280' }}>{h.row_count}</td>
                    <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: 12 }}>
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        title="Re-download not available for past exports"
                        style={{ background: 'none', border: 'none', cursor: 'not-allowed', color: '#D1D5DB' }}
                      >
                        <MdDownload size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
