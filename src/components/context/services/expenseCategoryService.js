// context/services/expenseCategoryService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const expenseCategoryService = {
  // Fetch all expense categories
  async getAll() {
    try {
      return await prisma.expenseCategory.findMany({
        include: {
          _count: {
            select: { transactions: true }
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expense categories');
    }
  },

  // Create new expense category
  async create(categoryData) {
    try {
      return await prisma.expenseCategory.create({
        data: categoryData
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating expense category');
    }
  },

  // Update existing expense category
  async update(id, categoryData) {
    try {
      return await prisma.expenseCategory.update({
        where: { id },
        data: categoryData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating expense category');
    }
  },

  // Delete expense category
  async delete(id) {
    try {
      return await prisma.expenseCategory.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting expense category');
    }
  },

  // Get expense category by ID
  async getById(id) {
    try {
      return await prisma.expenseCategory.findUnique({
        where: { id },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 20
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching expense category by ID');
    }
  },

  // Get active expense categories
  async getActive() {
    try {
      return await prisma.expenseCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching active expense categories');
    }
  }
};
