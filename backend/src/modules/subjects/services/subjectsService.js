import { prisma } from "../../../database/prisma.js";

const DEV_SCHOOL_CODE = "ELM-001";

async function resolveSchoolId(schoolId) {
  if (schoolId) return schoolId;
  const school = await prisma.school.findUnique({ where: { code: DEV_SCHOOL_CODE } });
  if (!school) throw Object.assign(new Error("Development school not found"), { status: 500 });
  return school.id;
}

export function validateSubject(data) {
  const errors = {};
  if (!data.name || !String(data.name).trim()) errors.name = "name is required";
  if (!data.code || !String(data.code).trim()) errors.code = "code is required";
  return Object.keys(errors).length ? errors : null;
}

function serialize(s) {
  return { id: s.id, name: s.name, code: s.code, schoolId: s.schoolId };
}

export async function listSubjects() {
  const list = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  return list.map(serialize);
}

export async function getSubjectById(id) {
  const s = await prisma.subject.findUnique({ where: { id } });
  return s ? serialize(s) : null;
}

export async function createSubject(payload) {
  const errors = validateSubject(payload);
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });
  const schoolId = await resolveSchoolId(payload.schoolId);
  const code = String(payload.code).trim();
  const dup = await prisma.subject.findFirst({ where: { schoolId, code } });
  if (dup) throw Object.assign(new Error("A subject with this code already exists"), { status: 409 });
  const s = await prisma.subject.create({ data: { name: String(payload.name).trim(), code, schoolId } });
  return serialize(s);
}

export async function updateSubject(id, payload) {
  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Subject not found"), { status: 404 });
  const code = payload.code != null ? String(payload.code).trim() : existing.code;
  const dup = await prisma.subject.findFirst({ where: { schoolId: existing.schoolId, code, id: { not: id } } });
  if (dup) throw Object.assign(new Error("A subject with this code already exists"), { status: 409 });
  const s = await prisma.subject.update({
    where: { id },
    data: {
      name: payload.name != null ? String(payload.name).trim() : existing.name,
      code,
    },
  });
  return serialize(s);
}

export async function deleteSubject(id) {
  const existing = await prisma.subject.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Subject not found"), { status: 404 });
  const assessmentCount = await prisma.assessment.count({ where: { subjectId: id } });
  if (assessmentCount) throw Object.assign(new Error("Cannot delete a subject that has assessments"), { status: 400 });
  await prisma.subject.delete({ where: { id } });
  return { id };
}