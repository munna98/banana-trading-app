// context/services/purchaseService.js
import { getPrismaClient, handleDatabaseError } from './prismaService.js';
import { supplierService } from './supplierService.js';

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
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching purchases');
    }
  },

  // Create new purchase
  async create(purchaseData, defaultWeightDeduction = 1.5) {
    try {
      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // Create the purchase with items
        const newPurchase = await tx.purchase.create({
          data: {
            supplierId: purchaseData.supplierId,
            totalAmount: purchaseData.totalAmount,
            paidAmount: purchaseData.paidAmount || 0,
            balance: purchaseData.totalAmount - (purchaseData.paidAmount || 0),
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

        // Update supplier balance
        if (newPurchase.balance > 0) {
          await tx.supplier.update({
            where: { id: purchaseData.supplierId },
            data: {
              balance: {
                increment: newPurchase.balance
              }
            }
          });
        }

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
          include: { supplier: true }
        });

        if (!purchase) {
          throw new Error('Purchase not found');
        }

        // Delete the purchase (items will be deleted by cascade)
        await tx.purchase.delete({
          where: { id }
        });

        // Update supplier balance (reduce by purchase balance)
        if (purchase.balance > 0) {
          await tx.supplier.update({
            where: { id: purchase.supplierId },
            data: {
              balance: {
                decrement: purchase.balance
              }
            }
          });
        }

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
          }
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
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching purchases by supplier');
    }
  }
};