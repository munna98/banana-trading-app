// context/services/inventorySnapshotService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const inventorySnapshotService = {
  // Fetch all inventory snapshots
  async getAll() {
    try {
      return await prisma.inventorySnapshot.findMany({
        include: {
          item: true
        },
        orderBy: [
          { date: 'desc' },
          { item: { name: 'asc' } }
        ]
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshots');
    }
  },

  // Create new inventory snapshot
  async create(snapshotData) {
    try {
      return await prisma.inventorySnapshot.create({
        data: snapshotData,
        include: {
          item: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating inventory snapshot');
    }
  },

  // Update existing inventory snapshot
  async update(id, snapshotData) {
    try {
      return await prisma.inventorySnapshot.update({
        where: { id },
        data: snapshotData,
        include: {
          item: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating inventory snapshot');
    }
  },

  // Delete inventory snapshot
  async delete(id) {
    try {
      return await prisma.inventorySnapshot.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting inventory snapshot');
    }
  },

  // Get inventory snapshot by ID
  async getById(id) {
    try {
      return await prisma.inventorySnapshot.findUnique({
        where: { id },
        include: {
          item: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshot by ID');
    }
  },

  // Get snapshots by item ID
  async getByItem(itemId) {
    try {
      return await prisma.inventorySnapshot.findMany({
        where: { itemId },
        include: {
          item: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshots by item');
    }
  },

  // Get snapshots by date range
  async getByDateRange(startDate, endDate) {
    try {
      return await prisma.inventorySnapshot.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          item: true
        },
        orderBy: [
          { date: 'desc' },
          { item: { name: 'asc' } }
        ]
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshots by date range');
    }
  },

  // Get latest snapshot for each item
  async getLatestForAllItems() {
    try {
      const items = await prisma.item.findMany({
        include: {
          inventorySnapshots: {
            orderBy: { date: 'desc' },
            take: 1
          }
        }
      });

      return items.map(item => ({
        item,
        latestSnapshot: item.inventorySnapshots[0] || null
      }));
    } catch (error) {
      handleDatabaseError(error, 'Fetching latest inventory snapshots for all items');
    }
  },

  // Get latest snapshot for specific item
  async getLatestForItem(itemId) {
    try {
      return await prisma.inventorySnapshot.findFirst({
        where: { itemId },
        include: {
          item: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching latest inventory snapshot for item');
    }
  },

  // Create snapshots for all items (bulk operation)
  async createBulkSnapshot(date = new Date()) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get all items with their current stock
        const items = await tx.item.findMany();
        
        // Create snapshots for all items
        const snapshots = await Promise.all(
          items.map(item =>
            tx.inventorySnapshot.create({
              data: {
                itemId: item.id,
                quantity: item.currentStock,
                date: date
              },
              include: {
                item: true
              }
            })
          )
        );

        return snapshots;
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating bulk inventory snapshots');
    }
  },

  // Get snapshots for specific date
  async getByDate(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await prisma.inventorySnapshot.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          item: true
        },
        orderBy: { item: { name: 'asc' } }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshots by date');
    }
  },

  // Get inventory history for item (with date range)
  async getItemHistory(itemId, startDate, endDate) {
    try {
      return await prisma.inventorySnapshot.findMany({
        where: {
          itemId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          item: true
        },
        orderBy: { date: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching item inventory history');
    }
  },

  // Get inventory movement analysis
  async getMovementAnalysis(itemId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshots = await prisma.inventorySnapshot.findMany({
        where: {
          itemId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          item: true
        },
        orderBy: { date: 'asc' }
      });

      if (snapshots.length < 2) {
        return {
          snapshots,
          totalMovement: 0,
          averageDaily: 0,
          trend: 'insufficient_data'
        };
      }

      const movements = [];
      for (let i = 1; i < snapshots.length; i++) {
        const movement = snapshots[i].quantity - snapshots[i - 1].quantity;
        movements.push(movement);
      }

      const totalMovement = movements.reduce((sum, movement) => sum + Math.abs(movement), 0);
      const averageDaily = totalMovement / days;
      
      // Determine trend
      const firstQuantity = snapshots[0].quantity;
      const lastQuantity = snapshots[snapshots.length - 1].quantity;
      const trend = lastQuantity > firstQuantity ? 'increasing' : 
                   lastQuantity < firstQuantity ? 'decreasing' : 'stable';

      return {
        snapshots,
        movements,
        totalMovement,
        averageDaily,
        trend,
        startQuantity: firstQuantity,
        endQuantity: lastQuantity,
        netChange: lastQuantity - firstQuantity
      };
    } catch (error) {
      handleDatabaseError(error, 'Analyzing inventory movement');
    }
  },

  // Delete old snapshots (cleanup utility)
  async deleteOldSnapshots(daysToKeep = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.inventorySnapshot.deleteMany({
        where: {
          date: {
            lt: cutoffDate
          }
        }
      });

      return { deletedCount: result.count };
    } catch (error) {
      handleDatabaseError(error, 'Deleting old inventory snapshots');
    }
  },

  // Get snapshot statistics
  async getStats() {
    try {
      const totalSnapshots = await prisma.inventorySnapshot.count();
      
      const oldestSnapshot = await prisma.inventorySnapshot.findFirst({
        orderBy: { date: 'asc' }
      });
      
      const newestSnapshot = await prisma.inventorySnapshot.findFirst({
        orderBy: { date: 'desc' }
      });

      const itemsWithSnapshots = await prisma.inventorySnapshot.groupBy({
        by: ['itemId'],
        _count: {
          id: true
        }
      });

      return {
        totalSnapshots,
        uniqueItems: itemsWithSnapshots.length,
        oldestSnapshotDate: oldestSnapshot?.date,
        newestSnapshotDate: newestSnapshot?.date,
        averageSnapshotsPerItem: itemsWithSnapshots.length > 0 
          ? totalSnapshots / itemsWithSnapshots.length 
          : 0
      };
    } catch (error) {
      handleDatabaseError(error, 'Fetching inventory snapshot statistics');
    }
  }
};