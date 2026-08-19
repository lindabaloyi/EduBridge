import { prisma } from "../../../database/prisma.js";

const DEV_SCHOOL_CODE = "ELM-001";
const DEV_ADMIN_EMAIL = "admin@elmridge.edu";

async function resolveSchoolId(schoolId) {
  if (schoolId) return schoolId;
  const school = await prisma.school.findUnique({ where: { code: DEV_SCHOOL_CODE } });
  if (!school) throw Object.assign(new Error("Development school not found"), { status: 500 });
  return school.id;
}

async function resolveCurrentUserId() {
  const user = await prisma.user.findFirst({ where: { email: DEV_ADMIN_EMAIL } });
  return user ? user.id : null;
}

// ── Validation ─────────────────────────────────────────────
function validateAnnouncement(data) {
  const errors = {};
  if (!data.title || !String(data.title).trim()) errors.title = "title is required";
  if (!data.body || !String(data.body).trim()) errors.body = "body is required";
  if (!["ANNOUNCEMENT", "NOTICE"].includes(data.kind)) errors.kind = "kind is invalid";
  if (!["EVERYONE", "STAFF", "PARENTS"].includes(data.audience)) errors.audience = "audience is invalid";
  return Object.keys(errors).length ? errors : null;
}

function serializeAnnouncement(a) {
  return {
    id: a.id,
    kind: a.kind,
    title: a.title,
    body: a.body,
    audience: a.audience,
    pinned: a.pinned,
    status: a.status,
    classId: a.classId,
    className: a.class ? a.class.name : null,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
  };
}

// ── Announcements & Notices ────────────────────────────────
export async function listAnnouncements(query = {}) {
  const where = {};
  if (query.kind) where.kind = query.kind;
  if (query.status) where.status = query.status;
  const list = await prisma.announcement.findMany({
    where,
    include: { class: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return list.map(serializeAnnouncement);
}

export async function getAnnouncement(id) {
  const a = await prisma.announcement.findUnique({ where: { id }, include: { class: true } });
  return a ? serializeAnnouncement(a) : null;
}

export async function createAnnouncement(payload) {
  const errors = validateAnnouncement(payload);
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });
  const schoolId = await resolveSchoolId(payload.schoolId);
  const createdById = await resolveCurrentUserId();
  const a = await prisma.announcement.create({
    data: {
      kind: payload.kind,
      title: String(payload.title).trim(),
      body: String(payload.body).trim(),
      audience: payload.audience,
      pinned: !!payload.pinned,
      classId: payload.classId || null,
      createdById,
      schoolId,
    },
    include: { class: true },
  });
  return serializeAnnouncement(a);
}

export async function updateAnnouncement(id, payload) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Announcement not found"), { status: 404 });
  if (existing.status === "PUBLISHED" && payload.title != null) {
    throw Object.assign(new Error("Published announcements cannot be edited; create a new one or unpublish"), { status: 400 });
  }
  const errors = validateAnnouncement({ ...existing, ...payload });
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });
  const a = await prisma.announcement.update({
    where: { id },
    data: {
      kind: payload.kind ?? existing.kind,
      title: payload.title != null ? String(payload.title).trim() : existing.title,
      body: payload.body != null ? String(payload.body).trim() : existing.body,
      audience: payload.audience ?? existing.audience,
      pinned: payload.pinned !== undefined ? !!payload.pinned : existing.pinned,
      classId: payload.classId !== undefined ? payload.classId : existing.classId,
    },
    include: { class: true },
  });
  return serializeAnnouncement(a);
}

export async function setAnnouncementStatus(id, status) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Announcement not found"), { status: 404 });
  if (!["DRAFT", "PUBLISHED"].includes(status)) throw Object.assign(new Error("status is invalid"), { status: 400 });
  const a = await prisma.announcement.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
    include: { class: true },
  });
  return serializeAnnouncement(a);
}

