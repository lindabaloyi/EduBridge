import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findUnique({ where: { code: "ELM-001" } });
  if (!school) throw new Error("Dev school ELM-001 not found (run `npm run seed` first)");

  const teacher = await prisma.teacher.findFirst({
    where: { schoolId: school.id, employeeNo: "EMP-001" },
  });
  if (!teacher) throw new Error("Teacher EMP-001 not found (run `npm run seed` first)");

  const subjects = await prisma.subject.findMany({ where: { schoolId: school.id } });
  const preferCodes = ["MATH", "PHYSCI", "LIFESCI", "ENG"];
  const preferred = preferCodes.map((c) => subjects.find((s) => s.code === c)).filter(Boolean);
  const assigned = (preferred.length >= 2 ? preferred : subjects).slice(0, 2);
  if (assigned.length < 2) throw new Error("Need at least 2 subjects to build a timetable");

  // Link subjects (idempotent)
  await prisma.teacher.update({
    where: { id: teacher.id },
    data: { subjects: { set: assigned.map((s) => ({ id: s.id })) } },
  });

  const classes = await prisma.class.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });
  if (classes.length < 2) throw new Error("Need at least 2 classes");

  // Clear old data for this teacher, then write fresh (idempotent)
  await prisma.timetableEntry.deleteMany({ where: { teacherId: teacher.id } });
  await prisma.teacherPerformance.deleteMany({ where: { teacherId: teacher.id } });

  const [c1, c2, c3] = classes;
  const [s1, s2] = assigned;
  const rows = [
    { dayOfWeek: "Monday", period: "P1", startTime: "08:00", endTime: "08:45", classId: c1.id, subjectId: s1.id },
    { dayOfWeek: "Monday", period: "P2", startTime: "08:50", endTime: "09:35", classId: c2.id, subjectId: s2.id },
    { dayOfWeek: "Tuesday", period: "P1", startTime: "08:00", endTime: "08:45", classId: c3 ? c3.id : c1.id, subjectId: s1.id },
    { dayOfWeek: "Tuesday", period: "P2", startTime: "08:50", endTime: "09:35", classId: c2.id, subjectId: s1.id },
    { dayOfWeek: "Wednesday", period: "P1", startTime: "08:00", endTime: "08:45", classId: c1.id, subjectId: s2.id },
  ];
  await prisma.timetableEntry.createMany({
    data: rows.map((r) => ({ ...r, teacherId: teacher.id, schoolId: school.id })),
  });

  await prisma.teacherPerformance.createMany({
    data: [
      { teacherId: teacher.id, semester: "1", score: 9.2, schoolId: school.id },
      { teacherId: teacher.id, semester: "2", score: 8.6, schoolId: school.id },
    ],
  });

  console.log(
    `✅ Teacher profile seeded for ${teacher.firstName} ${teacher.lastName}: ` +
      `${assigned.length} subjects, ${rows.length} timetable entries, 2 performance records`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
