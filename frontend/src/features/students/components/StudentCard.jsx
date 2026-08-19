import { Pencil, Trash2 } from "lucide-react";
import { letterTone } from "../../../components/common/letterTone";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { serif, mono } = theme.fonts;

export default function StudentCard({ student, onEdit, onDelete }) {
  const tone = letterTone(student.averageGrade || "A");

  return (
    <div
      className="p-4 flex flex-col"
      style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontFamily: mono, fontSize: 11, color: brass, letterSpacing: "0.05em" }}>
          {student.studentNo}
        </span>
        <div className="flex items-center gap-2">
          {student.averageGrade && (
            <span
              className="text-xs px-2 py-0.5"
              style={{ background: tone.bg, color: tone.fg, borderRadius: 2, fontFamily: mono }}
            >
              {student.averageGrade}
            </span>
          )}
          <button
            type="button"
            onClick={() => onEdit(student)}
            aria-label="Edit student"
            style={{ background: "transparent", border: "none", color: brass, padding: 4, cursor: "pointer" }}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(student)}
            aria-label="Delete student"
            style={{ background: "transparent", border: "none", color: rust, padding: 4, cursor: "pointer" }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div style={{ fontFamily: serif, fontSize: 18, color: ink }}>
        {student.firstName} {student.lastName}
      </div>

      <div style={{ fontSize: 13, color: "#8A8370", marginTop: 2 }}>
        {student.grade || "Unassigned"}
      </div>

      <div
        className="mt-auto"
        style={{ borderTop: `1px solid ${hairline}`, marginTop: 12, paddingTop: 10, fontSize: 12, color: "#6D6858" }}
      >
        {student.guardianName ? (
          <div>Guardian: {student.guardianName}</div>
        ) : (
          <div>Guardian: —</div>
        )}
        {student.attendance != null && <div style={{ marginTop: 4 }}>Attendance: {student.attendance}%</div>}
        {student.gender && <div style={{ marginTop: 4 }}>Gender: {student.gender}</div>}
      </div>
    </div>
  );
}