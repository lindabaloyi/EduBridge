import { useState, useEffect } from 'react';

export function useClassStudents(classId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If no class is selected, clear data and return
    if (!classId) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchClassStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📡 Fetching students for class:', classId);
        
        const response = await fetch(`/api/classes/${classId}/students`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Found', result.data?.length || 0, 'students');
          setData(result.data || []);
        } else {
          console.error('❌ API error:', result.error);
          setError(result.error || 'Failed to fetch students');
          setData([]);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err.message || 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClassStudents();
  }, [classId]); // Re-fetch when classId changes

  return { data, loading, error };
}