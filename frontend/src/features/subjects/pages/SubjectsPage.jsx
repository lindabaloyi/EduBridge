import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useSubjects } from "../../../hooks/useSubjects";
import { createSubject, updateSubject, deleteSubject } from "../../../api/subjects";
import { friendlyError } from "../../../utils/errors";
import SubjectFormModal from "../components/SubjectFormModal";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight } = theme.colors;
const { serif, mono } = theme.fonts;

export default function SubjectsPage() {
  const { data: subjects, loading, error, refresh } = useSubjects();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, subject: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const filtered = subjects.filter((s) => {
    const q = query.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  function openAdd() { setSubmitError(null); setModal({ open: true, subject: null }); }
  function openEdit(s) { setSubmitError(null); setModal({ open: true, subject: s }); }
  function close() { if (submitting) return; setModal({ open: false, subject: null }); setSubmitError(null); }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (modal.subject) await updateSubject(modal.subject.id, payload);
      else await createSubject(payload);
      setModal({ open: false, subject: null });
      refresh();
    } catch (err) {
      setSubmitError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(s) {
    if (!window.confirm(`Delete subject "${s.name}"?`)) return;
    try {
      await deleteSubject(s.id);
      refresh();
    } catch (err) {
      alert(friendlyError(err.message));
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <SectionTitle eyebrow="Curriculum" title="Subjects" />
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono, fontSize: 13 }}>
          <Plus size={16} /> New Subject
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 mb-4 max-w-sm" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subjects…"
          className="w-full bg-transparent outline-none text-sm"
          style={{ color: ink }}
        />
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 text-sm" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}>
          Could not load subjects: {friendlyError(error)}
        </div>
      )}

      {loading ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">Loading subjects…</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">No subjects found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="p-4" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5" style={{ background: sageLight, color: sage, borderRadius: 2, fontFamily: mono }}>
                  {s.code}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(s)} title="Edit" aria-label="Edit" style={iconBtn(brass)}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(s)} title="Delete" aria-label="Delete" style={iconBtn(rust)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontFamily: serif, fontSize: 17, color: ink }}>{s.name}</div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <SubjectFormModal
          subject={modal.subject}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onClose={close}
        />
      )}
    </div>
  );
}

const iconBtn = (color) => ({ background: "transparent", border: "none", color, padding: 4, cursor: "pointer" });