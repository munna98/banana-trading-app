// context/services/reportingPeriodService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const reportingPeriodService = {
  // Fetch all reporting periods
  async getAll() {
    try {
      return await prisma.reportingPeriod.findMany({
        orderBy: { startDate: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching reporting periods');
    }
  },

  // Create new reporting period
  async create(periodData) {
    try {
      return await prisma.reportingPeriod.create({
        data: {
          ...periodData,
          profit: (periodData.revenue || 0) - (periodData.expenses || 0)
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating reporting period');
    }
  },

  // Update existing reporting period
  async update(id, periodData) {
    try {
      const updateData = {
        ...periodData
      };

      // Recalculate profit if revenue or expenses are updated
      if (periodData.revenue !== undefined || periodData.expenses !== undefined) {
        const current = await prisma.reportingPeriod.findUnique({ where: { id } });
        if (current) {
          const revenue = periodData.revenue !== undefined ? periodData.revenue : current.revenue;
          const expenses = periodData.expenses !== undefined ? periodData.expenses : current.expenses;
          updateData.profit = revenue - expenses;
        }
      }

      return await prisma.reportingPeriod.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating reporting period');
    }
  },

  // Delete reporting period
  async delete(id) {
    try {
      return await prisma.reportingPeriod.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting reporting period');
    }
  },

  // Get reporting period by ID
  async getById(id) {
    try {
      return await prisma.reportingPeriod.findUnique({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching reporting period by ID');
    }
  },

  // Finalize a reporting period
  async finalize(id) {
    try {
      return await prisma.reportingPeriod.update({
        where: { id },
        data: { isFinalized: true }
      });
    } catch (error) {
      handleDatabaseError(error, 'Finalizing reporting period');
    }
  },

  // Unfinalize a reporting period
  async unfinalize(id) {
    try {
      return await prisma.reportingPeriod.update({
        where: { id },
        data: { isFinalized: false }
      });
    } catch (error) {
      handleDatabaseError(error, 'Unfinalizing reporting period');
    }
  },

  // Get active (non-finalized) reporting periods
  async getActive() {
    try {
      return await prisma.reportingPeriod.findMany({
        where: { isFinalized: false },
        orderBy: { startDate: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching active reporting periods');
    }
  },

  // Get finalized reporting periods
  async getFinalized() {
    try {
      return await prisma.reportingPeriod.findMany({
        where: { isFinalized: true },
        orderBy: { startDate: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching finalized reporting periods');
    }
  },

  // Get reporting periods by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.reportingPeriod.findMany({
        where: {
          AND: [
            { startDate: { gte: startDate } },
            { endDate: { lte: endDate } }
          ]
        },
        orderBy: { startDate: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching reporting periods by date range');
    }
  },

  // Get current reporting period (period that includes today)
  async getCurrent() {
    try {
      const today = new Date();
      return await prisma.reportingPeriod.findFirst({
        where: {
          AND: [
            { startDate: { lte: today } },
            { endDate: { gte: today } }
          ]
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching current reporting period');
    }
  },

  // Update financial data (revenue, expenses, profit)
  async updateFinancials(id, { revenue, expenses }) {
    try {
      const profit = revenue - expenses;
      
      return await prisma.reportingPeriod.update({
        where: { id },
        data: {
          revenue,
          expenses,
          profit
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating reporting period financials');
    }
  },

  // Increment revenue
  async incrementRevenue(id, amount) {
    try {
      return await prisma.reportingPeriod.update({
        where: { id },
        data: {
          revenue: { increment: amount },
          profit: { increment: amount }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Incrementing reporting period revenue');
    }
  },

  // Increment expenses
  async incrementExpenses(id, amount) {
    try {
      return await prisma.reportingPeriod.update({
        where: { id },
        data: {
          expenses: { increment: amount },
          profit: { decrement: amount }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Incrementing reporting period expenses');
    }
  },

  // Get summary statistics for all periods
  async getSummaryStats() {
    try {
      const stats = await prisma.reportingPeriod.aggregate({
        _sum: {
          revenue: true,
          expenses: true,
          profit: true
        },
        _avg: {
          revenue: true,
          expenses: true,
          profit: true
        },
        _count: {
          id: true
        }
      });

      const finalizedCount = await prisma.reportingPeriod.count({
        where: { isFinalized: true }
      });

      return {
        totalRevenue: stats._sum.revenue || 0,
        totalExpenses: stats._sum.expenses || 0,
        totalProfit: stats._sum.profit || 0,
        averageRevenue: stats._avg.revenue || 0,
        averageExpenses: stats._avg.expenses || 0,
        averageProfit: stats._avg.profit || 0,
        totalPeriods: stats._count.id || 0,
        finalizedPeriods: finalizedCount,
        activePeriods: (stats._count.id || 0) - finalizedCount
      };
    } catch (error) {
      handleDatabaseError(error, 'Fetching reporting period summary stats');
    }
  }
};