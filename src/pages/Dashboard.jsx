import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { getCohortDashboard, getAtRiskUsers, exportData } from '../api/admin';
import {
  MdWarning, MdFavorite, MdDirectionsRun, MdAssignment,
  MdGroups, MdMenuBook, MdPersonSearch, MdBarChart, MdDownload, MdOpenInNew
} from 'react-icons/md';

/* ─── TAB DEFINITIONS ──────────────────────────────────────────── */
const TABS = [
  { id: 'health_alerts',  label: 'Critical Health Alerts',          icon: <MdWarning /> },
  { id: 'health_risk',    label: 'Health Risk Indicator',           icon: <MdFavorite /> },
  { id: 'physical',       label: 'Physical Activity Metrics',       icon: <MdDirectionsRun /> },
  { id: 'questionnaire',  label: 'Questionnaire Performance',       icon: <MdAssignment /> },
  { id: 'enrollment',     label: 'Program Enrollment & Engagement', icon: <MdGroups /> },
  { id: 'education',      label: 'Education Hub Engagement',        icon: <MdMenuBook /> },
  { id: 'at_risk',        label: 'At Risk User Monitoring',         icon: <MdPersonSearch /> },
  { id: 'dau',            label: 'Daily Active Users',              icon: <MdBarChart /> },
];

/* ─── SHARED SUB-COMPONENTS ────────────────────────────────────── */

/* Section banner — green or red */
function SectionBanner({ color = 'green', label, sub }) {
  const bg   = color === 'red'  ? '#FFF0F0' : '#E8FBF7';
  const fg   = color === 'red'  ? '#FF5C5C' : '#00C9A7';
  const dot  = fg;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
      <span style={{
        display:'inline-flex', alignItems:'center', gap:6,
        background: bg, color: fg, borderRadius:20,
        padding:'4px 12px 4px 8px', fontWeight:700, fontSize:13
      }}>
        <span style={{ width:9, height:9, borderRadius:'50%', background:dot, display:'inline-block'}} />
        {label}
      </span>
      {sub && <span style={{ fontSize:12, color:'#6B7280' }}>{sub}</span>}
    </div>
  );
}

/* Metric chip row */
function MetricChip({ label, value, color='green' }) {
  const palettes = {
    green:  { bg:'#E8FBF7', fg:'#00C9A7' },
    red:    { bg:'#FFF0F0', fg:'#FF5C5C' },
    yellow: { bg:'#FFF8EC', fg:'#FFB020' },
    blue:   { bg:'#EBF5FF', fg:'#2D9EF0' },
  };
  const p = palettes[color] || palettes.green;
  return (
    <div>
      <div style={{ fontSize:11, color:'#6B7280', marginBottom:3 }}>{label}</div>
      <div style={{ background:p.bg, color:p.fg, borderRadius:6, padding:'4px 10px', fontWeight:700, fontSize:14, display:'inline-block' }}>
        {value}
      </div>
    </div>
  );
}

/* Horizontal bar with label + value */
function HBar({ label, value, pct, color }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:color, display:'inline-block' }} />
          {label}
        </span>
        <span style={{ fontWeight:600 }}>{value}</span>
      </div>
      <div style={{ background:'#E5E7EB', borderRadius:4, height:6 }}>
        <div style={{ background:color, borderRadius:4, height:6, width:`${pct}%` }} />
      </div>
    </div>
  );
}

