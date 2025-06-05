// pages/api/purchases/[id].js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  // Validate ID
  const purchaseId = parseInt(id);
  if (isNaN(purchaseId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid purchase ID",
      message: "Purchase ID must be a valid number",
    });
  }

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res, purchaseId);
      case "PUT":
        return await handleUpdate(req, res, purchaseId);
      case "DELETE":
        return await handleDelete(req, res, purchaseId);
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`,
          allowedMethods: ["GET", "PUT", "DELETE"],
          message: "Use /api/purchases for creating new purchases",
        });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/purchases/[id] - Fetch a specific purchase
async function handleGet(req, res, purchaseId) {
  const { includeDetails = "true" } = req.query;

  try {
    const include =
      includeDetails === "true"
        ? {
            supplier: true,
            items: {
              include: {
                item: true,
              },
              orderBy: {
                id: "asc",
              },
            },
            payments: {
              orderBy: {
                date: "desc",
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
        : {
            supplier: true,
          };

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include,
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
        message: `No purchase found with ID ${purchaseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error("GET Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch purchase",
      message: error.message,
    });
  }
}

// PUT /api/purchases/[id] - Update a specific purchase
async function handleUpdate(req, res, purchaseId) {
  const {
    supplierId,
    date,
    invoiceNo,
    items = [], // Now expecting items from frontend
    notes,
  } = req.body;

  // Recalculate totalAmount from items received
  let newTotalAmount = 0;
  for (const item of items) {
    // Ensure numbers are parsed for calculation
    const quantity = parseFloat(item.quantity);
    const rate = parseFloat(item.rate);
    const totalWeightDeduction = parseFloat(item.totalWeightDeduction || 0); // Use totalWeightDeduction
    const effectiveQuantity = quantity - totalWeightDeduction;
    newTotalAmount += effectiveQuantity * rate;
  }

  // Validation
  if (!supplierId || !date) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      message: "supplierId and date are required",
    });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Missing required items",
      message: "At least one item is required for a purchase.",
    });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if purchase exists
      const existingPurchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          items: true,
          payments: true,
          transaction: true, // Include transaction to potentially update it
        },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Check if purchase has payments - if so, restrict changing total amount significantly
      // We are now recalculating totalAmount based on new items, so this check needs adjustment.
      // A more robust solution might involve disallowing item changes if payments exist,
      // or handling balance adjustments more explicitly. For now, we'll allow item changes
      // but warn/error if the new totalAmount drastically changes the balance.
      // This is a simplification. In a real app, you'd have more complex accounting logic.
      if (existingPurchase.payments.length > 0 && Math.abs(newTotalAmount - existingPurchase.totalAmount) > 0.01) { // Allow for tiny floating point differences
        throw new Error("Cannot significantly change total amount for purchase with existing payments. Please delete all payments first.");
      }


      // Verify supplier exists if provided
      if (supplierId && parseInt(supplierId) !== existingPurchase.supplierId) {
        const supplier = await tx.supplier.findUnique({
          where: { id: parseInt(supplierId) },
        });

        if (!supplier) {
          throw new Error("Supplier not found");
        }
      }

      // Update purchase
      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          supplierId: parseInt(supplierId),
          totalAmount: newTotalAmount, // Use the recalculated totalAmount
          date: new Date(date),
          invoiceNo: invoiceNo || null,
          notes: notes || null,
          balance: newTotalAmount - existingPurchase.paidAmount, // Update balance based on new totalAmount
        },
      });

      // Handle items update: Delete existing and create new ones
      // This is a common strategy for updating nested lists in Prisma
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: purchaseId },
      });

      const itemsData = items.map((item) => ({
        purchaseId: purchaseId,
        itemId: parseInt(item.itemId),
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        numberOfBunches: parseInt(item.numberOfBunches || 0), // New field
        weightDeductionPerUnit: parseFloat(item.weightDeductionPerUnit || 0), // New field
        totalWeightDeduction: parseFloat(item.totalWeightDeduction || 0), // New field
        effectiveQuantity: parseFloat(item.effectiveQuantity), // New field
        amount: parseFloat(item.amount), // Use the amount calculated on frontend, or recalculate here
      }));

      await tx.purchaseItem.createMany({
        data: itemsData,
      });

      // Update transaction if exists and totalAmount changed
      if (existingPurchase.transaction && newTotalAmount !== existingPurchase.totalAmount) {
        // Update relevant transaction entries
        await tx.transactionEntry.updateMany({
          where: {
            transactionId: existingPurchase.transaction.id,
            // Assuming the original debit was for the expense account
            // and the original credit was for the supplier's payable account
            OR: [
              { type: 'DEBIT' }, // Adjusting the expense debit
              { type: 'CREDIT', account: { supplierId: parseInt(supplierId) } } // Adjusting supplier liability
            ]
          },
          data: {
            amount: newTotalAmount, // Update the amount for both debit and credit entries related to the total purchase
          },
        });

        await tx.transaction.update({
          where: { id: existingPurchase.transaction.id },
          data: {
            amount: newTotalAmount,
            description: `Purchase update - ${invoiceNo || `Purchase #${purchaseId}`}`,
          },
        });
      }


      return updatedPurchase;
    });

    // Fetch updated purchase with all relations
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: {
          orderBy: {
            date: "desc",
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

    return res.status(200).json({
      success: true,
      data: purchase,
      message: "Purchase updated successfully",
    });
  } catch (error) {
    console.error("UPDATE Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update purchase",
      message: error.message,
    });
  }
}

// DELETE /api/purchases/[id] - Delete a specific purchase
// No changes needed here related to the new item fields, as deletion logic remains the same.
async function handleDelete(req, res, purchaseId) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if purchase exists
      const existingPurchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          payments: true,
          items: true,
          transaction: {
            include: {
              entries: true,
            },
          },
        },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Check if purchase has payments
      if (existingPurchase.payments.length > 0) {
        throw new Error("Cannot delete purchase with existing payments. Please delete all payments first.");
      }

      // Delete related records in order (due to foreign key constraints)

      // 1. Delete purchase items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: purchaseId },
      });

      // 2. Delete transaction entries if transaction exists
      if (existingPurchase.transaction) {
        await tx.transactionEntry.deleteMany({
          where: { transactionId: existingPurchase.transaction.id },
        });

        // 3. Delete transaction
        await tx.transaction.delete({
          where: { id: existingPurchase.transaction.id },
        });
      }

      // 4. Finally delete the purchase
      const deletedPurchase = await tx.purchase.delete({
        where: { id: purchaseId },
      });

      return deletedPurchase;
    });

    return res.status(200).json({
      success: true,
      data: result,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Error:", error);

    // Handle specific constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: "Cannot delete purchase",
        message: "Purchase has related records that must be deleted first",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to delete purchase",
      message: error.message,
    });
  }
}