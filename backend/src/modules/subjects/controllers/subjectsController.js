import {
  listSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services/subjectsService.js";

export async function handleList(_req, res, next) {
  try {
    const items = await listSubjects();
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

export async function handleGetById(req, res, next) {
  try {
    const item = await getSubjectById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Subject not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleCreate(req, res, next) {
  try {
    const item = await createSubject(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdate(req, res, next) {
  try {
    const item = await updateSubject(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteSubject(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}