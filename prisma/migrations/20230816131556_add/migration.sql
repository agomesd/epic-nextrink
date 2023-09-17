/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Note_ownerId_updatedAt_idx";

-- DropIndex
DROP INDEX "Note_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "addressLine" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "state" TEXT,
    "postCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "arenaId" TEXT NOT NULL,
    CONSTRAINT "Address_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "Arena" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Arena" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "websiteUrl" TEXT,
    "phoneNumber" TEXT
);

-- CreateTable
CREATE TABLE "Association" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "websiteUrl" TEXT
);

-- CreateTable
CREATE TABLE "Caliber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepthChart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "teamId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "depthLevelId" TEXT NOT NULL,
    CONSTRAINT "DepthChart_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DepthChart_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DepthChart_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DepthChart_depthLevelId_fkey" FOREIGN KEY ("depthLevelId") REFERENCES "DepthLevel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepthLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FeedbackFrom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "FeedbackFrom_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FeedbackFrom_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "locationId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    CONSTRAINT "Game_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Arena" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "winningTeamId" TEXT,
    "losingTeamId" TEXT,
    "outcomeTypeId" TEXT NOT NULL,
    "winningScore" INTEGER NOT NULL,
    "losingScore" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    CONSTRAINT "Outcome_winningTeamId_fkey" FOREIGN KEY ("winningTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outcome_losingTeamId_fkey" FOREIGN KEY ("losingTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outcome_outcomeTypeId_fkey" FOREIGN KEY ("outcomeTypeId") REFERENCES "OutcomeType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Outcome_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutcomeType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "start" DATETIME NOT NULL,
    "end" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "locationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "Practice_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Arena" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Practice_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
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
    "activeTeamId" TEXT NOT NULL,
    "jerseyNumber" INTEGER,
    "statusId" TEXT NOT NULL,
    CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_shotSideId_fkey" FOREIGN KEY ("shotSideId") REFERENCES "ShotSide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_activeTeamId_fkey" FOREIGN KEY ("activeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerProfile_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "francJeux" INTEGER DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "plusMinus" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Record_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "from" DATETIME NOT NULL,
    "to" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShotSide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
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

-- CreateTable
CREATE TABLE "_ArenaToTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ArenaToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Arena" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ArenaToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AssociationToLevel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssociationToLevel_A_fkey" FOREIGN KEY ("A") REFERENCES "Association" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssociationToLevel_B_fkey" FOREIGN KEY ("B") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AssociationToCaliber" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AssociationToCaliber_A_fkey" FOREIGN KEY ("A") REFERENCES "Association" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AssociationToCaliber_B_fkey" FOREIGN KEY ("B") REFERENCES "Caliber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CaliberToLevel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CaliberToLevel_A_fkey" FOREIGN KEY ("A") REFERENCES "Caliber" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CaliberToLevel_B_fkey" FOREIGN KEY ("B") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_supported" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_supported_A_fkey" FOREIGN KEY ("A") REFERENCES "CoachProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_supported_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
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
CREATE UNIQUE INDEX "Address_arenaId_key" ON "Address"("arenaId");

-- CreateIndex
CREATE UNIQUE INDEX "Arena_name_key" ON "Arena"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Association_id_key" ON "Association"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Association_name_key" ON "Association"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Caliber_name_key" ON "Caliber"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_gameId_key" ON "Outcome"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Practice_id_key" ON "Practice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Position_id_key" ON "Position"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_id_key" ON "PlayerProfile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_positionId_key" ON "PlayerProfile"("positionId");

-- CreateIndex
CREATE UNIQUE INDEX "Record_ownerId_key" ON "Record"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "ShotSide_id_key" ON "ShotSide"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ShotSide_name_key" ON "ShotSide"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Status_name_key" ON "Status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_id_key" ON "Team"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Team_seasonId_key" ON "Team"("seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_coachId_key" ON "Team"("coachId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_associationId_levelId_caliberId_key" ON "Team"("name", "associationId", "levelId", "caliberId");

-- CreateIndex
CREATE UNIQUE INDEX "_ArenaToTeam_AB_unique" ON "_ArenaToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_ArenaToTeam_B_index" ON "_ArenaToTeam"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssociationToLevel_AB_unique" ON "_AssociationToLevel"("A", "B");

-- CreateIndex
CREATE INDEX "_AssociationToLevel_B_index" ON "_AssociationToLevel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssociationToCaliber_AB_unique" ON "_AssociationToCaliber"("A", "B");

-- CreateIndex
CREATE INDEX "_AssociationToCaliber_B_index" ON "_AssociationToCaliber"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CaliberToLevel_AB_unique" ON "_CaliberToLevel"("A", "B");

-- CreateIndex
CREATE INDEX "_CaliberToLevel_B_index" ON "_CaliberToLevel"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_supported_AB_unique" ON "_supported"("A", "B");

-- CreateIndex
CREATE INDEX "_supported_B_index" ON "_supported"("B");
