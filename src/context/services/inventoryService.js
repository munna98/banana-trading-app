// context/services/inventoryService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const inventoryService = {
  // Create inventory snapshot
  async createSnapshot(itemId, snapshotData) {
    try {
      return await prisma.inventorySnapshot.create({
        data: {
          itemId,
          ...snapshotData
        },
        include: {
          item: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating inventory snapshot');
    }
  },

  // Get inventory snapshots for an item
  async getSnapshotsByItem(itemId, limit = 10) {
    try {
      return await prisma.inventorySnapshot.findMany({
        where: { itemId },
        include: {
          item: true
        },
        orderBy: { date: 'desc' },
        take: limit
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshots by item');
    }
  },

  // Get current inventory valuation
  async getCurrentValuation() {
    try {
      const items = await prisma.item.findMany({
        where: { currentStock: { gt: 0 } },
        select: {
          id: true,
          name: true,
          currentStock: true,
          purchaseRate: true,
          salesRate: true
        }
      });

      const valuation = items.map(item => ({
        ...item,
        purchaseValue: item.currentStock * item.purchaseRate,
        salesValue: item.currentStock * item.salesRate,
        potentialProfit: (item.currentStock * item.salesRate) - (item.currentStock * item.purchaseRate)
      }));

      const totals = {
        totalPurchaseValue: valuation.reduce((sum, item) => sum + item.purchaseValue, 0),
        totalSalesValue: valuation.reduce((sum, item) => sum + item.salesValue, 0),
        totalPotentialProfit: valuation.reduce((sum, item) => sum + item.potentialProfit, 0)
      };

      return {
        items: valuation,
        totals
      };
    } catch (error) {
      handleDatabaseError(error, 'Calculating current inventory valuation');
    }
  },

  // Get inventory movement report
  async getMovementReport(itemId, startDate, endDate) {
    try {
      const purchases = await prisma.purchaseItem.findMany({
        where: {
          itemId,
          purchase: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        include: {
          purchase: {
            include: { supplier: true }
          }
        },
        orderBy: { purchase: { date: 'asc' } }
      });

      const sales = await prisma.saleItem.findMany({
        where: {
          itemId,
          sale: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        include: {
          sale: {
            include: { customer: true }
          }
        },
        orderBy: { sale: { date: 'asc' } }
      });

      return {
        purchases,
        sales,
        totalPurchased: purchases.reduce((sum, p) => sum + (p.quantity - p.weightDeduction), 0),
        totalSold: sales.reduce((sum, s) => sum + s.quantity, 0),
        totalPurchaseValue: purchases.reduce((sum, p) => sum + p.amount, 0),
        totalSalesValue: sales.reduce((sum, s) => sum + s.amount, 0)
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating inventory movement report');
    }
  },

  // Update all item stock levels (for reconciliation)
  async reconcileStock(stockUpdates) {
    try {
      return await prisma.$transaction(async (tx) => {
        const results = [];
        
        for (const update of stockUpdates) {
          const result = await tx.item.update({
            where: { id: update.itemId },
            data: { currentStock: update.newStock }
          });
          
          // Create snapshot for the reconciliation
          await tx.inventorySnapshot.create({
            data: {
              itemId: update.itemId,
              quantity: update.newStock,
              rate: update.rate || 0,
              value: (update.newStock * (update.rate || 0)),
              method: 'RECONCILIATION',
              notes: update.notes || 'Stock reconciliation'
            }
          });
          
          results.push(result);
        }
        
        return results;
      });
    } catch (error) {
      handleDatabaseError(error, 'Reconciling stock levels');
    }
  }
};