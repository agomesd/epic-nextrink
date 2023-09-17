/*
  Warnings:

  - You are about to drop the column `activeTeamId` on the `PlayerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `Team` table. All the data in the column will be lost.
  - Added the required column `activeTeamId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "imageId" TEXT,
    "activeTeamId" TEXT NOT NULL,
    CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("fileId") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_activeTeamId_fkey" FOREIGN KEY ("activeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "imageId", "updatedAt") SELECT "createdAt", "email", "id", "imageId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");
CREATE TABLE "new_PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userId" TEXT,
    "positionId" TEXT NOT NULL,
    "shotSideId" TEXT NOT NULL,
    "hometown" TEXT,
    "dob" DATETIME,
    "weight" REAL,
    "height" REAL,
    "jerseyNumber" INTEGER,
    "statusId" TEXT NOT NULL,
    CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_shotSideId_fkey" FOREIGN KEY ("shotSideId") REFERENCES "ShotSide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerProfile" ("createdAt", "dob", "firstName", "height", "hometown", "id", "jerseyNumber", "lastName", "positionId", "shotSideId", "statusId", "updatedAt", "userId", "weight") SELECT "createdAt", "dob", "firstName", "height", "hometown", "id", "jerseyNumber", "lastName", "positionId", "shotSideId", "statusId", "updatedAt", "userId", "weight" FROM "PlayerProfile";
DROP TABLE "PlayerProfile";
ALTER TABLE "new_PlayerProfile" RENAME TO "PlayerProfile";
CREATE UNIQUE INDEX "PlayerProfile_id_key" ON "PlayerProfile"("id");
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "caliberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Team_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "Association" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_caliberId_fkey" FOREIGN KEY ("caliberId") REFERENCES "Caliber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("associationId", "caliberId", "createdAt", "id", "levelId", "name", "seasonId", "updatedAt") SELECT "associationId", "caliberId", "createdAt", "id", "levelId", "name", "seasonId", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");
CREATE UNIQUE INDEX "Team_seasonId_key" ON "Team"("seasonId");
CREATE UNIQUE INDEX "Team_userId_key" ON "Team"("userId");
CREATE UNIQUE INDEX "Team_name_associationId_levelId_caliberId_key" ON "Team"("name", "associationId", "levelId", "caliberId");
CREATE TABLE "new__supported" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_supported_A_fkey" FOREIGN KEY ("A") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_supported_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__supported" ("A", "B") SELECT "A", "B" FROM "_supported";
DROP TABLE "_supported";
ALTER TABLE "new__supported" RENAME TO "_supported";
CREATE UNIQUE INDEX "_supported_AB_unique" ON "_supported"("A", "B");
CREATE INDEX "_supported_B_index" ON "_supported"("B");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
