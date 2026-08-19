import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Users, CalendarDays } from "lucide-react";
import { theme } from "../../../styles/themes";
import { useTeachers } from "../../../hooks/useTeachers";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight } = theme.colors;
const { serif, mono } = theme.fonts;

const panel = {
  background: cardPaper,
  border: `1px solid ${hairline}`,
  borderRadius: 4,
  padding: "20px",
};

const chip = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "4px 10px",
  fontSize: 12,
  fontFamily: mono,
  background: sageLight,
  color: sage,
  borderRadius: 3,
};

export default function TeacherProfilePage() {
  const { id } = useParams();
  const { fetchById, loading, error } = useTeachers();
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    let active = true;
    fetchById(id)
      .then((data) => {
        if (active) setTeacher(data);
      })
      .catch((err) => console.error("Failed to load teacher:", err));
    return () => {
      active = false;
    };
  }, [id, fetchById]);

  const initials = (f, l) => `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";
  const fullName = teacher
    ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
    : "";
  const joined = teacher?.joinedAt
    ? new Date(teacher.joinedAt).toLocaleDateString()
    : "—";

  if (loading && !teacher) {
    return (
      <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
        Loading teacher profile…
      </div>
    );
  }
  if (error && !teacher) {
    return (
      <div style={{ background: "#F0DAD3", color: rust, borderRadius: 4, padding: "8px 12px" }}>
        Error loading teacher: {error}
      </div>
    );
  }
  if (!teacher) {
    return (
      <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
        Teacher not found.
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/teachers"
        className="inline-flex items-center gap-1 mb-4 text-sm"
        style={{ color: sage, textDecoration: "none" }}
      >
        <ArrowLeft size={15} /> Back to Teachers
      </Link>

      {/* Header card */}
      <div style={{ ...panel, marginBottom: 24 }}>
        <div className="flex items-start gap-6">
          <div
            className="w-20 h-20 flex items-center justify-center text-2xl"
            style={{ background: sageLight, color: sage, borderRadius: "50%", fontFamily: mono }}
          >
            {initials(teacher.firstName, teacher.lastName)}
          </div>
          <div className="flex-1">
            <div className="text-2xl" style={{ fontFamily: serif, color: ink }}>
              {fullName}
            </div>
            <div className="text-sm mb-3" style={{ color: "#8A8370", fontFamily: mono }}>
              {teacher.employeeNo}{teacher.schoolName ? ` · ${teacher.schoolName}` : ""}
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <div className="text-xs uppercase" style={{ color: "#6D6858", fontFamily: mono }}>Employee ID</div>
                <div className="text-sm" style={{ color: ink, fontFamily: mono }}>{teacher.employeeNo || "N/A"}</div>
              </div>
              <div>
                <div className="text-xs uppercase" style={{ color: "#6D6858", fontFamily: mono }}>Email</div>
                <div className="text-sm" style={{ color: ink }}>{teacher.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase" style={{ color: "#6D6858", fontFamily: mono }}>School</div>
                <div className="text-sm" style={{ color: ink }}>{teacher.schoolName || "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase" style={{ color: "#6D6858", fontFamily: mono }}>Joined</div>
                <div className="text-sm" style={{ color: ink }}>{joined}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — subjects, timetable, classes */}
        <div className="lg:col-span-2">
          <div style={{ ...panel, marginBottom: 20 }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} color={brass} />
              <div className="text-lg" style={{ fontFamily: serif, color: ink }}>Subjects Taught</div>
            </div>
            {teacher.subjects?.length ? (
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((s) => (
                  <span key={s.id} style={chip}>{s.name}</span>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: "#8A8370" }}>No subjects assigned yet.</div>
            )}
          </div>

          <div style={{ ...panel, marginBottom: 20 }}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={16} color={brass} />
              <div className="text-lg" style={{ fontFamily: serif, color: ink }}>Timetable</div>
            </div>
            {teacher.schedule?.length ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${hairline}` }}>
                      {["Day", "Period", "Time", "Subject", "Class"].map((h) => (
                        <th key={h} className="text-left py-2 pr-3 text-xs uppercase" style={{ color: "#6D6858", fontFamily: mono, fontWeight: "normal" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacher.schedule.map((row) => (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${hairline}` }}>
                        <td className="py-2.5 pr-3 text-sm" style={{ color: ink }}>{row.dayOfWeek}</td>
                        <td className="py-2.5 pr-3 text-sm" style={{ color: "#8A8370", fontFamily: mono }}>{row.period}</td>
                        <td className="py-2.5 pr-3 text-sm" style={{ color: ink, fontFamily: mono }}>{row.startTime}–{row.endTime}</td>
                        <td className="py-2.5 pr-3 text-sm" style={{ color: ink }}>{row.subject}</td>
                        <td className="py-2.5 pr-3 text-sm" style={{ color: ink }}>
                          <span style={chip}>{row.className}{row.classGrade ? ` · G${row.classGrade}` : ""}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm" style={{ color: "#8A8370" }}>No timetable entries yet.</div>
            )}
          </div>

          <div style={panel}>
            <div className="flex items-center gap-2 mb-3">
              <Users size={16} color={brass} />
              <div className="text-lg" style={{ fontFamily: serif, color: ink }}>Classes</div>
            </div>
            {teacher.classesTaught?.length ? (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {teacher.classesTaught.map((c) => (
                    <span key={c.id} style={chip}>{c.name}</span>
                  ))}
                </div>
                <div className="text-sm" style={{ color: "#8A8370" }}>
                  {teacher.classCount} class{teacher.classCount === 1 ? "" : "es"} · {teacher.studentCount} student{teacher.studentCount === 1 ? "" : "s"}
                </div>
              </>
            ) : (
              <div className="text-sm" style={{ color: "#8A8370" }}>No classes assigned yet.</div>
            )}
          </div>
        </div>
        {/* Right — performance + quick stats */}
        <div>
          <div style={{ ...panel, marginBottom: 20 }}>
            <div className="text-lg mb-3" style={{ fontFamily: serif, color: ink }}>Performance</div>
            {teacher.performances?.length ? (
              <div className="space-y-4">
                {teacher.performances.map((p) => {
                  const label = p.semester === "1" ? "1st Semester" : "2nd Semester";
                  const pct = Math.max(0, Math.min(100, (p.score / 10) * 100));
                  return (
                    <div key={p.semester}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm" style={{ color: "#6D6858" }}>{label}</span>
                        <span className="text-sm" style={{ color: ink, fontFamily: mono }}>{p.score.toFixed(1)} / 10</span>
                      </div>
                      <div className="w-full h-2" style={{ background: "#E9E4D8", borderRadius: "50%" }}>
                        <div className="h-2" style={{ width: `${pct}%`, background: sage, borderRadius: "50%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm" style={{ color: "#8A8370" }}>No performance data yet.</div>
            )}
          </div>

          <div style={panel}>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3" style={{ background: sageLight, borderRadius: 4 }}>
                <div className="text-xl" style={{ color: sage, fontFamily: serif }}>{teacher.classCount}</div>
                <div className="text-xs" style={{ color: "#6D6858" }}>Classes</div>
              </div>
              <div className="text-center p-3" style={{ background: sageLight, borderRadius: 4 }}>
                <div className="text-xl" style={{ color: sage, fontFamily: serif }}>{teacher.studentCount}</div>
                <div className="text-xs" style={{ color: "#6D6858" }}>Students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}