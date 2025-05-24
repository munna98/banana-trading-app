// pages/api/purchases/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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

// GET /api/purchases - Get all purchases with search and sort
async function handleGet(req, res) {
  try {
    const { search, sortBy = 'date', sortOrder = 'desc', supplierId } = req.query;

    let whereClause = {};
    let orderByClause = {};

    // Search functionality
    if (search) {
      whereClause.OR = [
        {
          supplier: {
            name: {
              contains: search,
              mode: 'insensitive' // Case-insensitive search for SQLite
            }
          }
        },
        // You might want to add search by item names within the purchase
        // This would require a more complex query with `some` or `every`
        // For simplicity, we'll keep it at supplier name for now.
        // {
        //   items: {
        //     some: {
        //       item: {
        //         name: {
        //           contains: search,
        //           mode: 'insensitive'
        //         }
        //       }
        //     }
        //   }
        // }
      ];
    }

    // Filter by supplierId
    if (supplierId) {
      whereClause.supplierId = parseInt(supplierId);
    }

    // Sort functionality
    const validSortFields = ['date', 'totalAmount', 'paidAmount', 'balance'];
    if (validSortFields.includes(sortBy)) {
      orderByClause[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderByClause.date = 'desc'; // Default sort for purchases
    }

    const purchases = await prisma.purchase.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            phone: true,
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

    return res.status(200).json({
      success: true,
      data: purchases,
      total: purchases.length
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases'
    });
  }
}

// POST /api/purchases - Create a new purchase
async function handlePost(req, res) {
  try {
    const { supplierId, items, paidAmount = 0 } = req.body;

    // Validate incoming data
    const validation = validatePurchaseData({ supplierId, items, paidAmount });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Calculate total amount from items
    let totalAmount = 0;
    for (const item of items) {
      const { itemId, quantity, rate, weightDeduction } = item;
      if (typeof quantity !== 'number' || typeof rate !== 'number' || quantity <= 0 || rate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity or rate for purchase items.'
        });
      }
      const actualQuantity = quantity - (weightDeduction || 0); // Apply weight deduction if provided
      totalAmount += actualQuantity * rate;
    }

    const balance = totalAmount - parseFloat(paidAmount);

    // Use a transaction to ensure atomicity
    const newPurchase = await prisma.$transaction(async (prisma) => {
      // Create the purchase record
      const purchase = await prisma.purchase.create({
        data: {
          supplierId: parseInt(supplierId),
          totalAmount: totalAmount,
          paidAmount: parseFloat(paidAmount),
          balance: balance,
          date: new Date(), // Set current date
          items: {
            create: items.map(item => ({
              itemId: parseInt(item.itemId),
              quantity: parseFloat(item.quantity),
              weightDeduction: parseFloat(item.weightDeduction || 1.5), // Default to 1.5
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

      // Update supplier balance
      await prisma.supplier.update({
        where: { id: parseInt(supplierId) },
        data: {
          balance: {
            increment: balance // Add the purchase balance to supplier's balance
          }
        }
      });

      return purchase;
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: newPurchase
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    if (error.code === 'P2003') { // Foreign key constraint failed (e.g., invalid supplierId or itemId)
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID or item ID provided.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase'
    });
  }
}

// Validation helper function for Purchase data
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

// Helper function to get purchase statistics
export async function getPurchaseStats() {
  try {
    const totalPurchasesResult = await prisma.purchase.aggregate({
      _sum: {
        totalAmount: true,
        paidAmount: true,
        balance: true,
      },
      _count: {
        id: true
      }
    });

    const totalPurchases = totalPurchasesResult._count.id || 0;
    const totalPurchaseAmount = totalPurchasesResult._sum.totalAmount || 0;
    const totalPaidAmount = totalPurchasesResult._sum.paidAmount || 0;
    const totalPurchaseBalance = totalPurchasesResult._sum.balance || 0;

    return {
      totalPurchases,
      totalPurchaseAmount: Math.round(totalPurchaseAmount * 100) / 100,
      totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
      totalPurchaseBalance: Math.round(totalPurchaseBalance * 100) / 100,
    };
  } catch (error) {
    console.error('Error getting purchase stats:', error);
    return {
      totalPurchases: 0,
      totalPurchaseAmount: 0,
      totalPaidAmount: 0,
      totalPurchaseBalance: 0,
    };
  }
}