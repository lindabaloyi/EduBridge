import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  searchTeachers,
} from "../services/teachersService.js";

export async function handleList(req, res, next) {
  try {
    const teachers = await getTeachers(req.query.schoolId);
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (err) {
    next(err);
  }
}

export async function handleGetById(req, res, next) {
  try {
    const t = await getTeacherById(req.params.id);
    if (!t) return res.status(404).json({ success: false, error: "Teacher not found" });
    res.json({ success: true, data: t });
  } catch (err) {
    next(err);
  }
}

export async function handleCreate(req, res, next) {
  try {
    const t = await createTeacher(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdate(req, res, next) {
  try {
    const t = await updateTeacher(req.params.id, req.body);
    res.json({ success: true, data: t });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteTeacher(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleSearch(req, res, next) {
  try {
    if (!req.query.q) {
      return res.status(400).json({ success: false, error: "Search term is required" });
    }
    const teachers = await searchTeachers(req.query.schoolId, req.query.q);
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (err) {
    next(err);
  }
}