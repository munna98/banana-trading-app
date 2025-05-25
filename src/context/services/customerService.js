// context/services/customerService.js (UPDATED - remove balance field)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const customerService = {
  // Fetch all customers with outstanding balances
  async getAll() {
    try {
      return await prisma.customer.findMany({
        include: {
          sales: {
            where: {
              totalAmount: {
                gt: prisma.raw('receivedAmount') // Outstanding sales
              }
            }
          },
          _count: {
            select: { sales: true, receipts: true }
          }
        },
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
        data: customerData
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

  // Get customer by ID with sales history
  async getById(id) {
    try {
      return await prisma.customer.findUnique({
        where: { id },
        include: {
          sales: {
            orderBy: { date: 'desc' }
          },
          receipts: {
            orderBy: { date: 'desc' }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching customer by ID');
    }
  },

  // Get customer outstanding balance
  async getOutstandingBalance(id) {
    try {
      const result = await prisma.sale.aggregate({
        where: { customerId: id },
        _sum: {
          totalAmount: true,
          receivedAmount: true
        }
      });
      
      const totalAmount = result._sum.totalAmount || 0;
      const receivedAmount = result._sum.receivedAmount || 0;
      
      return totalAmount - receivedAmount;
    } catch (error) {
      handleDatabaseError(error, 'Calculating customer outstanding balance');
    }
  }
};