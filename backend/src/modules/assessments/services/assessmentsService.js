import { prisma } from "../../../database/prisma.js";

const DEV_SCHOOL_CODE = "ELM-001";
const DEV_ADMIN_EMAIL = "admin@elmridge.edu";

const ASSESSMENT_TYPES = [
  "ASSIGNMENT",
  "TEST",
  "EXAM",
  "PROJECT",
  "CLASSWORK",
  "PRACTICAL",
  "ORAL",
  "OTHER",
];

const STATUS_FLOW = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["SUBMITTED_FOR_MODERATION", "DRAFT", "LOCKED"],
  SUBMITTED_FOR_MODERATION: ["MODERATED", "DRAFT"],
  MODERATED: ["LOCKED", "DRAFT"],
  LOCKED: [],
};

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
export function validateAssessment(data) {
  const errors = {};
  if (!data.name || !String(data.name).trim()) errors.name = "name is required";
  if (!ASSESSMENT_TYPES.includes(data.type)) errors.type = "type is invalid";
  if (!data.subjectId) errors.subjectId = "subject is required";
  if (!data.classId) errors.classId = "class is required";
  if (!data.termId) errors.termId = "term is required";
  const max = Number(data.maxMark);
  if (data.maxMark == null || !Number.isFinite(max) || max <= 0) errors.maxMark = "maxMark must be a positive number";
  const weight = Number(data.weight);
  if (data.weight == null || !Number.isFinite(weight) || weight < 0) errors.weight = "weight must be >= 0";
  if (data.date && Number.isNaN(Date.parse(data.date))) errors.date = "date is invalid";
  return Object.keys(errors).length ? errors : null;
}

function serialize(a) {
  return {
    id: a.id,
    name: a.name,
    type: a.type,
    date: a.date ? a.date.toISOString().split("T")[0] : null,
    maxMark: a.maxMark,
    weight: a.weight,
    description: a.description,
    subjectId: a.subjectId,
    subject: a.subject ? a.subject.name : null,
    classId: a.classId,
    className: a.class ? a.class.name : null,
    termId: a.termId,
    termLabel: a.term ? a.term.label : null,
    status: a.status,
    moderatedAt: a.moderatedAt,
    moderationNote: a.moderationNote,
    schoolId: a.schoolId,
    createdAt: a.createdAt,
  };
}

function serializeMark(m) {
  return {
    id: m.id,
    mark: m.mark,
    status: m.status,
    studentId: m.studentId,
    studentNo: m.student ? m.student.studentNo : null,
    studentName: m.student ? `${m.student.firstName} ${m.student.lastName}` : null,
  };
}
// ── READ ───────────────────────────────────────────────────
export async function listAssessments(query = {}) {
  const where = {};
  if (query.termId) where.termId = query.termId;
  if (query.classId) where.classId = query.classId;
  if (query.subjectId) where.subjectId = query.subjectId;
  if (query.type) where.type = query.type;
  const list = await prisma.assessment.findMany({
    where,
    include: { subject: true, class: true, term: true, _count: { select: { marks: true } } },
    orderBy: { date: "asc" },
  });
  return list.map((a) => ({ ...serialize(a), markCount: a._count.marks }));
}

export async function getAssessment(id) {
  const a = await prisma.assessment.findUnique({
    where: { id },
    include: {
      subject: true,
      class: true,
      term: true,
      marks: { include: { student: true } },
    },
  });
  if (!a) return null;
  return { ...serialize(a), marks: a.marks.map((m) => serializeMark(m)) };
}

// ── CREATE ─────────────────────────────────────────────────
export async function createAssessment(payload) {
  const errors = validateAssessment(payload);
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });

  const schoolId = await resolveSchoolId(payload.schoolId);
  const createdById = await resolveCurrentUserId();

  const dup = await prisma.assessment.findUnique({
    where: {
      termId_subjectId_classId_name: {
        termId: payload.termId,
        subjectId: payload.subjectId,
        classId: payload.classId,
        name: String(payload.name).trim(),
      },
    },
  });
  if (dup) throw Object.assign(new Error("An assessment with this name already exists for this term/subject/class"), { status: 409 });

  const assessment = await prisma.assessment.create({
    data: {
      name: String(payload.name).trim(),
      type: payload.type,
      date: new Date(payload.date),
      maxMark: Number(payload.maxMark),
      weight: Number(payload.weight),
      description: payload.description || null,
      subjectId: payload.subjectId,
      classId: payload.classId,
      termId: payload.termId,
      schoolId,
      createdById,
    },
  });

  // Pre-create an empty StudentMark row for every student in the class.
  const students = await prisma.student.findMany({ where: { classId: payload.classId }, select: { id: true } });
  if (students.length) {
    await prisma.studentMark.createMany({
      data: students.map((s) => ({ assessmentId: assessment.id, studentId: s.id })),
      skipDuplicates: true,
    });
  }

  return getAssessment(assessment.id);
}

// ── UPDATE ─────────────────────────────────────────────────
export async function updateAssessment(id, payload) {
  const existing = await prisma.assessment.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Assessment not found"), { status: 404 });
  if (existing.status === "LOCKED") throw Object.assign(new Error("Assessment is locked and cannot be edited"), { status: 403 });

  const errors = validateAssessment({ ...existing, ...payload });
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });

  const assessment = await prisma.assessment.update({
    where: { id },
    data: {
      name: String(payload.name ?? existing.name).trim(),
      type: payload.type ?? existing.type,
      date: payload.date ? new Date(payload.date) : existing.date,
      maxMark: payload.maxMark != null ? Number(payload.maxMark) : existing.maxMark,
      weight: payload.weight != null ? Number(payload.weight) : existing.weight,
      description: payload.description !== undefined ? payload.description : existing.description,
    },
  });
  return getAssessment(assessment.id);
}

// ── DELETE ─────────────────────────────────────────────────
export async function deleteAssessment(id) {
  const existing = await prisma.assessment.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Assessment not found"), { status: 404 });
  if (existing.status === "LOCKED") throw Object.assign(new Error("Assessment is locked and cannot be deleted"), { status: 403 });
  await prisma.assessment.delete({ where: { id } });
  return { id };
}

// ── STATUS / MODERATION ────────────────────────────────────
export async function updateAssessmentStatus(id, { status, moderationNote }) {
  const existing = await prisma.assessment.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Assessment not found"), { status: 404 });
  if (existing.status === "LOCKED") throw Object.assign(new Error("Assessment is already locked"), { status: 403 });

  const allowed = STATUS_FLOW[existing.status] || [];
  if (!allowed.includes(status)) {
    throw Object.assign(new Error(`Cannot move assessment from ${existing.status} to ${status}`), { status: 400 });
  }

  const moderatedById = ["MODERATED", "LOCKED"].includes(status) ? await resolveCurrentUserId() : undefined;

  const assessment = await prisma.assessment.update({
    where: { id },
    data: {
      status,
      ...(status === "MODERATED" ? { moderatedAt: new Date(), moderationNote: moderationNote || null, moderatedById } : {}),
    },
  });
  return getAssessment(assessment.id);
}