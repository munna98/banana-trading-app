/*
  Warnings:

  - You are about to drop the `ExpenseCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ExpenseCategory_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExpenseCategory";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNo" TEXT,
    "notes" TEXT,
    "purchaseId" INTEGER,
    "saleId" INTEGER,
    "paymentId" INTEGER,
    "receiptId" INTEGER,
    "categoryId" INTEGER,
    "bankTransactionId" INTEGER,
    CONSTRAINT "Transaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "bankTransactionId", "categoryId", "date", "description", "id", "notes", "paymentId", "purchaseId", "receiptId", "referenceNo", "saleId", "type") SELECT "amount", "bankTransactionId", "categoryId", "date", "description", "id", "notes", "paymentId", "purchaseId", "receiptId", "referenceNo", "saleId", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_purchaseId_key" ON "Transaction"("purchaseId");
CREATE UNIQUE INDEX "Transaction_saleId_key" ON "Transaction"("saleId");
CREATE UNIQUE INDEX "Transaction_paymentId_key" ON "Transaction"("paymentId");
CREATE UNIQUE INDEX "Transaction_receiptId_key" ON "Transaction"("receiptId");
CREATE UNIQUE INDEX "Transaction_bankTransactionId_key" ON "Transaction"("bankTransactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
