// context/services/saleService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const saleService = {
  // Fetch all sales
  async getAll() {
    try {
      return await prisma.sale.findMany({
        include: {
          customer: true,
          items: {
            include: {
              item: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching sales');
    }
  },

  // Create new sale
  async create(saleData) {
    try {
      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // Create the sale with items
        const newSale = await tx.sale.create({
          data: {
            customerId: saleData.customerId,
            totalAmount: saleData.totalAmount,
            receivedAmount: saleData.receivedAmount || 0,
            balance: saleData.totalAmount - (saleData.receivedAmount || 0),
            items: {
              create: saleData.items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount
              }))
            }
          },
          include: {
            customer: true,
            items: {
              include: {
                item: true
              }
            }
          }
        });

        // Update customer balance
        if (newSale.balance > 0) {
          await tx.customer.update({
            where: { id: saleData.customerId },
            data: {
              balance: {
                increment: newSale.balance
              }
            }
          });
        }

        return newSale;
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating sale');
    }
  },

  // Update existing sale
  async update(id, saleData) {
    try {
      return await prisma.sale.update({
        where: { id },
        data: saleData,
        include: {
          customer: true,
          items: {
            include: {
              item: true
            }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating sale');
    }
  },

  // Delete sale
  async delete(id) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get sale details first
        const sale = await tx.sale.findUnique({
          where: { id },
          include: { customer: true }
        });

        if (!sale) {
          throw new Error('Sale not found');
        }

        // Delete the sale (items will be deleted by cascade)
        await tx.sale.delete({
          where: { id }
        });

        // Update customer balance (reduce by sale balance)
        if (sale.balance > 0) {
          await tx.customer.update({
            where: { id: sale.customerId },
            data: {
              balance: {
                decrement: sale.balance
              }
            }
          });
        }

        return sale;
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting sale');
    }
  },

  // Get sale by ID
  async getById(id) {
    try {
      return await prisma.sale.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              item: true
            }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching sale by ID');
    }
  },

  // Get sales by customer
  async getByCustomer(customerId) {
    try {
      return await prisma.sale.findMany({
        where: { customerId },
        include: {
          customer: true,
          items: {
            include: {
              item: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching sales by customer');
    }
  }
};