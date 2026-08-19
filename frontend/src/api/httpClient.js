// Centralized fetch helper for the EduBridge API.
// All requests go through here so error/response handling lives in one place.

async function parseResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || `HTTP ${res.status}`);
    err.errors = body.errors;
    err.status = res.status;
    throw err;
  }
  return body.data;
}

async function request(path, options = {}) {
  return parseResponse(await fetch(path, options));
}

// Build a query string from a params object, skipping empty values.
export function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export function get(path) {
  return request(path);
}

export function post(path, payload) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function put(path, payload) {
  return request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function patch(path, payload) {
  return request(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function del(path) {
  await request(path, { method: "DELETE" });
  return true;
}
