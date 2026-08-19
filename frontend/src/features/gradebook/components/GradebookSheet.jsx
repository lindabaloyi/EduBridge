import { theme } from "../../../styles/themes";
import { letterTone } from "../../../components/common/letterTone";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { serif, mono } = theme.fonts;

const STATUS_LABELS = { GRADED: "G", MISSING: "M", ABSENT: "A" };
const TYPE_LABELS = {
  ASSIGNMENT: "Assignment",
  TEST: "Test",
  EXAM: "Exam",
  PROJECT: "Project",
  CLASSWORK: "Classwork",
  PRACTICAL: "Practical",
  ORAL: "Oral",
  OTHER: "Other",
};

const emptyCell = { markId: null, mark: null, status: "GRADED" };

export default function GradebookSheet({ sheet, staged, onStage, disabled }) {
  const assessments = sheet.assessments || [];
  const students = sheet.students || [];
  const keyOf = (sId, aId) => `${sId}|${aId}`;
  const isLocked = (a) => a.status === "LOCKED";

  return (
    <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4, overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
        <thead>
          <tr>
            <th
              className="text-left px-3 py-2 text-xs"
              style={{ borderBottom: `2px solid ${hairline}`, color: "#8A8370", fontFamily: mono, letterSpacing: "0.05em" }}
            >
              Student
            </th>
            {assessments.map((a) => {
              const locked = isLocked(a);
              return (
                <th
                  key={a.id}
                  className="px-2 py-2 text-left align-top"
                  style={{ borderBottom: `2px solid ${hairline}`, minWidth: 110 }}
                >
                  <div style={{ fontFamily: serif, color: ink, fontSize: 13, lineHeight: 1.2 }}>{a.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: locked ? rust : "#8A8370", marginTop: 2 }}>
                    {TYPE_LABELS[a.type] || a.type} · /{a.maxMark} · w{a.weight}
                    {locked && " · LOCKED"}
                  </div>
                </th>
              );
            })}
            <th
              className="px-3 py-2 text-left"
              style={{ borderBottom: `2px solid ${hairline}`, color: brass, fontFamily: serif, minWidth: 90 }}
            >
              Final
            </th>
          </tr>
        </thead>
        <tbody>
{students.map((st) => (
            <tr key={st.id} style={{ borderBottom: `1px solid ${hairline}` }}>
              <td className="px-3 py-2" style={{ fontSize: 13, color: ink }}>
                <div>{st.firstName} {st.lastName}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: "#8A8370" }}>{st.studentNo}</div>
              </td>

              {assessments.map((a) => {
                const key = keyOf(st.id, a.id);
                const cell = (st.cells && st.cells[a.id]) || emptyCell;
                const stagedCell = staged[key];
                const mark = stagedCell ? stagedCell.mark : cell.mark ?? "";
                const status = stagedCell ? stagedCell.status : cell.status || "GRADED";
                const locked = isLocked(a);
                return (
                  <td key={a.id} className="px-1 py-1">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={a.maxMark}
                        value={mark}
                        disabled={locked || disabled}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") {
                            onStage(st.id, a.id, { mark: null, status: "MISSING" });
                          } else {
                            onStage(st.id, a.id, { mark: Number(v), status });
                          }
                        }}
                        style={{
                          width: 58,
                          padding: "5px 6px",
                          fontSize: 13,
                          fontFamily: mono,
                          color: ink,
                          background: locked ? "#EDE8DC" : "#fff",
                          border: `1px solid ${hairline}`,
                          borderRadius: 3,
                          outline: "none",
                        }}
                      />
                      <select
                        value={status}
                        disabled={locked || disabled}
                        onChange={(e) => onStage(st.id, a.id, { mark, status: e.target.value })}
                        title="GRADED / MISSING / ABSENT"
                        style={{
                          width: 34,
                          padding: "5px 2px",
                          fontSize: 12,
                          fontFamily: mono,
                          color: ink,
                          background: "#fff",
                          border: `1px solid ${hairline}`,
                          borderRadius: 3,
                        }}
                      >
                        {Object.keys(STATUS_LABELS).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!locked && status === "ABSENT" && (
                      <div style={{ fontSize: 10, color: rust, fontFamily: mono }}>absent → 0</div>
                    )}
                  </td>
                );
              })}

              <td className="px-3 py-2">
                {st.final != null ? (
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: mono, fontSize: 14, color: ink }}>{st.final}%</span>
                    <span
                      className="px-2 py-0.5 text-xs"
                      style={{
                        background: letterTone(st.letter).bg,
                        color: letterTone(st.letter).fg,
                        borderRadius: 2,
                        fontFamily: mono,
                      }}
                    >
                      {st.letter}
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: "#8A8370" }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-3 py-2 text-xs" style={{ color: "#6D6858", fontFamily: mono, borderTop: `1px solid ${hairline}` }}>
        Status: G=Graded · M=Missing (excluded) · A=Absent (counted as 0) — {assessments.filter(isLocked).length}/{assessments.length} columns locked.
      </div>
    </div>
  );
}