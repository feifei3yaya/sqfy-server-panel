-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "steamId" TEXT NOT NULL PRIMARY KEY,
    "nameHistory" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalPlaytime" INTEGER NOT NULL DEFAULT 0,
    "steamPlaytime" INTEGER NOT NULL DEFAULT 0,
    "lastSteamSync" DATETIME,
    "firstSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Player" ("firstSeen", "lastSeen", "nameHistory", "points", "reputation", "steamId", "totalPlaytime") SELECT "firstSeen", "lastSeen", "nameHistory", "points", "reputation", "steamId", "totalPlaytime" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
