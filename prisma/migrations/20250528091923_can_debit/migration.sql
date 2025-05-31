-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "openingBalance" DECIMAL DEFAULT 0.0,
    "canDebitOnPayment" BOOLEAN NOT NULL DEFAULT false,
    "canCreditOnReceipt" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("code", "createdAt", "description", "id", "isActive", "name", "parentId", "type", "updatedAt") SELECT "code", "createdAt", "description", "id", "isActive", "name", "parentId", "type", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
