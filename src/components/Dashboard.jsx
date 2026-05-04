import React from 'react';
import {
  MdPeople,
  MdDirectionsRun,
  MdWarning,
  MdAssignment,
  MdDownload,
  MdRefresh,
} from 'react-icons/md';

/**
 * Dashboard — demo dashboard component.
 *
 * Displays sample stat cards, an activity chart, quick metrics,
 * a recent-users table, and an alerts list.
 *
 * All responsive behaviour is handled by:
 *   src/styles/main.css   — .dash-demo-* base styles
 *   src/styles/device.css — .dash-demo-* responsive overrides
 *
 * This component is intentionally self-contained with static sample data
 * so it works without any API calls.
 */

/* ── Sample data ─────────────────────────────────────────── */

const STATS = [
  {
    label:  'Total Users',
    value:  '1,248',
    change: '+12%',
    up:     true,
    icon:   <MdPeople />,
    type:   'primary',
    footer: 'vs last month',
  },
  {
    label:  'Active Users',
    value:  '867',
    change: '+8%',
    up:     true,
    icon:   <MdDirectionsRun />,
    type:   'info',
    footer: '69% of total',
  },
  {
    label:  'At Risk Users',
    value:  '45',
    change: '+3',
    up:     false,
    icon:   <MdWarning />,
    type:   'danger',
    footer: 'require review',
  },
  {
    label:  'Questionnaires',
    value:  '342',
    change: '+24',
    up:     true,
    icon:   <MdAssignment />,
    type:   'warning',
    footer: 'completed today',
  },
];

const ACTIVITY = [
  { day: 'Mon', value: 68 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 74 },
  { day: 'Sat', value: 38 },
  { day: 'Sun', value: 50 },
];

const QUICK_STATS = [
  { label: 'Program Completion',     value: '78%', pct: 78, color: 'var(--primary)' },
  { label: 'Questionnaire Response', value: '64%', pct: 64, color: 'var(--info)' },
  { label: 'At-Risk Monitored',      value: '91%', pct: 91, color: 'var(--warning)' },
  { label: 'App Engagement',         value: '53%', pct: 53, color: 'var(--danger)' },
];

const RECENT_USERS = [
  { name: 'John Smith',    email: 'john@example.com',   status: 'active',   last: '2m ago' },
  { name: 'Sarah Johnson', email: 'sarah@example.com',  status: 'atrisk',   last: '1h ago' },
  { name: 'Mike Davis',    email: 'mike@example.com',   status: 'active',   last: '3h ago' },
  { name: 'Emily Wilson',  email: 'emily@example.com',  status: 'inactive', last: '2d ago' },
  { name: 'Robert Brown',  email: 'robert@example.com', status: 'active',   last: '5m ago' },
];

const ALERTS = [
  { title: 'High BP Reading — John Smith',      time: '2 minutes ago',  type: 'danger' },
  { title: 'Missed Questionnaire — 12 users',  time: '45 minutes ago', type: 'warning' },
  { title: 'New Program Enrollment — 8 users', time: '1 hour ago',     type: 'info' },
  { title: 'Low SpO₂ Alert — Emily Wilson',    time: '3 hours ago',    type: 'danger' },
  { title: 'Weekly Report Ready to Export',    time: '5 hours ago',    type: 'info' },
];

const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', atrisk: 'At Risk' };

const maxActivity = Math.max(...ACTIVITY.map((d) => d.value));

/* ── Component ───────────────────────────────────────────── */

