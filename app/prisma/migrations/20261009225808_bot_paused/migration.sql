-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "city" TEXT,
    "country" TEXT,
    "intent" TEXT NOT NULL DEFAULT 'BUY',
    "propertyType" TEXT,
    "budgetMin" REAL,
    "budgetMax" REAL,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "consent" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "botPaused" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "Lead_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("archivedAt", "budgetMax", "budgetMin", "city", "consent", "country", "createdAt", "email", "id", "intent", "lastActivityAt", "name", "orgId", "ownerId", "phone", "propertyType", "score", "source", "stage", "updatedAt") SELECT "archivedAt", "budgetMax", "budgetMin", "city", "consent", "country", "createdAt", "email", "id", "intent", "lastActivityAt", "name", "orgId", "ownerId", "phone", "propertyType", "score", "source", "stage", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_orgId_stage_idx" ON "Lead"("orgId", "stage");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
