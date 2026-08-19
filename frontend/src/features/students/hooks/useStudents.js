import { useCallback, useEffect, useState } from "react"

// Fetches students from the backend API
export function useStudents() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/students")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      if (result.success && result.data) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Unknown error")
      }
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  return { data, loading, error, refresh: fetchStudents }
}

// ── Mutations ───────────────────────────────────────────────
export async function createStudent(studentData) {
  const response = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  })
  const result = await response.json()
  if (!response.ok) {
    const err = new Error(result.error || `HTTP ${response.status}`)
    err.errors = result.errors
    throw err
  }
  return result.data
}

export async function updateStudent(id, studentData) {
  const response = await fetch(`/api/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  })
  const result = await response.json()
  if (!response.ok) {
    const err = new Error(result.error || `HTTP ${response.status}`)
    err.errors = result.errors
    throw err
  }
  return result.data
}

export async function deleteStudent(id) {
  const response = await fetch(`/api/students/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new Error(result.error || `HTTP ${response.status}`)
  }
  return result
}