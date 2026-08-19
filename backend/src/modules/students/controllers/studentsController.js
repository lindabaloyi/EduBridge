import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../services/studentsService.js';

// ── READ ─────────────────────────────────────────────────────
export async function handleGetStudents(_req, res, next) {
  try {
    const students = await getStudents();
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
}

export async function handleGetStudentById(req, res, next) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// ── CREATE ───────────────────────────────────────────────────
export async function handleCreateStudent(req, res, next) {
  try {
    const student = await createStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// ── UPDATE ───────────────────────────────────────────────────
export async function handleUpdateStudent(req, res, next) {
  try {
    const student = await updateStudent(req.params.id, req.body);
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
}

// ── DELETE ───────────────────────────────────────────────────
export async function handleDeleteStudent(req, res, next) {
  try {
    await deleteStudent(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}