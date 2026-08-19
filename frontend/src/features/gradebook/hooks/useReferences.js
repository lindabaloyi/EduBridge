import { useEffect, useState, useCallback } from "react";

async function loadList(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return body.success && Array.isArray(body.data) ? body.data : [];
}

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
      const [t, c, s] = await Promise.all([
        loadList("/api/terms"),
        loadList("/api/classes"),
        loadList("/api/subjects"),
      ]);
      setTerms(t);
      setClasses(c);
      setSubjects(s);
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

// Fetches the roster of students for a class (id => {id, studentNo, firstName, lastName}).
export async function fetchClassStudents(classId) {
  const res = await fetch(`/api/classes/${classId}/students`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return Array.isArray(body.data) ? body.data : [];
}