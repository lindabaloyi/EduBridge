import { useState } from "react";
import { X } from "lucide-react";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { mono } = theme.fonts;

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

export default function ClassFormModal({ cls, submitting, submitError, onSubmit, onClose }) {
  const isEdit = Boolean(cls);
  const [form, setForm] = useState({ name: cls?.name ?? "", grade: cls?.grade ?? "" });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Class name is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ name: form.name.trim(), grade: form.grade.trim() || null });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4" style={{ background: "rgba(29,43,58,0.55)", paddingTop: 60 }} onMouseDown={onClose}>
      <div className="w-full max-w-sm p-5" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 6 }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg" style={{ fontFamily: theme.fonts.serif, color: ink }}>
            {isEdit ? "Edit Class" : "New Class"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "transparent", border: "none", color: "#8A8370" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>
              Class Name <span style={{ color: rust }}>*</span>
            </span>
            <input value={form.name} onChange={set("name")} placeholder="Grade 9-A" style={inputStyle(errors.name)} />
            {errors.name && <span className="block text-xs mt-1" style={{ color: rust }}>{errors.name}</span>}
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>Grade</span>
            <input value={form.grade} onChange={set("grade")} placeholder="9" style={inputStyle(false)} />
          </label>

          {submitError && <div className="text-sm" style={{ color: rust }}>{submitError}</div>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${hairline}`, borderRadius: 4, color: ink }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: "8px 16px", background: brass, border: "none", borderRadius: 4, color: "#fff", fontFamily: mono }}>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}