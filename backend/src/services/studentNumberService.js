import { prisma } from '../database/prisma.js';

/**
 * Generate a unique student number
 * Format: STU-XXXX where XXXX is a sequential number
 * Example: STU-0001, STU-0002, etc.
 */
export async function generateStudentNumber(schoolId) {
  try {
    // Find the highest student number for this school
    const lastStudent = await prisma.student.findFirst({
      where: { schoolId },
      orderBy: {
        studentNo: 'desc',
      },
      select: {
        studentNo: true,
      },
    });

    let nextNumber = 1;
    
    if (lastStudent && lastStudent.studentNo) {
      // Extract the numeric part from the student number
      const match = lastStudent.studentNo.match(/STU-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    return `STU-${formattedNumber}`;
  } catch (error) {
    console.error('Error generating student number:', error);
    // Fallback to timestamp-based number if there's an error
    const timestamp = Date.now().toString().slice(-6);
    return `STU-${timestamp}`;
  }
}

/**
 * Validate if a student number is in the correct format
 */
export function isValidStudentNumber(studentNo) {
  return /^STU-\d{4}$/.test(studentNo);
}

/**
 * Extract the numeric sequence from a student number
 */
export function extractStudentNumberSequence(studentNo) {
  const match = studentNo.match(/STU-(\d+)/);
  return match ? parseInt(match[1]) : null;
}