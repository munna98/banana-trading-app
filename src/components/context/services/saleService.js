// context/services/saleService.js (UPDATED - remove balance field from schema)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';
import { transactionService } from './transactionService.js';

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
          },
          receipts: true,
          transaction: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching sales');
    }
  },

  // Create new sale with accounting entries
  async create(saleData) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create the sale with items
        const newSale = await tx.sale.create({
          data: {
            customerId: saleData.customerId,
            totalAmount: saleData.totalAmount,
            receivedAmount: saleData.receivedAmount || 0,
            invoiceNo: saleData.invoiceNo,
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

        // Update item stocks
        for (const item of saleData.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              currentStock: {
                decrement: item.quantity
              }
            }
          });
        }

        // Create accounting transaction
        await transactionService.createSaleTransaction(newSale, tx);

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
          include: { 
            customer: true,
            items: {
              include: { item: true }
            }
          }
        });

        if (!sale) {
          throw new Error('Sale not found');
        }

        // Reverse stock updates
        for (const saleItem of sale.items) {
          await tx.item.update({
            where: { id: saleItem.itemId },
            data: {
              currentStock: {
                increment: saleItem.quantity
              }
            }
          });
        }

        // Delete the sale (items will be deleted by cascade)
        await tx.sale.delete({
          where: { id }
        });

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
          },
          receipts: true,
          transaction: true
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
          },
          receipts: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching sales by customer');
    }
  },

  // Get outstanding sales
  async getOutstanding() {
    try {
      return await prisma.sale.findMany({
        where: {
          totalAmount: {
            gt: prisma.raw('receivedAmount')
          }
        },
        include: {
          customer: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching outstanding sales');
    }
  }
};