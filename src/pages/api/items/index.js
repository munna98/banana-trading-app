// pages/api/items/index.js
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
        // Only allow GET and POST for the collection endpoint
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

// GET /api/items - Get all items (remains the same)
async function handleGet(req, res) {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let whereClause = {};
    let orderByClause = {};

    // Search functionality - SQLite contains is case-insensitive by default
    if (search) {
      whereClause = {
        OR: [
          {
            name: {
              contains: search
            }
          },
          {
            description: {
              contains: search
            }
          },
          {
            unit: {
              contains: search
            }
          }
        ]
      };
    }

    // Sort functionality
    const validSortFields = ['name', 'purchaseRate', 'salesRate', 'unit', 'createdAt', 'updatedAt'];
    if (validSortFields.includes(sortBy)) {
      orderByClause[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderByClause.name = 'asc';
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: orderByClause
    });

    return res.status(200).json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch items'
    });
  }
}

// POST /api/items - Create a new item (remains the same)
async function handlePost(req, res) {
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

    // Check if item with same name already exists using raw SQL for SQLite
    const existingItems = await prisma.$queryRaw`
      SELECT id, name FROM Item
      WHERE LOWER(name) = LOWER(${name.trim()})
      LIMIT 1
    `;

    if (existingItems.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }

    // Create new item
    const newItem = await prisma.item.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        unit: unit || 'Kg',
        purchaseRate: parseFloat(purchaseRate) || 0.0,
        salesRate: parseFloat(salesRate) || 0.0
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: newItem
    });

  } catch (error) {
    console.error('Error creating item:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create item'
    });
  }
}

// Validation helper function (moved to api/items/[id].js for central validation)
// Ensure you import it if you want to keep it here, or define it here if not shared.
// For simplicity, I've duplicated it for now; in a larger app, move it to a shared lib.
function validateItemData({ name, description, unit, purchaseRate, salesRate }) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = 'Item name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Item name must be at least 2 characters long';
  } else if (name.trim().length > 100) {
    errors.name = 'Item name must not exceed 100 characters';
  }

  if (description && description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  const validUnits = ['Kg', 'Dozen', 'Bunch', 'Piece', 'Box'];
  if (unit && !validUnits.includes(unit)) {
    errors.unit = 'Please select a valid unit of measurement';
  }

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

// Helper function to get item statistics (remains the same)
export async function getItemStats() {
  try {
    const items = await prisma.item.findMany({
      select: {
        purchaseRate: true,
        salesRate: true
      }
    });

    const totalItems = items.length;
    const totalPurchaseValue = items.reduce((sum, item) => sum + (item.purchaseRate || 0), 0);
    const totalSalesValue = items.reduce((sum, item) => sum + (item.salesRate || 0), 0);
    const avgPurchaseRate = totalItems > 0 ? totalPurchaseValue / totalItems : 0;
    const avgSalesRate = totalItems > 0 ? totalSalesValue / totalItems : 0;
    const avgProfitMargin = avgPurchaseRate > 0
      ? ((avgSalesRate - avgPurchaseRate) / avgPurchaseRate * 100)
      : 0;

    return {
      totalItems,
      avgPurchaseRate: Math.round(avgPurchaseRate * 100) / 100,
      avgSalesRate: Math.round(avgSalesRate * 100) / 100,
      avgProfitMargin: Math.round(avgProfitMargin * 100) / 100
    };
  } catch (error) {
    console.error('Error getting item stats:', error);
    return {
      totalItems: 0,
      avgPurchaseRate: 0,
      avgSalesRate: 0,
      avgProfitMargin: 0
    };
  }
}