import { get, post, put } from "./httpClient";

// Fetch the gradebook sheet for a selected term/class/subject.
export function fetchGradebook(sel) {
  return get(`/api/gradebook?termId=${sel.termId}&classId=${sel.classId}&subjectId=${sel.subjectId}`);
}

export function bulkSaveMarks(assessmentId, marks) {
  return post(`/api/gradebook/assessments/${assessmentId}/marks`, { marks });
}

export function saveMark(markId, payload) {
  return put(`/api/gradebook/marks/${markId}`, payload);
}

export function importMarks(assessmentId, rows) {
  return post("/api/gradebook/import", { assessmentId, rows });
}

export function finalizeBook(sel) {
  return post("/api/gradebook/finish", sel);
}

export function exportUrl(sel) {
  return `/api/gradebook/export?termId=${sel.termId}&classId=${sel.classId}&subjectId=${sel.subjectId}`;
}
