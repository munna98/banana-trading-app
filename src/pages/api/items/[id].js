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
        unit: unit || 'KG',
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
    console.log(`Attempting to delete item with ID: ${id}`);

    // First, check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: id }
    });

    if (!existingItem) {
      console.log(`Item with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    console.log(`Item found: ${existingItem.name}`);

    // Method 1: Try to check for related records using common relation names
    // You might need to adjust these based on your actual Prisma schema
    let hasRelatedRecords = false;
    let relatedRecordsMessage = '';

    try {
      // Using the correct relation names from your schema
      const itemWithRelations = await prisma.item.findUnique({
        where: { id: id },
        include: {
          purchaseItems: true,    // Matches your schema
          saleItems: true,        // Matches your schema
        }
      });

      // Check if any relations exist
      if (itemWithRelations) {
        const purchaseCount = itemWithRelations.purchaseItems?.length || 0;
        const saleCount = itemWithRelations.saleItems?.length || 0;
        
        if (purchaseCount > 0 || saleCount > 0) {
          hasRelatedRecords = true;
          relatedRecordsMessage = `Item has ${purchaseCount} purchase record(s) and ${saleCount} sale record(s)`;
        }
      }
    } catch (includeError) {
      console.log('Include relations failed, trying alternative approach:', includeError.message);
      
      // Method 2: Alternative approach - try direct queries if relations don't work
      try {
        // Try to find related records directly
        const purchaseCount = await prisma.purchaseItem.count({
          where: { itemId: id }
        });
        
        const saleCount = await prisma.saleItem.count({
          where: { itemId: id }
        });

        if (purchaseCount > 0 || saleCount > 0) {
          hasRelatedRecords = true;
          relatedRecordsMessage = `Item has ${purchaseCount} purchase record(s) and ${saleCount} sale record(s)`;
        }
      } catch (countError) {
        console.log('Direct count queries failed, proceeding with delete attempt:', countError.message);
        // If we can't check relations, we'll let the delete attempt handle any foreign key constraints
      }
    }

    if (hasRelatedRecords) {
      console.log(`Cannot delete item: ${relatedRecordsMessage}`);
      return res.status(409).json({
        success: false,
        message: 'Cannot delete item. It has associated purchase or sale records.',
        details: relatedRecordsMessage
      });
    }

    // Attempt to delete the item
    console.log(`Deleting item with ID: ${id}`);
    const deletedItem = await prisma.item.delete({
      where: { id: id }
    });

    console.log(`Successfully deleted item: ${deletedItem.name}`);
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
    
    // P2003: Foreign key constraint failed
    if (error.code === 'P2003') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete item due to related records (purchases, sales, etc.)'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
  const validUnits = ['KG', 'PIECE', 'BOX'];
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