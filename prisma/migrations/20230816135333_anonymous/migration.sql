/*
  Warnings:

  - Added the required column `teamId` to the `PlayerProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
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
    "teamId" TEXT NOT NULL,
    CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_shotSideId_fkey" FOREIGN KEY ("shotSideId") REFERENCES "ShotSide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerProfile" ("createdAt", "dob", "firstName", "height", "hometown", "id", "jerseyNumber", "lastName", "positionId", "shotSideId", "statusId", "updatedAt", "userId", "weight") SELECT "createdAt", "dob", "firstName", "height", "hometown", "id", "jerseyNumber", "lastName", "positionId", "shotSideId", "statusId", "updatedAt", "userId", "weight" FROM "PlayerProfile";
DROP TABLE "PlayerProfile";
ALTER TABLE "new_PlayerProfile" RENAME TO "PlayerProfile";
CREATE UNIQUE INDEX "PlayerProfile_id_key" ON "PlayerProfile"("id");
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");
CREATE UNIQUE INDEX "PlayerProfile_teamId_key" ON "PlayerProfile"("teamId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
