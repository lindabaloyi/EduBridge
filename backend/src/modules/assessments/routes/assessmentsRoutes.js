import { Router } from "express";
import {
  handleList,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleStatus,
} from "../controllers/assessmentsController.js";

const router = Router();

router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:id", handleGetById);
router.put("/:id", handleUpdate);
router.delete("/:id", handleDelete);
router.patch("/:id/status", handleStatus);

export { router as assessmentsRoutes };