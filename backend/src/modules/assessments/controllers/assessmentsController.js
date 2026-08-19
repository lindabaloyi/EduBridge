import {
  listAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  updateAssessmentStatus,
} from "../services/assessmentsService.js";

export async function handleList(_req, res, next) {
  try {
    const items = await listAssessments(_req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

export async function handleGetById(req, res, next) {
  try {
    const item = await getAssessment(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Assessment not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleCreate(req, res, next) {
  try {
    const item = await createAssessment(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdate(req, res, next) {
  try {
    const item = await updateAssessment(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    await deleteAssessment(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function handleStatus(req, res, next) {
  try {
    const item = await updateAssessmentStatus(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}