export default function DashboardStatCards({ stats, trends }) {
  const statCards = [
    { label: "Total Enrolled",        value: stats?.total_enrolled_users || 0,      change: trends?.enrolled_growth || "0 this week",       dir: "up"                },
    { label: "Active Users (30d)",    value: stats?.active_users_30d || 0,          change: trends?.active_users_insight || "0% of enrolled",    dir: "up"                },
    { label: "At risk users",         value: stats?.active_alerts || 0,             change: "Requires attention", dir: "down", danger: true },
    { label: "Q completion rate",     value: `${stats?.q_completion_rate || 0}%`,   change: trends?.q_completion_trend || "-",     dir: "up"                },
    { label: "Avg. program score",    value: stats?.average_program_score || 0,     change: trends?.program_score_trend || "-",  dir: "up"                },
    { label: "Avg articles read/user",value: stats?.avg_articles_per_user || "0",   change: trends?.articles_read_trend || "0 this week",     dir: "up"                },
  ];
console.log("avg_program_score", stats?.average_program_score);

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
