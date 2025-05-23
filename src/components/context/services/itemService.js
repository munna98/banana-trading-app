// context/services/itemService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const itemService = {
  // Fetch all items
  async getAll() {
    try {
      return await prisma.item.findMany({
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
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching item by ID');
    }
  }
};