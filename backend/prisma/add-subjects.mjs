import { PrismaClient } from "@prisma/client";
import { TRADITIONAL_SUBJECTS } from "./traditionalSubjects.js";

const prisma = new PrismaClient();
const SCHOOL_CODE = "ELM-001";

async function main() {
  const school = await prisma.school.findUnique({ where: { code: SCHOOL_CODE } });
  if (!school) {
    console.error(`School with code "${SCHOOL_CODE}" not found. Run the seed first.`);
    process.exit(1);
  }
  const before = await prisma.subject.count({ where: { schoolId: school.id } });
  for (const [name, code] of TRADITIONAL_SUBJECTS) {
    await prisma.subject.upsert({
      where: { schoolId_code: { schoolId: school.id, code } },
      update: {},
      create: { name, code, schoolId: school.id },
    });
  }
  const after = await prisma.subject.count({ where: { schoolId: school.id } });
  console.log(`Subjects for ${school.name}: ${before} → ${after} (target list ${TRADITIONAL_SUBJECTS.length})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());