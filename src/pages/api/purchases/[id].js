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
    const include = includeDetails === "true" 
      ? {
          supplier: true,
          items: {
            include: {
              item: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
          payments: {
            orderBy: {
              date: 'desc',
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
    totalAmount,
    date,
    invoiceNo,
    items = [],
    notes,
  } = req.body;

  // Validation
  if (!supplierId || !totalAmount || !date) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields",
      message: "supplierId, totalAmount, and date are required",
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
        },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Check if purchase has payments - if so, restrict certain updates
      if (existingPurchase.payments.length > 0 && existingPurchase.totalAmount !== parseFloat(totalAmount)) {
        throw new Error("Cannot modify total amount for purchase with existing payments");
      }

      // Verify supplier exists if provided
      if (supplierId && supplierId !== existingPurchase.supplierId) {
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
          totalAmount: parseFloat(totalAmount),
          date: new Date(date),
          invoiceNo: invoiceNo || null,
          notes: notes || null,
          balance: parseFloat(totalAmount) - existingPurchase.paidAmount,
        },
      });

      // Handle items update if provided
      if (items && items.length > 0) {
        // Delete existing items
        await tx.purchaseItem.deleteMany({
          where: { purchaseId: purchaseId },
        });

        // Create new items
        const itemsData = items.map(item => ({
          purchaseId: purchaseId,
          itemId: parseInt(item.itemId),
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        }));

        await tx.purchaseItem.createMany({
          data: itemsData,
        });
      }

      // Update transaction if exists
      if (existingPurchase.transaction) {
        await tx.transactionEntry.updateMany({
          where: {
            transactionId: existingPurchase.transaction.id,
            type: 'DEBIT',
          },
          data: {
            amount: parseFloat(totalAmount),
          },
        });

        await tx.transactionEntry.updateMany({
          where: {
            transactionId: existingPurchase.transaction.id,
            type: 'CREDIT',
          },
          data: {
            amount: parseFloat(totalAmount),
          },
        });

        await tx.transaction.update({
          where: { id: existingPurchase.transaction.id },
          data: {
            amount: parseFloat(totalAmount),
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
            date: 'desc',
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