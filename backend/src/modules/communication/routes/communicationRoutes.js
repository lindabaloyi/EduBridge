import { Router } from "express";
import {
  handleListAnnouncements,
  handleGetAnnouncement,
  handleCreateAnnouncement,
  handleUpdateAnnouncement,
  handleAnnouncementStatus,
  handleDeleteAnnouncement,
  handleListMessages,
  handleGetMessage,
  handleSendMessage,
  handleMarkRead,
  handleDeleteMessage,
} from "../controllers/communicationController.js";

const router = Router();

// Announcements & Notices
router.get("/announcements", handleListAnnouncements);
router.post("/announcements", handleCreateAnnouncement);
router.get("/announcements/:id", handleGetAnnouncement);
router.put("/announcements/:id", handleUpdateAnnouncement);
router.patch("/announcements/:id/status", handleAnnouncementStatus);
router.delete("/announcements/:id", handleDeleteAnnouncement);

// Messages
router.get("/messages", handleListMessages);
router.post("/messages", handleSendMessage);
router.get("/messages/:id", handleGetMessage);
router.patch("/messages/:id/read", handleMarkRead);
router.delete("/messages/:id", handleDeleteMessage);

export { router as communicationRoutes };