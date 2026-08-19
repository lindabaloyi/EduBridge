import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useStudents, createStudent, updateStudent, deleteStudent } from "../hooks/useStudents";
import StudentCard from "../components/StudentCard";
import StudentFormModal from "../components/StudentFormModal";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { mono } = theme.fonts;

export default function StudentsPage() {
  const { data: students, loading, error, refresh } = useStudents();
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [modal, setModal] = useState({ open: false, student: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const classes = useMemo(() => {
    const map = new Map();
    (students ?? []).forEach((s) => {
      if (s.classId && s.grade) map.set(s.classId, { value: s.classId, label: s.grade });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [students]);

  const gradeOptions = useMemo(
    () =>
      [...new Set((students ?? []).map((s) => s.grade).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [students]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return (students ?? []).filter((s) => {
      const matchesGrade =
        gradeFilter === "All" ||
        (gradeFilter === "Unassigned" ? !s.grade : s.grade === gradeFilter);
      const matchesQuery =
        !q ||
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.studentNo?.toLowerCase().includes(q);
      return matchesGrade && matchesQuery;
    });
  }, [students, query, gradeFilter]);

  function openAdd() {
    setSubmitError(null);
    setModal({ open: true, student: null });
  }

  function openEdit(student) {
    setSubmitError(null);
    setModal({ open: true, student });
  }

  function closeModal() {
    if (submitting) return;
    setModal({ open: false, student: null });
    setSubmitError(null);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (modal.student) {
        await updateStudent(modal.student.id, payload);
      } else {
        await createStudent(payload);
      }
      setModal({ open: false, student: null });
      refresh();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(student) {
    const ok = window.confirm(
      `Delete ${student.firstName} ${student.lastName} (${student.studentNo})? This cannot be undone.`
    );
    if (!ok) return;
    try {
      await deleteStudent(student.id);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <SectionTitle eyebrow="Student catalog" title="Students" />
        <button
          type="button"
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: brass,
            border: "none",
            borderRadius: 4,
            color: "#fff",
            fontFamily: mono,
            fontSize: 13,
          }}
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {error && (
        <div
          className="mb-4 px-3 py-2 text-sm"
          style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}
        >
          Could not load students: {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div
          className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[220px]"
          style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}
        >
          <Search size={16} color="#8A8370" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or student number"
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: ink }}
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 text-sm outline-none"
          style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4, color: ink }}
        >
          <option value="All">All grades</option>
          {gradeOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>

      {loading ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">
          Loading students…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">
          {query || gradeFilter !== "All" ? "No students match this search." : "No students yet. Add your first student."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <StudentCard key={s.id} student={s} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal.open && (
        <StudentFormModal
          student={modal.student}
          classes={classes}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}