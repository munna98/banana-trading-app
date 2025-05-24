// pages/api/purchases/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Purchase ID is required.'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, parseInt(id));
      case 'PUT':
        return await handlePut(req, res, parseInt(id));
      case 'DELETE':
        return await handleDelete(req, res, parseInt(id));
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// GET /api/purchases/[id] - Get a single purchase by ID
async function handleGet(req, res, id) {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: id },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          }
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                unit: true,
              }
            }
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error(`Error fetching purchase with ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase'
    });
  }
}

// PUT /api/purchases/[id] - Update an existing purchase by ID
async function handlePut(req, res, id) {
  try {
    const { supplierId, items, paidAmount, date } = req.body; // 'date' can also be updated

    // Validate incoming data
    const validation = validatePurchaseData({ supplierId, items, paidAmount });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if purchase exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: id },
      include: { items: true } // Include existing items to calculate old total
    });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Calculate new total amount from items
    let newTotalAmount = 0;
    for (const item of items) {
      const { quantity, rate, weightDeduction } = item;
      if (typeof quantity !== 'number' || typeof rate !== 'number' || quantity <= 0 || rate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity or rate for purchase items.'
        });
      }
      const actualQuantity = quantity - (weightDeduction || 0);
      newTotalAmount += actualQuantity * rate;
    }

    const newPaidAmount = parseFloat(paidAmount);
    const newBalance = newTotalAmount - newPaidAmount;

    // Calculate the change in balance for the supplier
    const oldBalance = existingPurchase.totalAmount - existingPurchase.paidAmount;
    const balanceChange = newBalance - oldBalance;

    // Use a transaction for atomicity
    const updatedPurchase = await prisma.$transaction(async (prisma) => {
      // First, delete all existing PurchaseItems for this purchase
      await prisma.purchaseItem.deleteMany({
        where: { purchaseId: id },
      });

      // Then, update the purchase record and create new PurchaseItems
      const purchase = await prisma.purchase.update({
        where: { id: id },
        data: {
          supplierId: parseInt(supplierId),
          totalAmount: newTotalAmount,
          paidAmount: newPaidAmount,
          balance: newBalance,
          date: date ? new Date(date) : existingPurchase.date, // Update date if provided
          items: {
            create: items.map(item => ({
              itemId: parseInt(item.itemId),
              quantity: parseFloat(item.quantity),
              weightDeduction: parseFloat(item.weightDeduction || 1.5),
              rate: parseFloat(item.rate),
              amount: (parseFloat(item.quantity) - parseFloat(item.weightDeduction || 1.5)) * parseFloat(item.rate)
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

      // Update supplier balance based on the change
      if (balanceChange !== 0) {
        await prisma.supplier.update({
          where: { id: existingPurchase.supplierId }, // Use existing supplierId to update
          data: {
            balance: {
              increment: balanceChange // Adjust supplier balance
            }
          }
        });
      }
      return purchase;
    });

    return res.status(200).json({
      success: true,
      message: 'Purchase updated successfully',
      data: updatedPurchase
    });

  } catch (error) {
    console.error(`Error updating purchase with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({
        success: false,
        message: 'Purchase not found.'
      });
    }
    if (error.code === 'P2003') { // Foreign key constraint failed (e.g., invalid supplierId or itemId)
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID or item ID provided for update.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update purchase'
    });
  }
}

// DELETE /api/purchases/[id] - Delete a purchase by ID
async function handleDelete(req, res, id) {
  try {
    // Check if purchase exists
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: id }
    });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Use a transaction to ensure atomicity
    const deletedPurchase = await prisma.$transaction(async (prisma) => {
      // First, delete related PurchaseItems
      await prisma.purchaseItem.deleteMany({
        where: { purchaseId: id }
      });

      // Then delete the purchase itself
      const purchase = await prisma.purchase.delete({
        where: { id: id }
      });

      // Update supplier balance by deducting the purchase balance
      await prisma.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          balance: {
            decrement: purchase.balance
          }
        }
      });
      return purchase;
    });

    return res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: deletedPurchase
    });

  } catch (error) {
    console.error(`Error deleting purchase with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to delete purchase'
    });
  }
}

// Validation helper function for Purchase data (duplicated for this file,
// ideally you'd have a shared `utils/validation.js` in a larger project)
function validatePurchaseData({ supplierId, items, paidAmount }) {
  const errors = {};

  if (!supplierId) {
    errors.supplierId = 'Supplier ID is required.';
  } else if (isNaN(parseInt(supplierId))) {
    errors.supplierId = 'Supplier ID must be a valid number.';
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.items = 'At least one item is required for a purchase.';
  } else {
    items.forEach((item, index) => {
      if (!item.itemId) {
        errors[`items[${index}].itemId`] = 'Item ID is required.';
      } else if (isNaN(parseInt(item.itemId))) {
        errors[`items[${index}].itemId`] = 'Item ID must be a valid number.';
      }
      if (item.quantity === undefined || isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be a positive number.';
      }
      if (item.rate === undefined || isNaN(parseFloat(item.rate)) || parseFloat(item.rate) < 0) {
        errors[`items[${index}].rate`] = 'Rate must be a non-negative number.';
      }
      if (item.weightDeduction !== undefined && (isNaN(parseFloat(item.weightDeduction)) || parseFloat(item.weightDeduction) < 0)) {
        errors[`items[${index}].weightDeduction`] = 'Weight deduction must be a non-negative number.';
      }
    });
  }

  if (paidAmount !== undefined && (isNaN(parseFloat(paidAmount)) || parseFloat(paidAmount) < 0)) {
    errors.paidAmount = 'Paid amount must be a non-negative number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}