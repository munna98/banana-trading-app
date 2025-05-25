// context/services/bankTransactionService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const bankTransactionService = {
  // Fetch all bank transactions
  async getAll() {
    try {
      return await prisma.bankTransaction.findMany({
        include: {
          transaction: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching bank transactions');
    }
  },

  // Create new bank transaction
  async create(bankTransactionData) {
    try {
      return await prisma.bankTransaction.create({
        data: bankTransactionData
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating bank transaction');
    }
  },

  // Bulk import bank transactions
  async bulkImport(transactions) {
    try {
      return await prisma.bankTransaction.createMany({
        data: transactions,
        skipDuplicates: true
      });
    } catch (error) {
      handleDatabaseError(error, 'Bulk importing bank transactions');
    }
  },

  // Update existing bank transaction
  async update(id, bankTransactionData) {
    try {
      return await prisma.bankTransaction.update({
        where: { id },
        data: bankTransactionData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating bank transaction');
    }
  },

  // Delete bank transaction
  async delete(id) {
    try {
      return await prisma.bankTransaction.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting bank transaction');
    }
  },

  // Get bank transaction by ID
  async getById(id) {
    try {
      return await prisma.bankTransaction.findUnique({
        where: { id },
        include: {
          transaction: {
            include: {
              entries: {
                include: {
                  account: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching bank transaction by ID');
    }
  },

  // Get unreconciled bank transactions
  async getUnreconciled() {
    try {
      return await prisma.bankTransaction.findMany({
        where: { isReconciled: false },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching unreconciled bank transactions');
    }
  },

  // Reconcile bank transaction
  async reconcile(id, transactionId) {
    try {
      return await prisma.bankTransaction.update({
        where: { id },
        data: {
          isReconciled: true,
          transactionId
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Reconciling bank transaction');
    }
  },

  // Get bank transactions by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.bankTransaction.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          transaction: true
        },
        orderBy: { date: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching bank transactions by date range');
    }
  }
};
