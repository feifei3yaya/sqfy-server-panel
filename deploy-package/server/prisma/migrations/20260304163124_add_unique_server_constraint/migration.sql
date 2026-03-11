/*
  Warnings:

  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[host,rconPort]` on the table `Server` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[steamId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "steamId" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SystemConfig";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ScheduledTaskExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "totalAttempts" INTEGER NOT NULL DEFAULT 1,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "durationMs" INTEGER,
    "error" TEXT,
    "output" TEXT,
    CONSTRAINT "ScheduledTaskExecution_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ScheduledTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScrimMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "serverId" TEXT,
    "teamAId" TEXT,
    "teamBId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScrimMatch_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScrimMatch_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ScrimMatch_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "retryDelay" INTEGER NOT NULL DEFAULT 30,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRun" DATETIME,
    "nextRun" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScheduledTask_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ScheduledTask" ("createdAt", "cron", "description", "enabled", "id", "lastRun", "name", "nextRun", "payload", "serverId", "type", "updatedAt") SELECT "createdAt", "cron", "description", "enabled", "id", "lastRun", "name", "nextRun", "payload", "serverId", "type", "updatedAt" FROM "ScheduledTask";
DROP TABLE "ScheduledTask";
ALTER TABLE "new_ScheduledTask" RENAME TO "ScheduledTask";
CREATE TABLE "new_Whitelist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "steamId" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Whitelist_steamId_fkey" FOREIGN KEY ("steamId") REFERENCES "Player" ("steamId") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Whitelist_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Whitelist" ("comment", "createdAt", "expiresAt", "id", "serverId", "steamId") SELECT "comment", "createdAt", "expiresAt", "id", "serverId", "steamId" FROM "Whitelist";
DROP TABLE "Whitelist";
ALTER TABLE "new_Whitelist" RENAME TO "Whitelist";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ScheduledTaskExecution_taskId_startedAt_idx" ON "ScheduledTaskExecution"("taskId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Server_host_rconPort_key" ON "Server"("host", "rconPort");

-- CreateIndex
CREATE UNIQUE INDEX "User_steamId_key" ON "User"("steamId");
