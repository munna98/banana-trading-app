// context/services/itemService.js (UPDATED)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const itemService = {
  // Fetch all items
  async getAll() {
    try {
      return await prisma.item.findMany({
        include: {
          inventorySnapshots: {
            orderBy: { date: 'desc' },
            take: 1 // Get latest snapshot
          }
        },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching items');
    }
  },

  // Create new item
  async create(itemData) {
    try {
      return await prisma.item.create({
        data: itemData
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating item');
    }
  },

  // Update existing item
  async update(id, itemData) {
    try {
      return await prisma.item.update({
        where: { id },
        data: itemData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating item');
    }
  },

  // Update stock levels
  async updateStock(id, quantity, operation = 'set') {
    try {
      const updateData = operation === 'set' 
        ? { currentStock: quantity }
        : { currentStock: { [operation]: quantity } };
        
      return await prisma.item.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating item stock');
    }
  },

  // Delete item
  async delete(id) {
    try {
      return await prisma.item.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting item');
    }
  },

  // Get item by ID
  async getById(id) {
    try {
      return await prisma.item.findUnique({
        where: { id },
        include: {
          inventorySnapshots: {
            orderBy: { date: 'desc' },
            take: 5 // Get recent snapshots
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching item by ID');
    }
  },

  // Get low stock items
  async getLowStock(threshold = 10) {
    try {
      return await prisma.item.findMany({
        where: {
          currentStock: {
            lte: threshold
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching low stock items');
    }
  }
};