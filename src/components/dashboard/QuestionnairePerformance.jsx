import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import SectionBanner from "./shared/SectionBanner";

const CustomYAxisTick = ({ x, y, payload }) => (
  <text
    x={x}
    y={y}
    dy={4}
    textAnchor="end"
    fill="#1A1D23"
    fontSize={11}
    fontWeight={500}
  >
    {payload.value}
  </text>
);

export default function QuestionnairePerformance({ data }) {
  const completedToday = data?.completed_today || 0;
  const overdue = data?.overdue || 0;
  const compRate = data?.completion_rate || 0;

  const byTypeData =
    data?.by_type?.length > 0
      ? data.by_type
      : [
          { name: "PHQ-9 (Mood)", value: 0 },
          { name: "Sleep Quality Index", value: 0 },
          { name: "Activity Check", value: 0 },
          { name: "Nutrition Assessment", value: 0 },
        ];

  const domainData =
    data?.domain_scores?.length > 0
      ? data.domain_scores
      : [
          { domain: "Mood & affect", score: 0 },
          { domain: "Sleep Quality", score: 0 },
          { domain: "Energy levels", score: 0 },
          { domain: "Focus & cognition", score: 0 },
        ];

  return (
    <div>
      <SectionBanner
        color="blue"
        label="Questionnaire Performance"
        sub="Program Progress and mental health domain tracking"
      />
      <div className="two-col-grid sectionBoddyPhMet sectionBoddy">
        {/* Left: Completion Rate */}
        <div className="metric-card">
          <div className="card-title card-title--lg">
            Completion Rate – by questionnaire type
          </div>
          <div className="card-subtitle">
            All Programs | Current enrollment period
          </div>
          <div className="quest-stat-grid">
            <div className="quest-stat-card quest-stat-card--blue">
              <div className="quest-stat-label">Completed today</div>
              <div className="quest-stat-value">{completedToday}</div>
            </div>
            <div className="quest-stat-card quest-stat-card--red">
              <div className="quest-stat-label">Overdue</div>
              <div className="quest-stat-value quest-stat-value--red">
                {overdue}
              </div>
            </div>
            <div className="quest-stat-card quest-stat-card--green">
              <div className="quest-stat-label">Overall rate</div>
              <div className="quest-stat-value quest-stat-value--green">
                {compRate}%
              </div>
            </div>
          </div>
          <div className="quest-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={byTypeData}
                margin={{ top: 0, right: 60, left: 20, bottom: 0 }}
                barCategoryGap={16}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomYAxisTick />}
                  width={140}
                />
                <Tooltip cursor={{ fill: "#F9FAFB" }} />
                <Bar
                  dataKey="value"
                  fill="#00C9A7"
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  background={{ fill: "#F3F4F6", radius: [0, 4, 4, 0] }}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(v) => `${v} users`}
                    style={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Domain scores */}
        <div className="metric-card">
          <div className="card-title card-title--lg">
            Average domain score – cohort (PHQ-9)
          </div>
          <div className="card-subtitle">
            Lower score = better on PHQ-9 Scale | Avg overall: 71.2 / 100
          </div>
          <div className="quest-domain-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={domainData}
                margin={{ top: 30, right: 10, left: -20, bottom: 0 }}
                barCategoryGap={35}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="domain"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  dy={10}
                />
                <YAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                />
                <Tooltip cursor={{ fill: "#F9FAFB" }} />
                <Bar
                  dataKey="score"
                  fill="#00C9A7"
                  radius={[6, 6, 0, 0]}
                  barSize={42}
                >
                  <LabelList
                    dataKey="score"
                    position="top"
                    style={{ fontSize: 15, fontWeight: 700, fill: "#1A1D23" }}
                    dy={-6}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
