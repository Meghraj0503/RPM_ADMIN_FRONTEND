import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SectionBanner from "./shared/SectionBanner";

export default function AtRiskMonitoring({ list = [], breakdown = [] }) {
  const navigate = useNavigate();

  const bdData = (breakdown || []).map((b, i) => ({
    name: b.vital_type,
    value: Number(b.count),
    color: ["#FF5C5C", "#FFB020", "#2D9EF0", "#9CA3AF"][i % 4],
  }));

  return (
    <div>
      <SectionBanner
        color="red"
        label="At-Risk User Monitoring"
        sub="Detailed view of flagged vitals requiring medical evaluation"
      />
      <div className="grid-at-risk sectionBoddy sectionBoddyPhMet">
        {/* Left: table */}
        <div className="metric-card">
          <div className="card-title">
            At-risk users – flagged in last 48 hrs
          </div>
          <div className="card-subtitle">
            {list.length} users flagged · Sorted by severity
          </div>
          <div className="table-overflow">
            <table className="at-risk-table">
              <thead>
                <tr className="table-header-row">
                  {[
                    "User",
                    "Program",
                    "Vital Flag",
                    "Reading",
                    "When",
                    "Status",
                    "",
                  ].map((h, i) => (
                    <th key={i} className="table-th">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((r, i) => {
                  const diffH = r.latest_alertDate
                    ? Math.floor(
                        (new Date() - new Date(r.latest_alertDate)) /
                          (1000 * 60 * 60),
                      )
                    : null;
                  const whenStr =
                    diffH === null
                      ? "Just now"
                      : diffH > 24
                        ? `${Math.floor(diffH / 24)}d Ago`
                        : `${diffH}h Ago`;
                  return (
                    <tr key={i} className="table-row">
                      <td className="table-td table-td--bold">{r.name}</td>
                      <td className="table-td">{r.program}</td>
                      <td className="table-td">
                        {r.vital === "heart_rate"
                          ? "Heart Rate"
                          : String(r.vital).replace("_", " ")}
                      </td>
                      <td className="table-td">{r.reading}</td>
                      <td className="table-td table-td--muted">{whenStr}</td>
                      <td className="table-td">
                        <span className="badge-critical">Critical</span>
                      </td>
                      <td className="table-td table-action">⊙</td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="7" className="table-empty-cell">
                      No active alerts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="view-all-link--right">
            <button
              className="navigate-link"
              onClick={() => navigate("/at-risk")}
            >
              View All {list.length} at-risk users →
            </button>
          </div>
        </div>

        {/* Right: breakdown donut */}
        <div className="metric-card">
          <div className="card-title">At-risk breakdown by vital type</div>
          <div className="card-subtitle">
            {list.length} unique users at risk
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={bdData.length ? bdData : [{ value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={92}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {bdData.length ? (
                  bdData.map((e, i) => <Cell key={i} fill={e.color} />)
                ) : (
                  <Cell fill="#F3F4F6" />
                )}
              </Pie>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={26}
                fontWeight={700}
              >
                {list.length}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={12}
              >
                Users at risk
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="card-legend">
            {bdData.map((d, i) => (
              <div key={i} className="legend-row">
                <span className="legend-dot-label">
                  <span
                    className="legend-dot"
                    style={{ background: d.color }}
                  />
                  {d.name.replace("_", " ").toUpperCase()}
                </span>
                <span className="legend-value">{d.value} users</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
