// context/services/expenseService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const expenseService = {
  // Fetch all expenses
  async getAll() {
    try {
      return await prisma.expense.findMany({
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expenses');
    }
  },

  // Create new expense
  async create(expenseData) {
    try {
      return await prisma.expense.create({
        data: {
          ...expenseData,
          date: expenseData.date || new Date()
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating expense');
    }
  },

  // Update existing expense
  async update(id, expenseData) {
    try {
      return await prisma.expense.update({
        where: { id },
        data: expenseData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating expense');
    }
  },

  // Delete expense
  async delete(id) {
    try {
      return await prisma.expense.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting expense');
    }
  },

  // Get expense by ID
  async getById(id) {
    try {
      return await prisma.expense.findUnique({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expense by ID');
    }
  },

  // Get expenses by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.expense.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expenses by date range');
    }
  },

  // Get expenses by category
  async getByCategory(category) {
    try {
      return await prisma.expense.findMany({
        where: { category },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expenses by category');
    }
  },

  // Get total expenses for a period
  async getTotalForPeriod(startDate, endDate) {
    try {
      const result = await prisma.expense.aggregate({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        }
      });
      return result._sum.amount || 0;
    } catch (error) {
      handleDatabaseError(error, 'Calculating total expenses for period');
    }
  }
};