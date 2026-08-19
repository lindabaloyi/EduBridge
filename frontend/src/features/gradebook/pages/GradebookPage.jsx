import { useMemo, useRef, useState } from "react";
import { Download, FileUp, Lock, Save } from "lucide-react";
import { SectionTitle } from "../../../components/common/SectionTitle";
import { theme } from "../../../styles/themes";
import { useReferences } from "../../../hooks/useReferences";
import { useGradebook } from "../../../hooks/useGradebook";
import { bulkSaveMarks, importMarks, finalizeBook, exportUrl } from "../../../api/gradebook";
import { toImportRows } from "../../../utils/gradeCsv";
import GradebookSheet from "../components/GradebookSheet";

const { ink, cardPaper, hairline, brass, rust, sage } = theme.colors;
const { mono } = theme.fonts;

const selectStyle = (w) => ({
  width: w || 180,
  padding: "8px 10px",
  fontSize: 14,
  color: ink,
  background: cardPaper,
  border: `1px solid ${hairline}`,
  borderRadius: 4,
});

const btn = (bg, isDisabled) => ({
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontFamily: mono,
  background: bg,
  border: "none",
  borderRadius: 4,
  color: "#fff",
  opacity: isDisabled ? 0.5 : 1,
  cursor: isDisabled ? "not-allowed" : "pointer",
});

const btnLink = () => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  fontSize: 13,
  fontFamily: mono,
  background: cardPaper,
  border: `1px solid ${hairline}`,
  borderRadius: 4,
  color: ink,
  textDecoration: "none",
});

export default function GradebookPage() {
  const ref = useReferences();
  const { sheet, loading, error, selection, select, refresh } = useGradebook();
  const [staged, setStaged] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [importTarget, setImportTarget] = useState("");
  const [importSummary, setImportSummary] = useState(null);
  const fileRef = useRef(null);

  const dirty = useMemo(() => Object.keys(staged).length, [staged]);
  const hasSel = Object.values(selection).every(Boolean);

  const lockedColumns = sheet ? sheet.assessments.filter((a) => a.status === "LOCKED").length : 0;
  const lockedAll = sheet && sheet.assessments.length > 0 && lockedColumns === sheet.assessments.length;
  const assessmentSummary =
    sheet ? `${sheet.students.length} students · ${sheet.assessments.length} assessments · ${lockedColumns} locked` : "";
  const assessmentsForImport = sheet ? sheet.assessments : [];

  function onStage(studentId, assessmentId, patch) {
    setStaged((prev) => ({ ...prev, [`${studentId}|${assessmentId}`]: patch }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const byAssessment = {};
      for (const [key, patch] of Object.entries(staged)) {
        const [studentId, assessmentId] = key.split("|");
        (byAssessment[assessmentId] = byAssessment[assessmentId] || []).push({ studentId, mark: patch.mark, status: patch.status });
      }
      let updated = 0;
      for (const [assessmentId, marks] of Object.entries(byAssessment)) {
        const r = await bulkSaveMarks(assessmentId, marks);
        updated += r.updated || 0;
      }
      setStaged({});
      setMessage({ kind: "ok", text: `Saved ${updated} mark(s). Percentages updated.` });
      refresh();
    } catch (err) {
      setMessage({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !importTarget) return;
    try {
      const text = await file.text();
      const rows = toImportRows(text);
      const result = await importMarks(importTarget, rows);
      setImportSummary(result);
      setMessage({ kind: "ok", text: `Imported: ${result.created} created / ${result.updated} updated / ${result.notFound} not found.` });
      e.target.value = "";
      refresh();
    } catch (err) {
      setMessage({ kind: "err", text: err.message });
    }
  }

  async function handleFinalize() {
    if (!window.confirm("Finalize / Lock this gradebook? Marks can no longer be edited.")) return;
    try {
      await finalizeBook(selection);
      setMessage({ kind: "ok", text: "Gradebook finalized & locked." });
      refresh();
    } catch (err) {
      setMessage({ kind: "err", text: err.message });
    }
  }

  return (
<div>
      <SectionTitle eyebrow="Mark book" title="Gradebook" />

      {error && !hasSel && (
        <div className="mb-3 text-sm" style={{ color: "#8A8370" }}>Could not load pickers: {error}</div>
      )}

      {/* Selectors */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="block">
          <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>Term</span>
          <select value={selection.termId} onChange={(e) => select({ ...selection, termId: e.target.value })} style={selectStyle()}>
            <option value="">—</option>
            {ref.terms.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>Class</span>
          <select value={selection.classId} onChange={(e) => select({ ...selection, classId: e.target.value })} style={selectStyle()}>
            <option value="">—</option>
            {ref.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide mb-1" style={{ color: "#6D6858", fontFamily: mono }}>Subject</span>
          <select value={selection.subjectId} onChange={(e) => select({ ...selection, subjectId: e.target.value })} style={selectStyle()}>
            <option value="">—</option>
            {ref.subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      {message && (
        <div className="mb-3 px-3 py-2 text-sm" style={{ background: message.kind === "err" ? theme.colors.rustLight : theme.colors.sageLight, color: message.kind === "err" ? rust : sage, borderRadius: 4 }}>
          {message.text}
        </div>
      )}

      {!hasSel && (
        <div style={{ color: "#8A8370" }} className="py-10 text-center text-sm">Select a term, class and subject to open the mark sheet.</div>
      )}

      {hasSel && loading && <div style={{ color: "#8A8370" }} className="py-8 text-center text-sm">Loading mark sheet…</div>}

      {hasSel && !loading && error && (
        <div className="px-3 py-2 text-sm" style={{ background: theme.colors.rustLight, color: rust, borderRadius: 4 }}>Could not load sheet: {error}</div>
      )}

      {hasSel && !loading && sheet && (
<>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button onClick={handleSave} disabled={saving || dirty === 0} style={btn(brass, dirty === 0 || saving)}>
              <Save size={15} /> Save {dirty > 0 ? `(${dirty})` : ""}
            </button>
            <a href={exportUrl(selection)} download="gradebook.csv" style={btnLink()}>
              <Download size={15} /> Export CSV
            </a>
            <button onClick={handleFinalize} disabled={lockedAll} style={btn("#6A4C93", lockedAll)}>
              <Lock size={15} /> Finalize / Lock
            </button>
            <div className="flex-1" />
            <span style={{ fontSize: 12, color: "#6D6858", fontFamily: mono }}>{assessmentSummary}</span>
          </div>

          <GradebookSheet sheet={sheet} staged={staged} onStage={onStage} disabled={saving} />

          <div className="mt-4 p-4" style={{ background: cardPaper, border: `1px solid ${hairline}`, borderRadius: 4 }}>
            <div className="flex items-center gap-2 mb-2" style={{ color: ink, fontFamily: theme.fonts.serif }}>
              <FileUp size={16} color={brass} /> Import marks (CSV)
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <select value={importTarget} onChange={(e) => setImportTarget(e.target.value)} style={selectStyle(200)}>
                <option value="">Pick an assessment column…</option>
                {assessmentsForImport.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} style={{ fontSize: 13 }} />
            </div>
            <div className="mt-2 text-xs" style={{ color: "#8A8370", fontFamily: mono }}>
              Columns: Student No, Mark, (optional) Status — header recommended. Example: "STU-1042, 38, GRADED"
            </div>
            {importSummary && (
              <div className="mt-2 text-xs" style={{ color: sage }}>
                Imported: {importSummary.created} created · {importSummary.updated} updated · {importSummary.notFound} not found {importSummary.notFound > 0 ? "(won't match)" : ""}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}