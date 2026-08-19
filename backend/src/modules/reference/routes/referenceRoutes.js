import { Router } from "express";
import { listTerms } from "../services/referenceService.js";

const router = Router();

router.get("/terms", async (_req, res, next) => {
  try {
    res.json({ success: true, data: await listTerms() });
  } catch (err) {
    next(err);
  }
});

export { router as referenceRoutes };