export async function deleteAnnouncement(id) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Announcement not found"), { status: 404 });
  await prisma.announcement.delete({ where: { id } });
  return { id };
}
// ── Recipients (guardians) ─────────────────────────────────
export async function listGuardiansForClasses(classIds = [], schoolId) {
  const ids = (Array.isArray(classIds) ? classIds : String(classIds).split(","))
    .map((s) => String(s).trim())
    .filter(Boolean);
  if (ids.length === 0) return [];
  const resolvedSchoolId = await resolveSchoolId(schoolId);

  const students = await prisma.student.findMany({
    where: { schoolId: resolvedSchoolId, classId: { in: ids } },
    include: { parent: true, class: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const seen = new Set();
  const picked = [];
  for (const s of students) {
    const email = s.parent?.email;
    if (!email) continue; // no guardian email on record
    if (seen.has(email)) continue;
    seen.add(email);
    picked.push({
      email,
      name: s.parent
        ? `${s.parent.firstName} ${s.parent.lastName}`
        : s.guardianName || `${s.firstName} ${s.lastName}`,
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      className: s.class ? s.class.name : null,
      relationship: "GUARDIAN",
    });
  }
  return picked;
}

// ── Messages ───────────────────────────────────────────────
function serializeMessage(m) {
  let recipient = null;
  if (m.toParent) recipient = `${m.toParent.firstName} ${m.toParent.lastName}`;
  else if (m.toClass) recipient = `${m.toClass.name} (parents)`;
  else if (m.toUserId) recipient = "Staff (internal)";
  return {
    id: m.id,
    kind: m.kind,
    subject: m.subject,
    body: m.body,
    senderType: m.senderType,
    senderId: m.senderId,
    senderName: m.senderName,
    toParentId: m.toParentId,
    toClassName: m.toClass ? m.toClass.name : null,
    toUserId: m.toUserId,
    recipient: recipient || "—",
    replyToId: m.replyToId,
    readAt: m.readAt,
    createdAt: m.createdAt,
  };
}

export async function listMessages(query = {}) {
  const where = {};
  if (query.kind) where.kind = query.kind;
  const list = await prisma.message.findMany({
    where,
    include: { toParent: true, toClass: true },
    orderBy: { createdAt: "desc" },
  });
  return list.map(serializeMessage);
}

export async function getMessage(id) {
  const m = await prisma.message.findUnique({ where: { id }, include: { toParent: true, toClass: true } });
  return m ? serializeMessage(m) : null;
}

export async function sendMessage(payload) {
  const { subject, body, kind = "PARENT", senderType = "TEACHER", senderName, toParentId, toClassId, toUserId, replyToId } = payload;
  const errors = {};
  if (!subject || !String(subject).trim()) errors.subject = "subject is required";
  if (!body || !String(body).trim()) errors.body = "body is required";
  if (!senderName || !String(senderName).trim()) errors.senderName = "senderName is required";
  if (!toParentId && !toClassId && !toUserId) errors.recipient = "a recipient (parent, class, or user) is required";
  if (Object.keys(errors).length) throw Object.assign(new Error("Validation failed"), { status: 400, errors });

  const schoolId = await resolveSchoolId(payload.schoolId);
  const base = {
    schoolId,
    kind: ["INTERNAL", "PARENT"].includes(kind) ? kind : "PARENT",
    senderType: ["TEACHER", "SCHOOL", "PARENT"].includes(senderType) ? senderType : "TEACHER",
    senderName: String(senderName).trim(),
    subject: String(subject).trim(),
    body: String(body).trim(),
    replyToId: replyToId || null,
  };

  // Fan-out to every parent of the students in a class (Teacher→Parents, School→Parents).
  if (toClassId) {
    const parents = await prisma.parent.findMany({
      where: { students: { some: { classId: toClassId } } },
    });
    if (parents.length === 0) {
      throw Object.assign(new Error("No parents found for this class"), { status: 400 });
    }
    await prisma.message.createMany({
      data: parents.map((p) => ({ ...base, toClassId, toParentId: p.id, senderId: payload.senderId || null })),
    });
    return { created: parents.length, recipients: parents.length };
  }

  const message = await prisma.message.create({
    data: {
      ...base,
      toParentId: toParentId || null,
      toClassId: toClassId || null,
      toUserId: toUserId || null,
      senderId: payload.senderId || null,
    },
  });
  return { created: 1, id: message.id };
}

export async function markMessageRead(id) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Message not found"), { status: 404 });
  const m = await prisma.message.update({ where: { id }, data: { readAt: new Date() } });
  return serializeMessage(m);
}

export async function deleteMessage(id) {
  const existing = await prisma.message.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Message not found"), { status: 404 });
  await prisma.message.delete({ where: { id } });
  return { id };
}