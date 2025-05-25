// context/services/receiptService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';
import { transactionService } from './transactionService.js';

const prisma = getPrismaClient();

export const receiptService = {
  // Fetch all receipts
  async getAll() {
    try {
      return await prisma.receipt.findMany({
        include: {
          customer: true,
          sale: true,
          transaction: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching receipts');
    }
  },

  // Create new receipt
  async create(receiptData) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create the receipt
        const newReceipt = await tx.receipt.create({
          data: receiptData,
          include: {
            customer: true,
            sale: true
          }
        });

        // Update sale received amount if linked to a sale
        if (receiptData.saleId) {
          await tx.sale.update({
            where: { id: receiptData.saleId },
            data: {
              receivedAmount: {
                increment: receiptData.amount
              }
            }
          });
        }

        // Create accounting transaction
        await transactionService.createReceiptTransaction(newReceipt, tx);

        return newReceipt;
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating receipt');
    }
  },

  // Update existing receipt
  async update(id, receiptData) {
    try {
      return await prisma.receipt.update({
        where: { id },
        data: receiptData,
        include: {
          customer: true,
          sale: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating receipt');
    }
  },

  // Delete receipt
  async delete(id) {
    try {
      return await prisma.$transaction(async (tx) => {
        const receipt = await tx.receipt.findUnique({
          where: { id },
          include: { sale: true }
        });

        if (!receipt) {
          throw new Error('Receipt not found');
        }

        // Reverse sale received amount if linked
        if (receipt.saleId) {
          await tx.sale.update({
            where: { id: receipt.saleId },
            data: {
              receivedAmount: {
                decrement: receipt.amount
              }
            }
          });
        }

        // Delete the receipt
        await tx.receipt.delete({
          where: { id }
        });

        return receipt;
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting receipt');
    }
  },

  // Get receipt by ID
  async getById(id) {
    try {
      return await prisma.receipt.findUnique({
        where: { id },
        include: {
          customer: true,
          sale: true,
          transaction: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching receipt by ID');
    }
  },

  // Get receipts by customer
  async getByCustomer(customerId) {
    try {
      return await prisma.receipt.findMany({
        where: { customerId },
        include: {
          customer: true,
          sale: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching receipts by customer');
    }
  },

  // Get receipts by sale
  async getBySale(saleId) {
    try {
      return await prisma.receipt.findMany({
        where: { saleId },
        include: {
          customer: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching receipts by sale');
    }
  }
};

