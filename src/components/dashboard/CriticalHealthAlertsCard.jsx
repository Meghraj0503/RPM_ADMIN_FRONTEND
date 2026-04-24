import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Tooltip,
} from "recharts";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";
import HBar from "./shared/HBar";

export default function CriticalHealthAlertsCard({ data }) {
  const tSpo2 = data?.spo2
    ? Number(data.spo2.normal) + Number(data.spo2.low) + Number(data.spo2.critical)
    : 1;

  const spo2Slices = [
    {
      name: "Normal 95–100%",
      value: data?.spo2?.normal || 0,
      pct: Math.round(((data?.spo2?.normal || 0) / tSpo2) * 100),
      color: "#03A37C",
    },
    {
      name: "Low 90–94%",
      value: data?.spo2?.low || 0,
      pct: Math.round(((data?.spo2?.low || 0) / tSpo2) * 100),
      color: "#FFDE84",
    },
    {
      name: "Critical below 90%",
      value: data?.spo2?.critical || 0,
      pct: Math.round(((data?.spo2?.critical || 0) / tSpo2) * 100),
      color: "#FF5959",
    },
  ];

  const pieSpo2 = [
    { v: Number(data?.spo2?.normal || 0),   color: "#03A37C" },
    { v: Number(data?.spo2?.low || 0),      color: "#FFDE84" },
    { v: Number(data?.spo2?.critical || 0), color: "#FF5959" },
    { v: tSpo2 === 0 ? 1 : 0,              color: "#E5E7EB" },
  ];

  const hrData = [
    { r: "Below 40",  v: Number(data?.hr?.below_40   || 0), c: "#FF5C5C" },
    { r: "40–59",     v: Number(data?.hr?.hr_40_59   || 0), c: "#FFB020" },
    { r: "60–79",     v: Number(data?.hr?.hr_60_79   || 0), c: "#00C9A7" },
    { r: "80–100",    v: Number(data?.hr?.hr_80_100  || 0), c: "#00C9A7" },
    { r: "101–120",   v: Number(data?.hr?.hr_101_120 || 0), c: "#FFB020" },
    { r: "Above 120", v: Number(data?.hr?.above_120  || 0), c: "#FF5C5C" },
  ];

  const atRiskCount = Number(data?.spo2?.low || 0) + Number(data?.spo2?.critical || 0);
  const avgSpo2 = data?.spo2?.avg_spo2 ? Number(data.spo2.avg_spo2).toFixed(1) : 0;
  const avgHr   = data?.hr?.avg_hr     ? Number(data.hr.avg_hr).toFixed(1)     : 0;

  return (
    <div className="alert-card-wrap">
      <SectionBanner
        color="red"
        label="Critical Health Alerts"
        sub="Immediate medical attention signals"
      />
      <div className="sectionBoddy">
        <div className="chart-row">
          <div className="leftWrap">
            <div className="card-title">
              Blood oxygen (SpO2) – Population Distribution
            </div>
            <div className="card-subtitle">
              Safe range: <span className="safeRangeBr">95–100%</span> Alert
              threshold: below <span>95%</span>
            </div>
            <div className="chip-row">
              <MetricChip
                label="Cohort avg SpO2"
                value={`${avgSpo2}%`}
                color="blue"
                className="rightRadius"
              />
              <MetricChip
                label="Critical users"
                value={Number(data?.spo2?.critical || 0)}
                color="red"
                className="leftRadius"
              />
            </div>
            <div className="chart-col">
              {spo2Slices.map((s, i) => (
                <HBar
                  key={i}
                  label={s.name}
                  value={`${s.value} – ${s.pct}%`}
                  pct={s.pct * 1.5}
                  color={s.color}
                />
              ))}
            </div>
          </div>

          <div className="spo2-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieSpo2}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="88%"
                  dataKey="v"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {pieSpo2.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <text x="50%" y="48%" textAnchor="middle" fill="#000000" fontSize={26} fontWeight={700}>
                  {atRiskCount}
                </text>
                <text x="50%" y="58%" textAnchor="middle" fill="#6E6E6E" fontSize={12}>
                  At risk
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="btmWrap">
          <p className="alert-note alert-note--mb">
            Alert trigger at:{" "}
            <span className="alert-highlight">Below 95% SpO2</span> · Users in
            critical band auto-appear in at-risk list
          </p>

          <div className="section-header">
            <span className="section-header__title">
              Heart rate – Population range breakdown
            </span>
            <span className="section-header__caret">^</span>
          </div>
          <div className="card-subtitle">
            Safe range: <span className="safeRangeBr">60–100bpm</span> Alert:
            Above <span>120bpm</span> or below <span>40bpm</span>
          </div>

          <div className="hr-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hrData}
                margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E9E9E9" />
                <XAxis
                  dataKey="r"
                  tick={{ fontSize: 11, fill: "#000000" }}
                  axisLine={{ stroke: "#B4B4B4" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#000000" }}
                  axisLine={{ stroke: "#B4B4B4" }}
                  tickLine={false}
                />
                <Bar dataKey="v" radius={[10, 10, 0, 0]} barSize={36}>
                  {hrData.map((e, i) => (
                    <Cell key={i} fill={e.c} />
                  ))}
                  <LabelList
                    dataKey="v"
                    position="top"
                    style={{ fontSize: 16, fontWeight: 700, fill: "#000000" }}
                  />
                </Bar>
                <Tooltip cursor={{ fill: "transparent" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="alert-note">
            Critical:{" "}
            <span className="alert-highlight">Above 120bpm or below 40bpm</span>{" "}
            (Cohort avg: {avgHr}bpm)
          </p>
        </div>
      </div>
    </div>
  );
}
