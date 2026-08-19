import { Router } from "express";
import {
  handleList,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleRoster,
} from "../controllers/classesController.js";

const router = Router();

router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:id/students", handleRoster);
router.get("/:id", handleGetById);
router.put("/:id", handleUpdate);
router.delete("/:id", handleDelete);

export { router as classesRoutes };