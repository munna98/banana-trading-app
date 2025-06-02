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
    debitAccountId, // This is the account to be DEBITED (e.g., Trade Payables, an expense account)
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify debit account exists and is active (debitAccountId is correct)
      const payableOrExpenseAccount = await tx.account.findUnique({
        where: { id: parseInt(debitAccountId) },
        include: { supplier: true },
      });

      if (!payableOrExpenseAccount || !payableOrExpenseAccount.isActive) {
        throw new Error("Invalid or inactive debit account (payable/expense)");
      }

      // ... (supplier and purchase verification logic remains the same)
      let supplier = null;
      if (supplierId) {
        supplier = await tx.supplier.findUnique({
          where: { id: parseInt(supplierId) },
        });
        if (!supplier) {
          throw new Error("Supplier not found");
        }
      }

      let purchase = null;
      if (purchaseId) {
        purchase = await tx.purchase.findUnique({
          where: { id: parseInt(purchaseId) },
          include: { supplier: true },
        });

        if (!purchase) {
          throw new Error("Purchase not found");
        }

        if (supplierId && purchase.supplierId !== parseInt(supplierId)) {
          throw new Error("Purchase does not belong to the specified supplier");
        }

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

      // Determine the cash/bank account to be credited
      let cashBankAccountID;
      switch (paymentMethod) {
        case "CASH":
          const cashAccount = await tx.account.findFirst({
            where: {
              code: "1111",
              type: "ASSET",
              isActive: true,
            },
          });
          cashBankAccountID = cashAccount?.id;
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
          cashBankAccountID = bankAccount?.id;
          break;
        default:
          throw new Error("Invalid payment method");
      }

      if (!cashBankAccountID) {
        throw new Error(
          `No ${paymentMethod === "CASH" ? "cash" : "bank"} account found`
        );
      }

      // Create transaction entries (double-entry bookkeeping)
      const entries = [];

      // 1. DEBIT the Payable/Expense account (reducing liability/increasing expense)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: parseInt(debitAccountId), // This is the supplier's payable or expense account
            debitAmount: parseFloat(amount),     // Correct: Debit this account
            creditAmount: 0,
            description: `Payment ${payment.id} - ${paymentMethod} (Debit)`,
          },
        })
      );

      // 2. CREDIT the Cash/Bank account (reducing asset)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: cashBankAccountID, // This is the cash or bank account
            debitAmount: 0,
            creditAmount: parseFloat(amount), // Correct: Credit this account
            description: `Payment ${payment.id} - ${paymentMethod} (Credit)`,
          },
        })
      );

      // Update purchase paid amount and balance if linked to a purchase
      if (purchase) {
        await tx.purchase.update({
          where: { id: purchase.id },
          data: {
            paidAmount: {
              increment: parseFloat(amount),
            },
            // IMPORTANT: Decrement the balance as payment is made
            balance: {
              decrement: parseFloat(amount),
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
