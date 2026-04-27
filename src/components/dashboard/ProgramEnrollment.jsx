import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";

export default function ProgramEnrollment({ data, topStats }) {
  const prgs = data?.programs || [];
  const total = Number(topStats?.total_enrolled_users || 1);
  const programData = prgs.map((p, i) => ({
    name: p.program_name,
    value: Number(p.count),
    pct: Math.round((Number(p.count) / total) * 100) + "%",
    color: ["#2D9EF0", "#FF5C5C", "#FFB020", "#9CA3AF"][i % 4],
  }));

  const totalDevices = Number(data?.devices?.total_devices || 1);
  const connDevices = Number(data?.devices?.connected_devices || 0);
  const connPct = Math.round((connDevices / totalDevices) * 100);

  const abhaData = [
    { v: 76, color: "#00C9A7" },
    { v: 24, color: "#E5E7EB" },
  ];
  const deviceColors = ["#2D9EF0", "#FF5C5C", "#FF8080"];
  const deviceData = [
    { name: "Paired & active", value: connDevices },
    {
      name: "Manual entry only",
      value: Math.max(0, totalDevices - connDevices),
    },
  ];

  return (
    <div>
      <SectionBanner
        color="blue"
        label="Program Enrollment & Engagement"
        sub="Daily movement and energy tracking across the cohort"
      />
      <div className="grid-three sectionBoddy sectionBoddyPhMet">
        {/* Users by Program */}
        <div className="metric-card">
          <div className="card-title">Users by Program</div>
          <div className="card-subtitle">
            Total enrolled: {topStats?.total_enrolled_users || 0} across all
            programs
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={programData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {programData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={22}
                fontWeight={700}
              >
                {topStats?.total_enrolled_users || 0}
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="card-legend">
            {programData.map((d, i) => (
              <div key={i} className="legend-row">
                <span className="legend-dot-label">
                  <span
                    className="legend-dot"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
                <span className="legend-value">
                  {d.value} – {d.pct}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ABHA linkage */}
        <div className="metric-card">
          <div className="card-title">ABHA ID linkage status</div>
          <div className="card-subtitle">
            Ayushman Bharat Health Account integration
          </div>
          <div className="chip-row">
            <MetricChip
              label="ABHA linked"
              value="8"
              color="green"
              className="rightRadius"
            />
            <MetricChip
              label="Not linked"
              value="3"
              color="blue"
              className="leftRadius"
            />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={abhaData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={84}
                dataKey="v"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {abhaData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={26}
                fontWeight={700}
              >
                76%
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={12}
              >
                Linked
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Wearable pairing */}
        <div className="metric-card">
          <div className="card-title">Wearable device pairing</div>
          <div className="card-subtitle">User smartwatch connection status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[{ v: connPct }, { v: 100 - connPct }]}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                dataKey="v"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {deviceColors.map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <text
                x="50%"
                y="47%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={22}
                fontWeight={700}
              >
                {connPct}%
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
              >
                Connected
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="card-legend">
            {deviceData.map((d, i) => (
              <div key={i} className="legend-row">
                <span className="legend-dot-label">
                  <span
                    className="legend-dot"
                    style={{ background: deviceColors[i] }}
                  />
                  {d.name}
                </span>
                <span className="legend-value">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
