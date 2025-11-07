-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "classId" INTEGER NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "passingMarks" INTEGER NOT NULL DEFAULT 33,
    "isAdditional" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "enrollmentNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxTotalMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectMark" (
    "id" SERIAL NOT NULL,
    "resultId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "marksObtained" DOUBLE PRECISION NOT NULL,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectMark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultPublication" (
    "id" SERIAL NOT NULL,
    "academicYear" TEXT NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResultPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_classId_name_key" ON "Subject"("classId", "name");

-- CreateIndex
CREATE INDEX "Student_academicYear_idx" ON "Student"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNumber_academicYear_key" ON "Student"("rollNumber", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "Student_enrollmentNo_academicYear_key" ON "Student"("enrollmentNo", "academicYear");

-- CreateIndex
CREATE INDEX "Result_academicYear_idx" ON "Result"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_academicYear_key" ON "Result"("studentId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectMark_resultId_subjectId_key" ON "SubjectMark"("resultId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultPublication_academicYear_key" ON "ResultPublication"("academicYear");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMark" ADD CONSTRAINT "SubjectMark_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "Result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectMark" ADD CONSTRAINT "SubjectMark_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
