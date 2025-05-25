// context/services/transactionService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const transactionService = {
  // Fetch all transactions
  async getAll() {
    try {
      return await prisma.transaction.findMany({
        include: {
          entries: {
            include: {
              account: true
            }
          },
          purchase: {
            include: { supplier: true }
          },
          sale: {
            include: { customer: true }
          },
          payment: {
            include: { supplier: true }
          },
          receipt: {
            include: { customer: true }
          },
          category: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching transactions');
    }
  },

  // Create purchase transaction
  async createPurchaseTransaction(purchase, tx = prisma) {
    try {
      // Get account IDs (assuming they exist)
      const inventoryAccount = await tx.account.findFirst({ where: { code: 'INVENTORY' } });
      const payableAccount = await tx.account.findFirst({ where: { code: 'ACCOUNTS_PAYABLE' } });
      const cashAccount = await tx.account.findFirst({ where: { code: 'CASH' } });

      const transaction = await tx.transaction.create({
        data: {
          type: 'PURCHASE',
          amount: purchase.totalAmount,
          description: `Purchase from ${purchase.supplier.name}`,
          purchaseId: purchase.id,
          entries: {
            create: [
              // Debit Inventory
              {
                accountId: inventoryAccount.id,
                debitAmount: purchase.totalAmount,
                description: 'Inventory purchase'
              },
              // Credit Accounts Payable (if not fully paid)
              ...(purchase.totalAmount > purchase.paidAmount ? [{
                accountId: payableAccount.id,
                creditAmount: purchase.totalAmount - purchase.paidAmount,
                description: 'Amount payable to supplier'
              }] : []),
              // Credit Cash (if partially/fully paid)
              ...(purchase.paidAmount > 0 ? [{
                accountId: cashAccount.id,
                creditAmount: purchase.paidAmount,
                description: 'Cash payment'
              }] : [])
            ]
          }
        }
      });

      return transaction;
    } catch (error) {
      handleDatabaseError(error, 'Creating purchase transaction');
    }
  },

  // Create sale transaction
  async createSaleTransaction(sale, tx = prisma) {
    try {
      const receivableAccount = await tx.account.findFirst({ where: { code: 'ACCOUNTS_RECEIVABLE' } });
      const revenueAccount = await tx.account.findFirst({ where: { code: 'SALES_REVENUE' } });
      const cashAccount = await tx.account.findFirst({ where: { code: 'CASH' } });

      const transaction = await tx.transaction.create({
        data: {
          type: 'SALE',
          amount: sale.totalAmount,
          description: `Sale to ${sale.customer.name}`,
          saleId: sale.id,
          entries: {
            create: [
              // Debit Accounts Receivable (if not fully received)
              ...(sale.totalAmount > sale.receivedAmount ? [{
                accountId: receivableAccount.id,
                debitAmount: sale.totalAmount - sale.receivedAmount,
                description: 'Amount receivable from customer'
              }] : []),
              // Debit Cash (if partially/fully received)
              ...(sale.receivedAmount > 0 ? [{
                accountId: cashAccount.id,
                debitAmount: sale.receivedAmount,
                description: 'Cash received'
              }] : []),
              // Credit Sales Revenue
              {
                accountId: revenueAccount.id,
                creditAmount: sale.totalAmount,
                description: 'Sales revenue'
              }
            ]
          }
        }
      });

      return transaction;
    } catch (error) {
      handleDatabaseError(error, 'Creating sale transaction');
    }
  },

  // Create payment transaction
  async createPaymentTransaction(payment, tx = prisma) {
    try {
      const payableAccount = await tx.account.findFirst({ where: { code: 'ACCOUNTS_PAYABLE' } });
      const cashAccount = await tx.account.findFirst({ where: { code: 'CASH' } });
      const bankAccount = await tx.account.findFirst({ where: { code: 'BANK' } });

      // Determine which account to credit based on payment method
      let creditAccountId;
      switch (payment.paymentMethod) {
        case 'CASH':
          creditAccountId = cashAccount.id;
          break;
        case 'BANK_TRANSFER':
        case 'CHEQUE':
        case 'UPI':
        case 'CARD':
          creditAccountId = bankAccount.id;
          break;
        default:
          creditAccountId = cashAccount.id;
      }

      const transaction = await tx.transaction.create({
        data: {
          type: 'PAYMENT',
          amount: payment.amount,
          description: `Payment to ${payment.supplier?.name || 'Supplier'} via ${payment.paymentMethod}`,
          paymentId: payment.id,
          entries: {
            create: [
              // Debit Accounts Payable
              {
                accountId: payableAccount.id,
                debitAmount: payment.amount,
                description: 'Payment to supplier'
              },
              // Credit Cash/Bank
              {
                accountId: creditAccountId,
                creditAmount: payment.amount,
                description: `Payment via ${payment.paymentMethod}`
              }
            ]
          }
        }
      });

      return transaction;
    } catch (error) {
      handleDatabaseError(error, 'Creating payment transaction');
    }
  },

  // Create receipt transaction
  async createReceiptTransaction(receipt, tx = prisma) {
    try {
      const receivableAccount = await tx.account.findFirst({ where: { code: 'ACCOUNTS_RECEIVABLE' } });
      const cashAccount = await tx.account.findFirst({ where: { code: 'CASH' } });
      const bankAccount = await tx.account.findFirst({ where: { code: 'BANK' } });

      // Determine which account to debit based on payment method
      let debitAccountId;
      switch (receipt.paymentMethod) {
        case 'CASH':
          debitAccountId = cashAccount.id;
          break;
        case 'BANK_TRANSFER':
        case 'CHEQUE':
        case 'UPI':
        case 'CARD':
          debitAccountId = bankAccount.id;
          break;
        default:
          debitAccountId = cashAccount.id;
      }

      const transaction = await tx.transaction.create({
        data: {
          type: 'RECEIPT',
          amount: receipt.amount,
          description: `Receipt from ${receipt.customer?.name || 'Customer'} via ${receipt.paymentMethod}`,
          receiptId: receipt.id,
          entries: {
            create: [
              // Debit Cash/Bank
              {
                accountId: debitAccountId,
                debitAmount: receipt.amount,
                description: `Receipt via ${receipt.paymentMethod}`
              },
              // Credit Accounts Receivable
              {
                accountId: receivableAccount.id,
                creditAmount: receipt.amount,
                description: 'Receipt from customer'
              }
            ]
          }
        }
      });

      return transaction;
    } catch (error) {
      handleDatabaseError(error, 'Creating receipt transaction');
    }
  },

  // Create expense transaction
  async createExpenseTransaction(expenseData, tx = prisma) {
    try {
      const expenseAccount = await tx.account.findFirst({ 
        where: { type: 'EXPENSE', name: { contains: expenseData.category || 'General' } } 
      });
      const cashAccount = await tx.account.findFirst({ where: { code: 'CASH' } });

      const transaction = await tx.transaction.create({
        data: {
          type: 'EXPENSE',
          amount: expenseData.amount,
          description: expenseData.description || 'General expense',
          categoryId: expenseData.categoryId,
          entries: {
            create: [
              // Debit Expense
              {
                accountId: expenseAccount.id,
                debitAmount: expenseData.amount,
                description: expenseData.description
              },
              // Credit Cash
              {
                accountId: cashAccount.id,
                creditAmount: expenseData.amount,
                description: 'Cash payment for expense'
              }
            ]
          }
        }
      });

      return transaction;
    } catch (error) {
      handleDatabaseError(error, 'Creating expense transaction');
    }
  },

  // Get transaction by ID
  async getById(id) {
    try {
      return await prisma.transaction.findUnique({
        where: { id },
        include: {
          entries: {
            include: {
              account: true
            }
          },
          purchase: {
            include: { supplier: true }
          },
          sale: {
            include: { customer: true }
          },
          payment: {
            include: { supplier: true }
          },
          receipt: {
            include: { customer: true }
          },
          category: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching transaction by ID');
    }
  },

  // Get transactions by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.transaction.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          entries: {
            include: {
              account: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching transactions by date range');
    }
  }
};
