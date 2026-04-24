import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CategoryDonut({ value, label, icon, size = 100 }) {
  const total = 1400;
  return (
    <div className="category-donut">
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={[{ v: value }, { v: Math.max(0, total - value) }]}
            cx="50%" cy="50%"
            innerRadius={size * 0.33} outerRadius={size * 0.46}
            dataKey="v" startAngle={90} endAngle={-270} stroke="none"
          >
            <Cell fill="#00C9A7" />
            <Cell fill="#E5E7EB" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="category-donut__value" style={{ marginTop: -size * 0.6, fontSize: size === 100 ? 15 : 13 }}>
        {value.toLocaleString()}
      </div>
      <div className="category-donut__label" style={{ marginTop: size * 0.62 }}>
        {icon} {label}
      </div>
    </div>
  );
}
