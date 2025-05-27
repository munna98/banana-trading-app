// pages/api/payments/[id].js
// ===========================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payment ID',
      message: 'Payment ID must be a valid number'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGetById(req, res, parseInt(id));
      case 'PUT':
        return await handlePut(req, res, parseInt(id));
      case 'DELETE':
        return await handleDelete(req, res, parseInt(id));
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          error: `Method ${method} not allowed`,
          allowedMethods: ['GET', 'PUT', 'DELETE']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/payments/[id] - Get payment by ID
async function handleGetById(req, res, id) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchase: {
          include: {
            items: {
              include: {
                item: true
              }
            }
          }
        },
        transaction: {
          include: {
            entries: {
              include: {
                account: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: `Payment with ID ${id} does not exist`
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch payment',
      message: error.message
    });
  }
}

// PUT /api/payments/[id] - Update payment
async function handlePut(req, res, id) {
  const {
    paymentMethod,
    amount,
    reference,
    notes,
    date
  } = req.body;

  try {
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        purchase: true,
        transaction: {
          include: {
            entries: true
          }
        }
      }
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: `Payment with ID ${id} does not exist`
      });
    }

    // Start transaction for update
    const result = await prisma.$transaction(async (tx) => {
      const oldAmount = existingPayment.amount;
      const newAmount = amount ? parseFloat(amount) : oldAmount;
      const amountDifference = newAmount - oldAmount;

      // Update the payment
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          paymentMethod: paymentMethod || existingPayment.paymentMethod,
          amount: newAmount,
          reference: reference !== undefined ? reference : existingPayment.reference,
          notes: notes !== undefined ? notes : existingPayment.notes,
          date: date ? new Date(date) : existingPayment.date,
          updatedAt: new Date()
        }
      });

      // Update transaction description and amount
      if (existingPayment.transaction) {
        await tx.transaction.update({
          where: { id: existingPayment.transaction.id },
          data: {
            amount: newAmount,
            description: `Payment ${id} - ${updatedPayment.paymentMethod}${existingPayment.supplier ? ` to ${existingPayment.supplier.name}` : ''}${existingPayment.purchase ? ` for Purchase #${existingPayment.purchase.id}` : ''}`,
            date: updatedPayment.date,
            referenceNo: updatedPayment.reference,
            notes: updatedPayment.notes
          }
        });

        // Update transaction entries if amount changed
        if (amountDifference !== 0) {
          for (const entry of existingPayment.transaction.entries) {
            if (entry.debitAmount > 0) {
              await tx.transactionEntry.update({
                where: { id: entry.id },
                data: {
                  debitAmount: entry.debitAmount + amountDifference
                }
              });
            } else if (entry.creditAmount > 0) {
              await tx.transactionEntry.update({
                where: { id: entry.id },
                data: {
                  creditAmount: entry.creditAmount + amountDifference
                }
              });
            }
          }
        }
      }

      // Update purchase paid amount if linked and amount changed
      if (existingPayment.purchase && amountDifference !== 0) {
        await tx.purchase.update({
          where: { id: existingPayment.purchase.id },
          data: {
            paidAmount: {
              increment: amountDifference
            }
          }
        });
      }

      // Return updated payment with relations
      return await tx.payment.findUnique({
        where: { id },
        include: {
          supplier: true,
          purchase: {
            include: {
              items: {
                include: {
                  item: true
                }
              }
            }
          },
          transaction: {
            include: {
              entries: {
                include: {
                  account: true
                }
              }
            }
          }
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Payment updated successfully'
    });

  } catch (error) {
    console.error('PUT Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update payment',
      message: error.message
    });
  }
}

// DELETE /api/payments/[id] - Delete payment
async function handleDelete(req, res, id) {
  try {
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        purchase: true,
        transaction: {
          include: {
            entries: true
          }
        }
      }
    });

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
        message: `Payment with ID ${id} does not exist`
      });
    }

    // Start transaction for deletion
    await prisma.$transaction(async (tx) => {
      // Update purchase paid amount if linked
      if (existingPayment.purchase) {
        await tx.purchase.update({
          where: { id: existingPayment.purchase.id },
          data: {
            paidAmount: {
              decrement: existingPayment.amount
            }
          }
        });
      }

      // Delete transaction entries first (due to foreign key constraints)
      if (existingPayment.transaction) {
        await tx.transactionEntry.deleteMany({
          where: { transactionId: existingPayment.transaction.id }
        });

        // Delete transaction
        await tx.transaction.delete({
          where: { id: existingPayment.transaction.id }
        });
      }

      // Delete the payment
      await tx.payment.delete({
        where: { id }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('DELETE Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete payment',
      message: error.message
    });
  }
}