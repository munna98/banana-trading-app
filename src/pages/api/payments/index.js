// pages/api/payments/index.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({
          error: `Method ${method} not allowed`,
          allowedMethods: ["GET", "POST"],
          message: "Use /api/payments/[id] for individual payment operations",
        });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/payments - Fetch payments with various filters
async function handleGet(req, res) {
  const {
    supplierId,
    purchaseId,
    paymentMethod,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    includeDetails = "true",
  } = req.query;

  try {
    // Build where clause
    const where = {};

    if (supplierId) {
      where.supplierId = parseInt(supplierId);
    }

    if (purchaseId) {
      where.purchaseId = parseInt(purchaseId);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Build include clause
    const include =
      includeDetails === "true"
        ? {
            supplier: true,
            purchase: {
              include: {
                items: {
                  include: {
                    item: true,
                  },
                },
              },
            },
            transaction: {
              include: {
                entries: {
                  include: {
                    account: true,
                  },
                },
              },
            },
          }
        : {};

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include,
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: payments,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch payments",
      message: error.message,
    });
  }
}

// POST /api/payments - Create a new payment
async function handlePost(req, res) {
  const {
    supplierId,
    purchaseId,
    paymentMethod,
    amount,
    reference,
    notes,
    date,
    debitAccountId,
  } = req.body;

  // Validation
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid amount",
      message: "Amount must be greater than 0",
    });
  }

  if (!debitAccountId) {
    return res.status(400).json({
      success: false,
      error: "Missing debit account",
      message: "Debit account ID is required",
    });
  }

  if (!paymentMethod) {
    return res.status(400).json({
      success: false,
      error: "Missing payment method",
      message: "Payment method is required",
    });
  }

  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify debit account exists and is active
      const debitAccount = await tx.account.findUnique({
        where: { id: parseInt(debitAccountId) },
        include: { supplier: true },
      });

      if (!debitAccount || !debitAccount.isActive) {
        throw new Error("Invalid or inactive debit account");
      }

      // If supplierId is provided, verify it exists
      let supplier = null;
      if (supplierId) {
        supplier = await tx.supplier.findUnique({
          where: { id: parseInt(supplierId) },
        });
        if (!supplier) {
          throw new Error("Supplier not found");
        }
      }

      // If purchaseId is provided, verify it exists and belongs to the supplier
      let purchase = null;
      if (purchaseId) {
        purchase = await tx.purchase.findUnique({
          where: { id: parseInt(purchaseId) },
          include: { supplier: true },
        });

        if (!purchase) {
          throw new Error("Purchase not found");
        }

        // If supplierId is provided, ensure purchase belongs to that supplier
        if (supplierId && purchase.supplierId !== parseInt(supplierId)) {
          throw new Error("Purchase does not belong to the specified supplier");
        }

        // Use purchase's supplier if no supplierId was provided
        if (!supplierId) {
          supplier = purchase.supplier;
        }
      }

      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          supplierId: supplier ? supplier.id : null,
          purchaseId: purchase ? purchase.id : null,
          paymentMethod,
          amount: parseFloat(amount),
          reference: reference || null,
          notes: notes || null,
          date: date ? new Date(date) : new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: "PAYMENT",
          amount: parseFloat(amount),
          description: `Payment ${payment.id} - ${paymentMethod}${
            supplier ? ` to ${supplier.name}` : ""
          }${purchase ? ` for Purchase #${purchase.id}` : ""}`,
          date: payment.date,
          referenceNo: reference || null,
          notes: notes || null,
          paymentId: payment.id,
        },
      });

      // Create transaction entries (double-entry bookkeeping)
      const entries = [];

      // Credit the debit account (reducing the balance for expense/liability accounts)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: parseInt(debitAccountId),
            debitAmount: 0,
            creditAmount: parseFloat(amount),
            description: `Payment ${payment.id} - ${paymentMethod}`,
          },
        })
      );

      // Debit cash/bank account based on payment method
      let creditAccountId;
      switch (paymentMethod) {
        case "CASH":
          // Find cash account by exact code or name
          const cashAccount = await tx.account.findFirst({
            where: {
              code: "1111", // Using the exact code from your JSON
              type: "ASSET",
              isActive: true,
            },
          });
          creditAccountId = cashAccount?.id;
          break;
        case "BANK_TRANSFER":
        case "CHEQUE":
        case "UPI":
        case "CARD":
          // Find bank account by exact code or name
          const bankAccount = await tx.account.findFirst({
            where: {
              code: "1112", // Using the exact code from your JSON
              type: "ASSET",
              isActive: true,
            },
          });
          creditAccountId = bankAccount?.id;
          break;
        default:
          throw new Error("Invalid payment method");
      }

      if (!creditAccountId) {
        throw new Error(
          `No ${paymentMethod === "CASH" ? "cash" : "bank"} account found`
        );
      }

      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: creditAccountId,
            debitAmount: parseFloat(amount),
            creditAmount: 0,
            description: `Payment ${payment.id} - ${paymentMethod}`,
          },
        })
      );

      // Update purchase paid amount if linked to a purchase
      if (purchase) {
        await tx.purchase.update({
          where: { id: purchase.id },
          data: {
            paidAmount: {
              increment: parseFloat(amount),
            },
          },
        });
      }

      // Return the created payment with related data
      return await tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          supplier: true,
          purchase: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
          transaction: {
            include: {
              entries: {
                include: {
                  account: true,
                },
              },
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("POST Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to record payment",
      message: error.message,
    });
  }
}

export { handleGet, handlePost };
