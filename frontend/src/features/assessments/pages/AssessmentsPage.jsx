import { useState } from "react";
import { Plus, Pencil, Trash2, Check, Send, Lock } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useReferences } from "../../gradebook/hooks/useReferences";
import { useAssessments, createAssessment, updateAssessment, deleteAssessment, updateAssessmentStatus } from "../hooks/useAssessments";
import AssessmentFormModal from "../components/AssessmentFormModal";

const { ink, cardPaper, hairline, brass, rust, sage, sageLight } = theme.colors;
const { mono } = theme.fonts;

const TYPE_LABELS = { ASSIGNMENT: "Assignment", TEST: "Test", EXAM: "Exam", PROJECT: "Project", CLASSWORK: "Classwork", PRACTICAL: "Practical", ORAL: "Oral", OTHER: "Other" };

const NEXT_ACTION = {
  DRAFT: { status: "PUBLISHED", label: "Publish", icon: Check },
  PUBLISHED: { status: "SUBMITTED_FOR_MODERATION", label: "Submit", icon: Send },
  SUBMITTED_FOR_MODERATION: { status: "MODERATED", label: "Moderate", icon: Check },
  MODERATED: { status: "LOCKED", label: "Finalize", icon: Lock },
  LOCKED: null,
};

function friendlyError(msg) {
  const m = String(msg || "");
  if (/failed to fetch|networkerror|load failed|econnrefused|econnreset|connect/i.test(m)) {
    return "The backend API is unreachable. Start it with `cd backend && npm run dev`, then Retry.";
  }
  return m;
}

export default function AssessmentsPage() {
  const ref = useReferences();
  const pickerError = ref.error ? friendlyError(ref.error) : null;
  const [filters, setFilters] = useState({ termId: "", classId: "", subjectId: "", type: "" });
  const { data, loading, error, refresh } = useAssessments(filters);
  const [modal, setModal] = useState({ open: false, assessment: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  function retry() {
    refresh();
    ref.refresh();
  }

  function fr(m) {
    return friendlyError(m);
  }

  function openCreate() {
    setSubmitError(null);
    setModal({ open: true, assessment: null });
  }
  function openEdit(a) {
    setSubmitError(null);
    setModal({ open: true, assessment: a });
  }
  function close() {
    if (submitting) return;
    setModal({ open: false, assessment: null });
    setSubmitError(null);
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (modal.assessment) await updateAssessment(modal.assessment.id, payload);
      else await createAssessment(payload);
      setModal({ open: false, assessment: null });
      refresh();
    } catch (err) {
      setSubmitError(fr(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(a) {
    if (!window.confirm(`Delete assessment "${a.name}"? Marks will be removed.`)) return;
    try {
      await deleteAssessment(a.id);
      refresh();
    } catch (err) {
      alert(fr(err.message));
    }
  }

  async function handleStatusAction(a) {
    const action = NEXT_ACTION[a.status];
    if (!action) return;
    try {
      await updateAssessmentStatus(a.id, action.status);
      refresh();
    } catch (err) {
      alert(fr(err.message));
    }
  }

  const selectStyle = (w) => ({ width: w || 160, padding: "8px 10px", fontSize: 14, color: ink, background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 });

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <SectionTitle eyebrow="Assessment management" title="Assessments" />
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono, fontSize: 13 }}>
          <Plus size={16} /> New Assessment
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={filters.termId} onChange={setFilter("termId")} style={selectStyle()}>
          <option value="">All terms</option>
          {ref.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select value={filters.classId} onChange={setFilter("classId")} style={selectStyle()}>
          <option value="">All classes</option>
          {ref.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.subjectId} onChange={setFilter("subjectId")} style={selectStyle()}>
          <option value="">All subjects</option>
          {ref.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.type} onChange={setFilter("type")} style={selectStyle()}>
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {pickerError && (
        <div className="mb-3 px-3 py-2 text-sm" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}>
          Could not load Term/Class/Subject options: {pickerError}
        </div>
      )}

      {error && (
        <div className="mb-3 px-3 py-2 text-sm flex items-start justify-between gap-3" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}>
          <span>Could not load assessments: {fr(error)}</span>
          <button onClick={retry} style={{ flexShrink: 0, background: "transparent", border: `1px solid ${rust}`, color: rust, borderRadius: 3, padding: "2px 10px", fontSize: 12, fontFamily: mono, cursor: "pointer" }}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">Loading assessments…</div>
      ) : data.length === 0 ? (
        <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">No assessments found. Create one to start entering marks.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((a) => {
            const action = NEXT_ACTION[a.status];
            const locked = a.status === "LOCKED";
            return (
              <div key={a.id} className="p-4" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5" style={{ background: locked ? theme.colors.rustLight : sageLight, color: locked ? rust : sage, borderRadius: 2, fontFamily: mono }}>
                    {a.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(a)} disabled={locked} title="Edit" style={iconBtn(brass, locked)}><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(a)} disabled={locked} title="Delete" style={iconBtn(rust, locked)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ fontFamily: theme.fonts.serif, fontSize: 17, color: ink }}>{a.name}</div>
                <div style={{ fontSize: 13, color: "#8A8370", marginTop: 2 }}>{TYPE_LABELS[a.type] || a.type} · {a.className} · {a.subject}</div>
                <div className="flex flex-wrap gap-x-4 mt-3 text-xs" style={{ color: "#6D6858", fontFamily: mono }}>
                  <span>Date {a.date}</span>
                  <span>Max {a.maxMark}</span>
                  <span>Weight {a.weight}</span>
                  <span>{a.markCount} rows</span>
                </div>
                {action && (
                  <button onClick={() => handleStatusAction(a)} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, padding: "6px 12px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono, fontSize: 12 }}>
                    <action.icon size={14} /> {action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <AssessmentFormModal
          assessment={modal.assessment}
          terms={ref.terms}
          classes={ref.classes}
          subjects={ref.subjects}
          optionsLoading={ref.loading}
          optionsError={fr(ref.error)}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
          onClose={close}
        />
      )}
    </div>
  );
}

const iconBtn = (color, disabled) => ({ background: "transparent", border: "none", color, padding: 4, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.35 : 1 });
