export default function SectionBanner({ color = "green", label, sub }) {
  const styles = {
    red: {
      mainBg: "#FF9898",
      subBg: "#FFE2E2",
      subColor: "#FF4545",
    },
    yellow: {
      mainBg: "#FFDE84",
      subBg: "#FFF0C2",
      subColor: "#B78900",
    },
    green: {
      mainBg: "#A1F6D9",
      subBg: "#DDFFF7",
      subColor: "#03A37C",
    },
    blue: {
      mainBg: "#CFDFFF",
      subBg: "#E2EBFF",
      subColor: "#3064C5",
    },
  };

  const current = styles[color] || styles.green;

  return (
    <div className="section-banner" style={{ background: current.mainBg }}>
      <span className="section-banner__badge">
        <span className="section-banner__dot" />
        {label}
      </span>

      {sub && (
        <span
          className="section-banner__sub"
          style={{
            background: current.subBg,
            color: current.subColor,
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
