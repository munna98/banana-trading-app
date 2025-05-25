// context/services/accountService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const accountService = {
  // Fetch all accounts
  async getAll() {
    try {
      return await prisma.account.findMany({
        include: {
          parent: true,
          children: true,
          _count: {
            select: { entries: true }
          }
        },
        orderBy: { code: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching accounts');
    }
  },

  // Get chart of accounts (hierarchical structure)
  async getChartOfAccounts() {
    try {
      return await prisma.account.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: true
            }
          }
        },
        orderBy: { code: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching chart of accounts');
    }
  },

  // Create new account
  async create(accountData) {
    try {
      return await prisma.account.create({
        data: accountData,
        include: {
          parent: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating account');
    }
  },

  // Update existing account
  async update(id, accountData) {
    try {
      return await prisma.account.update({
        where: { id },
        data: accountData,
        include: {
          parent: true,
          children: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating account');
    }
  },

  // Delete account
  async delete(id) {
    try {
      return await prisma.account.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting account');
    }
  },

  // Get account by ID
  async getById(id) {
    try {
      return await prisma.account.findUnique({
        where: { id },
        include: {
          parent: true,
          children: true,
          entries: {
            include: {
              transaction: true
            },
            orderBy: { transaction: { date: 'desc' } },
            take: 50 // Recent entries
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching account by ID');
    }
  },

  // Get account balance
  async getBalance(id) {
    try {
      const result = await prisma.transactionEntry.aggregate({
        where: { accountId: id },
        _sum: {
          debitAmount: true,
          creditAmount: true
        }
      });

      const debitTotal = result._sum.debitAmount || 0;
      const creditTotal = result._sum.creditAmount || 0;

      // Get account type to determine normal balance
      const account = await prisma.account.findUnique({
        where: { id },
        select: { type: true }
      });

      let balance;
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        balance = debitTotal - creditTotal; // Normal debit balance
      } else {
        balance = creditTotal - debitTotal; // Normal credit balance
      }

      return {
        debitTotal,
        creditTotal,
        balance,
        accountType: account.type
      };
    } catch (error) {
      handleDatabaseError(error, 'Calculating account balance');
    }
  },

  // Get accounts by type
  async getByType(accountType) {
    try {
      return await prisma.account.findMany({
        where: { type: accountType, isActive: true },
        orderBy: { code: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching accounts by type');
    }
  }
};