export default function MetricChip({
  label,
  value,
  color = "green",
  className = "",
}) {
  const palettes = {
    green: { bg: "#DDFFF7", fg: "#03A37C" },
    red: { bg: "#FFE2E2", fg: "#FF4545" },
    blue: { bg: "#CFDFFF", fg: "#000000" },
    yellow: { bg: "#FFF8EC", fg: "#FFB020" },
  };

  const p = palettes[color] || palettes.green;

  return (
    <div
      className={`metric-chip ${className}`}
      style={{
        background: p.bg,
      }}
    >
      <div className="metric-chip__label">{label}</div>
      <div
        className="metric-chip__value"
        style={{
          color: p.fg,
        }}
      >
        {value}
      </div>
    </div>
  );
}
