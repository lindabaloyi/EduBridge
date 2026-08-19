import { useState } from "react";
import { X } from "lucide-react";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { mono } = theme.fonts;

const TYPES = [
  ["ASSIGNMENT", "Assignment"],
  ["TEST", "Test"],
  ["EXAM", "Exam"],
  ["PROJECT", "Project"],
  ["CLASSWORK", "Classwork"],
  ["PRACTICAL", "Practical"],
  ["ORAL", "Oral"],
  ["OTHER", "Other"],
];

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>
        {label}
        {required && <span style={{ color: rust }}> *</span>}
      </span>
      {children}
      {error && <span className="block text-xs mt-1" style={{ color: rust }}>{error}</span>}
    </label>
  );
}

const inputStyle = (err) => ({
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  color: ink,
  background: "#fff",
  border: `1px solid ${err ? rust : hairline}`,
  borderRadius: 4,
  outline: "none",
});

export default function AssessmentFormModal({ assessment, terms, classes, subjects, optionsLoading, optionsError, submitting, submitError, onSubmit, onClose }) {
  const isEdit = Boolean(assessment);
  const [form, setForm] = useState({
    name: assessment?.name ?? "",
    type: assessment?.type ?? "ASSIGNMENT",
    subjectId: assessment?.subjectId ?? "",
    classId: assessment?.classId ?? "",
    termId: assessment?.termId ?? "",
    date: assessment?.date ?? "",
    maxMark: assessment?.maxMark ?? 50,
    weight: assessment?.weight ?? 10,
    description: assessment?.description ?? "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const selectDisabled = (list) => optionsLoading && list.length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.termId) errs.termId = "Term is required";
    if (!form.classId) errs.classId = "Class is required";
    if (!form.subjectId) errs.subjectId = "Subject is required";
    if (!form.date) errs.date = "Date is required";
    if (!form.maxMark || Number(form.maxMark) <= 0) errs.maxMark = "max must be > 0";
    if (form.weight == null || Number(form.weight) < 0) errs.weight = "weight must be >= 0";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...form, maxMark: Number(form.maxMark), weight: Number(form.weight) });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" style={{ background: "rgba(29,43,58,0.55)", paddingTop: 60 }} onMouseDown={onClose}>
      <div className="w-full max-w-md p-5" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 6 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg" style={{ fontFamily: theme.fonts.serif, color: ink }}>
            {isEdit ? "Edit Assessment" : "New Assessment"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "#8A8370" }}>
            <X size={18} />
          </button>
        </div>

        {optionsLoading && (
          <div className="text-xs mb-3" style={{ color: "#8A8370", fontFamily: mono }}>Loading Term / Class / Subject options…</div>
        )}
        {optionsError && !optionsLoading && (
          <div className="text-xs mb-3" style={{ color: rust }}>Couldn't load course options: {optionsError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name" required error={errors.name}>
            <input value={form.name} onChange={set("name")} placeholder="Term Test 1" style={inputStyle(errors.name)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" required error={errors.type}>
              <select value={form.type} onChange={set("type")} style={inputStyle(false)}>
                {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Date" required error={errors.date}>
              <input type="date" value={form.date} onChange={set("date")} style={inputStyle(errors.date)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Term" required error={errors.termId}>
              <select value={form.termId} onChange={set("termId")} disabled={selectDisabled(terms)} style={inputStyle(errors.termId)}>
                <option value="">—</option>
                {terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Class" required error={errors.classId}>
              <select value={form.classId} onChange={set("classId")} disabled={selectDisabled(classes)} style={inputStyle(errors.classId)}>
                <option value="">—</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Subject" required error={errors.subjectId}>
              <select value={form.subjectId} onChange={set("subjectId")} disabled={selectDisabled(subjects)} style={inputStyle(errors.subjectId)}>
                <option value="">—</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Max Mark" required error={errors.maxMark}>
              <input type="number" min="1" value={form.maxMark} onChange={set("maxMark")} style={inputStyle(errors.maxMark)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight" required error={errors.weight}>
              <input type="number" min="0" value={form.weight} onChange={set("weight")} style={inputStyle(errors.weight)} />
            </Field>
            <Field label="Description">
              <input value={form.description} onChange={set("description")} placeholder="Optional" style={inputStyle(false)} />
            </Field>
          </div>

          {submitError && <div className="text-sm" style={{ color: rust }}>{submitError}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${hairline}`, borderRadius: 4, color: ink }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 16px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono }}>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
