import {
  getSheet,
  bulkUpsertMarks,
  updateMark,
  importMarks,
  exportCsv,
  finalizeBook,
  getTermResult,
} from "../services/gradebookService.js";

export async function handleGetSheet(req, res, next) {
  try {
    const sheet = await getSheet(req.query);
    res.json({ success: true, data: sheet });
  } catch (err) {
    next(err);
  }
}

export async function handleBulkMarks(req, res, next) {
  try {
    const result = await bulkUpsertMarks(req.params.assessmentId, req.body.marks);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateMark(req, res, next) {
  try {
    const updated = await updateMark(req.params.markId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function handleImport(req, res, next) {
  try {
    const result = await importMarks(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleExport(req, res, next) {
  try {
    const csv = await exportCsv(req.query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="gradebook.csv"');
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

export async function handleFinalize(req, res, next) {
  try {
    const result = await finalizeBook(req.body, req.body.lock !== false);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleTermResult(req, res, next) {
  try {
    const result = await getTermResult(req.params.studentId, req.params.termId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}