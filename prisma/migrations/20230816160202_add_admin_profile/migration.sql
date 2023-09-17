/*
  Warnings:

  - You are about to drop the column `name` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `access` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_AdminProfileToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_AdminProfileToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "AdminProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AdminProfileToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "action" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Permission" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Permission";
DROP TABLE "Permission";
ALTER TABLE "new_Permission" RENAME TO "Permission";
CREATE UNIQUE INDEX "Permission_id_key" ON "Permission"("id");
CREATE UNIQUE INDEX "Permission_access_action_entity_key" ON "Permission"("access", "action", "entity");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_AdminProfileToRole_AB_unique" ON "_AdminProfileToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminProfileToRole_B_index" ON "_AdminProfileToRole"("B");
