import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Tooltip,
} from "recharts";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";

export default function HealthRiskCard({ data }) {
  const hrvData = [
    { r: "Below 20ms", v: Number(data?.hrv?.below_20 || 0), c: "#FF5959" },
    { r: "20–39ms", v: Number(data?.hrv?.hrv_20_39 || 0), c: "#FFDE84" },
    { r: "40–59ms", v: Number(data?.hrv?.hrv_40_59 || 0), c: "#03A37C" },
    { r: "60–79ms", v: Number(data?.hrv?.hrv_60_79 || 0), c: "#3FD7B2" },
    { r: "80+ ms", v: Number(data?.hrv?.above_80 || 0), c: "#0E775D" },
  ];

  const sleepData = [
    { r: "Below 4h", v: Number(data?.sleep?.below_4 || 0), c: "#FF5C5C" },
    { r: "4–5h", v: Number(data?.sleep?.sleep_4_4_9 || 0), c: "#FFB020" },
    { r: "5–6h", v: Number(data?.sleep?.sleep_5_5_9 || 0), c: "#00C9A7" },
    { r: "6–7h", v: Number(data?.sleep?.sleep_6_6_9 || 0), c: "#00C9A7" },
    { r: "7–8h", v: Number(data?.sleep?.sleep_7_7_9 || 0), c: "#00C9A7" },
    { r: "8h+", v: Number(data?.sleep?.above_8 || 0), c: "#9CA3AF" },
  ];

  const avgHrv = data?.hrv?.cohort_avg_hrv
    ? Number(data.hrv.cohort_avg_hrv).toFixed(0)
    : 0;
  const avgSleep = data?.sleep?.cohort_avg_sleep
    ? Number(data.sleep.cohort_avg_sleep).toFixed(1)
    : 0;

  return (
    <div className="alert-card-wrap">
      <SectionBanner
        color="yellow"
        label="Health Risk Indicator"
        sub="Early morning lifestyle indicator"
      />
      <div className="sectionBoddy">
        <div className="card-title">
          Heart rate variability (HRV) – cohort distribution
        </div>
        <div className="card-subtitle card-subtitle--sm-mb">
          Higher HRV ={" "}
          <span className="safeRangeBr">better autonomic health</span> Cohort
          avg: <span>{avgHrv}ms</span>
        </div>
        <div className="hrv-avg-label">
          Avg <span>{avgHrv}ms</span>
        </div>

        <ResponsiveContainer width="100%" height={182}>
          <BarChart data={hrvData} layout="vertical" barSize={18}>
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="r"
              tick={{ fontSize: 10 }}
              width={80}
              axisLine={false}
              tickLine={false}
            />
            <Bar dataKey="v" radius={[10, 10, 10, 10]}>
              {hrvData.map((entry, index) => (
                <Cell key={index} fill={entry.c} />
              ))}
            </Bar>
            <Tooltip cursor={{ fill: "transparent" }} />
          </BarChart>
        </ResponsiveContainer>

        <p className="alert-note alert-note--mb-lg">
          Alert: <span className="alert-highlight">HRV below 70 ms</span> for 5+
          consecutive days · {data?.hrv?.alert_users || 0} users currently
          flagged
        </p>

        <div className="section-header">
          <span className="section-header__title">
            Sleep duration – cohort distribution (7-day avg)
          </span>
          <span className="section-header__caret">^</span>
        </div>
        <div className="card-subtitle">
          Recommended: <span className="safeRangeBr">7–9h/night</span> Avg sleep
          quality score: <span>8.5/10</span>
        </div>

        <div className="chartChipsWrap">
          <div className="sleep-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sleepData}
                margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#E9E9E9"
                />
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
                  {sleepData.map((e, i) => (
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

          <div className="chip-row chip-row--mt">
            <MetricChip
              label="Cohort avg sleep"
              value={`${avgSleep}h`}
              color="blue"
            />
            <MetricChip
              label="Critical (below 4h)"
              value={Number(data?.sleep?.critical_sleep_users || 0)}
              color="red"
            />
            <MetricChip label="Avg quality score" value="8.5" color="blue" />
          </div>
        </div>

        <p className="alert-note">
          Alert: <span className="alert-highlight">Below 4hrs/night</span> for
          2+ consecutive days
        </p>
      </div>
    </div>
  );
}
