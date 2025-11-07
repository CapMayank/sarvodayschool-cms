-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "hasPractical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "practicalMaxMarks" INTEGER,
ADD COLUMN     "practicalPassingMarks" INTEGER,
ADD COLUMN     "theoryMaxMarks" INTEGER,
ADD COLUMN     "theoryPassingMarks" INTEGER;

-- AlterTable
ALTER TABLE "SubjectMark" ADD COLUMN     "isPracticalPassed" BOOLEAN,
ADD COLUMN     "isTheoryPassed" BOOLEAN,
ADD COLUMN     "practicalMarks" DOUBLE PRECISION,
ADD COLUMN     "theoryMarks" DOUBLE PRECISION,
ALTER COLUMN "marksObtained" SET DEFAULT 0;
