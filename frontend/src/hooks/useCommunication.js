import { useCallback, useState } from "react";
import { useClasses } from "./useClasses";
import { fetchGuardians, sendEmail } from "../api/communication";

// Drives the Communication feature: class options come from the real /api/classes
// endpoint and guardians (with real emails) come from /api/communication/guardians.
export function useCommunication() {
  const {
    data: classes,
    loading: loadingClasses,
    error: classesError,
    refresh: refreshClasses,
  } = useClasses();

  const [guardians, setGuardians] = useState([]);
  const [loadingGuardians, setLoadingGuardians] = useState(false);
  const [error, setError] = useState(null);

  const loadGuardians = useCallback(async (classIds) => {
    if (!classIds || classIds.length === 0) {
      setGuardians([]);
      return [];
    }
    setLoadingGuardians(true);
    setError(null);
    try {
      const result = await fetchGuardians(classIds);
      setGuardians(Array.isArray(result) ? result : []);
      return result;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoadingGuardians(false);
    }
  }, []);

  return {
    classes,
    loadingClasses,
    classesError,
    guardians,
    loadingGuardians,
    error,
    loadGuardians,
    refreshClasses,
    sendEmail,
  };
}
