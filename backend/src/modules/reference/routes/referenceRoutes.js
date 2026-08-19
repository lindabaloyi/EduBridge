import { Router } from "express";
import { handleListTerms } from "../controllers/referenceController.js";

const router = Router();

router.get("/terms", handleListTerms);

export { router as referenceRoutes };