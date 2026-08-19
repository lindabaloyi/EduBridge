import { get, post, put, del } from "./httpClient";

export function fetchStudents() {
  return get("/api/students");
}

export function createStudent(payload) {
  return post("/api/students", payload);
}

export function updateStudent(id, payload) {
  return put(`/api/students/${id}`, payload);
}

export function deleteStudent(id) {
  return del(`/api/students/${id}`);
}
