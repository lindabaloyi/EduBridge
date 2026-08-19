import { get, post, put, patch, del, buildQuery } from "./httpClient";

export function fetchAssessments(filters = {}) {
  return get(`/api/assessments${buildQuery(filters)}`);
}

export function createAssessment(payload) {
  return post("/api/assessments", payload);
}

export function updateAssessment(id, payload) {
  return put(`/api/assessments/${id}`, payload);
}

export function deleteAssessment(id) {
  return del(`/api/assessments/${id}`);
}

export function updateAssessmentStatus(id, status, moderationNote) {
  return patch(`/api/assessments/${id}/status`, { status, moderationNote });
}
