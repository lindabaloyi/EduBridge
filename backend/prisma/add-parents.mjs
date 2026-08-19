import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SCHOOL_CODE = "ELM-001";

// Links existing students (without a parent) to a Parent record,
// deriving the parent's name from each student's guardian fields.
async function main() {
  const school = await prisma.school.findUnique({ where: { code: SCHOOL_CODE } });
  if (!school) {
    console.error(`School with code "${SCHOOL_CODE}" not found.`);
    process.exit(1);
  }
  const students = await prisma.student.findMany({ where: { schoolId: school.id, parentId: null } });
  let created = 0;
  for (const s of students) {
    const src = (s.guardianName || `${s.firstName} ${s.lastName}`).trim();
    const idx = src.indexOf(" ");
    const firstName = idx === -1 ? src : src.slice(0, idx);
    const lastName = idx === -1 ? "" : src.slice(idx + 1);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}@elmridge.edu`;
    const parent = await prisma.parent.create({
      data: { firstName, lastName, email, phone: s.guardianPhone || null, schoolId: school.id },
    });
    await prisma.student.update({ where: { id: s.id }, data: { parentId: parent.id } });
    created++;
  }
  console.log(`Linked ${created} parent(s) for ${school.name}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());