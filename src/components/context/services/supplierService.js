// context/services/supplierService.js (UPDATED - remove balance field)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const supplierService = {
  // Fetch all suppliers with outstanding balances
  async getAll() {
    try {
      return await prisma.supplier.findMany({
        include: {
          purchases: {
            where: {
              totalAmount: {
                gt: prisma.raw('paidAmount') // Outstanding purchases
              }
            }
          },
          _count: {
            select: { purchases: true, payments: true }
          }
        },
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
        data: supplierData
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

  // Get supplier by ID with purchase history
  async getById(id) {
    try {
      return await prisma.supplier.findUnique({
        where: { id },
        include: {
          purchases: {
            orderBy: { date: 'desc' }
          },
          payments: {
            orderBy: { date: 'desc' }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching supplier by ID');
    }
  },

  // Get supplier outstanding balance
  async getOutstandingBalance(id) {
    try {
      const result = await prisma.purchase.aggregate({
        where: { supplierId: id },
        _sum: {
          totalAmount: true,
          paidAmount: true
        }
      });
      
      const totalAmount = result._sum.totalAmount || 0;
      const paidAmount = result._sum.paidAmount || 0;
      
      return totalAmount - paidAmount;
    } catch (error) {
      handleDatabaseError(error, 'Calculating supplier outstanding balance');
    }
  }
};
