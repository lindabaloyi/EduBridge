import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  setAnnouncementStatus,
  deleteAnnouncement,
  listMessages,
  getMessage,
  sendMessage,
  markMessageRead,
  deleteMessage,
  listGuardiansForClasses,
} from "../services/communicationService.js";

// ── Announcements & Notices ────────────────────────────────
export async function handleListAnnouncements(req, res, next) {
  try {
    const items = await listAnnouncements(req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

export async function handleGetAnnouncement(req, res, next) {
  try {
    const item = await getAnnouncement(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Announcement not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateAnnouncement(req, res, next) {
  try {
    const item = await createAnnouncement(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateAnnouncement(req, res, next) {
  try {
    const item = await updateAnnouncement(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleAnnouncementStatus(req, res, next) {
  try {
    const item = await setAnnouncementStatus(req.params.id, req.body.status);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteAnnouncement(req, res, next) {
  try {
    await deleteAnnouncement(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Messages ───────────────────────────────────────────────
export async function handleListMessages(req, res, next) {
  try {
    const items = await listMessages(req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}

export async function handleGetMessage(req, res, next) {
  try {
    const item = await getMessage(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Message not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleSendMessage(req, res, next) {
  try {
    const result = await sendMessage(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function handleMarkRead(req, res, next) {
  try {
    const item = await markMessageRead(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteMessage(req, res, next) {
  try {
    await deleteMessage(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Recipients (guardians) ─────────────────────────────────
export async function handleListGuardians(req, res, next) {
  try {
    const items = await listGuardiansForClasses(req.query.classIds, req.query.schoolId);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
}