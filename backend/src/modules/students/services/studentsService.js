import { prisma } from '../../../database/prisma.js';

// ── Temporary dev-only configuration ────────────────────────────
// Before authentication is wired up, the frontend cannot know a school's
// database CUID. We resolve the seeded development school by its code so the
// API is self-contained. Once authenticate()/req.user.schoolId exist, this
// fallback is removed and replaced with the authenticated user's school.
const DEV_SCHOOL_CODE = "ELM-001";

/**
 * Resolve a schoolId, falling back to the seeded dev school by code when none
 * is supplied. Returns an already-supplied schoolId unchanged (future auth
 * path). Throws a 500 if the development school is missing from the DB.
 */
async function resolveSchoolId(schoolId) {
  if (schoolId) return schoolId;
  const school = await prisma.school.findUnique({
    where: { code: DEV_SCHOOL_CODE },
  });
  if (!school) {
    const err = new Error(`Development school (code "${DEV_SCHOOL_CODE}") not found`);
    err.status = 500;
    throw err;
  }
  return school.id;
}

/**
 * Resolve a classId. Accepts an already-supplied classId and verifies it exists
 * (and belongs to the school). Returns null when no class is supplied.
 */
async function resolveClassId(classId, schoolId) {
  if (!classId) return null;
  const cls = await prisma.class.findFirst({
    where: { id: classId, schoolId },
  });
  if (!cls) {
    const err = new Error("Invalid or missing class");
    err.status = 400;
    throw err;
  }
  return cls.id;
}

// ── Validation ──────────────────────────────────────────────────
const REQUIRED_FIELDS = ['studentNo', 'firstName', 'lastName'];

export function validateStudent(data) {
  const errors = {};
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      errors[field] = `${field} is required`;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

// ── Helper: serialize a Prisma student record ───────────────────
function serialize(student) {
  return {
    id: student.id,
    studentNo: student.studentNo,
    firstName: student.firstName,
    lastName: student.lastName,
    dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
    gender: student.gender,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    attendance: student.attendance,
    averageGrade: student.averageGrade,
    classId: student.classId,
    grade: student.class ? student.class.name : null,
    schoolId: student.schoolId,
    school: student.school ? student.school.name : null,
  };
}

// ── CRUD: READ ──────────────────────────────────────────────────
export async function getStudents() {
  const data = await prisma.student.findMany({
    include: { school: true, class: true },
    orderBy: { firstName: 'asc' },
  });
  return data.map(serialize);
}

export async function getStudentById(id) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { school: true, class: true },
  });
  if (!student) return null;
  return serialize(student);
}

// ── CRUD: CREATE ────────────────────────────────────────────────
export async function createStudent(payload) {
  const {
    studentNo,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    guardianName,
    guardianPhone,
    attendance,
    averageGrade,
    classId: providedClassId,
    schoolId: providedSchoolId,
  } = payload;

  const validation = validateStudent(payload);
  if (validation) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.errors = validation;
    throw err;
  }

  const schoolId = await resolveSchoolId(providedSchoolId);

  const existing = await prisma.student.findFirst({
    where: { schoolId, studentNo },
  });
  if (existing) {
    const err = new Error('A student with this student number already exists');
    err.status = 409;
    throw err;
  }

  const classId = await resolveClassId(providedClassId, schoolId);

  const student = await prisma.student.create({
    data: {
      studentNo: studentNo.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || null,
      guardianName: guardianName ? guardianName.trim() : null,
      guardianPhone: guardianPhone ? guardianPhone.trim() : null,
      attendance: attendance != null ? Number(attendance) : null,
      averageGrade: averageGrade || null,
      classId,
      schoolId,
    },
    include: { school: true, class: true },
  });

  return serialize(student);
}

// ── CRUD: UPDATE ────────────────────────────────────────────────
export async function updateStudent(id, payload) {
  const {
    studentNo,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    guardianName,
    guardianPhone,
    attendance,
    averageGrade,
    classId: providedClassId,
    schoolId: providedSchoolId,
  } = payload;

  const validation = validateStudent(payload);
  if (validation) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.errors = validation;
    throw err;
  }

  const schoolId = await resolveSchoolId(providedSchoolId);

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  const duplicate = await prisma.student.findFirst({
    where: { schoolId, studentNo, id: { not: id } },
  });
  if (duplicate) {
    const err = new Error('A student with this student number already exists');
    err.status = 409;
    throw err;
  }

  const classId = await resolveClassId(providedClassId, schoolId);

  const student = await prisma.student.update({
    where: { id },
    data: {
      studentNo: studentNo.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      guardianName: guardianName ? guardianName.trim() : null,
      guardianPhone: guardianPhone ? guardianPhone.trim() : null,
      attendance: attendance != null ? Number(attendance) : null,
      averageGrade: averageGrade || null,
      classId,
      schoolId,
    },
    include: { school: true, class: true },
  });

  return serialize(student);
}

// ── CRUD: DELETE ────────────────────────────────────────────────
export async function deleteStudent(id) {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  await prisma.student.delete({ where: { id } });
  return { id };
}