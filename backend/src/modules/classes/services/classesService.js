import { prisma } from "../../../database/prisma.js";

const DEV_SCHOOL_CODE = "ELM-001";

async function resolveSchoolId(schoolId) {
  if (schoolId) return schoolId;
  const school = await prisma.school.findUnique({ where: { code: DEV_SCHOOL_CODE } });
  if (!school) throw Object.assign(new Error("Development school not found"), { status: 500 });
  return school.id;
}

export function validateClass(data) {
  const errors = {};
  if (!data.name || !String(data.name).trim()) errors.name = "name is required";
  return Object.keys(errors).length ? errors : null;
}

function serializeClass(c, studentCount = 0) {
  return { id: c.id, name: c.name, grade: c.grade ?? null, schoolId: c.schoolId, studentCount };
}

export async function listClasses({ grade } = {}) {
  const where = grade ? { grade } : {};
  const list = await prisma.class.findMany({
    where,
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });
  return list.map((c) => ({ 
    id: c.id, 
    name: c.name, 
    grade: c.grade, 
    schoolId: c.schoolId, 
    studentCount: c._count.students 
  }));
}

export async function getClassById(id) {
  const c = await prisma.class.findUnique({
    where: { id },
    include: { _count: { select: { students: true, assessments: true } } },
  });
  if (!c) return null;
  return { ...serializeClass(c, c._count.students), assessmentCount: c._count.assessments };
}

export async function createClass(payload) {
  const errors = validateClass(payload);
  if (errors) throw Object.assign(new Error("Validation failed"), { status: 400, errors });
  const schoolId = await resolveSchoolId(payload.schoolId);
  const name = String(payload.name).trim();
  const dup = await prisma.class.findFirst({ where: { schoolId, name } });
  if (dup) throw Object.assign(new Error("A class with this name already exists"), { status: 409 });
  const c = await prisma.class.create({ data: { name, grade: payload.grade || null, schoolId } });
  return serializeClass(c, 0);
}

export async function updateClass(id, payload) {
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Class not found"), { status: 404 });
  const name = payload.name != null ? String(payload.name).trim() : existing.name;
  const dup = await prisma.class.findFirst({ where: { schoolId: existing.schoolId, name, id: { not: id } } });
  if (dup) throw Object.assign(new Error("A class with this name already exists"), { status: 409 });
  const c = await prisma.class.update({
    where: { id },
    data: { name, grade: payload.grade !== undefined ? payload.grade || null : existing.grade },
  });
  const count = await prisma.student.count({ where: { classId: id } });
  return serializeClass(c, count);
}

export async function deleteClass(id) {
  const existing = await prisma.class.findUnique({ where: { id } });
  if (!existing) throw Object.assign(new Error("Class not found"), { status: 404 });
  const assessmentCount = await prisma.assessment.count({ where: { classId: id } });
  if (assessmentCount) throw Object.assign(new Error("Cannot delete a class that has assessments"), { status: 400 });
  await prisma.class.delete({ where: { id } });
  return { id };
}

// ✅ Get students for attendance - only basic info needed
export async function getClassStudents(classId) {
  console.log('📡 Fetching students for class:', classId);
  
  // Check if class exists
  const classExists = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, name: true }
  });

  if (!classExists) {
    throw Object.assign(new Error("Class not found"), { status: 404 });
  }

  // Get students - only what we need for attendance
  const students = await prisma.student.findMany({
    where: { 
      classId: classId 
    },
    orderBy: [
      { lastName: "asc" }, 
      { firstName: "asc" }
    ],
    select: {
      id: true,
      studentNo: true,
      firstName: true,
      lastName: true,
      // Only these 4 fields needed for attendance
    }
  });

  console.log(`✅ Found ${students.length} students`);

  return students;
}