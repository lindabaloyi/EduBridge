import { get, post, put, del } from "./httpClient";

export function fetchSubjects() {
  return get("/api/subjects");
}

export function createSubject(payload) {
  return post("/api/subjects", payload);
}

export function updateSubject(id, payload) {
  return put(`/api/subjects/${id}`, payload);
}

export function deleteSubject(id) {
  return del(`/api/subjects/${id}`);
}
