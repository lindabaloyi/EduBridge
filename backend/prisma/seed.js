import { PrismaClient } from "@prisma/client"
import { TRADITIONAL_SUBJECTS } from "./traditionalSubjects.js"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting EduBridge database seed...")

  // School
  const school = await prisma.school.create({
    data: {
      name: 'Elmridge School',
      code: 'ELM-001',
    },
  })

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@elmridge.edu',
      password: 'hashed-password', // In production use bcrypt
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      schoolId: school.id,
    },
  })

  const teacher1 = await prisma.user.create({
    data: {
      email: 'mrs.smith@elmridge.edu',
      password: 'hashed-password', // In production use bcrypt
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'TEACHER',
      schoolId: school.id,
    },
  })

  // Teacher profile (separate model in schema)
  const teacher = await prisma.teacher.create({
    data: {
      employeeNo: 'EMP-001',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'mrs.smith@elmridge.edu',
      schoolId: school.id,
    },
  })

  console.log(`   - Teacher: ${teacher.employeeNo} profile created`)

  // Classes
  const grade9A = await prisma.class.create({
    data: {
      name: 'Grade 9-A',
      grade: '9',
      schoolId: school.id,
    },
  })

  const grade9B = await prisma.class.create({
    data: {
      name: 'Grade 9-B',
      grade: '9',
      schoolId: school.id,
    },
  })

  const grade10A = await prisma.class.create({
    data: {
      name: 'Grade 10-A',
      grade: '10',
      schoolId: school.id,
    },
  })

  const grade10B = await prisma.class.create({
    data: {
      name: 'Grade 10-B',
      grade: '10',
      schoolId: school.id,
    },
  })

  // Subjects (traditional SA subjects + English Literature for compatibility)
  await prisma.subject.upsert({
    where: { schoolId_code: { schoolId: school.id, code: 'ENG' } },
    update: {},
    create: { name: 'English Literature', code: 'ENG', schoolId: school.id },
  })
  for (const [name, code] of TRADITIONAL_SUBJECTS) {
    await prisma.subject.upsert({
      where: { schoolId_code: { schoolId: school.id, code } },
      update: {},
      create: { name, code, schoolId: school.id },
    })
  }

  // Students (8 mock students matching our frontend data)
  const students = await prisma.student.createMany({
    data: [
      {
        studentNo: 'STU-1042',
        firstName: 'Amara',
        lastName: 'Okafor',
        gender: 'Female',
        guardianName: 'Chidi Okafor',
        guardianPhone: '+27 82 000 1042',
        attendance: 96,
        averageGrade: 'A-',
        classId: grade9A.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1043',
        firstName: 'Liam',
        lastName: 'Fischer',
        gender: 'Male',
        guardianName: 'Nora Fischer',
        guardianPhone: '+27 82 000 1043',
        attendance: 88,
        averageGrade: 'B+',
        classId: grade9A.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1044',
        firstName: 'Priya',
        lastName: 'Nair',
        gender: 'Female',
        guardianName: 'Ravi Nair',
        guardianPhone: '+27 82 000 1044',
        attendance: 99,
        averageGrade: 'A',
        classId: grade9B.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1045',
        firstName: 'Mateo',
        lastName: 'Rossi',
        gender: 'Male',
        guardianName: 'Elena Rossi',
        guardianPhone: '+27 82 000 1045',
        attendance: 74,
        averageGrade: 'C',
        classId: grade10A.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1046',
        firstName: 'Yuki',
        lastName: 'Tanaka',
        gender: 'Female',
        guardianName: 'Kenji Tanaka',
        guardianPhone: '+27 82 000 1046',
        attendance: 91,
        averageGrade: 'B',
        classId: grade10A.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1047',
        firstName: 'Zoe',
        lastName: 'van Dijk',
        gender: 'Female',
        guardianName: 'Bram van Dijk',
        guardianPhone: '+27 82 000 1047',
        attendance: 83,
        averageGrade: 'B-',
        classId: grade10B.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1048',
        firstName: 'Kofi',
        lastName: 'Mensah',
        gender: 'Male',
        guardianName: 'Ama Mensah',
        guardianPhone: '+27 82 000 1048',
        attendance: 95,
        averageGrade: 'A-',
        classId: grade9B.id,
        schoolId: school.id,
      },
      {
        studentNo: 'STU-1049',
        firstName: 'Isla',
        lastName: 'Campbell',
        gender: 'Female',
        guardianName: 'Fiona Campbell',
        guardianPhone: '+27 82 000 1049',
        attendance: 79,
        averageGrade: 'C+',
        classId: grade10B.id,
        schoolId: school.id,
      },
    ],
  })
// Parents (linked to each seeded student, indexed by student number order)
  const seededStudents = await prisma.student.findMany({ where: { schoolId: school.id }, orderBy: { studentNo: 'asc' } })
  const PARENTS = [
    ['Chidi', 'Okafor'], ['Nora', 'Fischer'], ['Ravi', 'Nair'], ['Elena', 'Rossi'],
    ['Kenji', 'Tanaka'], ['Bram', 'van Dijk'], ['Ama', 'Mensah'], ['Fiona', 'Campbell'],
  ]
  for (let i = 0; i < seededStudents.length; i++) {
    const s = seededStudents[i]
    const [f, l] = PARENTS[i] || ['Chidi', s.lastName]
    const parent = await prisma.parent.create({
      data: {
        firstName: f,
        lastName: l,
        email: `${f.toLowerCase().replace(/\./g, '')}.${l.toLowerCase().replace(/\s/g, '')}@elmridge.edu`,
        phone: '+27 82 000 0000',
        schoolId: school.id,
      },
    })
    await prisma.student.update({ where: { id: s.id }, data: { parentId: parent.id } })
  }

  // Academic years
  const currentYear = await prisma.academicYear.create({
    data: {
      label: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      schoolId: school.id,
    },
  })

  const term1 = await prisma.term.create({
    data: {
      label: 'Term 1',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-31'),
      academicYearId: currentYear.id,
    },
  })

  console.log('✅ Development school seeded successfully')
  console.log(`   - School: ${school.name} (${school.code})`)
  console.log(`   - Admin: ${admin.email}`)
  console.log(`   - Students: 8 created`)
  console.log(`   - Classes: 4 created`)
  console.log(`   - Subjects: ${TRADITIONAL_SUBJECTS.length + 1} created`)
  console.log(`   - Academic year: ${currentYear.label}`)
  console.log(`   - Term: ${term1.label}`)
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:")
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })