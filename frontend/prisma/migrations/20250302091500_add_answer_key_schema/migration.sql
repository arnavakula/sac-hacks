/*
  Warnings:

  - A unique constraint covering the columns `[answerKeyId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "answerKeyId" TEXT;

-- CreateTable
CREATE TABLE "AnswerKey" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "professorId" TEXT NOT NULL,

    CONSTRAINT "AnswerKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_answerKeyId_key" ON "Assignment"("answerKeyId");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_answerKeyId_fkey" FOREIGN KEY ("answerKeyId") REFERENCES "AnswerKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerKey" ADD CONSTRAINT "AnswerKey_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
