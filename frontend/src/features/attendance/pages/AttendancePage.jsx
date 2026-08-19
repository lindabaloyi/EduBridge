import { useState, useMemo, useEffect } from "react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { MetricCard } from "../../../components/common/MetricCard";
import { theme } from "../../../styles/themes";
import { useClasses } from "../../classes/hooks/useClasses";
import { useClassStudents } from "../../students/hooks/useClassStudents";

const { ink, cardPaper, hairline, sage, sageLight, rust, rustLight } = theme.colors;
const { mono } = theme.fonts;

const selectStyle = (w) => ({
  width: w || 200,
  padding: "8px 10px",
  fontSize: 14,
  color: ink,
  background: cardPaper,
  border: `1px solid ${hairline}`,
  borderRadius: 4,
  fontFamily: mono,
});

export default function AttendancePage() {
  // Get classes from API
  const { data: classes, loading: classesLoading, error: classesError } = useClasses();
  
  // State for selected class
  const [selectedClassId, setSelectedClassId] = useState("");
  const [status, setStatus] = useState({});

  // Get students for the selected class
  const { 
    data: students, 
    loading: studentsLoading, 
    error: studentsError 
  } = useClassStudents(selectedClassId);

  // Get the name of the selected class
  const selectedClassName = useMemo(() => {
    if (!selectedClassId || !classes) return "";
    const cls = classes.find((c) => c.id === selectedClassId);
    return cls ? cls.name : "";
  }, [selectedClassId, classes]);

  // Reset attendance status when students change
  useEffect(() => {
    const initialStatus = {};
    students.forEach((s) => {
      initialStatus[s.id] = "present";
    });
    setStatus(initialStatus);
  }, [students]);

  // Cycle attendance status: present → late → absent → present
  const cycle = (id) => {
    setStatus((prev) => {
      const order = ["present", "late", "absent"];
      const currentIndex = order.indexOf(prev[id]);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % order.length;
      return { ...prev, [id]: order[nextIndex] };
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

  const loading = classesLoading || studentsLoading;
  const error = classesError || studentsError;

  // Show loading state
  if (loading) {
    return (
      <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
        Loading attendance data...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="px-3 py-2 text-sm" style={{ background: rustLight, color: rust, borderRadius: 4 }}>
        Error loading data: {error}
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        eyebrow={new Date().toLocaleDateString(undefined, { 
          weekday: "long", 
          month: "long", 
          day: "numeric" 
        })}
        title={selectedClassName ? `Roll call — ${selectedClassName}` : "Select a class to mark attendance"}
      />

      {/* Class Selector */}
      <div className="mb-6">
        <label className="block">
          <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>
            Class
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={selectStyle()}
          >
            <option value="">— Select a class —</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.grade || "—"}) — {c.studentCount || 0} student{c.studentCount === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Show message if no class selected */}
      {!selectedClassId && (
        <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
          Please select a class to mark attendance
        </div>
      )}

      {/* Show message if class has no students */}
      {selectedClassId && students.length === 0 && (
        <div style={{ color: "#8A8370", textAlign: "center", padding: "40px" }}>
          No students found in this class.
        </div>
      )}

      {/* Show attendance grid if class has students */}
      {selectedClassId && students.length > 0 && (
        <>
          <div className="flex gap-4 mb-6">
            <MetricCard label="Present" value={counts.present || 0} />
            <MetricCard label="Late" value={counts.late || 0} />
            <MetricCard label="Absent" value={counts.absent || 0} />
          </div>

          <div style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
            {/* Header */}
            <div
              className="flex items-center px-4 py-2 text-xs uppercase"
              style={{ 
                borderBottom: `1px solid ${hairline}`, 
                color: "#8A8370", 
                fontFamily: mono, 
                letterSpacing: "0.05em" 
              }}
            >
              <span className="flex-1">Student</span>
              <span style={{ width: 100 }}>Roll no.</span>
              <span style={{ width: 90, textAlign: "center" }}>Mark</span>
            </div>

            {/* Student Rows */}
            {students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center px-4 py-3"
                style={{ 
                  borderBottom: i === students.length - 1 ? "none" : `1px solid ${hairline}` 
                }}
              >
                <span className="flex-1" style={{ color: ink, fontSize: 14 }}>
                  {s.firstName} {s.lastName}
                </span>
                <span style={{ width: 100, fontFamily: mono, fontSize: 12, color: "#8A8370" }}>
                  {s.studentNo}
                </span>
                <div style={{ width: 90, textAlign: "center" }}>
                  <button
                    onClick={() => cycle(s.id)}
                    className="w-8 h-8 inline-flex items-center justify-center text-sm"
                    style={{
                      background: tones[status[s.id]]?.bg || "#f0f0f0",
                      color: tones[status[s.id]]?.fg || "#333",
                      borderRadius: 2,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: mono,
                    }}
                    title="Click to change mark"
                  >
                    {marks[status[s.id]] || "?"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs mt-3" style={{ color: "#8A8370" }}>
            Tap a mark to cycle present → late → absent.
          </p>
        </>
      )}
    </div>
  );
}