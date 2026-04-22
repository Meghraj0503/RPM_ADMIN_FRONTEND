import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, LabelList,
  AreaChart, Area
} from 'recharts';
import { getCohortDashboard, getAtRiskUsers, exportData } from '../api/admin';
import {
  MdWarning, MdFavorite, MdDirectionsRun, MdAssignment,
  MdGroups, MdMenuBook, MdPersonSearch, MdBarChart, MdDownload, MdOpenInNew,
  MdPsychology, MdBedtime, MdRestaurant, MdSelfImprovement,
  MdFitnessCenter, MdMonitorHeart, MdMedicalServices, MdLocalHospital
} from 'react-icons/md';

/* ─── TAB DEFINITIONS ──────────────────────────────────────────── */
const TABS = [
  { id: 'health_alerts',  label: 'Critical Health Alerts',          icon: <MdWarning /> },
  // { id: 'health_risk',    label: 'Health Risk Indicator',           icon: <MdFavorite /> },
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
function CriticalHealthAlertsCard({ data }) {
  const tSpo2 = data?.spo2 ? (Number(data.spo2.normal) + Number(data.spo2.low) + Number(data.spo2.critical)) : 1;
  const spo2Slices = [
    { name: 'Normal 95–100%', value: data?.spo2?.normal || 0, pct: Math.round(((data?.spo2?.normal || 0) / tSpo2) * 100), color:'#00C9A7' },
    { name: 'Low 90–94%',     value: data?.spo2?.low || 0,    pct: Math.round(((data?.spo2?.low || 0) / tSpo2) * 100), color:'#FFB020' },
    { name: 'Critical below 90%', value: data?.spo2?.critical || 0, pct: Math.round(((data?.spo2?.critical || 0) / tSpo2) * 100), color:'#FF5C5C' },
  ];
  const pieSpo2 = [
    { v: Number(data?.spo2?.normal || 0), color:'#00C9A7' },
    { v: Number(data?.spo2?.low || 0),    color:'#FFB020' },
    { v: Number(data?.spo2?.critical || 0), color:'#FF5C5C' },
    { v: tSpo2 === 0 ? 1 : 0, color:'#E5E7EB' } // Empty placeholder
  ];
  const hrData = [
    { r:'Below 40', v: Number(data?.hr?.below_40 || 0),  c:'#FF5C5C' },
    { r:'40–59',    v: Number(data?.hr?.hr_40_59 || 0),  c:'#FFB020' },
    { r:'60–79',    v: Number(data?.hr?.hr_60_79 || 0),  c:'#00C9A7' },
    { r:'80–100',   v: Number(data?.hr?.hr_80_100 || 0), c:'#00C9A7' },
    { r:'101–120',  v: Number(data?.hr?.hr_101_120 || 0),c:'#FFB020' },
    { r:'Above 120',v: Number(data?.hr?.above_120 || 0), c:'#FF5C5C' },
  ];

  const atRiskCount = Number(data?.spo2?.low || 0) + Number(data?.spo2?.critical || 0);
  const avgSpo2 = data?.spo2?.avg_spo2 ? Number(data.spo2.avg_spo2).toFixed(1) : 0;
  const avgHr = data?.hr?.avg_hr ? Number(data.hr.avg_hr).toFixed(1) : 0;

  return (
    <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff', flex:1 }}>
      <SectionBanner color="red" label="Critical Health Alerts" sub="Immediate medical attention signals" />

      {/* SpO2 section */}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Blood oxygen (SpO2) – Population Distribution</div>
      <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Safe range: 95–100% · Alert threshold: below 95%</div>

      <div style={{ display:'flex', gap:16, marginBottom:14 }}>
        <MetricChip label="Cohort avg SpO2" value={`${avgSpo2}%`} color="green" />
        <MetricChip label="Critical users" value={Number(data?.spo2?.critical || 0)} color="red" />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie data={pieSpo2} cx={70} cy={70} innerRadius={46} outerRadius={68} dataKey="v" startAngle={90} endAngle={-270} stroke="none">
              {pieSpo2.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie>
            <text x={70} y={65} textAnchor="middle" fill="#1A1D23" fontSize={20} fontWeight={700}>{atRiskCount}</text>
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
          <Tooltip cursor={{fill: 'transparent'}} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize:11, color:'#6B7280', marginTop:6 }}>
        Critical: <span style={{ color:'#FF5C5C', fontWeight:600 }}>Above 120bpm or below 40bpm</span> (Cohort avg: {avgHr}bpm)
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Health Risk Indicator  (right card)
════════════════════════════════════════════════════════════════ */
function HealthRiskCard({ data, alertActive }) {
  const hrvData = [
    { r:'Below 20ms', v: Number(data?.hrv?.below_20 || 0) },
    { r:'20–39ms',    v: Number(data?.hrv?.hrv_20_39 || 0) },
    { r:'40–59ms',    v: Number(data?.hrv?.hrv_40_59 || 0) },
    { r:'60–79ms',    v: Number(data?.hrv?.hrv_60_79 || 0) },
    { r:'80+ ms',     v: Number(data?.hrv?.above_80 || 0) },
  ];
  const sleepData = [
    { r:'Below 4h', v: Number(data?.sleep?.below_4 || 0),       c:'#FF5C5C' },
    { r:'4–5h',     v: Number(data?.sleep?.sleep_4_4_9 || 0),   c:'#FFB020' },
    { r:'5–6h',     v: Number(data?.sleep?.sleep_5_5_9 || 0),   c:'#00C9A7' },
    { r:'6–7h',     v: Number(data?.sleep?.sleep_6_6_9 || 0),   c:'#00C9A7' },
    { r:'7–8h',     v: Number(data?.sleep?.sleep_7_7_9 || 0),   c:'#00C9A7' },
    { r:'8h+',      v: Number(data?.sleep?.above_8 || 0),       c:'#9CA3AF' },
  ];

  const avgHrv = data?.hrv?.cohort_avg_hrv ? Number(data.hrv.cohort_avg_hrv).toFixed(0) : 0;
  const avgSleep = data?.sleep?.cohort_avg_sleep ? Number(data.sleep.cohort_avg_sleep).toFixed(1) : 0;

  return (
    <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff', flex:1 }}>
      <SectionBanner color="green" label="Health Risk Indicator" sub="Early morning lifestyle indicator" />

      {/* HRV */}
      <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Heart rate variability (HRV) – cohort distribution</div>
      <div style={{ fontSize:12, color:'#6B7280', marginBottom:10 }}>Higher HRV = better autonomic health · Cohort avg: {avgHrv}ms</div>
      <div style={{ fontWeight:600, fontSize:11, color:'#6B7280', marginBottom:4 }}>Avg {avgHrv}ms</div>
      <ResponsiveContainer width="100%" height={145}>
        <BarChart data={hrvData} layout="vertical" barSize={14}>
          <XAxis type="number" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="r" tick={{ fontSize:10 }} width={68} axisLine={false} tickLine={false} />
          <Bar dataKey="v" fill="#00C9A7" radius={[0,4,4,0]} />
          <Tooltip cursor={{fill: 'transparent'}} />
        </BarChart>
      </ResponsiveContainer>
      <p style={{ fontSize:11, color:'#6B7280', marginTop:6, marginBottom:18 }}>
        Alert: <span style={{ color:'#FFB020', fontWeight:600 }}>HRV below 70 ms</span> for 5+ consecutive days · {data?.hrv?.alert_users || 0} users currently flagged
      </p>

      {/* Sleep */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <span style={{ fontWeight:600, fontSize:13 }}>Sleep duration – cohort distribution (7-day avg)</span>
        <span style={{ fontSize:10, color:'#9CA3AF' }}>^</span>
      </div>
      <div style={{ fontSize:11, color:'#6B7280', marginBottom:10 }}>Recommended: 7–9h/night · Avg sleep quality score: 8.5/10</div>

      <ResponsiveContainer width="100%" height={148}>
        <BarChart data={sleepData} barSize={26}>
          <XAxis dataKey="r" tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} />
          <Bar dataKey="v" radius={[4,4,0,0]}>
            {sleepData.map((e,i)=><Cell key={i} fill={e.c}/>)}
          </Bar>
          <Tooltip cursor={{fill: 'transparent'}} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display:'flex', gap:10, marginTop:10 }}>
        <MetricChip label="Cohort avg sleep" value={`${avgSleep}h`} color="green" />
        <MetricChip label="Critical (below 4h)" value={Number(data?.sleep?.critical_sleep_users || 0)} color="red" />
        <MetricChip label="Avg quality score" value="8.5" color="blue" />
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
function PhysicalActivityMetrics({ data }) {
  const stepsTrend = data?.steps_trend_7d || [];
  const stepsData = stepsTrend.map(d => ({
    day: new Date(d.day).toLocaleDateString('en-US', {weekday:'short'}),
    steps: Number(d.avg_steps)
  }));
  const avgSteps = stepsData.length ? Math.round(stepsData.reduce((a,c)=>a+c.steps,0)/stepsData.length) : 0;

  const calData = [
    { name:'At or above 350 kcal', value: Number(data?.targeted_cal_users || 0), color:'#00C9A7' },
    { name:'Below target',          value: Math.max(0, 11 - Number(data?.targeted_cal_users || 0)), color:'#FFB020' }, // using 11 total mock for demo scale if needed, actually we just render 2 parts
  ];
  
  const totalCalUsers = calData[0].value + calData[1].value || 1;
  const calPct = Math.round((calData[0].value / totalCalUsers) * 100);

  const activeMins = Number(data?.weekly_avg_minutes || 0);
  const minutesPct = Math.min(activeMins / 200, 1);
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
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Daily goal: 8,000 steps · Cohort avg: {avgSteps.toLocaleString()}</div>
          <div style={{ display:'flex', gap:14, marginBottom:14 }}>
            <MetricChip label="Cohort avg /day" value={avgSteps.toLocaleString()} color="blue" />
            <MetricChip label="Target: 8k" value="8,000" color="green" />
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
            Consistently below 5000 steps triggers a physical activity insight flag.
          </p>
        </div>

        {/* Calories donut */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Calories Burned – Target achievement</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Daily target: 350 kcal · Cohort avg: {Number(data?.avg_calories_daily||0)} kcal/day</div>
          <div style={{ display:'flex', gap:14, marginBottom:14 }}>
            <MetricChip label="Cohort avg kcal" value={Number(data?.avg_calories_daily||0)} color="blue" />
            <MetricChip label="Daily target kcal" value="350" color="green" />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={calData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {calData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>{calPct}%</text>
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
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>WHO target: 150 min/week · Cohort avg: {activeMins} min/week</div>
          
          <div style={{ display:'flex', gap:14, marginBottom:10 }}>
            <MetricChip label="WHO target" value="150" color="green" />
            <MetricChip label="Current Avg" value={activeMins} color="blue" />
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
              <text x="50%" y="82%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>{activeMins}</text>
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
function ProgramEnrollment({ data, topStats }) {
  const prgs = data?.programs || [];
  const total = Number(topStats?.total_enrolled_users || 1);
  const programData = prgs.map((p, i) => ({
    name: p.program_name, 
    value: Number(p.count), 
    pct: Math.round((Number(p.count)/total)*100) + '%', 
    color: ['#2D9EF0','#FF5C5C','#FFB020','#9CA3AF'][i % 4]
  }));

  const totalDevices = Number(data?.devices?.total_devices || 1);
  const connDevices = Number(data?.devices?.connected_devices || 0);
  const abhaData = [{ v: 76, color: '#00C9A7' }, { v: 24, color: '#E5E7EB' }]; // Placeholder since simulated
  
  const connPct = Math.round((connDevices / totalDevices) * 100);
  const deviceColors = ['#2D9EF0','#FF5C5C','#FF8080'];
  const deviceData = [
    { name:'Paired & active',      value: connDevices },
    { name:'Manual entry only',    value: Math.max(0, totalDevices - connDevices) },
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
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Total enrolled: {topStats?.total_enrolled_users || 0} across all programs</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={programData} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {programData.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <text x="50%" y="46%" textAnchor="middle" fill="#1A1D23" fontSize={22} fontWeight={700}>{topStats?.total_enrolled_users || 0}</text>
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
            <MetricChip label="ABHA linked" value="8" color="green" />
            <MetricChip label="Not linked" value="3" color="red" />
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
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>User smartwatch connection status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{v:connPct},{v:100-connPct}]} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="v" startAngle={90} endAngle={-270} stroke="none">
                {deviceColors.map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" fill="#1A1D23" fontSize={22} fontWeight={700}>{connPct}%</text>
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
function EducationHub({ data }) {
  // Map category names to react-icon components
  const CATEGORY_ICON_COMPONENTS = {
    'Nutrition':      <MdRestaurant size={22} color="#00C9A7" />,
    'Mental Health':  <MdPsychology size={22} color="#6C5CE7" />,
    'Mental health':  <MdPsychology size={22} color="#6C5CE7" />,
    'Sleep':          <MdBedtime size={22} color="#2D9EF0" />,
    'Movement':       <MdDirectionsRun size={22} color="#FFB020" />,
    'Spiritual':      <MdSelfImprovement size={22} color="#9B59B6" />,
    'Fitness':        <MdFitnessCenter size={22} color="#E74C3C" />,
    'Wellness':       <MdFavorite size={22} color="#FF6B6B" />,
    'Cardiology':     <MdMonitorHeart size={22} color="#FF5C5C" />,
    'Diabetes':       <MdMedicalServices size={22} color="#27AE60" />,
  };
  const getCategoryIcon = (cat) => CATEGORY_ICON_COMPONENTS[cat] || <MdMenuBook size={22} color="#9CA3AF" />;

  // Use published_count as the donut value — bookmarks may be 0 for new setups
  const cats = (data?.by_category || []).map(c => ({
    label: c.category,
    value: Number(c.published_count),
    bookmarks: Number(c.bookmark_count),
    icon: getCategoryIcon(c.category)
  }));

  const library = data?.library || {};
  const topArticles = data?.top_articles || [];
  const totalBookmarks = Number(data?.total_bookmarks || 0);
  const avgPerUser = data?.avg_articles_per_user || '0';

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <SectionBanner label="Education Hub Engagement" sub="Content effectiveness and reading behaviour" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>

        {/* Left: category engagement */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>Articles – by category</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>Total bookmarks: {totalBookmarks} · Avg per user: {avgPerUser}</div>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <MetricChip label="Total bookmarks" value={totalBookmarks} color="blue" />
            <MetricChip label="Avg per user" value={avgPerUser} color="green" />
            <MetricChip label="Published" value={Number(library.published||0)} color="blue" />
          </div>
          {cats.length === 0 ? (
            <div style={{textAlign:'center', color:'#9CA3AF', padding:40}}>No articles found</div>
          ) : (
            <>
              <div style={{ display:'flex', justifyContent:'space-around', marginBottom:8, flexWrap:'wrap', gap:10 }}>
                {cats.slice(0,3).map((c,i)=>(
                  <CategoryDonut key={i} value={c.value} label={c.label} icon={c.icon} size={110} />
                ))}
              </div>
              {cats.length > 3 && (
                <div style={{ display:'flex', justifyContent:'center', gap:60, marginTop:8, flexWrap:'wrap' }}>
                  {cats.slice(3,5).map((c,i)=>(
                    <CategoryDonut key={i} value={c.value} label={c.label} icon={c.icon} size={110} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: library stats + top articles */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Content library status &amp; top performing articles</div>
          <div style={{ display:'flex', gap:10, marginBottom:20 }}>
            <MetricChip label="Published"   value={Number(library.published||0)}  color="green" />
            <MetricChip label="Draft"       value={Number(library.draft||0)}       color="yellow" />
            <MetricChip label="Scheduled"   value={Number(library.scheduled||0)}   color="blue" />
          </div>
          <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Top articles (most bookmarked)</div>
          {topArticles.length === 0 ? (
            <div style={{color:'#9CA3AF', fontSize:13}}>No published articles yet</div>
          ) : topArticles.map((a,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F3F4F6' }}>
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', width:34, height:34, borderRadius:8, background:'#F3F4F6', marginRight:12, flexShrink:0 }}>
                {getCategoryIcon(a.category)}
              </span>
              <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{a.title}</span>
              <span style={{ fontSize:12, color:'#6B7280', display:'flex', alignItems:'center', gap:4 }}>
                <MdMenuBook size={14}/> {a.bookmarks} bookmarks
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
function NavigateToAtRisk({ count }) {
  const navigate = useNavigate();
  return (
    <span
      onClick={() => navigate('/at-risk')}
      style={{ color:'#00C9A7', fontWeight:600, cursor:'pointer', fontSize:13 }}
    >
      View All {count} at-risk users →
    </span>
  );
}

function AtRiskMonitoring({ list = [], breakdown = [] }) {
  const bdData = breakdown.map((b, i) => ({
    name: b.vital_type,
    value: Number(b.count),
    color: ['#FF5C5C','#FFB020','#2D9EF0','#9CA3AF'][i % 4]
  }));
  const totalAlerts = bdData.reduce((acc, c) => acc + c.value, 0);

  return (
    <div>
      <div style={{ background:'#FFF0F0', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
        <SectionBanner color="red" label="At-Risk User Monitoring" sub="Detailed view of flagged vitals requiring medical evaluation" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:20 }}>

        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>At-risk users – flagged in last 48 hrs</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:16 }}>{list.length} users flagged · Sorted by severity</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid #F3F4F6' }}>
                  {['User','Program','Vital flag','Reading','When','Status',''].map((h,i)=>(
                    <th key={i} style={{ padding:'8px 10px', textAlign:'left', fontSize:11, fontWeight:600, color:'#6B7280', textTransform:'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r,i)=>{
                  const diffH = r.latest_alertDate ? Math.floor((new Date()-new Date(r.latest_alertDate))/(1000*60*60)) : null;
                  const whenStr = diffH === null ? 'Just now' : diffH > 24 ? `${Math.floor(diffH/24)}d Ago` : `${diffH}h Ago`;
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid #F9FAFB' }}>
                      <td style={{ padding:'11px 10px', fontWeight:500 }}>{r.name}</td>
                      <td style={{ padding:'11px 10px' }}>{r.program}</td>
                      <td style={{ padding:'11px 10px', textTransform:'capitalize' }}>{r.vital === 'heart_rate' ? 'Heart Rate' : String(r.vital).replace('_',' ')}</td>
                      <td style={{ padding:'11px 10px', fontSize:12, color:'#4B5563' }}>{r.reading}</td>
                      <td style={{ padding:'11px 10px', color:'#6B7280', fontSize:12 }}>{whenStr}</td>
                      <td style={{ padding:'11px 10px' }}>
                        <span style={{ background:'#FFF0F0', color:'#FF5C5C', borderRadius:20, padding:'3px 12px', fontWeight:600, fontSize:12 }}>Critical</span>
                      </td>
                      <td style={{ padding:'11px 10px', color:'#9CA3AF', cursor:'pointer' }}>⊙</td>
                    </tr>
                  );
                })}
                {list.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:20, color:'#6B7280'}}>No active alerts</td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign:'right', marginTop:12, fontSize:13 }}>
            <NavigateToAtRisk count={list.length} />
          </div>
        </div>

        {/* Right: breakdown donut */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>At-risk breakdown by vital type</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:12 }}>{list.length} unique users at risk</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bdData.length ? bdData : [{value:1}]} cx="50%" cy="50%" innerRadius={62} outerRadius={92} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                {bdData.length ? bdData.map((e,i)=><Cell key={i} fill={e.color}/>) : <Cell fill="#F3F4F6"/>}
              </Pie>
              <text x="50%" y="47%" textAnchor="middle" fill="#1A1D23" fontSize={26} fontWeight={700}>{list.length}</text>
              <text x="50%" y="58%" textAnchor="middle" fill="#6B7280" fontSize={12}>Users at risk</text>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop:10 }}>
            {bdData.map((d,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8, fontSize:12 }}>
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:9, height:9, borderRadius:'50%', background:d.color, display:'inline-block'}} />
                  {d.name.replace('_', ' ').toUpperCase()}
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
   TAB: Questionnaire Performance
════════════════════════════════════════════════════════════════ */
function QuestionnairePerformance({ data }) {
  const completedToday = data?.completed_today || 0;
  const overdue = data?.overdue || 0;
  const compRate = data?.completion_rate || 0;
  
  // Provide fallback structure as per UI constraints to ensure chart renders if empty
  const byTypeData = data?.by_type?.length > 0 ? data.by_type : [
    { name: 'PHQ-9 (Mood)', value: 0 },
    { name: 'Sleep Quality Index', value: 0 },
    { name: 'Activity Check', value: 0 },
    { name: 'Nutrition Assessment', value: 0 },
  ];
  
  const domainData = data?.domain_scores?.length > 0 ? data.domain_scores : [
    { domain: 'Mood & affect', score: 0 },
    { domain: 'Sleep Quality', score: 0 },
    { domain: 'Energy levels', score: 0 },
    { domain: 'Focus & cognition', score: 0 },
  ];

  const CustomYAxisTick = ({ x, y, payload }) => (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#1A1D23" fontSize={11} fontWeight={500}>
      {payload.value}
    </text>
  );

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16 }}>
        <SectionBanner label="Questionnaire Performance" sub="Program Progress and mental health domain tracking" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        
        {/* Left: Completion Rate */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:24, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>Completion Rate - by questionnaire type</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:20 }}>All Programs | Current enrollment period</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:24 }}>
            <div style={{ background:'#E0E7FF', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:11, color:'#111', fontWeight:500, marginBottom:4 }}>Completed today</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#1A1D23' }}>{completedToday}</div>
            </div>
            <div style={{ background:'#FFE4E6', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:11, color:'#111', fontWeight:500, marginBottom:4 }}>Overdue</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#E11D48' }}>{overdue}</div>
            </div>
            <div style={{ background:'#E0FBF5', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:11, color:'#111', fontWeight:500, marginBottom:4 }}>Overall rate</div>
              <div style={{ fontSize:18, fontWeight:700, color:'#00C9A7' }}>{compRate}%</div>
            </div>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={byTypeData} margin={{ top: 0, right: 60, left: 20, bottom: 0 }} barCategoryGap={16}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={<CustomYAxisTick />} width={140} />
                <Tooltip cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="value" fill="#00C9A7" radius={[0, 4, 4, 0]} barSize={12} background={{ fill: '#F3F4F6', radius: [0, 4, 4, 0] }}>
                  <LabelList dataKey="value" position="right" formatter={(v) => `${v} users`} style={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Domain scores */}
        <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:24, background:'#fff' }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:2 }}>Average domain score-cohort (PHQ-9)</div>
          <div style={{ fontSize:12, color:'#6B7280', marginBottom:20 }}>Lower score = better on PHQ-9 Scale | Avg overall : 71.2 / 100</div>

          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={domainData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }} barCategoryGap={35}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" strokeDasharray="4 4" />
                <XAxis dataKey="domain" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                <YAxis type="number" domain={[0, 100]} ticks={[0,10,20,30,40,50,60,70,80,90,100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip cursor={{fill: '#F9FAFB'}} />
                <Bar dataKey="score" fill="#00C9A7" radius={[6, 6, 0, 0]} barSize={42}>
                  <LabelList dataKey="score" position="top" style={{ fontSize: 15, fontWeight: 700, fill: '#1A1D23' }} dy={-6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: Daily Active Users  (brand new)
════════════════════════════════════════════════════════════════ */
function DailyActiveUsers({ dauTrend = [] }) {
  const [period, setPeriod] = useState('30');

  // Filter the 90-day trend data to the selected period
  const days = Number(period);
  const filtered = dauTrend.slice(-days).map(d => ({
    day: new Date(d.day).toLocaleDateString('en-US', { month:'short', day:'numeric'}),
    dau: Number(d.dau)
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = dauTrend.find(d => d.day === todayStr);
  const dauToday = todayEntry ? Number(todayEntry.dau) : (filtered.length ? filtered[filtered.length-1].dau : 0);
  const avgDau = filtered.length ? Math.round(filtered.reduce((a,c)=>a+c.dau,0)/filtered.length) : 0;
  const firstDau = filtered.length > 1 ? filtered[0].dau : avgDau;
  const growthPct = firstDau > 0 ? (((dauToday - firstDau)/firstDau)*100).toFixed(1) : 0;
  const totalEnrolled = dauTrend.reduce((max, d) => Math.max(max, Number(d.dau)), 0) || 1;
  const dauRatio = Math.round((dauToday / totalEnrolled) * 100);

  const metrics = [
    { label:'DAU today',          value: dauToday,        color:'blue'  },
    { label:`Avg DAU (${period}d)`, value: avgDau,         color:'green' },
    { label:`Growth (${period}d)`,  value: `${growthPct >= 0 ? '+': ''}${growthPct}%`, color: growthPct >= 0 ? 'green' : 'red' },
    { label:'DAU / peak enrolled', value: `${dauRatio}%`,  color:'blue'  },
  ];

  return (
    <div>
      <div style={{ background:'#E8FBF7', borderRadius:10, padding:'8px 14px', marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <SectionBanner label="Daily Active Users" sub="Platform engagement and retention trends" />
        </div>
        <span style={{ fontSize:12, color:'#6B7280' }}>Based on last_login_at timestamps</span>
      </div>

      <div style={{ border:'1px solid #E5E7EB', borderRadius:14, padding:20, background:'#fff' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>DAU trends – last {period} days</div>
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

        {filtered.length === 0 ? (
          <div style={{textAlign:'center', padding:60, color:'#9CA3AF'}}>No login activity data available for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={filtered} margin={{ top:10, right:20, bottom:0, left:0 }}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00C9A7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00C9A7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize:10 }} axisLine={false} tickLine={false}
                interval={Math.max(0, Math.floor(filtered.length/7)-1)} />
              <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false} domain={[0,'dataMax+2']} />
              <Tooltip />
              <Area type="monotone" dataKey="dau" stroke="#00C9A7" strokeWidth={2} fill="url(#dauGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
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
  const [atRisk, setAtRisk]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(()=>{
    Promise.all([getCohortDashboard(), getAtRiskUsers()])
      .then(([d, a])=> { setStats(d.data); setAtRisk(a.data.at_risk_users || []); })
      .catch((e)=> { console.error('Dashboard Data Error', e); 
      //   setStats({
      //   top_level: { total_enrolled_users: 1284, active_users_7d: 187, active_alerts: 23, average_program_score: 71.2 }
      // }); 
    })
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
    { label:'Total Enrolled',        value: stats?.top_level?.total_enrolled_users || 0, change:'',       dir:'up' },
    { label:'Active Users (30d)',     value: stats?.top_level?.active_users_30d || 0,      change:'',    dir:'up' },
    { label:'At risk users',          value: stats?.top_level?.active_alerts || 0,         change:'',    dir:'down', danger:true },
    { label:'Q completion rate',      value:`${stats?.top_level?.q_completion_rate || 0}%`,change:'',     dir:'up' },
    { label:'Avg. program score',     value: stats?.top_level?.average_program_score || 0, change:'',    dir:'up' },
    { label:'Avg articles read/user', value: stats?.top_level?.avg_articles_per_user || '0', change:'', dir:'up' },
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
              <CriticalHealthAlertsCard data={stats?.critical_alerts} />
              <HealthRiskCard data={stats?.health_risk} alertActive={stats?.top_level?.active_alerts} />
            </div>
          )}
          {activeTab === 'health_risk' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <CriticalHealthAlertsCard data={stats?.critical_alerts} />
              <HealthRiskCard data={stats?.health_risk} alertActive={stats?.top_level?.active_alerts} />
            </div>
          )}
          {activeTab === 'physical'      && <PhysicalActivityMetrics data={stats?.physical_activity} />}
          {activeTab === 'questionnaire' && <QuestionnairePerformance data={stats?.questionnaires || {}} />}
          {activeTab === 'enrollment'    && <ProgramEnrollment data={stats?.enrollment} topStats={stats?.top_level} />}
          {activeTab === 'education'     && <EducationHub data={stats?.education} />}
          {activeTab === 'at_risk'       && <AtRiskMonitoring list={atRisk} breakdown={stats?.at_risk_breakdown} />}
          {activeTab === 'dau'           && <DailyActiveUsers dauTrend={stats?.dau_trend || []} />}
        </>
      )}
    </div>
  );
}
