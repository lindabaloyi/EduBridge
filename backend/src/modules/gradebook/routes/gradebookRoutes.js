import { Router } from "express";
import {
  handleGetSheet,
  handleBulkMarks,
  handleUpdateMark,
  handleImport,
  handleExport,
  handleFinalize,
  handleTermResult,
} from "../controllers/gradebookController.js";

const router = Router();

router.get("/", handleGetSheet);
router.get("/export", handleExport);
router.post("/import", handleImport);
router.post("/finish", handleFinalize);
router.get("/result/:studentId/term/:termId", handleTermResult);
router.post("/assessments/:assessmentId/marks", handleBulkMarks);
router.put("/marks/:markId", handleUpdateMark);

export { router as gradebookRoutes };