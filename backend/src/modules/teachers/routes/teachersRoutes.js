import { Router } from "express";
import {
  handleList,
  handleGetById,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleSearch,
} from "../controllers/teachersController.js";

const router = Router();

router.get("/", handleList);
router.get("/search", handleSearch);
router.get("/:id", handleGetById);
router.post("/", handleCreate);
router.put("/:id", handleUpdate);
router.delete("/:id", handleDelete);

export { router as teachersRoutes };