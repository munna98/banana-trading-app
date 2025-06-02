/*
  Warnings:

  - You are about to drop the column `balance` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `Supplier` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "Customer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("accountId", "address", "createdAt", "id", "name", "phone", "updatedAt") SELECT "accountId", "address", "createdAt", "id", "name", "phone", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX "Customer_accountId_key" ON "Customer"("accountId");
CREATE TABLE "new_Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountId" INTEGER NOT NULL,
    CONSTRAINT "Supplier_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("accountId", "address", "createdAt", "id", "name", "phone", "updatedAt") SELECT "accountId", "address", "createdAt", "id", "name", "phone", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE UNIQUE INDEX "Supplier_phone_key" ON "Supplier"("phone");
CREATE UNIQUE INDEX "Supplier_accountId_key" ON "Supplier"("accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