export default function Dashboard() {
  return (
    <div className="dash-demo-wrap">

      {/* ── Page header ── */}
      <div className="dash-demo-header">
        <div>
          <h1 className="dash-demo-title">Dashboard Overview</h1>
          <p className="dash-demo-sub">Remote Patient Monitoring — program summary</p>
        </div>
        <div className="dash-demo-actions">
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdRefresh style={{ fontSize: 16 }} />
            Refresh
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdDownload style={{ fontSize: 16 }} />
            Export
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-demo-stat-grid">
        {STATS.map((s) => (
          <div key={s.label} className="dash-demo-stat-card">
            <div className="dash-demo-icon-row">
              <div className={`dash-demo-stat-icon dash-demo-stat-icon--${s.type}`}>
                {s.icon}
              </div>
              <span className={`dash-demo-change dash-demo-change--${s.up ? 'up' : 'down'}`}>
                {s.change}
              </span>
            </div>
            <div className="dash-demo-stat-label">{s.label}</div>
            <div className="dash-demo-stat-value">{s.value}</div>
            <div className="dash-demo-stat-footer">{s.footer}</div>
          </div>
        ))}
      </div>

      {/* ── Mid section: activity chart + quick stats ── */}
      <div className="dash-demo-mid-grid">

        {/* Activity bar chart */}
        <div className="dash-demo-card">
          <div className="dash-demo-card-header">
            <div>
              <div className="dash-demo-card-title">Weekly Activity</div>
              <div className="dash-demo-card-sub">Daily active users — this week</div>
            </div>
          </div>
          <div className="dash-demo-card-body">
            <div className="dash-demo-bars">
              {ACTIVITY.map((d) => {
                const heightPct = (d.value / maxActivity) * 100;
                const isToday   = d.day === 'Thu';
                return (
                  <div key={d.day} className="dash-demo-bar-col">
                    <div
                      className={`dash-demo-bar ${isToday ? 'dash-demo-bar--active' : 'dash-demo-bar--muted'}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.value} users`}
                    />
                    <span className="dash-demo-bar-lbl">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="dash-demo-card">
          <div className="dash-demo-card-header">
            <div>
              <div className="dash-demo-card-title">Quick Stats</div>
              <div className="dash-demo-card-sub">Program performance metrics</div>
            </div>
          </div>
          <div className="dash-demo-quick">
            {QUICK_STATS.map((q) => (
              <div key={q.label} className="dash-demo-quick-item">
                <div className="dash-demo-quick-row">
                  <span className="dash-demo-quick-label">
                    <span
                      className="dash-demo-quick-dot"
                      style={{ background: q.color }}
                    />
                    {q.label}
                  </span>
                  <span className="dash-demo-quick-value">{q.value}</span>
                </div>
                <div className="dash-demo-progress">
                  <div
                    className="dash-demo-progress-fill"
                    style={{ width: `${q.pct}%`, background: q.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom section: recent users + alerts ── */}
      <div className="dash-demo-bottom-grid">

        {/* Recent users table */}
        <div className="dash-demo-card">
          <div className="dash-demo-card-header">
            <div>
              <div className="dash-demo-card-title">Recent Users</div>
              <div className="dash-demo-card-sub">Latest enrolled patients</div>
            </div>
          </div>
          <div className="dash-demo-table-wrap">
            <table className="dash-demo-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_USERS.map((u) => (
                  <tr key={u.email}>
                    <td>
                      <div className="dash-demo-user-name">{u.name}</div>
                      <div className="dash-demo-user-email">{u.email}</div>
                    </td>
                    <td>
                      <span className={`dash-demo-badge dash-demo-badge--${u.status}`}>
                        {STATUS_LABEL[u.status]}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {u.last}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="dash-demo-card">
          <div className="dash-demo-card-header">
            <div>
              <div className="dash-demo-card-title">Recent Alerts</div>
              <div className="dash-demo-card-sub">Monitoring events today</div>
            </div>
          </div>
          <div className="dash-demo-alerts">
            {ALERTS.map((a, i) => (
              <div key={i} className="dash-demo-alert-item">
                <div className={`dash-demo-alert-dot dash-demo-alert-dot--${a.type}`} />
                <div>
                  <div className="dash-demo-alert-title">{a.title}</div>
                  <div className="dash-demo-alert-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
