import { get, post, put, del } from "./httpClient";

export function fetchClasses() {
  return get("/api/classes");
}

export function createClass(payload) {
  return post("/api/classes", payload);
}

export function updateClass(id, payload) {
  return put(`/api/classes/${id}`, payload);
}

export function deleteClass(id) {
  return del(`/api/classes/${id}`);
}

// Roster of students assigned to a class (id => {id, studentNo, firstName, lastName}).
export function fetchClassStudents(classId) {
  return get(`/api/classes/${classId}/students`);
}
