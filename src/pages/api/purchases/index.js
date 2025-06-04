
import { PrismaClient } from '@prisma/client';
import { generateInvoiceNumber } from '../../../lib/invoiceGenerator';

const prisma = new PrismaClient();
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
    return res.status(500).json({
      success: false,
      message: isDevelopment ? error.message : 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
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

    return res.status(200).json({
      success: true,
      data: purchases,
      total: purchases.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: isDevelopment ? error.message : 'Failed to fetch purchases',
    });
  }
}

async function handlePost(req, res) {
  try {
    const { 
      supplierId, 
      date, 
      items, 
      payments = [],
      notes 
    } = req.body;

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
    const balance = totalAmount - totalPaidAmount;

    // Generate the invoice number
    const invoiceNo = await generateInvoiceNumber("PUR");

    // Use a transaction to ensure atomicity
    const newPurchase = await prisma.$transaction(async (tx) => {
      // Get the items with their details to determine expense account
      const itemDetails = await tx.item.findMany({
        where: {
          id: {
            in: items.map(item => parseInt(item.itemId))
          }
        }
      });

      // For now, we'll use a single expense account for all purchases
      // You can modify this logic to select different accounts based on item categories
      const expenseAccount = await tx.account.findFirst({
        where: {
          code: '5110', // Banana Purchases account
          type: 'EXPENSE',
          isActive: true
        }
      });

      if (!expenseAccount) {
        throw new Error("Expense account not found. Please ensure '5110 - Banana Purchases' account exists.");
      }

      // Verify supplier exists
      const supplier = await tx.supplier.findUnique({
        where: { id: parseInt(supplierId) },
      });

      if (!supplier) {
        throw new Error("Supplier not found");
      }

      // Find supplier's trade payable account using the direct relation
      const tradePayableAccount = await tx.account.findFirst({
        where: {
          supplier: {
            id: parseInt(supplierId)
          },
          type: 'LIABILITY',
          isActive: true
        }
      });

      if (!tradePayableAccount && balance > 0) {
        throw new Error("Supplier's trade payable account not found");
      }

      // Create the purchase record
      const purchase = await tx.purchase.create({
        data: {
          supplierId: parseInt(supplierId),
          totalAmount: totalAmount,
          paidAmount: totalPaidAmount,
          balance: balance,
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
          }
        }
      });

      // Create transaction record for the purchase
      const transaction = await tx.transaction.create({
        data: {
          type: "PURCHASE",
          amount: totalAmount,
          description: `Purchase ${purchase.id} - ${supplier.name} (Invoice: ${invoiceNo})`,
          date: purchase.date,
          referenceNo: invoiceNo,
          notes: notes || null,
          purchaseId: purchase.id,
        },
      });

      // Create transaction entries for double-entry bookkeeping
      const entries = [];

      // 1. DEBIT the Expense account (increasing expense)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: expenseAccount.id,
            debitAmount: totalAmount,
            creditAmount: 0,
            description: `Purchase ${purchase.id} - ${expenseAccount.name} (Debit)`,
          },
        })
      );

      // 2. CREDIT the Trade Payable account for unpaid balance (increasing liability)
      if (balance > 0) {
        entries.push(
          await tx.transactionEntry.create({
            data: {
              transactionId: transaction.id,
              accountId: tradePayableAccount.id,
              debitAmount: 0,
              creditAmount: balance,
              description: `Purchase ${purchase.id} - Trade Payable (Credit)`,
            },
          })
        );
      }

      // 3. CREDIT Cash/Bank accounts for immediate payments (reducing assets)
      if (totalPaidAmount > 0) {
        // Group payments by method to determine which account to credit
        const paymentsByMethod = payments.reduce((acc, payment) => {
          const method = payment.method;
          if (!acc[method]) acc[method] = 0;
          acc[method] += parseFloat(payment.amount);
          return acc;
        }, {});

        for (const [method, amount] of Object.entries(paymentsByMethod)) {
          let cashBankAccountId;
          
          switch (method) {
            case "CASH":
              const cashAccount = await tx.account.findFirst({
                where: {
                  code: "1111",
                  type: "ASSET",
                  isActive: true,
                },
              });
              cashBankAccountId = cashAccount?.id;
              break;
            case "BANK_TRANSFER":
            case "CHEQUE":
            case "UPI":
            case "CARD":
              const bankAccount = await tx.account.findFirst({
                where: {
                  code: "1112",
                  type: "ASSET",
                  isActive: true,
                },
              });
              cashBankAccountId = bankAccount?.id;
              break;
            default:
              throw new Error(`Invalid payment method: ${method}`);
          }

          if (!cashBankAccountId) {
            throw new Error(`No ${method === "CASH" ? "cash" : "bank"} account found`);
          }

          entries.push(
            await tx.transactionEntry.create({
              data: {
                transactionId: transaction.id,
                accountId: cashBankAccountId,
                debitAmount: 0,
                creditAmount: amount,
                description: `Purchase ${purchase.id} - ${method} Payment (Credit)`,
              },
            })
          );
        }
      }

      // Create payment records if any payments were made
      if (payments.length > 0) {
        await tx.payment.createMany({
          data: payments.map(payment => ({
            supplierId: parseInt(supplierId),
            purchaseId: purchase.id,
            paymentMethod: payment.method,
            amount: parseFloat(payment.amount),
            reference: payment.reference || null,
            date: new Date(),
          }))
        });
      }

      // Return the created purchase with all related data
      return await tx.purchase.findUnique({
        where: { id: purchase.id },
        include: {
          supplier: true,
          items: {
            include: {
              item: true
            }
          },
          payments: true,
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

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully with accounting entries',
      data: newPurchase
    });

  } catch (error) {
    console.error("Purchase creation error:", error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid supplier ID, item ID, or account ID provided. Please ensure they exist.',
        error: isDevelopment ? error.message : undefined,
      });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('invoiceNo')) {
      return res.status(409).json({
        success: false,
        message: 'A purchase with this invoice number already exists. Please try again.',
        error: isDevelopment ? error.message : undefined,
      });
    }
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
    return {
      totalPurchases: 0,
      totalPurchaseAmount: 0,
      totalPaidAmount: 0,
      totalPurchaseBalance: 0,
    };
  }
}