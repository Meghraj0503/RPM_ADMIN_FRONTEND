export default function DashboardStatCards({ stats }) {
  const statCards = [
    { label: "Total Enrolled",        value: stats?.total_enrolled_users || 0,      change: "+2 this week",       dir: "up"                },
    { label: "Active Users (30d)",    value: stats?.active_users_30d || 0,          change: "65% of enrolled",    dir: "up"                },
    { label: "At risk users",         value: stats?.active_alerts || 0,             change: "+5 since yesterday", dir: "down", danger: true },
    { label: "Q completion rate",     value: `${stats?.q_completion_rate || 0}%`,   change: "+3% last score",     dir: "up"                },
    { label: "Avg. program score",    value: stats?.average_program_score || 0,     change: "+1.4 vs last week",  dir: "up"                },
    { label: "Avg articles read/user",value: stats?.avg_articles_per_user || "0",   change: "+0.6 this week",     dir: "up"                },
  ];

  return (
    <div className="stat-row">
      {statCards.map((s, i) => (
        <div key={i} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className={`stat-value ${s.danger ? "danger" : ""}`}>{s.value}</div>
          <div className={`stat-change ${s.dir}`}>{s.change}</div>
        </div>
      ))}
    </div>
  );
}
