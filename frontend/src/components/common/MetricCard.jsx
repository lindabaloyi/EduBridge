import { theme } from "../../styles/themes";

const { cardPaper, ink, hairline } = theme.colors;
const { serif, mono } = theme.fonts;

export function MetricCard({ label, value, sub }) {
  return (
    <div
      className="p-4 flex-1"
      style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}
    >
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: "#8A8370", fontFamily: mono }}>
        {label}
      </div>
      <div className="text-3xl" style={{ fontFamily: serif, color: ink }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: "#8A8370" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default MetricCard;