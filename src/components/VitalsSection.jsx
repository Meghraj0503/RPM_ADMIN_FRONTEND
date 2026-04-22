import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { MdMonitorHeart, MdDirectionsRun, MdNightlightRound, MdLocalFireDepartment, MdKeyboardArrowDown, MdBarChart, MdShowChart } from 'react-icons/md';

const VITAL_COLORS = {
  heart_rate: '#FF5C5C', hrv: '#34D399', spo2: '#1A1D23',
  steps: '#6EE7B7', sleep: '#6366F1', calories: '#F97316'
};

// Aggregate vitals per day for charts
const toChartData = (vitals, type) => {
  const byDay = {};
  vitals
    .filter(v => v.vital_type === type)
    .forEach(v => {
      const key = new Date(v.recorded_at).toLocaleDateString('en-IN', {
        month: '2-digit', day: '2-digit', year: '2-digit'
      }).replace(/\//g, '-');
      if (!byDay[key]) byDay[key] = { sum: 0, count: 0 };
      byDay[key].sum   += parseFloat(v.vital_value);
      byDay[key].count += 1;
    });
  return Object.entries(byDay)
    .sort(([a], [b]) => {
      // parse DD-MM-YY → Date for proper sort
      const parse = s => { const [d,m,y] = s.split('-'); return new Date(`20${y}-${m}-${d}`); };
      return parse(a) - parse(b);
    })
    .map(([date, {sum, count}]) => ({ date, value: parseFloat((sum / count).toFixed(1)) }));
};

// Latest single reading of a type
const latest = (vitals, type) => {
  const list = vitals.filter(v => v.vital_type === type).sort((a,b) => new Date(b.recorded_at) - new Date(a.recorded_at));
  return list.length ? parseFloat(list[0].vital_value) : null;
};

// Average over the period
const avg = (vitals, type) => {
  const list = vitals.filter(v => v.vital_type === type);
  if (!list.length) return null;
  const sum = list.reduce((s, v) => s + parseFloat(v.vital_value), 0);
  return parseFloat((sum / list.length).toFixed(1));
};

// Sum of all values (for total steps/calories)
const total = (vitals, type) => {
  const list = vitals.filter(v => v.vital_type === type);
  if (!list.length) return null;
  return Math.round(list.reduce((s, v) => s + parseFloat(v.vital_value), 0));
};

// Format minutes → "Xh Ym"
const fmtMins = (mins) => {
  if (mins === null || mins === undefined) return '—';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Format sleep hours → "Xh Ym"
const fmtHours = (hrs) => {
  if (hrs === null || hrs === undefined) return '—';
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return `${h}h ${m > 0 ? m + 'm' : ''}`;
};

// Sleep quality label based on avg hours
const sleepQuality = (avgHrs) => {
  if (avgHrs === null) return { label: '—', color: '#9CA3AF' };
  if (avgHrs >= 7 && avgHrs <= 9) return { label: 'Good', color: '#00C9A7' };
  if (avgHrs >= 6) return { label: 'Irregular', color: '#FBBF24' };
  return { label: 'Poor', color: '#FF5C5C' };
};

// Sleep quality score /10 based on avg hours
const sleepScore = (avgHrs) => {
  if (avgHrs === null) return null;
  // 7-9hrs = 8-10, 6-7 = 6-8, <6 = 3-6
  if (avgHrs >= 7 && avgHrs <= 9) return Math.min(10, parseFloat((7 + (avgHrs - 7) * 1.5).toFixed(1)));
  if (avgHrs >= 6) return parseFloat((5 + (avgHrs - 6) * 2).toFixed(1));
  return parseFloat(Math.max(2, avgHrs * 0.9).toFixed(1));
};

export default function VitalsSection({ vitals, days, bmi }) {
  const [hrMode, setHrMode]   = useState('line');
  const [spoMode, setSpoMode] = useState('line');

  // Chart data (averaged per day)
  const hrData   = useMemo(() => toChartData(vitals, 'heart_rate'), [vitals]);
  const spoData  = useMemo(() => toChartData(vitals, 'spo2'),       [vitals]);
  const hrvData  = useMemo(() => toChartData(vitals, 'hrv'),        [vitals]);
  const stepData = useMemo(() => toChartData(vitals, 'steps'),      [vitals]);
  const sleepData = useMemo(() => toChartData(vitals, 'sleep'),     [vitals]);

  // Latest readings for headline numbers
  const latestHR   = latest(vitals, 'heart_rate');
  const latestSpo2 = latest(vitals, 'spo2');

  // Averages for summary stats
  const avgHRV     = avg(vitals, 'hrv');
  const avgSleep   = avg(vitals, 'sleep');
  const avgActMins = avg(vitals, 'activity_minutes');

  // Total calories (sum over period)
  const totalCal   = total(vitals, 'calories');

  // Latest steps reading (last recorded day)
  const latestSteps = (() => {
    const data = toChartData(vitals, 'steps');
    return data.length ? Math.round(data[data.length - 1].value) : null;
  })();

  // Sleep metrics
  const sq = sleepQuality(avgSleep);
  const ss = sleepScore(avgSleep);

  // HRV avg percent (normalised to 0-100ms range → %)
  const hrvPct = avgHRV !== null ? Math.min(100, Math.round((avgHRV / 100) * 100)) : null;

  // BMI
  const valBMI = parseFloat(bmi || 0);
  const pctBMI = Math.max(0, Math.min(100, ((valBMI - 15) / 20) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ROW 1: HR/SPO2 + HRV */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Heart Rate & SpO2 */}
        <div style={{ background: '#E8FBF7', borderRadius: 16, padding: 24 }}>
          {/* Heart Rate header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF5C5C' }}>
              <MdMonitorHeart size={20} />
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                Heart Rate{' '}
                <strong style={{ color: '#1A1D23', fontSize: 18 }}>
                  {latestHR !== null ? Math.round(latestHR) : '—'}
                </strong>
                <span style={{ fontSize: 10, color: '#6B7280' }}>Bpm</span>
              </span>
            </div>
            <button
              onClick={() => setHrMode(hrMode === 'line' ? 'bar' : 'line')}
              style={{ background: '#fff', border: '1px solid #D1FAE5', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7' }}
            >
              {hrMode === 'line' ? <MdBarChart size={16} /> : <MdShowChart size={16} />}
            </button>
          </div>
          <div style={{ height: 80, marginLeft: -20, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              {hrMode === 'line' ? (
                <LineChart data={hrData}>
                  <Line type="monotone" dataKey="value" stroke={VITAL_COLORS.heart_rate} strokeWidth={2} dot={false} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} formatter={(v) => [`${v} bpm`, 'Heart Rate']} />
                </LineChart>
              ) : (
                <BarChart data={hrData}>
                  <Bar dataKey="value" fill={VITAL_COLORS.heart_rate} radius={[2, 2, 0, 0]} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} formatter={(v) => [`${v} bpm`, 'Heart Rate']} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* SpO2 header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffcccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 6, height: 6, background: '#FF5C5C', borderRadius: '50%' }} />
              </div>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                SpO2{' '}
                <strong style={{ color: '#1A1D23', fontSize: 18 }}>
                  {latestSpo2 !== null ? Math.round(latestSpo2) : '—'}
                </strong>
                <span style={{ fontSize: 10, color: '#6B7280' }}>%</span>
              </span>
            </div>
            <button
              onClick={() => setSpoMode(spoMode === 'line' ? 'bar' : 'line')}
              style={{ background: '#fff', border: '1px solid #D1FAE5', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7' }}
            >
              {spoMode === 'line' ? <MdBarChart size={16} /> : <MdShowChart size={16} />}
            </button>
          </div>
          <div style={{ height: 80, marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              {spoMode === 'line' ? (
                <LineChart data={spoData}>
                  <Line type="monotone" dataKey="value" stroke={VITAL_COLORS.spo2} strokeWidth={2} dot={false} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} formatter={(v) => [`${v}%`, 'SpO2']} />
                </LineChart>
              ) : (
                <BarChart data={spoData}>
                  <Bar dataKey="value" fill={VITAL_COLORS.spo2} radius={[2, 2, 0, 0]} />
                  <Tooltip wrapperStyle={{ fontSize: 11 }} formatter={(v) => [`${v}%`, 'SpO2']} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* HRV Score */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>HRV Score</span>
              <div style={{ fontSize: 11, color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {days}d <MdKeyboardArrowDown />
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              Average : {avgHRV !== null ? `${avgHRV} ms` : '—'}
            </div>
          </div>
          <div style={{ height: 160, marginLeft: -20, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrvData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                <ReferenceArea y1={40} y2={60} fill="#FEF3C7" fillOpacity={0.6} />
                <Line type="monotone" dataKey="value" stroke={VITAL_COLORS.hrv} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                <Tooltip wrapperStyle={{ fontSize: 12 }} formatter={(v) => [`${v} ms`, 'HRV']} />
              </LineChart>
            </ResponsiveContainer>
            <span style={{ position: 'absolute', right: 20, top: '25%', fontSize: 10, color: '#9CA3AF' }}>High</span>
            <span style={{ position: 'absolute', right: 20, top: '65%', fontSize: 10, color: '#9CA3AF' }}>Low</span>
          </div>
        </div>
      </div>

      {/* ROW 2: Steps + Sleep */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Steps */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <MdDirectionsRun color="#00C9A7" />
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Steps{' '}
                <strong style={{ fontSize: 14 }}>
                  {latestSteps !== null ? latestSteps.toLocaleString() : '—'}
                </strong>{' '}
                <span style={{ fontWeight: 400, color: '#6B7280' }}>Steps</span>
              </span>
            </div>
          </div>
          <div style={{ height: 160, marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} formatter={(v) => [v.toLocaleString(), 'Steps']} />
                <Bar dataKey="value" fill="#6EE7B7" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 20, padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                <MdNightlightRound color="#6366F1" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>
                  Sleep hours <strong style={{ fontSize: 14 }}>{avgSleep !== null ? fmtHours(avgSleep) : '—'}</strong>
                </span>
              </div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                Recommended: 7-9 hrs/night<br />
                Avg sleep quality score : {ss !== null ? `${ss}/10` : '—'}
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>
              Sleep Quality: <span style={{ color: sq.color }}>{sq.label}</span>
            </div>
          </div>
          <div style={{ height: 140, marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [`${fmtHours(v)}`, 'Sleep']} />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: Calories + Activity Minutes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Calorie Card */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdLocalFireDepartment color="#00C9A7" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Avg Daily Calories</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {totalCal !== null ? Math.round(totalCal / Math.max(1, new Set(vitals.filter(v=>v.vital_type==='calories').map(v=>new Date(v.recorded_at).toDateString())).size)).toLocaleString() : '—'}
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}> Kcal</span>
                </div>
              </div>
            </div>
            <MdKeyboardArrowDown style={{ color: '#9CA3AF' }} />
          </div>

          {/* Activity Minutes Card */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MdDirectionsRun color="#00C9A7" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Avg Activity</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {avgActMins !== null ? fmtMins(avgActMins) : '—'}
                </div>
              </div>
            </div>
            <MdKeyboardArrowDown style={{ color: '#9CA3AF' }} />
          </div>
        </div>
      </div>

      {/* BMI */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginTop: 4 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Body Mass Index</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{valBMI ? valBMI.toFixed(1) : '—'}</div>
          </div>
          <div style={{ flex: 1, marginTop: 6 }}>
            <div style={{ position: 'relative', height: 16, width: '100%' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 8, background: 'linear-gradient(to right, #FDE047, #34D399, #EF4444)' }} />
              {valBMI > 0 && (
                <div style={{ position: 'absolute', top: -5, left: `calc(${pctBMI}% - 10px)`, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '5px solid #1A1D23', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF', marginTop: 12, fontWeight: 500 }}>
              <span>Under Weight {'<'} 18.5</span>
              <span>Normal 18.5-24.9</span>
              <span>Over Weight 25-29.9</span>
              <span>Obese {'>'} 30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
