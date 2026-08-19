import { useEffect, useState, useCallback } from "react";
import { fetchTerms } from "../api/reference";
import { fetchClasses } from "../api/classes";
import { fetchSubjects } from "../api/subjects";

// Loads term / class / subject picker data once.
export function useReferences() {
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, c, s] = await Promise.all([fetchTerms(), fetchClasses(), fetchSubjects()]);
      setTerms(Array.isArray(t) ? t : []);
      setClasses(Array.isArray(c) ? c : []);
      setSubjects(Array.isArray(s) ? s : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { terms, classes, subjects, loading, error, refresh: load };
}
