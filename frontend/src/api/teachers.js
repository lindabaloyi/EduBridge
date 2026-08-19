import { get, post, put, del, buildQuery } from "./httpClient";

export function fetchTeachers(schoolId) {
  return get(`/api/teachers${buildQuery({ schoolId })}`);
}

export function getTeacherById(id) {
  return get(`/api/teachers/${id}`);
}

export function searchTeachers(searchTerm, schoolId) {
  return get(`/api/teachers/search${buildQuery({ q: searchTerm, schoolId })}`);
}

export function createTeacher(data) {
  return post("/api/teachers", data);
}

export function updateTeacher(id, data) {
  return put(`/api/teachers/${id}`, data);
}

export function deleteTeacher(id) {
  return del(`/api/teachers/${id}`);
}