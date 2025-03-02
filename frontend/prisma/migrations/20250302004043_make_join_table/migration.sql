/*
  Warnings:

  - You are about to drop the `_StudentClasses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentClasses" DROP CONSTRAINT "_StudentClasses_B_fkey";

-- DropTable
DROP TABLE "_StudentClasses";

-- CreateTable
CREATE TABLE "UsersOnClasses" (
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnClasses_pkey" PRIMARY KEY ("classId","userId")
);

-- AddForeignKey
ALTER TABLE "UsersOnClasses" ADD CONSTRAINT "UsersOnClasses_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnClasses" ADD CONSTRAINT "UsersOnClasses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
