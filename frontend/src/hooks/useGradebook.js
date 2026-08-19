import { useCallback, useEffect, useState } from "react";
import { fetchGradebook } from "../api/gradebook";

export function useGradebook() {
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState({ termId: "", classId: "", subjectId: "" });

  const load = useCallback(
    async (sel = selection) => {
      const { termId, classId, subjectId } = sel;
      if (!termId || !classId || !subjectId) return null;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGradebook(sel);
        setSheet(data);
        return data;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [selection]
  );

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
