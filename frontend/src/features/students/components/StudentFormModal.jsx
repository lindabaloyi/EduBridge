import { useState } from "react";
import { X } from "lucide-react";
import { theme } from "../../../styles/themes";

const { ink, cardPaper, hairline, brass, rust } = theme.colors;
const { mono } = theme.fonts;

function Field({ label, required, children, error }) {
  return (
    <label className="block">
      <span
        className="block text-xs uppercase tracking-wide mb-1"
        style={{ color: "#6D6858", fontFamily: mono }}
      >
        {label}
        {required && <span style={{ color: rust }}> *</span>}
      </span>
      {children}
      {error && (
        <span className="block text-xs mt-1" style={{ color: rust }}>
          {error}
        </span>
      )}
    </label>
  );
}

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "8px 10px",
  fontSize: 14,
  color: theme.colors.ink,
  background: "#fff",
  border: `1px solid ${hasError ? rust : hairline}`,
  borderRadius: 4,
  outline: "none",
});

export default function StudentFormModal({
  student,
  classes,
  submitting,
  submitError,
  onSubmit,
  onClose,
}) {
  const isEdit = Boolean(student);

  const [form, setForm] = useState({
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    gender: student?.gender ?? "",
    dateOfBirth: student?.dateOfBirth ?? "",
    guardianName: student?.guardianName ?? "",
    guardianPhone: student?.guardianPhone ?? "",
    attendance: student?.attendance ?? "",
    averageGrade: student?.averageGrade ?? "",
    classId: student?.classId ?? "",
  });

  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      firstName: form.firstName,
      lastName: form.lastName,
      gender: form.gender || null,
      dateOfBirth: form.dateOfBirth || null,
      guardianName: form.guardianName || null,
      guardianPhone: form.guardianPhone || null,
      attendance: form.attendance === "" ? null : Number(form.attendance),
      averageGrade: form.averageGrade || null,
      classId: form.classId || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4"
      style={{ background: "rgba(29,43,58,0.55)", paddingTop: 60 }}
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md p-5"
        style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 6 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg"
            style={{ fontFamily: theme.fonts.serif, color: ink }}
          >
            {isEdit ? "Edit Student" : "Add Student"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", color: "#8A8370" }}
          >
            <X size={18} />
          </button>
        </div>

        {!isEdit && (
          <div 
            className="mb-4 px-3 py-2 text-sm"
            style={{ 
              background: "#E8F0E9", 
              color: "#4A7C59", 
              borderRadius: 4,
              fontFamily: mono,
            }}
          >
            ℹ️ Student number will be automatically assigned by the system.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" required error={errors.firstName}>
              <input
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="Amara"
                style={inputStyle(errors.firstName)}
              />
            </Field>
            <Field label="Last Name" required error={errors.lastName}>
              <input
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Okafor"
                style={inputStyle(errors.lastName)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={set("gender")}
                style={inputStyle(false)}
              >
                <option value="">—</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={set("dateOfBirth")}
                style={inputStyle(false)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Class">
              <select value={form.classId} onChange={set("classId")} style={inputStyle(false)}>
                <option value="">Unassigned</option>
                {classes.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Guardian Name">
              <input
                value={form.guardianName}
                onChange={set("guardianName")}
                placeholder="Chidi Okafor"
                style={inputStyle(false)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Guardian Phone">
              <input
                value={form.guardianPhone}
                onChange={set("guardianPhone")}
                placeholder="+27 82 000 1042"
                style={inputStyle(false)}
              />
            </Field>
            <Field label="Attendance %">
              <input
                type="number"
                min="0"
                max="100"
                value={form.attendance}
                onChange={set("attendance")}
                style={inputStyle(false)}
                placeholder="85"
              />
            </Field>
          </div>

          <div>
            <Field label="Average Grade">
              <select value={form.averageGrade} onChange={set("averageGrade")} style={inputStyle(false)}>
                <option value="">—</option>
                {["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {submitError && (
            <div className="text-sm" style={{ color: rust }}>
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "8px 14px",
                background: "transparent",
                border: `1px solid ${hairline}`,
                borderRadius: 4,
                color: ink,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 16px",
                background: brass,
                border: "none",
                borderRadius: 4,
                color: "#fff",
                fontFamily: mono,
                cursor: "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}