import { Router } from "express";
import {
  handleList,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete,
} from "../controllers/subjectsController.js";

const router = Router();

router.get("/", handleList);
router.post("/", handleCreate);
router.get("/:id", handleGetById);
router.put("/:id", handleUpdate);
router.delete("/:id", handleDelete);

export { router as subjectsRoutes };