import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const school = await p.school.findUnique({ where: { code: "ELM-001" } });
const cls = await p.class.findFirst({ where: { schoolId: school.id, name: "Grade 9-A" } });
const students = await p.student.findMany({ where: { classId: cls.id }, include: { parent: true } });
for (const s of students) {
  console.log(`${s.studentNo} ${s.firstName} ${s.lastName} => parent: ${s.parent ? s.parent.firstName + " " + s.parent.lastName : "NONE"}`);
}
const parentForClass = await p.parent.findMany({ where: { students: { some: { classId: cls.id } } } });
console.log("parents for 9-A:", parentForClass.length);
await p.$disconnect();