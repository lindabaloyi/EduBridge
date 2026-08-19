import { useCallback, useState } from "react";
import {
  fetchTeachers as fetchTeachersApi,
  searchTeachers as searchTeachersApi,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../api/teachers";

export function useTeachers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeachers = useCallback(async (schoolId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTeachersApi(schoolId);
      setData(Array.isArray(result) ? result : []);
      return result;
    } catch (err) {
      setError(err.message);
      setData([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (searchTerm, schoolId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchTeachersApi(searchTerm, schoolId);
      setData(Array.isArray(result) ? result : []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => createTeacher(payload), []);
  const update = useCallback(async (id, payload) => updateTeacher(id, payload), []);
  const remove = useCallback(async (id) => deleteTeacher(id), []);

  return { data, loading, error, fetchTeachers, search, create, update, remove };
}