// pages/api/receipts/[id].js
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
      error: 'Invalid receipt ID',
      message: 'Receipt ID must be a valid number'
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

// GET /api/receipts/[id] - Get receipt by ID
async function handleGetById(req, res, id) {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        customer: true,
        sale: {
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

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found',
        message: `Receipt with ID ${id} does not exist`
      });
    }

    return res.status(200).json({
      success: true,
      data: receipt
    });

  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch receipt',
      message: error.message
    });
  }
}

// PUT /api/receipts/[id] - Update receipt
async function handlePut(req, res, id) {
  const {
    paymentMethod,
    amount,
    reference,
    notes,
    date
  } = req.body;

  try {
    // Check if receipt exists
    const existingReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        sale: true,
        transaction: {
          include: {
            entries: true
          }
        }
      }
    });

    if (!existingReceipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found',
        message: `Receipt with ID ${id} does not exist`
      });
    }

    // Start transaction for update
    const result = await prisma.$transaction(async (tx) => {
      const oldAmount = existingReceipt.amount;
      const newAmount = amount ? parseFloat(amount) : oldAmount;
      const amountDifference = newAmount - oldAmount;

      // Update the receipt
      const updatedReceipt = await tx.receipt.update({
        where: { id },
        data: {
          paymentMethod: paymentMethod || existingReceipt.paymentMethod,
          amount: newAmount,
          reference: reference !== undefined ? reference : existingReceipt.reference,
          notes: notes !== undefined ? notes : existingReceipt.notes,
          date: date ? new Date(date) : existingReceipt.date,
          updatedAt: new Date()
        }
      });

      // Update transaction description and amount
      if (existingReceipt.transaction) {
        await tx.transaction.update({
          where: { id: existingReceipt.transaction.id },
          data: {
            amount: newAmount,
            description: `Receipt ${id} - ${updatedReceipt.paymentMethod}${existingReceipt.customer ? ` from ${existingReceipt.customer.name}` : ''}${existingReceipt.sale ? ` for Sale #${existingReceipt.sale.id}` : ''}`,
            date: updatedReceipt.date,
            referenceNo: updatedReceipt.reference,
            notes: updatedReceipt.notes
          }
        });

        // Update transaction entries if amount changed
        if (amountDifference !== 0) {
          for (const entry of existingReceipt.transaction.entries) {
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

      // Update sale paid amount and balance if linked and amount changed
      if (existingReceipt.sale && amountDifference !== 0) {
        await tx.sale.update({
          where: { id: existingReceipt.sale.id },
          data: {
            paidAmount: {
              increment: amountDifference
            },
            balance: {
              decrement: amountDifference
            }
          }
        });
      }

      // Return updated receipt with relations
      return await tx.receipt.findUnique({
        where: { id },
        include: {
          customer: true,
          sale: {
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
      message: 'Receipt updated successfully'
    });

  } catch (error) {
    console.error('PUT Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update receipt',
      message: error.message
    });
  }
}

// DELETE /api/receipts/[id] - Delete receipt
async function handleDelete(req, res, id) {
  try {
    // Check if receipt exists
    const existingReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        sale: true,
        transaction: {
          include: {
            entries: true
          }
        }
      }
    });

    if (!existingReceipt) {
      return res.status(404).json({
        success: false,
        error: 'Receipt not found',
        message: `Receipt with ID ${id} does not exist`
      });
    }

    // Start transaction for deletion
    await prisma.$transaction(async (tx) => {
      // Update sale paid amount and balance if linked
      if (existingReceipt.sale) {
        await tx.sale.update({
          where: { id: existingReceipt.sale.id },
          data: {
            paidAmount: {
              decrement: existingReceipt.amount
            },
            balance: {
              increment: existingReceipt.amount
            }
          }
        });
      }

      // Delete transaction entries first (due to foreign key constraints)
      if (existingReceipt.transaction) {
        await tx.transactionEntry.deleteMany({
          where: { transactionId: existingReceipt.transaction.id }
        });

        // Delete transaction
        await tx.transaction.delete({
          where: { id: existingReceipt.transaction.id }
        });
      }

      // Delete the receipt
      await tx.receipt.delete({
        where: { id }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('DELETE Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete receipt',
      message: error.message
    });
  }
}