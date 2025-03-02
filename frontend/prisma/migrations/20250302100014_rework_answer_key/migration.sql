/*
  Warnings:

  - You are about to drop the column `answerKeyId` on the `Assignment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignmentId]` on the table `AnswerKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assignmentId` to the `AnswerKey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_answerKeyId_fkey";

-- DropIndex
DROP INDEX "Assignment_answerKeyId_key";

-- AlterTable
ALTER TABLE "AnswerKey" ADD COLUMN     "assignmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "answerKeyId";

-- CreateIndex
CREATE UNIQUE INDEX "AnswerKey_assignmentId_key" ON "AnswerKey"("assignmentId");

-- AddForeignKey
ALTER TABLE "AnswerKey" ADD CONSTRAINT "AnswerKey_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
