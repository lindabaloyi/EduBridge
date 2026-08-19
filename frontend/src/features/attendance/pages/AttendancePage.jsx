import { useState } from "react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { MetricCard } from "../../../components/common/MetricCard";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, sage, sageLight, rust, rustLight } = theme.colors;
const { mono } = theme.fonts;

const STUDENTS = [
  { id: "STU-1042", name: "Amara Okafor", grade: "Grade 9-A", guardian: "Chidi Okafor", attendance: 96, avg: "A-" },
  { id: "STU-1043", name: "Liam Fischer", grade: "Grade 9-A", guardian: "Nora Fischer", attendance: 88, avg: "B+" },
  { id: "STU-1044", name: "Priya Nair", grade: "Grade 9-B", guardian: "Ravi Nair", attendance: 99, avg: "A" },
  { id: "STU-1045", name: "Mateo Rossi", grade: "Grade 10-A", guardian: "Elena Rossi", attendance: 74, avg: "C" },
  { id: "STU-1046", name: "Yuki Tanaka", grade: "Grade 10-A", guardian: "Kenji Tanaka", attendance: 91, avg: "B" },
  { id: "STU-1047", name: "Zoe van Dijk", grade: "Grade 10-B", guardian: "Bram van Dijk", attendance: 83, avg: "B-" },
  { id: "STU-1048", name: "Kofi Mensah", grade: "Grade 9-B", guardian: "Ama Mensah", attendance: 95, avg: "A-" },
  { id: "STU-1049", name: "Isla Campbell", grade: "Grade 10-B", guardian: "Fiona Campbell", attendance: 79, avg: "C+" },
];

export default function AttendancePage() {
  const [status, setStatus] = useState(() =>
    Object.fromEntries(STUDENTS.map((s) => [s.id, "present"]))
  );

  const cycle = (id) => {
    setStatus((prev) => {
      const order = ["present", "late", "absent"];
      const next = order[(order.indexOf(prev[id]) + 1) % order.length];
      return { ...prev, [id]: next };
    });
  };

  const marks = { present: "✓", late: "△", absent: "✕" };
  const tones = {
    present: { bg: sageLight, fg: sage },
    late: { bg: "#D8C39A", fg: "#6B4F1F" },
    absent: { bg: rustLight, fg: rust },
  };

  const counts = Object.values(status).reduce(
    (acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }),
    {}
  );

  return (
    <div>
      <SectionTitle
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        title="Roll call — Grade 9-A"
      />

      <div className="flex gap-4 mb-6">
        <MetricCard label="Present" value={counts.present || 0} />
        <MetricCard label="Late" value={counts.late || 0} />
        <MetricCard label="Absent" value={counts.absent || 0} />
      </div>

      <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
        <div
          className="flex items-center px-4 py-2 text-xs uppercase"
          style={{ borderBottom: `1px solid ${hairline}`, color: "#8A8370", fontFamily: mono, letterSpacing: "0.05em" }}
        >
          <span className="flex-1">Student</span>
          <span style={{ width: 100 }}>Roll no.</span>
          <span style={{ width: 90, textAlign: "center" }}>Mark</span>
        </div>
        {STUDENTS.map((s, i) => (
          <div
            key={s.id}
            className="flex items-center px-4 py-3"
            style={{ borderBottom: i === STUDENTS.length - 1 ? "none" : `1px solid ${hairline}` }}
          >
            <span className="flex-1" style={{ color: ink, fontSize: 14 }}>{s.name}</span>
            <span style={{ width: 100, fontFamily: mono, fontSize: 12, color: "#8A8370" }}>{s.id}</span>
            <div style={{ width: 90, textAlign: "center" }}>
              <button
                onClick={() => cycle(s.id)}
                className="w-8 h-8 inline-flex items-center justify-center text-sm"
                style={{
                  background: tones[status[s.id]].bg,
                  color: tones[status[s.id]].fg,
                  borderRadius: 2,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: mono,
                }}
                title="Click to change mark"
              >
                {marks[status[s.id]]}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-3" style={{ color: "#8A8370" }}>
        Tap a mark to cycle present → late → absent.
      </p>
    </div>
  );
}