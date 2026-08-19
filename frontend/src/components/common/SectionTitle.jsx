import { theme } from "../../styles/themes";

const { brass } = theme.colors;
const { serif, mono } = theme.fonts;

export function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <div
        className="text-xs tracking-widest uppercase mb-1"
        style={{ color: brass, fontFamily: mono, letterSpacing: "0.12em" }}
      >
        {eyebrow}
      </div>
      <h1 className="text-2xl" style={{ fontFamily: serif, color: theme.colors.ink }}>
        {title}
      </h1>
    </div>
  );
}

export default SectionTitle;