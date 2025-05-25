
// context/services/cashBookService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const cashBookService = {
  // Fetch all cash book entries
  async getAll() {
    try {
      return await prisma.cashBook.findMany({
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching cash book entries');
    }
  },

  // Create or update daily cash book entry
  async createOrUpdate(date, cashData) {
    try {
      const existingEntry = await prisma.cashBook.findUnique({
        where: { date }
      });

      if (existingEntry) {
        return await prisma.cashBook.update({
          where: { date },
          data: {
            ...cashData,
            closingCash: cashData.openingCash + cashData.cashIn - cashData.cashOut
          }
        });
      } else {
        return await prisma.cashBook.create({
          data: {
            date,
            ...cashData,
            closingCash: cashData.openingCash + cashData.cashIn - cashData.cashOut
          }
        });
      }
    } catch (error) {
      handleDatabaseError(error, 'Creating/updating cash book entry');
    }
  },

  // Get cash book entry by date
  async getByDate(date) {
    try {
      return await prisma.cashBook.findUnique({
        where: { date }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching cash book entry by date');
    }
  },

  // Get cash book entries by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.cashBook.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching cash book entries by date range');
    }
  },

  // Calculate daily cash summary
  async calculateDailyCashSummary(date) {
    try {
      // Get cash receipts for the day
      const cashReceipts = await prisma.receipt.aggregate({
        where: {
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          },
          paymentMethod: 'CASH'
        },
        _sum: { amount: true }
      });

      // Get cash payments for the day
      const cashPayments = await prisma.payment.aggregate({
        where: {
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          },
          paymentMethod: 'CASH'
        },
        _sum: { amount: true }
      });

      // Get cash sales for the day
      const cashSales = await prisma.sale.aggregate({
        where: {
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          },
          receipts: {
            some: {
              paymentMethod: 'CASH'
            }
          }
        },
        _sum: { receivedAmount: true }
      });

      return {
        cashIn: (cashReceipts._sum.amount || 0) + (cashSales._sum.receivedAmount || 0),
        cashOut: cashPayments._sum.amount || 0,
        netCash: ((cashReceipts._sum.amount || 0) + (cashSales._sum.receivedAmount || 0)) - (cashPayments._sum.amount || 0)
      };
    } catch (error) {
      handleDatabaseError(error, 'Calculating daily cash summary');
    }
  }
};