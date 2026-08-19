import { useCallback, useEffect, useState } from "react";
import { fetchAssessments } from "../api/assessments";

export function useAssessments(filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAssessments(filters);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.termId, filters.classId, filters.subjectId, filters.type]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
