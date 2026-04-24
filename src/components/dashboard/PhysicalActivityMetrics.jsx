import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";

export default function PhysicalActivityMetrics({ data }) {
  const stepsTrend = data?.steps_trend_7d || [];
  const stepsData = stepsTrend.map((d) => ({
    day: new Date(d.day).toLocaleDateString("en-US", { weekday: "short" }),
    steps: Number(d.avg_steps),
  }));
  const avgSteps = stepsData.length
    ? Math.round(stepsData.reduce((a, c) => a + c.steps, 0) / stepsData.length)
    : 0;

  const calData = [
    {
      name: "At or above 350 kcal",
      value: Number(data?.targeted_cal_users || 0),
      color: "#00C9A7",
    },
    {
      name: "Below target",
      value: Math.max(0, 11 - Number(data?.targeted_cal_users || 0)),
      color: "#FFB020",
    },
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
      <SectionBanner
        label="Physical Activity Metrics"
        sub="Daily movement and energy tracking across the cohort"
      />
      <div className="grid-physical sectionBoddy sectionBoddyPhMet">
        {/* Steps line chart */}
        <div className="metric-card">
          <div className="card-title">Avg steps/day – 7 day cohort trend</div>
          <div className="card-subtitle">
            Daily goal: 8,000 steps · Cohort avg: {avgSteps.toLocaleString()}
          </div>
          <div className="chip-row">
            <MetricChip
              label="Cohort avg /day"
              value={avgSteps.toLocaleString()}
              color="blue"
              className="rightRadius"
            />
            <MetricChip
              label="Target: 8k"
              value="8,000"
              color="green"
              className="leftRadius"
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stepsData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F3F4F6"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, "dataMax+2000"]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="#00C9A7"
                strokeWidth={2}
                dot={{ r: 4, fill: "#00C9A7" }}
              />
              <Line
                type="monotone"
                data={stepsData.map((d) => ({ ...d, goal: 8000 }))}
                dataKey="goal"
                stroke="#E5E7EB"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="alert-note">
            Consistently below 5000 steps triggers a physical activity insight
            flag.
          </p>
        </div>

        {/* Calories donut */}
        <div className="metric-card">
          <div className="card-title">Calories Burned – Target achievement</div>
          <div className="card-subtitle">
            Daily target: 350 kcal · Cohort avg:{" "}
            {Number(data?.avg_calories_daily || 0)} kcal/day
          </div>
          <div className="chip-row">
            <MetricChip
              label="Cohort avg kcal"
              value={Number(data?.avg_calories_daily || 0)}
              color="blue"
              className="rightRadius"
            />
            <MetricChip
              label="Daily target kcal"
              value="350"
              color="green"
              className="leftRadius"
            />
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={calData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {calData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={26}
                fontWeight={700}
              >
                {calPct}%
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={12}
              >
                on target
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="card-legend">
            {calData.map((d, i) => (
              <div key={i} className="legend-row">
                <span className="legend-dot-label">
                  <span
                    className="legend-dot"
                    style={{ background: d.color }}
                  />
                  {d.name}
                </span>
                <span className="legend-value">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active minutes semi-arc gauge */}
        <div className="metric-card">
          <div className="card-title">Active minutes – weekly cohort avg</div>
          <div className="card-subtitle">
            WHO target: 150 min/week · Cohort avg: {activeMins} min/week
          </div>
          <div className="chip-row">
            <MetricChip
              label="WHO target"
              value="150"
              color="green"
              className="rightRadius"
            />
            <MetricChip
              label="Current Avg"
              value={activeMins}
              color="red"
              className="leftRadius"
            />
          </div>
          <div className="gauge-label">150 (WHO goal)</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="80%"
                startAngle={180}
                endAngle={0}
                innerRadius={72}
                outerRadius={100}
                dataKey="v"
                stroke="none"
              >
                <Cell fill="#00C9A7" />
                <Cell fill="#E5E7EB" />
              </Pie>
              <text
                x="50%"
                y="82%"
                textAnchor="middle"
                fill="#1A1D23"
                fontSize={26}
                fontWeight={700}
              >
                {activeMins}
              </text>
              <text
                x="50%"
                y="93%"
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
              >
                min/week
              </text>
            </PieChart>
          </ResponsiveContainer>
          <div className="gauge-scale">
            <span>0</span>
            <span>200+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
