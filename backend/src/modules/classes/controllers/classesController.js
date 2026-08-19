import {
  listClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
} from "../services/classesService.js";

export async function handleList(req, res, next) {
  try {
    const items = await listClasses(req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

export async function handleGetById(req, res, next) {
  try {
    const item = await getClassById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Class not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleCreate(req, res, next) {
  try {
    const item = await createClass(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdate(req, res, next) {
  try {
    const item = await updateClass(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteClass(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleRoster(req, res, next) {
  try {
    const students = await getClassStudents(req.params.id);
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
}