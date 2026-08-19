import { prisma } from '../../../database/prisma.js';

const DEV_SCHOOL_CODE = "ELM-001";

async function resolveSchoolId(schoolId) {
  if (schoolId) return schoolId;
  const school = await prisma.school.findUnique({ where: { code: DEV_SCHOOL_CODE } });
  if (!school) throw Object.assign(new Error("Development school not found"), { status: 500 });
  return school.id;
}

export function validateTeacher(data) {
  const errors = {};
  if (!data.firstName || !String(data.firstName).trim()) errors.firstName = "firstName is required";
  if (!data.lastName || !String(data.lastName).trim()) errors.lastName = "lastName is required";
  return Object.keys(errors).length ? errors : null;
}

function serializeTeacher(t) {
  return {
    id: t.id,
    employeeNo: t.employeeNo,
    firstName: t.firstName,
    lastName: t.lastName,
    email: t.email,
    schoolId: t.schoolId,
  };
}

export async function getTeachers(schoolId) {
  const resolvedSchoolId = await resolveSchoolId(schoolId);
  const list = await prisma.teacher.findMany({
    where: { schoolId: resolvedSchoolId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return list.map(serializeTeacher);
}

export async function getTeacherById(id) {
  const t = await prisma.teacher.findUnique({ where: { id } });
  return t ? serializeTeacher(t) : null;
}

export async function createTeacher(payload) {
  const errors = validateTeacher(payload);
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });
  const schoolId = await resolveSchoolId(payload.schoolId);
  const employeeNo = payload.employeeNo ? String(payload.employeeNo).trim() : `T${Date.now().toString().slice(-6)}`;
  if (payload.employeeNo) {
    const dup = await prisma.teacher.findFirst({ where: { schoolId, employeeNo } });
    if (dup) throw Object.assign(new Error("Employee number already exists"), { status: 409 });
  }
  const t = await prisma.teacher.create({
    data: {
      employeeNo,
      firstName: String(payload.firstName).trim(),
      lastName: String(payload.lastName).trim(),
      email: payload.email ? String(payload.email).trim() : null,
      schoolId,
    },
  });
  return serializeTeacher(t);
}

export async function updateTeacher(id, payload) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Teacher not found"), { status: 404 });
  const employeeNo = payload.employeeNo ? String(payload.employeeNo).trim() : existing.employeeNo;
  if (payload.employeeNo && employeeNo !== existing.employeeNo) {
    const dup = await prisma.teacher.findFirst({
      where: { schoolId: existing.schoolId, employeeNo, id: { not: id } },
    });
    if (dup) throw Object.assign(new Error("Employee number already exists"), { status: 409 });
  }
  const t = await prisma.teacher.update({
    where: { id },
    data: {
      firstName: payload.firstName != null ? String(payload.firstName).trim() : existing.firstName,
      lastName: payload.lastName != null ? String(payload.lastName).trim() : existing.lastName,
      email:
        payload.email !== undefined
          ? payload.email
            ? String(payload.email).trim()
            : null
          : existing.email,
      employeeNo,
    },
  });
  return serializeTeacher(t);
}

export async function deleteTeacher(id) {
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Teacher not found"), { status: 404 });
  await prisma.teacher.delete({ where: { id } });
  return { id };
}

export async function searchTeachers(schoolId, searchTerm) {
  const resolvedSchoolId = await resolveSchoolId(schoolId);
  const term = String(searchTerm || "").trim();
  if (!term) return [];
  const list = await prisma.teacher.findMany({
    where: {
      schoolId: resolvedSchoolId,
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { employeeNo: { contains: term, mode: "insensitive" } },
      ],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return list.map(serializeTeacher);
}