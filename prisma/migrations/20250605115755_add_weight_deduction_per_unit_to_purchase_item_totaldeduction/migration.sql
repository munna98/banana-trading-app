/*
  Warnings:

  - Added the required column `totalWeightDeduction` to the `PurchaseItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PurchaseItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "purchaseId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "weightDeductionPerUnit" REAL NOT NULL,
    "totalWeightDeduction" REAL NOT NULL,
    "effectiveQuantity" REAL NOT NULL,
    "numberOfBunches" INTEGER,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PurchaseItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PurchaseItem" ("amount", "effectiveQuantity", "id", "itemId", "purchaseId", "quantity", "rate", "weightDeductionPerUnit") SELECT "amount", "effectiveQuantity", "id", "itemId", "purchaseId", "quantity", "rate", "weightDeductionPerUnit" FROM "PurchaseItem";
DROP TABLE "PurchaseItem";
ALTER TABLE "new_PurchaseItem" RENAME TO "PurchaseItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
