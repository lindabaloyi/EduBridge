-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "attendance" DOUBLE PRECISION,
ADD COLUMN     "averageGrade" TEXT,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
