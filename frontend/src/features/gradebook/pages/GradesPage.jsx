import { SectionTitle } from "../../../components/common/SectionTitle";
import { letterTone } from "../../../components/common/letterTone";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline } = theme.colors;
const { serif, mono } = theme.fonts;

const GRADE_ROWS = [
  { name: "Amara Okafor", subject: "Mathematics", score: 92, letter: "A-" },
  { name: "Liam Fischer", subject: "Mathematics", score: 87, letter: "B+" },
  { name: "Priya Nair", subject: "Biology", score: 95, letter: "A" },
  { name: "Mateo Rossi", subject: "World history", score: 71, letter: "C" },
  { name: "Yuki Tanaka", subject: "Chemistry", score: 84, letter: "B" },
  { name: "Zoe van Dijk", subject: "English literature", score: 80, letter: "B-" },
];

export default function GradesPage() {
  return (
    <div>
      <SectionTitle eyebrow="Mark book" title="Grades" />
      <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
        <div
          className="flex items-center px-4 py-2 text-xs uppercase"
          style={{ borderBottom: `1px solid ${hairline}`, color: "#8A8370", fontFamily: mono, letterSpacing: "0.05em" }}
        >
          <span className="flex-1">Student</span>
          <span style={{ width: 180 }}>Subject</span>
          <span style={{ width: 80, textAlign: "right" }}>Score</span>
          <span style={{ width: 80, textAlign: "center" }}>Grade</span>
        </div>
        {GRADE_ROWS.map((row, i) => {
          const tone = letterTone(row.letter);
          return (
            <div
              key={row.name + row.subject}
              className="flex items-center px-4 py-3"
              style={{ borderBottom: i === GRADE_ROWS.length - 1 ? "none" : `1px solid ${hairline}` }}
            >
              <span className="flex-1" style={{ color: ink, fontSize: 14 }}>{row.name}</span>
              <span style={{ width: 180, fontSize: 13, color: "#6D6858" }}>{row.subject}</span>
              <span style={{ width: 80, textAlign: "right", fontFamily: mono, fontSize: 13, color: "#8A8370" }}>{row.score}</span>
              <span style={{ width: 80, textAlign: "center" }}>
                <span
                  className="text-xs px-2 py-0.5"
                  style={{ background: tone.bg, color: tone.fg, borderRadius: 2, fontFamily: mono }}
                >
                  {row.letter}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}