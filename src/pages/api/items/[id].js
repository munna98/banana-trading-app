// pages/api/items/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query; // Get the ID from the URL query

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Item ID is required.'
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

// GET /api/items/[id] - Get a single item by ID
async function handleGet(req, res, id) {
  try {
    const item = await prisma.item.findUnique({
      where: { id: id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(`Error fetching item with ID ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch item'
    });
  }
}

// PUT /api/items/[id] - Update an existing item by ID
async function handlePut(req, res, id) {
  try {
    const { name, description, unit, purchaseRate, salesRate } = req.body;

    // Validation
    const validation = validateItemData({ name, description, unit, purchaseRate, salesRate });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: id }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if another item with same name exists (excluding current item)
    const duplicateItems = await prisma.$queryRaw`
      SELECT id, name FROM Item
      WHERE LOWER(name) = LOWER(${name.trim()})
      AND id != ${id}
      LIMIT 1
    `;

    if (duplicateItems.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }

    // Update item
    const updatedItem = await prisma.item.update({
      where: { id: id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        unit: unit || 'Kg',
        purchaseRate: parseFloat(purchaseRate) || 0.0,
        salesRate: parseFloat(salesRate) || 0.0
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error(`Error updating item with ID ${id}:`, error);

    if (error.code === 'P2002') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to update item'
    });
  }
}

// DELETE /api/items/[id] - Delete an item by ID
async function handleDelete(req, res, id) {
  try {
    // Check if item exists and has related records
    const existingItem = await prisma.item.findUnique({
      where: { id: id },
      include: {
        PurchaseItem: true, // Assuming this correctly links to purchases
        SaleItem: true      // Assuming this correctly links to sales
      }
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if item has related purchase or sale records
    if (existingItem.PurchaseItem.length > 0 || existingItem.SaleItem.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete item. It has associated purchase or sale records.'
      });
    }

    // Delete the item
    const deletedItem = await prisma.item.delete({
      where: { id: id }
    });

    return res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: deletedItem
    });

  } catch (error) {
    console.error(`Error deleting item with ID ${id}:`, error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    // P2003: Foreign key constraint failed - handled by explicit check above
    if (error.code === 'P2003') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete item due to related records (e.g., purchases, sales).'
        });
      }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
}

// Validation helper function (moved from api/items/index.js for reuse)
function validateItemData({ name, description, unit, purchaseRate, salesRate }) {
  const errors = {};

  // Required fields
  if (!name || !name.trim()) {
    errors.name = 'Item name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    errors.name = 'Item name must not exceed 100 characters';
  }

  // Optional description validation
  if (description && description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // Unit validation
  const validUnits = ['Kg', 'Dozen', 'Bunch', 'Piece', 'Box'];
  if (unit && !validUnits.includes(unit)) {
    errors.unit = 'Please select a valid unit of measurement';
  }

  // Rate validations
  if (purchaseRate !== undefined && purchaseRate !== '') {
    const purchaseRateNum = parseFloat(purchaseRate);
    if (isNaN(purchaseRateNum) || purchaseRateNum < 0) {
      errors.purchaseRate = 'Purchase rate must be a valid positive number';
    } else if (purchaseRateNum > 999999) {
      errors.purchaseRate = 'Purchase rate seems too high';
    }
  }

  if (salesRate !== undefined && salesRate !== '') {
    const salesRateNum = parseFloat(salesRate);
    if (isNaN(salesRateNum) || salesRateNum < 0) {
      errors.salesRate = 'Sales rate must be a valid positive number';
    } else if (salesRateNum > 999999) {
      errors.salesRate = 'Sales rate seems too high';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}