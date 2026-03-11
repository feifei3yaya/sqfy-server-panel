-- CreateTable
CREATE TABLE "PlayerNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "steamId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerNote_steamId_fkey" FOREIGN KEY ("steamId") REFERENCES "Player" ("steamId") ON DELETE RESTRICT ON UPDATE CASCADE
);
