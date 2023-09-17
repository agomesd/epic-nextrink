/*
  Warnings:

  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `activeTeamId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PlayerProfile_teamId_key";

-- DropIndex
DROP INDEX "_RoleToUser_B_index";

-- DropIndex
DROP INDEX "_RoleToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RoleToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_CoachProfileToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CoachProfileToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "CoachProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CoachProfileToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PlayerProfileToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PlayerProfileToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PlayerProfileToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__supported" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_supported_A_fkey" FOREIGN KEY ("A") REFERENCES "CoachProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_supported_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__supported" ("A", "B") SELECT "A", "B" FROM "_supported";
DROP TABLE "_supported";
ALTER TABLE "new__supported" RENAME TO "_supported";
CREATE UNIQUE INDEX "_supported_AB_unique" ON "_supported"("A", "B");
CREATE INDEX "_supported_B_index" ON "_supported"("B");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "caliberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "coachId" TEXT,
    CONSTRAINT "Team_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_caliberId_fkey" FOREIGN KEY ("caliberId") REFERENCES "Caliber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("associationId", "caliberId", "createdAt", "id", "levelId", "name", "seasonId", "updatedAt") SELECT "associationId", "caliberId", "createdAt", "id", "levelId", "name", "seasonId", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");
CREATE UNIQUE INDEX "Team_seasonId_key" ON "Team"("seasonId");
CREATE UNIQUE INDEX "Team_coachId_key" ON "Team"("coachId");
CREATE UNIQUE INDEX "Team_name_associationId_levelId_caliberId_key" ON "Team"("name", "associationId", "levelId", "caliberId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "imageId" TEXT,
    CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("fileId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "imageId", "updatedAt") SELECT "createdAt", "email", "id", "imageId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_CoachProfileToRole_AB_unique" ON "_CoachProfileToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_CoachProfileToRole_B_index" ON "_CoachProfileToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerProfileToRole_AB_unique" ON "_PlayerProfileToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerProfileToRole_B_index" ON "_PlayerProfileToRole"("B");
