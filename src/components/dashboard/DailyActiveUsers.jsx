import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";

export default function DailyActiveUsers({ dauTrend = [] }) {
  const [period, setPeriod] = useState("30");

  const filteredTrend = dauTrend.slice(-Number(period));
  const dauData = filteredTrend.map(d => ({
    day: new Date(d.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    dau: Number(d.dau)
  }));
  
  const todayDau = dauData.length ? dauData[dauData.length - 1].dau : 0;
  const avgDau = dauData.length ? Math.round(dauData.reduce((acc, curr) => acc + curr.dau, 0) / dauData.length) : 0;
  const startDau = dauData.length ? dauData[0].dau : 0;
  const growth = startDau > 0 ? (((todayDau - startDau) / startDau) * 100).toFixed(1) : 0;

  const metrics = [
    { label: "DAU today", value: todayDau.toString(), color: "blue" },
    { label: `Avg DAU (${period}d)`, value: avgDau.toString(), color: "green" },
    { label: `Growth (${period}d)`, value: `${growth > 0 ? '+' : ''}${growth}%`, color: growth > 0 ? "green" : "red" },
    { label: "Trending", value: growth > 0 ? "Upward" : "Stable", color: "blue" },
  ];

  return (
    <div>
      {/* <div className="section-banner-wrap section-banner-wrap--spaced">
        <div className="section-banner-wrap__inner">
          <SectionBanner
            label="Daily Active Users"
            sub="Platform engagement and retention trends"
          />
        </div>
        <span className="period-label">Period : last 7 days ▾</span>
      </div> */}
      <SectionBanner
        color="blue"
        label="Daily Active Users"
        sub="Platform engagement and retention trends"
      />

      <div className="metric-card sectionBoddy">
        <div className="dau-header">
          <div>
            <div className="card-title">DAU trends – last 30 days</div>
            <div className="card-subtitle card-subtitle--no-mb">
              Daily active users across all enrolled programs
            </div>
          </div>
          <div className="period-toggle">
            {["07 Days", "30 Days", "90 Days"].map((p, i) => {
              const v = ["7", "30", "90"][i];
              const active = period === v;
              return (
                <button
                  key={v}
                  onClick={() => setPeriod(v)}
                  className="period-btn"
                  style={{
                    fontWeight: active ? 600 : 400,
                    background: active ? "#00C9A7" : "#fff",
                    color: active ? "#fff" : "#6B7280",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="chip-row chip-row--mb-xl">
          {metrics.map((m, i) => (
            <MetricChip
              key={i}
              label={m.label}
              value={m.value}
              color={m.color}
            />
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={dauData}
            margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C9A7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00C9A7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              ticks={dauData
                .filter((_, i) => i % 5 === 0 || i === 29)
                .map((d) => d.day)}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[300, "dataMax+100"]}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="dau"
              stroke="#00C9A7"
              strokeWidth={2}
              fill="url(#dauGrad)"
              dot={(props) => {
                if (props.index === 29)
                  return (
                    <circle
                      key="peak"
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill="#00C9A7"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  );
                return null;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