/* Donut chart card used for Education Hub category items */
function CategoryDonut({ value, label, icon, size=100 }) {
  const total = 1400;
  const filled = Math.round((value / total) * 100);
  return (
    <div style={{ textAlign:'center' }}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={[{ v: value }, { v: Math.max(0, total - value) }]}
            cx="50%" cy="50%"
            innerRadius={size*0.33} outerRadius={size*0.46}
            dataKey="v" startAngle={90} endAngle={-270} stroke="none"
          >
            <Cell fill="#00C9A7" />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ marginTop:-size*0.6, fontWeight:700, fontSize:size===100?15:13, color:'#1A1D23' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ marginTop: size*0.62, fontSize:11, color:'#6B7280', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
        {icon} {label}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Critical Health Alerts  (left card)
════════════════════════════════════════════════════════════════ */
function CriticalHealthAlertsCard() {
  const spo2Slices = [
    { name: 'Normal 95–100%', value: 1084, pct: 62, color:'#00C9A7' },
    { name: 'Low 90–94%',     value: 167,  pct: 13, color:'#FFB020' },
    { name: 'Critical below 90%', value: 63, pct: 5, color:'#FF5C5C' },
  ];
  const pieSpo2 = [
    { v:1084, color:'#00C9A7' },
    { v:167,  color:'#FFB020' },
    { v:63,   color:'#FF5C5C' },
    { v:50,   color:'#E5E7EB' },
  ];
  const hrData = [
    { r:'Below 40', v:18,  c:'#FF5C5C' },
    { r:'40–59',    v:95,  c:'#FFB020' },
    { r:'60–79',    v:512, c:'#00C9A7' },
    { r:'80–100',   v:487, c:'#00C9A7' },
    { r:'101–120',  v:143, c:'#FFB020' },
    { r:'Above 120',v:28,  c:'#FF5C5C' },
  ];

  return (
    <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff', flex:1 }}>
      <SectionBanner color="red" label="Critical Health Alerts" sub="Immediate medical attention signals" />

      {/* SpO2 section */}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Blood oxygen (SpO2) – Population Distraction</div>
      <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Safe range: 95–100% · Alert threshold: below 95%</div>

      <div style={{ display:'flex', gap:16, marginBottom:14 }}>
        <MetricChip label="Cohort avg SpO2" value="96.2%" color="green" />
        <MetricChip label="Critical users" value="63" color="red" />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie data={pieSpo2} cx={70} cy={70} innerRadius={46} outerRadius={68} dataKey="v" startAngle={90} endAngle={-270} stroke="none">
              {pieSpo2.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <text x={70} y={65} textAnchor="middle" fill="#1A1D23" fontSize={20} fontWeight={700}>64</text>
            <text x={70} y={82} textAnchor="middle" fill="#6B7280" fontSize={11}>At risk</text>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex:1 }}>
          {spo2Slices.map((s,i)=>(
            <HBar key={i} label={s.name} value={`${s.value} – ${s.pct}%`} pct={s.pct*1.5} color={s.color} />
          ))}
        </div>
      </div>

      <p style={{ fontSize:11, color:'#6B7280', marginTop:6, marginBottom:20 }}>
        Alert trigger at: <span style={{ color:'#FF5C5C', fontWeight:600 }}>Below 95% SpO2</span> · Users in critical band auto-appear in at-risk list
      </p>

      {/* HR bar chart */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <span style={{ fontWeight:600, fontSize:13 }}>Heart rate – Population range breakdown</span>
        <span style={{ fontSize:10, color:'#9CA3AF' }}>^</span>
      </div>
      <div style={{ fontSize:11, color:'#6B7280', marginBottom:10 }}>Safe range: 60–100bpm · Alert: Above 120bpm or below 40bpm</div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={hrData} barSize={26}>
          <XAxis dataKey="r" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <Bar dataKey="v" radius={[4,4,0,0]}>
            {hrData.map((e,i)=><Cell key={i} fill={e.c}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize:11, color:'#6B7280', marginTop:6 }}>
        Critical: <span style={{ color:'#FF5C5C', fontWeight:600 }}>Above 120bpm or below 40bpm</span> (Cohort avg: 74bpm)
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Health Risk Indicator  (right card)
════════════════════════════════════════════════════════════════ */
function HealthRiskCard() {
  const hrvData = [
    { r:'Below 20ms', v:94  },
    { r:'20–39ms',    v:317 },
    { r:'40–59ms',    v:486 },
    { r:'60–79ms',    v:287 },
    { r:'80+ ms',     v:108 },
  ];
  const sleepData = [
    { r:'Below 4h', v:18,  c:'#FF5C5C' },
    { r:'4–5h',     v:95,  c:'#FFB020' },
    { r:'5–6h',     v:512, c:'#00C9A7' },
    { r:'6–7h',     v:487, c:'#00C9A7' },
    { r:'7–8h',     v:143, c:'#00C9A7' },
    { r:'8h+',      v:28,  c:'#9CA3AF' },
  ];

  return (
    <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff', flex:1 }}>
      <SectionBanner color="green" label="Health Risk Indicator" sub="Early morning lifestyle indicator" />

      {/* HRV */}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Heart rate variability (HRV) – cohort distribution</div>
      <div style={{ fontSize:12, color:'#6B7280', marginBottom:10 }}>Higher HRV = better autonomic health · Cohort avg: 38ms</div>
      <div style={{ fontWeight:600, fontSize:11, color:'#6B7280', marginBottom:4 }}>Avg 38ms</div>
      <ResponsiveContainer width="100%" height={145}>
        <BarChart data={hrvData} layout="vertical" barSize={14}>
          <XAxis type="number" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="r" tick={{ fontSize:10 }} width={68} axisLine={false} tickLine={false} />
          <Bar dataKey="v" fill="#00C9A7" radius={[0,4,4,0]} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize:11, color:'#6B7280', marginTop:6, marginBottom:18 }}>
        Alert: <span style={{ color:'#FFB020', fontWeight:600 }}>HRV below 70 ms</span> for 5+ consecutive days · 94 users currently flagged
      </p>

      {/* Sleep */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <span style={{ fontWeight:600, fontSize:13 }}>Sleep duration – cohort distribution (7-day avg)</span>
        <span style={{ fontSize:10, color:'#9CA3AF' }}>^</span>
      </div>
      <div style={{ fontSize:11, color:'#6B7280', marginBottom:10 }}>Recommended: 7–9h/night · Avg sleep quality score: 6.4/10</div>

      <ResponsiveContainer width="100%" height={148}>
        <BarChart data={sleepData} barSize={26}>
          <XAxis dataKey="r" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <Bar dataKey="v" radius={[4,4,0,0]}>
            {sleepData.map((e,i)=><Cell key={i} fill={e.c}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', gap:10, marginTop:10 }}>
        <MetricChip label="Cohort avg sleep" value="6.8h" color="green" />
        <MetricChip label="Critical (below 4h)" value="5.9" color="red" />
        <MetricChip label="Avg quality score" value="6.4" color="blue" />
      </div>
      <p style={{ fontSize:11, color:'#6B7280', marginTop:8 }}>
        Alert: <span style={{ color:'#FF5C5C', fontWeight:600 }}>Below 4hrs/night</span> for 2+ consecutive days
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Physical Activity Metrics
════════════════════════════════════════════════════════════════ */
function PhysicalActivityMetrics() {
  const stepsData = [
    { day:'Mon', steps:5800 }, { day:'Tue', steps:6200 }, { day:'Wed', steps:5900 },
    { day:'Thu', steps:7100 }, { day:'Fri', steps:6400 }, { day:'Sat', steps:8200 },
    { day:'Sun', steps:6800 },
  ];
  const calData = [
    { name:'At or above 350 kcal', value:889, color:'#00C9A7' },
    { name:'Below target',          value:385, color:'#FFB020' },
  ];
  // Semi-arc gauge for active minutes (0–200+ scale)
  const minutesPct = 112 / 200; // 112 min out of 200
  const gaugeData = [
    { v: Math.round(minutesPct * 100) },
    { v: 100 - Math.round(minutesPct * 100) },
  ];

  return (
    <div>
      {/* Green section banner */}
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
        <SectionBanner label="Physical Activity Metrics" sub="Daily movement and energy tracking across the cohort" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:20 }}>

        {/* Steps line chart */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Avg steps/day – 7 day cohort trend</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Daily goal: 8,000 steps · Cohort avg: 6,214</div>
          <div style={{ display:'flex', gap:14, marginBottom:14 }}>
            <MetricChip label="Cohort avg /day" value="6,214" color="blue" />
            <MetricChip label="Hit 8k goal today" value="412" color="green" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stepsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} domain={[0,'dataMax+2000']} />
              <Tooltip />
              <Line type="monotone" dataKey="steps" stroke="#00C9A7" strokeWidth={2} dot={{ r:4, fill:'#00C9A7' }} />
              {/* Goal reference line annotated */}
              <Line type="monotone" data={stepsData.map(d=>({...d, goal:8000}))} dataKey="goal" stroke="#E5E7EB" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ fontSize:11, color:'#6B7280', marginTop:6 }}>
            Alert trigger at: <span style={{color:'#FF5C5C',fontWeight:600}}>Below 95% SpO2</span> · Users in critical band auto-appear in at-risk list
          </p>
        </div>

        {/* Calories donut */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Calories Burned – Target achievement</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Daily target: 350 kcal · Cohort avg: 281 kcal/day</div>
          <div style={{ display:'flex', gap:14, marginBottom:14 }}>
            <MetricChip label="Cohort avg kcal" value="281" color="blue" />
            <MetricChip label="Daily target kcal" value="350" color="green" />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={calData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {calData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>70%</text>
              <text x="50%" y="57%" textAnchor="middle" fill="#6B7280" fontSize={12}>on target</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop:12 }}>
            {calData.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:'50%', background:d.color, display:'inline-block'}} />
                  {d.name}
                </span>
                <span style={{ fontWeight:600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active minutes semi-arc gauge */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Active minutes – weekly cohort avg</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>WHO target: 150 min/week · Cohort avg: 120 min/week</div>
          <div style={{ display:'flex', gap:14, marginBottom:10 }}>
            <MetricChip label="Not WHO target" value="412" color="red" />
            <MetricChip label="Below Target" value="872" color="yellow" />
          </div>

          <div style={{ textAlign:'center', fontSize:12, color:'#6B7280', marginBottom:4 }}>150 (WHO goal)</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%" cy="80%"
                startAngle={180} endAngle={0}
                innerRadius={72} outerRadius={100}
                dataKey="v" stroke="none"
              >
                <Cell fill="#00C9A7" />
                <Cell fill="#E5E7EB" />
              </Pie>
              <text x="50%" y="82%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>112</text>
              <text x="50%" y="93%" textAnchor="middle" fill="#6B7280" fontSize={11}>min/week</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#6B7280', marginTop:-10 }}>
            <span>0</span>
            <span>200+</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Program Enrollment & Engagement
════════════════════════════════════════════════════════════════ */
function ProgramEnrollment() {
  const programData = [
    { name:'Wellness 90',  value:580, pct:'48%', color:'#2D9EF0' },
    { name:'Diabetes Care',value:312, pct:'24%', color:'#FF5C5C' },
    { name:'Cardiac Rehab',value:218, pct:'17%', color:'#FFB020' },
    { name:'Other',        value:174, pct:'14%', color:'#9CA3AF' },
  ];
  const abhaData  = [{ v:76, color:'#00C9A7' }, { v:24, color:'#E5E7EB' }];
  const deviceColors = ['#2D9EF0','#FF5C5C','#FF8080'];
  const deviceData = [
    { name:'Paired & active',      value:899 },
    { name:'Paired, not syncing',  value:193 },
    { name:'Manual entry only',    value:192 },
  ];

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16 }}>
        <SectionBanner label="Program Enrollment & Engagement" sub="Daily movement and energy tracking across the cohort" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>

        {/* Users by Program */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Users by Program</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Total enrolled: 1,284 across all programs</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={programData} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {programData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" fill="#1A1D23" fontSize={22} fontWeight={700}>1,284</text>
              <text x="50%" y="57%" textAnchor="middle" fill="#6B7280" fontSize={11}>Total</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop:12 }}>
            {programData.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7, fontSize:12 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:'50%', background:d.color, display:'inline-block'}} />
                  {d.name}
                </span>
                <span style={{ fontWeight:600 }}>{d.value} – {d.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ABHA linkage */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>ABHA ID linkage status</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Ayushman Bharat Health Account integration</div>
          <div style={{ display:'flex', gap:12, marginBottom:14 }}>
            <MetricChip label="ABHA linked" value="976" color="green" />
            <MetricChip label="Not linked" value="308" color="red" />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={abhaData} cx="50%" cy="50%" innerRadius={58} outerRadius={84} dataKey="v" startAngle={90} endAngle={-270} stroke="none">
                {abhaData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>76%</text>
              <text x="50%" y="58%" textAnchor="middle" fill="#6B7280" fontSize={12}>Linked</text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Wearable pairing */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Wearable device pairing</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Fastrack smartwatch connection status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{v:76},{v:15},{v:9}]} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="v" startAngle={90} endAngle={-270} stroke="none">
                {deviceColors.map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" fill="#1A1D23" fontSize={22} fontWeight={700}>76%</text>
              <text x="50%" y="58%" textAnchor="middle" fill="#6B7280" fontSize={11}>Connected</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop:10 }}>
            {deviceData.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7, fontSize:12 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:'50%', background:deviceColors[i], display:'inline-block'}} />
                  {d.name}
                </span>
                <span style={{ fontWeight:600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Education Hub Engagement
════════════════════════════════════════════════════════════════ */
function EducationHub() {
  const cats = [
    { label:'Nutrition',     value:1248, icon:'🌿' },
    { label:'Mental health', value:1018, icon:'🧠' },
    { label:'Sleep',         value:891,  icon:'😴' },
    { label:'Movement',      value:776,  icon:'🏃' },
    { label:'Spiritual',     value:479,  icon:'🕊️' },
  ];
  const top = [
    { title:'Glycaemic load in indian diets', reads:342, bk:128 },
    { title:'Breathing for anxiety relief',   reads:198, bk:104 },
    { title:'HRV and late dinner',            reads:241, bk:87  },
  ];

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <SectionBanner label="Education Hub Engagement" sub="Content effectiveness and reading behaviour" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>

        {/* Left: category donuts */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Article Read – by category (this week)</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Total reads: 5,412 · Avg per user: 4.2 articles</div>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <MetricChip label="Total reads" value="5,412" color="blue" />
            <MetricChip label="Avg per user" value="4.2" color="green" />
            <MetricChip label="Bookmarked" value="38%" color="blue" />
          </div>
          {/* Row 1: 3 donuts */}
          <div style={{ display:'flex', justifyContent:'space-around', marginBottom:8 }}>
            {cats.slice(0,3).map((c,i)=>(
              <CategoryDonut key={i} value={c.value} label={c.label} icon={c.icon} size={110} />
            ))}
          </div>
          {/* Row 2: 2 donuts centred */}
          <div style={{ display:'flex', justifyContent:'center', gap:60, marginTop:8 }}>
            {cats.slice(3).map((c,i)=>(
              <CategoryDonut key={i} value={c.value} label={c.label} icon={c.icon} size={110} />
            ))}
          </div>
        </div>

        {/* Right: library + top articles */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Content library status & top performing articles</div>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <MetricChip label="Published"   value="24" color="green" />
            <MetricChip label="Draft"       value="6"  color="yellow" />
            <MetricChip label="Unpublished" value="3"  color="red" />
          </div>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Top articles this week</div>
          {top.map((a,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ fontSize:22, marginRight:12 }}>🍃</span>
              <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{a.title}</span>
              <span style={{ fontSize:12, color:'#6B7280', display:'flex', alignItems:'center', gap:4, marginRight:14 }}>
                📖 {a.reads}
              </span>
              <span style={{ fontSize:12, color:'#6B7280', display:'flex', alignItems:'center', gap:4 }}>
                🔖 {a.bk}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: At-Risk User Monitoring
════════════════════════════════════════════════════════════════ */
function AtRiskMonitoring() {
  const rows = Array(7).fill({ name:'Aryan Sharma', program:'Diabetes', vital:'SpO2', reading:'91%', when:'3h Ago' });
  const breakdown = [
    { name:'SpO2 Critical',    value:11, color:'#FF5C5C' },
    { name:'Heart Rate',       value:7,  color:'#FFB020' },
    { name:'HRV low',          value:3,  color:'#2D9EF0' },
    { name:'Sleep Deprivation',value:2,  color:'#9CA3AF' },
  ];

  return (
    <div>
      <div style={{ background:'#FFF0F0', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <SectionBanner color="red" label="At-Risk User Monitoring" sub="Content effectiveness and reading behaviour" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:20 }}>

        {/* Left: table */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>At-risk users – flagged in last 48 hrs</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:16 }}>23 users flagged · Sorted by severity</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #F3F4F6' }}>
                  {['User','Program','Vital Flag','Reading','When','Status',''].map((h,i)=>(
                    <th key={i} style={{ padding:'8px 10px', textAlign:'left', fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid #F9FAFB' }}>
                    <td style={{ padding:'11px 10px', fontWeight:500 }}>{r.name}</td>
                    <td style={{ padding:'11px 10px' }}>{r.program}</td>
                    <td style={{ padding:'11px 10px' }}>{r.vital}</td>
                    <td style={{ padding:'11px 10px' }}>{r.reading}</td>
                    <td style={{ padding:'11px 10px', color:'#6B7280' }}>{r.when}</td>
                    <td style={{ padding:'11px 10px' }}>
                      <span style={{ background:'#FFF0F0', color:'#FF5C5C', borderRadius:20, padding:'3px 12px', fontWeight:600, fontSize:12 }}>Critical</span>
                    </td>
                    <td style={{ padding:'11px 10px', color:'#9CA3AF', cursor:'pointer' }}>⊙</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign:'center', marginTop:14, fontSize:13 }}>
            <a href="#" style={{ color:'#00C9A7', fontWeight:600, textDecoration:'none' }}>View All 23 at-risk users →</a>
          </div>
        </div>

        {/* Right: breakdown donut */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>At-risk breakdown by vital type</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>23 users flagged</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={62} outerRadius={92} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {breakdown.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>23</text>
              <text x="50%" y="58%" textAnchor="middle" fill="#6B7280" fontSize={12}>At-risk</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop:10 }}>
            {breakdown.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, fontSize:12 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:'50%', background:d.color, display:'inline-block'}} />
                  {d.name}
                </span>
                <span style={{ fontWeight:600 }}>{d.value} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Daily Active Users  (brand new)
════════════════════════════════════════════════════════════════ */
function DailyActiveUsers() {
  const [period, setPeriod] = useState('30');

  // 30-day area chart data
  const dauData = Array.from({ length:30 }, (_, i) => ({
    day: `Day ${i+1}`,
    dau: 580 + Math.round(Math.sin(i/4)*80 + i*8 + Math.random()*40),
  }));
  dauData[29].dau = 847; // peak at day 30

  const metrics = [
    { label:'DAU today',          value:'847',   color:'blue'  },
    { label:'Avg DAU (30d)',      value:'712',   color:'green' },
    { label:'Growth (30d)',       value:'+18.9%',color:'green' },
    { label:'DAU / total enrolled',value:'66%',  color:'blue'  },
  ];

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <SectionBanner label="Daily Active Users" sub="Platform engagement and retention trends" />
        </div>
        <span style={{ fontSize:12, color:'#6B7280' }}>Period : last 7 days ▾</span>
      </div>

      <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>DAU trends – last 30 days</div>
            <div style={{ fontSize:12, color:'#6B7280' }}>Daily active users across all enrolled programs</div>
          </div>
          {/* Period toggle */}
          <div style={{ display:'flex', gap:0, border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
            {['07 Days','30 Days','90 Days'].map((p,i)=>{
              const v = ['7','30','90'][i];
              const active = period === v;
              return (
                <button key={v} onClick={()=>setPeriod(v)} style={{
                  padding:'6px 14px', fontSize:13, fontWeight: active ? 600 : 400,
                  background: active ? '#00C9A7' : '#fff',
                  color: active ? '#fff' : '#6B7280',
                  border:'none', cursor:'pointer', fontFamily:'inherit'
                }}>{p}</button>
              );
            })}
          </div>
        </div>

        {/* Summary chip row */}
        <div style={{ display:'flex', gap:14, marginBottom:24 }}>
          {metrics.map((m,i)=><MetricChip key={i} label={m.label} value={m.value} color={m.color} />)}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={dauData} margin={{ top:10, right:20, bottom:0, left:0 }}>
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00C9A7" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#00C9A7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize:10 }} axisLine={false} tickLine={false}
              ticks={dauData.filter((_,i)=>i%5===0 || i===29).map(d=>d.day)} />
            <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} domain={[300,'dataMax+100']} />
            <Tooltip />
            <Area type="monotone" dataKey="dau" stroke="#00C9A7" strokeWidth={2} fill="url(#dauGrad)"
              dot={(props)=>{
                if(props.index===29) return <circle key="peak" cx={props.cx} cy={props.cy} r={5} fill="#00C9A7" stroke="#fff" strokeWidth={2}/>;
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('health_alerts');
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(()=>{
    Promise.all([getCohortDashboard(), getAtRiskUsers()])
      .then(([d])=> setStats(d.data))
      .catch(()=> setStats({
        total_enrolled_users: 1284, active_users_7d: 187,
        active_alerts: 23, average_program_score: 71.2
      }))
      .finally(()=> setLoading(false));
  }, []);

  const handleExport = async () => {
    try {
      const res = await exportData('vitals');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href=url; a.download='vitals_export.csv'; a.click();
    } catch { alert('Export failed'); }
  };

  const statCards = [
    { label:'Total Enrolled',        value: stats?.total_enrolled_users || 1284, change:'+2 this Week',       dir:'up' },
    { label:'Active Use s (30d)',     value: stats?.active_users_7d || 187,      change:'65% of enrolled',    dir:'up' },
    { label:'At risk users',          value: stats?.active_alerts || 23,         change:'+5 since yesterday', dir:'down', danger:true },
    { label:'Q compltion rate',       value:'68%',                               change:'+3% last score',     dir:'up' },
    { label:'Avg. program score',     value: stats?.average_program_score || 71.2,change:'+1.4 vs last week', dir:'up' },
    { label:'Avg articles read/user', value:'4.2',                              change:'+0.6 this score',     dir:'up' },
  ];

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Cohort Dashboard</h1>
          <p className="sub">Wellness 90 · AI Program · Live · Updated 2 min ago</p>
        </div>
        <div className="page-header-right">
          <div className="filter-select">Program : All ▾</div>
          <div className="filter-select">Period : Last 7 days ▾</div>
          <div className="filter-select">Enrolled cohorts ▾</div>
          <button className="btn-export" onClick={handleExport}><MdDownload /> Export</button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="stat-row">
        {statCards.map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.danger?'danger':''}`}>{s.value}</div>
            <div className={`stat-change ${s.dir}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="dashboard-tabs">
        {TABS.map((t)=>(
          <div key={t.id} className={`tab-item ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>
            <div className="tab-icon">{t.icon}</div>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}
      {loading ? (
        <div className="full-center"><div className="spinner"/></div>
      ) : (
        <>
          {activeTab === 'health_alerts' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <CriticalHealthAlertsCard/>
              <HealthRiskCard/>
            </div>
          )}
          {activeTab === 'health_risk' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <CriticalHealthAlertsCard/>
              <HealthRiskCard/>
            </div>
          )}
          {activeTab === 'physical'      && <PhysicalActivityMetrics/>}
          {activeTab === 'questionnaire' && <DailyActiveUsers/>}
          {activeTab === 'enrollment'    && <ProgramEnrollment/>}
          {activeTab === 'education'     && <EducationHub/>}
          {activeTab === 'at_risk'       && <AtRiskMonitoring/>}
          {activeTab === 'dau'           && <DailyActiveUsers/>}
        </>
      )}
    </div>
  );
}
