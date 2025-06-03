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
          message: "Use /api/receipts/[id] for individual receipt operations",
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

// GET /api/receipts - Fetch receipts with various filters
async function handleGet(req, res) {
  const {
    customerId, // Changed from supplierId
    saleId, // Changed from purchaseId
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

    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    if (saleId) {
      where.saleId = parseInt(saleId);
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
            customer: true, // Changed from supplier
            sale: {
              // Changed from purchase
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

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include,
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.receipt.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: receipts,
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
      error: "Failed to fetch receipts",
      message: error.message,
    });
  }
}

// POST /api/receipts - Create a new receipt
async function handlePost(req, res) {
  const {
    customerId, // Changed from supplierId
    saleId, // Changed from purchaseId
    paymentMethod,
    amount,
    reference,
    notes,
    date,
    creditAccountId, // This is the account to be CREDITED (e.g., Accounts Receivable, a revenue account)
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Verify credit account exists and is active (creditAccountId is correct)
      const receivableOrRevenueAccount = await tx.account.findUnique({
        where: { id: parseInt(creditAccountId) },
        include: { customer: true }, // Changed from supplier
      });

      if (!receivableOrRevenueAccount || !receivableOrRevenueAccount.isActive) {
        throw new Error("Invalid or inactive credit account (receivable/revenue)");
      }

      // ... (customer and sale verification logic)
      let customer = null;
      if (customerId) {
        customer = await tx.customer.findUnique({
          where: { id: parseInt(customerId) },
        });
        if (!customer) {
          throw new Error("Customer not found");
        }
      }

      let sale = null;
      if (saleId) {
        sale = await tx.sale.findUnique({
          where: { id: parseInt(saleId) },
          include: { customer: true },
        });

        if (!sale) {
          throw new Error("Sale not found");
        }

        if (customerId && sale.customerId !== parseInt(customerId)) {
          throw new Error("Sale does not belong to the specified customer");
        }

        if (!customerId) {
          customer = sale.customer;
        }
      }

      // Create the receipt record
      const receipt = await tx.receipt.create({
        data: {
          customerId: customer ? customer.id : null,
          saleId: sale ? sale.id : null,
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
          type: "RECEIPT", // Changed from PAYMENT
          amount: parseFloat(amount),
          description: `Receipt ${receipt.id} - ${paymentMethod}${
            customer ? ` from ${customer.name}` : "" // Changed 'to' to 'from'
          }${sale ? ` for Sale #${sale.id}` : ""}`, // Changed Purchase to Sale
          date: receipt.date,
          referenceNo: reference || null,
          notes: notes || null,
          receiptId: receipt.id, // Changed from paymentId
        },
      });

      // Determine the cash/bank account to be debited
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

      // 1. DEBIT the Cash/Bank account (increasing asset)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: cashBankAccountID, // This is the cash or bank account
            debitAmount: parseFloat(amount), // Correct: Debit this account
            creditAmount: 0,
            description: `Receipt ${receipt.id} - ${paymentMethod} (Debit)`,
          },
        })
      );

      // 2. CREDIT the Receivable/Revenue account (reducing asset/increasing revenue)
      entries.push(
        await tx.transactionEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: parseInt(creditAccountId), // This is the customer's receivable or revenue account
            debitAmount: 0,
            creditAmount: parseFloat(amount), // Correct: Credit this account
            description: `Receipt ${receipt.id} - ${paymentMethod} (Credit)`,
          },
        })
      );

      // Update sale paid amount and balance if linked to a sale
      if (sale) {
        await tx.sale.update({
          where: { id: sale.id },
          data: {
            paidAmount: {
              increment: parseFloat(amount),
            },
            // IMPORTANT: Decrement the balance as receipt is made
            balance: {
              decrement: parseFloat(amount),
            },
          },
        });
      }

      // Return the created receipt with related data
      return await tx.receipt.findUnique({
        where: { id: receipt.id },
        include: {
          customer: true, // Changed from supplier
          sale: {
            // Changed from purchase
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
      message: "Receipt recorded successfully",
    });
  } catch (error) {
    console.error("POST Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to record receipt",
      message: error.message,
    });
  }
}

export { handleGet, handlePost };