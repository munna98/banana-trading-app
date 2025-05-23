// context/services/customerService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const customerService = {
  // Fetch all customers
  async getAll() {
    try {
      return await prisma.customer.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching customers');
    }
  },

  // Create new customer
  async create(customerData) {
    try {
      return await prisma.customer.create({
        data: {
          ...customerData,
          balance: 0 // Initialize balance to 0
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating customer');
    }
  },

  // Update existing customer
  async update(id, customerData) {
    try {
      return await prisma.customer.update({
        where: { id },
        data: customerData
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating customer');
    }
  },

  // Delete customer
  async delete(id) {
    try {
      return await prisma.customer.delete({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting customer');
    }
  },

  // Get customer by ID
  async getById(id) {
    try {
      return await prisma.customer.findUnique({
        where: { id }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching customer by ID');
    }
  },

  // Update customer balance
  async updateBalance(id, amount, operation = 'increment') {
    try {
      return await prisma.customer.update({
        where: { id },
        data: {
          balance: {
            [operation]: amount
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating customer balance');
    }
  }
};