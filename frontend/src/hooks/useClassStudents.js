import { useState, useEffect } from "react";
import { fetchClassStudents } from "../api/classes";

// Loads the roster of students for a selected class.
export function useClassStudents(classId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no class is selected, clear data and return.
    if (!classId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchClassStudents(classId);
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        setError(err.message || "An error occurred");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [classId]); // Re-fetch when classId changes

  return { data, loading, error };
}
