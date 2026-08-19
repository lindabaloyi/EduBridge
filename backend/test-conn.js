import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    const parents = await prisma.parent.findMany({
      take: 100,
      select: { id: true, firstName: true, lastName: true, email: true }
    });
    console.log('Parents found:', parents.length);
    
    const schools = await prisma.school.findMany({ take: 1 });
    console.log('Schools found:', schools.length);
    
    const students = await prisma.student.findMany({ take: 1 });
    console.log('Students found:', students.length);
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();