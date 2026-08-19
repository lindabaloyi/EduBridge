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

function toQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function useAssessments(filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await parse(await fetch(`/api/assessments${toQuery(filters)}`)));
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

export async function createAssessment(payload) {
  return parse(await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
}

export async function updateAssessment(id, payload) {
  return parse(await fetch(`/api/assessments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }));
}

export async function deleteAssessment(id) {
  const res = await fetch(`/api/assessments/${id}`, { method: "DELETE" });
  if (!res.ok) throw await parseError(res);
  return true;
}

export async function updateAssessmentStatus(id, status, moderationNote) {
  return parse(await fetch(`/api/assessments/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, moderationNote }) }));
}

async function parseError(res) {
  const body = await res.json().catch(() => ({}));
  return new Error(body.error || `HTTP ${res.status}`);
}