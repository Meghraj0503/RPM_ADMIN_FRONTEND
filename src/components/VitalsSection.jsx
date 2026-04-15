import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, AreaChart, Area
} from 'recharts';
import { MdMonitorHeart, MdDirectionsRun, MdNightlightRound, MdLocalFireDepartment, MdKeyboardArrowDown, MdBarChart, MdShowChart } from 'react-icons/md';

const VITAL_COLORS = {
  heart_rate: '#FF5C5C', hrv: '#2D9EF0', spo2: '#1A1D23',
  steps: '#6EE7B7', sleep_hours: '#6366F1', active_calories: '#F97316'
};

const generateMockData = (type, days) => {
  const data = [];
  const now = new Date();
  for(let i=days-1; i>=0; i--) {
    let d = new Date(now);
    d.setDate(d.getDate() - i);
    let val = 0;
    if(type === 'heart_rate') val = Math.floor(65 + Math.random() * 20);
    else if(type === 'spo2') val = Math.floor(96 + Math.random() * 3);
    else if(type === 'hrv') val = Math.floor(30 + Math.random() * 50);
    else if(type === 'steps') val = Math.floor(2000 + Math.random() * 8000);
    else if(type === 'sleep_hours') val = 5 + Math.random() * 4;
    
    data.push({ 
      date: d.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g,'-'), 
      value: val 
    });
  }
  return data;
};

export default function VitalsSection({ vitals, days, bmi }) {
  const [hrMode, setHrMode] = useState('line');
  const [spoMode, setSpoMode] = useState('line');

  // Parsing lists safely
  const getParsed = (type) => {
    let subset = vitals.filter(v => v.vital_type === type).sort((a,b) => new Date(a.recorded_at) - new Date(b.recorded_at));
    if(subset.length === 0) return generateMockData(type, days);
    return subset.map(v => ({
      date: new Date(v.recorded_at).toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g,'-'),
      value: parseFloat(v.vital_value)
    }));
  };

  const hrData = useMemo(() => getParsed('heart_rate'), [vitals, days]);
  const spoData = useMemo(() => getParsed('spo2'), [vitals, days]);
  const hrvData = useMemo(() => getParsed('hrv'), [vitals, days]);
  const stepData = useMemo(() => getParsed('steps'), [vitals, days]);
  const sleepData = useMemo(() => getParsed('sleep_hours'), [vitals, days]);

  // BMI math
  const valBMI = parseFloat(bmi || 0);
  const pctBMI = Math.max(0, Math.min(100, ((valBMI - 15) / 20) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ROW 1: HR/SPO2 + HRV */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        {/* Heart Rate & SpO2 Mint Container */}
        <div style={{ background: '#E8FBF7', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF5C5C' }}>
              <MdMonitorHeart size={20} />
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Heart Rate <strong style={{color: '#1A1D23', fontSize: 18}}>75</strong><span style={{fontSize: 10, color: '#6B7280'}}>Bpm</span></span>
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
                </LineChart>
              ) : (
                <BarChart data={hrData}>
                  <Bar dataKey="value" fill={VITAL_COLORS.heart_rate} radius={[2, 2, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FF5C5C' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ffcccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{width: 6, height: 6, background: '#FF5C5C', borderRadius: '50%'}}></span></div>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>SpO2 <strong style={{color: '#1A1D23', fontSize: 18}}>98</strong><span style={{fontSize: 10, color: '#6B7280'}}>%</span></span>
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
                </LineChart>
              ) : (
                <BarChart data={spoData}>
                  <Bar dataKey="value" fill={VITAL_COLORS.spo2} radius={[2, 2, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* HRV Score Container */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>HRV Score</span>
              <div style={{ fontSize: 11, color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>Last Week <MdKeyboardArrowDown/></div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Average : 35%</div>
          </div>
          <div style={{ height: 160, marginLeft: -20, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrvData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="date" tick={{fontSize: 9, color: '#9CA3AF'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 9, color: '#9CA3AF'}} tickLine={false} axisLine={false} domain={[0, 100]} />
                <ReferenceArea y1={40} y2={60} fill="#FEF3C7" fillOpacity={0.6} />
                <Line type="monotone" dataKey="value" stroke="#34D399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                <Tooltip wrapperStyle={{ fontSize: 12 }} />
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
              <MdDirectionsRun color="#00C9A7"/>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Steps <strong style={{fontSize: 14}}>5000</strong> <span style={{fontWeight: 400, color: '#6B7280'}}>Steps</span></span>
            </div>
          </div>
          <div style={{ height: 160, marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 9}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 9}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
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
                  <MdNightlightRound color="#6366F1"/>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Sleep hours <strong style={{fontSize: 14}}>7h 30m</strong></span>
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>Recommended: 7-9 hrs/night<br/>Avg sleep quality score : 6.4/10</div>
             </div>
             <div style={{ fontSize: 11, fontWeight: 600 }}>Sleep Quality: <span style={{color: '#FBBF24'}}>Irregular</span></div>
          </div>
          <div style={{ height: 140, marginLeft: -20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 9}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 9}} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: Calories/Activity + BMI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
         <div style={{ display: 'flex', gap: 16 }}>
           {/* Calorie Card */}
           <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdLocalFireDepartment color="#00C9A7" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Active Calories</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>248 <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>Kcal</span></div>
                </div>
             </div>
             <MdKeyboardArrowDown style={{color: '#9CA3AF'}}/>
           </div>

           {/* Activity Minutes Card */}
           <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8FBF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdDirectionsRun color="#00C9A7" size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Activity Minutes</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>1h 20m</div>
                </div>
             </div>
             <MdKeyboardArrowDown style={{color: '#9CA3AF'}}/>
           </div>
         </div>
      </div>
      
      {/* BMI Component */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: 24, marginTop: 4 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
           <div>
             <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Body Mass Index</div>
             <div style={{ fontSize: 24, fontWeight: 700 }}>{valBMI ? valBMI.toFixed(1) : '24.3'}</div>
           </div>
           
           <div style={{ flex: 1, marginTop: 6 }}>
              <div style={{ position: 'relative', height: 16, width: '100%' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 8, background: 'linear-gradient(to right, #FDE047, #34D399, #EF4444)' }}></div>
                {valBMI > 0 && (
                  <div style={{ position: 'absolute', top: -5, left: `calc(${pctBMI}% - 10px)`, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: '5px solid #1A1D23', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
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
