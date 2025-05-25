// context/services/purchaseService.js (UPDATED - remove balance field from schema)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';
import { transactionService } from './transactionService.js';

const prisma = getPrismaClient();

export const purchaseService = {
  // Fetch all purchases
  async getAll() {
    try {
      return await prisma.purchase.findMany({
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          },
          payments: true,
          transaction: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching purchases');
    }
  },

  // Create new purchase with accounting entries
  async create(purchaseData, defaultWeightDeduction = 1.5) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create the purchase with items
        const newPurchase = await tx.purchase.create({
          data: {
            supplierId: purchaseData.supplierId,
            totalAmount: purchaseData.totalAmount,
            paidAmount: purchaseData.paidAmount || 0,
            invoiceNo: purchaseData.invoiceNo,
            items: {
              create: purchaseData.items.map(item => ({
                itemId: item.itemId,
                quantity: item.quantity,
                weightDeduction: item.weightDeduction || defaultWeightDeduction,
                rate: item.rate,
                amount: item.amount
              }))
            }
          },
          include: {
            supplier: true,
            items: {
              include: {
                item: true
              }
            }
          }
        });

        // Update item stocks
        for (const item of purchaseData.items) {
          const netQuantity = item.quantity - (item.weightDeduction || defaultWeightDeduction);
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              currentStock: {
                increment: netQuantity
              }
            }
          });
        }

        // Create accounting transaction
        await transactionService.createPurchaseTransaction(newPurchase, tx);

        return newPurchase;
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating purchase');
    }
  },

  // Update existing purchase
  async update(id, purchaseData) {
    try {
      return await prisma.purchase.update({
        where: { id },
        data: purchaseData,
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          }
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating purchase');
    }
  },

  // Delete purchase
  async delete(id) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get purchase details first
        const purchase = await tx.purchase.findUnique({
          where: { id },
          include: { 
            supplier: true,
            items: {
              include: { item: true }
            }
          }
        });

        if (!purchase) {
          throw new Error('Purchase not found');
        }

        // Reverse stock updates
        for (const purchaseItem of purchase.items) {
          const netQuantity = purchaseItem.quantity - purchaseItem.weightDeduction;
          await tx.item.update({
            where: { id: purchaseItem.itemId },
            data: {
              currentStock: {
                decrement: netQuantity
              }
            }
          });
        }

        // Delete the purchase (items will be deleted by cascade)
        await tx.purchase.delete({
          where: { id }
        });

        return purchase;
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting purchase');
    }
  },

  // Get purchase by ID
  async getById(id) {
    try {
      return await prisma.purchase.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          },
          payments: true,
          transaction: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching purchase by ID');
    }
  },

  // Get purchases by supplier
  async getBySupplier(supplierId) {
    try {
      return await prisma.purchase.findMany({
        where: { supplierId },
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          },
          payments: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching purchases by supplier');
    }
  },

  // Get outstanding purchases
  async getOutstanding() {
    try {
      return await prisma.purchase.findMany({
        where: {
          totalAmount: {
            gt: prisma.raw('paidAmount')
          }
        },
        include: {
          supplier: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching outstanding purchases');
    }
  }
};