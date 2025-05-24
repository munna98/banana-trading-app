/*
  Warnings:

  - You are about to drop the column `name COLLATE NOCASE` on the `Item` table. All the data in the column will be lost.
  - Added the required column `name` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'Kg',
    "purchaseRate" REAL NOT NULL DEFAULT 0.0,
    "salesRate" REAL NOT NULL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Item" ("createdAt", "description", "id", "purchaseRate", "salesRate", "unit", "updatedAt") SELECT "createdAt", "description", "id", "purchaseRate", "salesRate", "unit", "updatedAt" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
