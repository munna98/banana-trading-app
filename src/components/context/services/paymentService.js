// context/services/paymentService.js (NEW)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';
import { transactionService } from './transactionService.js';

const prisma = getPrismaClient();

export const paymentService = {
  // Fetch all payments
  async getAll() {
    try {
      return await prisma.payment.findMany({
        include: {
          supplier: true,
          purchase: true,
          transaction: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching payments');
    }
  },

  // Create new payment
  async create(paymentData) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create the payment
        const newPayment = await tx.payment.create({
          data: paymentData,
          include: {
            supplier: true,
            purchase: true
          }
        });

        // Update purchase paid amount if linked to a purchase
        if (paymentData.purchaseId) {
          await tx.purchase.update({
            where: { id: paymentData.purchaseId },
            data: {
              paidAmount: {
                increment: paymentData.amount
              }
            }
          });
        }

        // Create accounting transaction
        await transactionService.createPaymentTransaction(newPayment, tx);

        return newPayment;
      });
    } catch (error) {
      handleDatabaseError(error, 'Creating payment');
    }
  },

  // Update existing payment
  async update(id, paymentData) {
    try {
      return await prisma.payment.update({
        where: { id },
        data: paymentData,
        include: {
          supplier: true,
          purchase: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Updating payment');
    }
  },

  // Delete payment
  async delete(id) {
    try {
      return await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id },
          include: { purchase: true }
        });

        if (!payment) {
          throw new Error('Payment not found');
        }

        // Reverse purchase paid amount if linked
        if (payment.purchaseId) {
          await tx.purchase.update({
            where: { id: payment.purchaseId },
            data: {
              paidAmount: {
                decrement: payment.amount
              }
            }
          });
        }

        // Delete the payment
        await tx.payment.delete({
          where: { id }
        });

        return payment;
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting payment');
    }
  },

  // Get payment by ID
  async getById(id) {
    try {
      return await prisma.payment.findUnique({
        where: { id },
        include: {
          supplier: true,
          purchase: true,
          transaction: true
        }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching payment by ID');
    }
  },

  // Get payments by supplier
  async getBySupplier(supplierId) {
    try {
      return await prisma.payment.findMany({
        where: { supplierId },
        include: {
          supplier: true,
          purchase: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching payments by supplier');
    }
  },

  // Get payments by purchase
  async getByPurchase(purchaseId) {
    try {
      return await prisma.payment.findMany({
        where: { purchaseId },
        include: {
          supplier: true
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching payments by purchase');
    }
  }
};