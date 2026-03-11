/*
  Warnings:

  - Added the required column `name` to the `ScheduledTask` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScheduledTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "cron" TEXT,
    "payload" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" DATETIME,
    "nextRun" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledTask_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledTask" ("createdAt", "cron", "enabled", "id", "lastRun", "nextRun", "payload", "serverId", "type", "updatedAt") SELECT "createdAt", "cron", "enabled", "id", "lastRun", "nextRun", "payload", "serverId", "type", "updatedAt" FROM "ScheduledTask";
DROP TABLE "ScheduledTask";
ALTER TABLE "new_ScheduledTask" RENAME TO "ScheduledTask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
