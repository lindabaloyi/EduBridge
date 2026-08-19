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

export function useSubjects() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subjects");
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setData(Array.isArray(body.data) ? body.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export async function createSubject(payload) {
  return parse(await fetch("/api/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
}

export async function updateSubject(id, payload) {
  return parse(await fetch(`/api/subjects/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
}

export async function deleteSubject(id) {
  const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
  if (!res.ok) throw await parseError(res);
  return true;
}

async function parseError(res) {
  const body = await res.json().catch(() => ({}));
  return new Error(body.error || `HTTP ${res.status}`);
}