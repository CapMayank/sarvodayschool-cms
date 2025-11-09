-- CreateTable
CREATE TABLE "StudentSubjectOptIn" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSubjectOptIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentSubjectOptIn_studentId_idx" ON "StudentSubjectOptIn"("studentId");

-- CreateIndex
CREATE INDEX "StudentSubjectOptIn_subjectId_idx" ON "StudentSubjectOptIn"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSubjectOptIn_studentId_subjectId_key" ON "StudentSubjectOptIn"("studentId", "subjectId");

-- AddForeignKey
ALTER TABLE "StudentSubjectOptIn" ADD CONSTRAINT "StudentSubjectOptIn_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubjectOptIn" ADD CONSTRAINT "StudentSubjectOptIn_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
