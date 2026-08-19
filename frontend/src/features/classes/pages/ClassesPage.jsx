import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useClasses } from "../../../hooks/useClasses";
import { createClass, updateClass, deleteClass } from "../../../api/classes";
import { friendlyError } from "../../../utils/errors";
import ClassFormModal from "../components/ClassFormModal";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight } = theme.colors;
const { serif, mono } = theme.fonts;

export default function ClassesPage() {
  const { data: classes, loading, error, refresh } = useClasses();
  const [modal, setModal] = useState({ open: false, cls: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function openAdd() { setSubmitError(null); setModal({ open: true, cls: null }); }
  function openEdit(c) { setSubmitError(null); setModal({ open: true, cls: c }); }
  function close() { if (submitting) return; setModal({ open: false, cls: null }); setSubmitError(null); }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (modal.cls) await updateClass(modal.cls.id, payload);
      else await createClass(payload);
      setModal({ open: false, cls: null });
      refresh();
    } catch (err) {
      setSubmitError(friendlyError(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete class "${c.name}"?`)) return;
    try {
      await deleteClass(c.id);
      refresh();
    } catch (err) {
      alert(friendlyError(err.message));
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <SectionTitle eyebrow="Student catalog" title="Classes" />
        <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono, fontSize: 13 }}>
          <Plus size={16} /> New Class
        </button>
      </div>

      {error && (
        <div className="mb-3 px-3 py-2 text-sm" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}>
          Could not load classes: {friendlyError(error)}
        </div>
      )}

      {loading ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">Loading classes…</div>
      ) : classes.length === 0 ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">No classes yet. Add your first class.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="p-4" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5" style={{ background: sageLight, color: sage, borderRadius: 2, fontFamily: mono }}>
                  Grade {c.grade || "—"}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} title="Edit" aria-label="Edit" style={iconBtn(brass)}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(c)} title="Delete" aria-label="Delete" style={iconBtn(rust)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontFamily: serif, fontSize: 18, color: ink }}>{c.name}</div>
              <div style={{ fontSize: 13, color: "#8A8370", marginTop: 6 }}>{c.studentCount} student{c.studentCount === 1 ? "" : "s"}</div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <ClassFormModal
          cls={modal.cls}
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