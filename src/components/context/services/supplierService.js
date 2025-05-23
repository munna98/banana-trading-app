// context/services/supplierService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const supplierService = {
  // Fetch all suppliers
  async getAll() {
    try {
      return await prisma.supplier.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching suppliers');
    }
  },

  // Create new supplier
  async create(supplierData) {
    try {
      return await prisma.supplier.create({
        data: {
          ...supplierData,
          balance: 0 // Initialize balance to 0
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating supplier');
    }
  },

  // Update existing supplier
  async update(id, supplierData) {
    try {
      return await prisma.supplier.update({
        where: { id },
        data: supplierData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating supplier');
    }
  },

  // Delete supplier
  async delete(id) {
    try {
      return await prisma.supplier.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting supplier');
    }
  },

  // Get supplier by ID
  async getById(id) {
    try {
      return await prisma.supplier.findUnique({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching supplier by ID');
    }
  },

  // Update supplier balance
  async updateBalance(id, amount, operation = 'increment') {
    try {
      return await prisma.supplier.update({
        where: { id },
        data: {
          balance: {
            [operation]: amount
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating supplier balance');
    }
  }
};