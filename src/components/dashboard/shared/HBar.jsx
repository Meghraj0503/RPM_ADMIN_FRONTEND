export default function HBar({ label, value, pct, color }) {
  const safePct = Math.max(0, Math.min(pct, 100));
  return (
    <div className="hbar">
      <div className="hbar__header">
        <span className="hbar__label">
          <span className="legend-dot" style={{ background: color }} />
          {label}
        </span>
        <span className="hbar__value">{value}</span>
      </div>
      <div className="hbar__track">
        <div
          className="hbar__fill"
          style={{ background: color, width: `${safePct}%` }}
        />
      </div>
    </div>
  );
}
