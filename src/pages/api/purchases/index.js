// pages/api/purchases/index.js
import { PrismaClient } from '@prisma/client';
import { generateInvoiceNumber } from '../../../lib/invoiceGenerator'; // Adjust path as needed

const prisma = new PrismaClient();

// Determine if we are in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

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
    // Global API error handler for unexpected errors
    console.error('API Error in handler:', error); // Log the full error object

    return res.status(500).json({
      success: false,
      message: isDevelopment ? error.message : 'Internal server error',
    });
  }
}

async function handleGet(req, res) {
  try {
    const { search, sortBy = 'date', sortOrder = 'desc', supplierId } = req.query;

    let whereClause = {};
    let orderByClause = {};

    if (search) {
      whereClause.OR = [
        {
          supplier: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          invoiceNo: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (supplierId) {
      whereClause.supplierId = parseInt(supplierId);
    }

    const validSortFields = ['date', 'totalAmount', 'paidAmount', 'balance'];
    if (validSortFields.includes(sortBy)) {
      orderByClause[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderByClause.date = 'desc';
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
      message: isDevelopment ? error.message : 'Failed to fetch purchases',
    });
  }
}

async function handlePost(req, res) {
  try {
    const { supplierId, date, items, payments = [] } = req.body;

    // Validate incoming data
    const validation = validatePurchaseData({ supplierId, items, payments });
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
      const { quantity, rate, weightDeduction } = item;
      if (typeof quantity !== 'number' || typeof rate !== 'number' || quantity <= 0 || rate < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity or rate for purchase items.'
        });
      }
      const actualQuantity = quantity - (weightDeduction || 0);
      totalAmount += actualQuantity * rate;
    }

    // Calculate total paid amount from payments
    let totalPaidAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    const balance = totalAmount - totalPaidAmount; // This balance will now only be stored on the Purchase record

    // Generate the invoice number
    const invoiceNo = await generateInvoiceNumber("PUR");

    // Use a transaction to ensure atomicity
    const newPurchase = await prisma.$transaction(async (prisma) => {
      // Create the purchase record
      const purchase = await prisma.purchase.create({
        data: {
          supplierId: parseInt(supplierId),
          totalAmount: totalAmount,
          paidAmount: totalPaidAmount,
          balance: balance, // Storing balance on the Purchase record itself
          date: date ? new Date(date) : new Date(),
          invoiceNo: invoiceNo,
          items: {
            create: items.map(item => ({
              itemId: parseInt(item.itemId),
              quantity: parseFloat(item.quantity),
              weightDeduction: parseFloat(item.weightDeduction || 0),
              rate: parseFloat(item.rate),
              amount: (parseFloat(item.quantity) - parseFloat(item.weightDeduction || 0)) * parseFloat(item.rate)
            }))
          },
          payments: {
            create: payments.map(payment => ({
              amount: parseFloat(payment.amount),
              method: payment.method,
              reference: payment.reference || null,
              date: new Date(),
            }))
          }
        },
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          },
          payments: true
        }
      });

      // Removed: Supplier balance update logic
      // await prisma.supplier.update({
      //   where: { id: parseInt(supplierId) },
      //   data: {
      //     balance: {
      //       increment: balance
      //     }
      //   }
      // });

      return purchase;
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: newPurchase
    });

  } catch (error) {
    if (error.code === 'P2003') {
      console.error('Prisma Foreign Key Constraint Error:', error.message, error.meta);
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID or item ID provided. Please ensure they exist.',
        error: isDevelopment ? error.message : undefined,
      });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNo')) {
      console.error('Prisma Unique Constraint Error (invoiceNo):', error.message, error.meta);
      return res.status(409).json({
        success: false,
        message: 'A purchase with this invoice number already exists. Please try again.',
        error: isDevelopment ? error.message : undefined,
      });
    }
    console.error('Error creating purchase in handlePost:', error);

    return res.status(500).json({
      success: false,
      message: isDevelopment ? error.message : 'Failed to create purchase',
    });
  }
}

function validatePurchaseData({ supplierId, items, payments }) {
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
      if (item.itemId === undefined || item.itemId === null || isNaN(parseInt(item.itemId))) {
        errors[`items[${index}].itemId`] = 'Item ID is required and must be a valid number.';
      }
      if (item.quantity === undefined || item.quantity === null || isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0) {
        errors[`items[${index}].quantity`] = 'Quantity must be a positive number.';
      }
      if (item.rate === undefined || item.rate === null || isNaN(parseFloat(item.rate)) || parseFloat(item.rate) < 0) {
        errors[`items[${index}].rate`] = 'Rate must be a non-negative number.';
      }
      if (item.weightDeduction !== undefined && item.weightDeduction !== null && (isNaN(parseFloat(item.weightDeduction)) || parseFloat(item.weightDeduction) < 0)) {
        errors[`items[${index}].weightDeduction`] = 'Weight deduction must be a non-negative number.';
      }
    });
  }

  if (!Array.isArray(payments)) {
    errors.payments = 'Payments must be an array.';
  } else {
    payments.forEach((payment, index) => {
      if (payment.amount === undefined || payment.amount === null || isNaN(parseFloat(payment.amount)) || parseFloat(payment.amount) < 0) {
        errors[`payments[${index}].amount`] = 'Payment amount must be a non-negative number.';
      }
      if (!payment.method) {
        errors[`payments[${index}].method`] = 'Payment method is required.';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

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