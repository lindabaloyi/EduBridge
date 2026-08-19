import { useCallback, useEffect, useState } from "react";

async function parse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.errors = body.errors;
    throw err;
  }
  return body.data;
}

// Fetch the gradebook sheet for a selected term/class/subject.
export function useGradebook() {
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState({ termId: "", classId: "", subjectId: "" });

  const load = useCallback(async (sel = selection) => {
    const { termId, classId, subjectId } = sel;
    if (!termId || !classId || !subjectId) return null;
    setLoading(true);
    setError(null);
    try {
      const data = await parse(await fetch(`/api/gradebook?termId=${termId}&classId=${classId}&subjectId=${subjectId}`));
      setSheet(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selection]);

  const select = useCallback((sel) => {
    setSelection(sel);
    return sel;
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.termId, selection.classId, selection.subjectId]);

  return { sheet, loading, error, selection, select, refresh: load };
}

export async function bulkSaveMarks(assessmentId, marks) {
  return parse(
    await fetch(`/api/gradebook/assessments/${assessmentId}/marks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marks }),
    })
  );
}

export async function saveMark(markId, payload) {
  return parse(
    await fetch(`/api/gradebook/marks/${markId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function importMarks(assessmentId, rows) {
  return parse(
    await fetch("/api/gradebook/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId, rows }),
    })
  );
}

export async function finalizeBook(sel) {
  return parse(
    await fetch("/api/gradebook/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sel),
    })
  );
}

export function exportUrl(sel) {
  return `/api/gradebook/export?termId=${sel.termId}&classId=${sel.classId}&subjectId=${sel.subjectId}`;
}