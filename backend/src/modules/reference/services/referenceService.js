import { prisma } from "../../../database/prisma.js";

export async function listTerms() {
  const terms = await prisma.term.findMany({
    include: { academicYear: true },
    orderBy: { startDate: "asc" },
  });
  return terms.map((t) => ({
    id: t.id,
    label: t.label,
    academicYearId: t.academicYearId,
    academicYearLabel: t.academicYear.label,
    startDate: t.startDate,
    endDate: t.endDate,
  }));
}

export async function listClasses() {
  const classes = await prisma.class.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });
  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    studentCount: c._count.students,
  }));
}

export async function listSubjects() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
  return subjects.map((s) => ({ id: s.id, name: s.name, code: s.code }));
}

export async function getClassStudents(classId) {
  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return students.map((s) => ({
    id: s.id,
    studentNo: s.studentNo,
    firstName: s.firstName,
    lastName: s.lastName,
  }));
}