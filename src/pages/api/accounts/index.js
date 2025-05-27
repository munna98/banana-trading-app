// pages/api/accounts/index.js
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
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          error: `Method ${method} not allowed`,
          allowedMethods: ['GET', 'POST'],
          message: 'Use /api/accounts/[id] for individual account operations'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/accounts - Fetch accounts with various filters and options
async function handleGet(req, res) {
  const {
    type,
    parentId,
    includeChildren,
    includeParent,
    active,
    search,
    hierarchical,
    canBeDebitedForPayments, // NEW: Filter for accounts suitable for payments
    page = 1,
    limit = 100
  } = req.query;

  try {
    // Build where clause
    const where = {};

    if (type) {
      where.type = type;
    }

    if (parentId) {
      where.parentId = parentId === 'null' ? null : parseInt(parentId);
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // NEW: Logic for canBeDebitedForPayments
    if (canBeDebitedForPayments === 'true') {
      where.OR = [
        { type: 'EXPENSE' },
        {
          type: 'LIABILITY',
          // Corrected: Use relational filter for supplier existence
          supplier: {
            isNot: null // Checks if a supplier relation exists for this account
          }
        },
      ];
      // When filtering for debited accounts, we want to include their parent and supplier info
      // to display properly on the frontend.
      Object.assign(where, { isActive: true }); // Only show active accounts for payments
    }


    // Build include clause
    const include = {};

    if (includeChildren === 'true') {
      include.children = {
        where: { isActive: true },
        orderBy: { code: 'asc' }
      };
    }

    // Always include parent and supplier if canBeDebitedForPayments is true
    // or if explicitly requested by includeParent/includeSupplier
    if (includeParent === 'true' || canBeDebitedForPayments === 'true') {
      include.parent = true;
    }

    // Include supplier relation if the account can have one
    // This is crucial for the frontend to display supplier name
    include.supplier = true;


    // For hierarchical view, get root accounts with all children
    if (hierarchical === 'true') {
      const accounts = await prisma.account.findMany({
        where: {
          ...where,
          parentId: null // Only root accounts
        },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: {
                    include: {
                      children: true // Support up to 4 levels deep
                    }
                  }
                }
              }
            }
          },
          parent: true, // Include parent for root accounts (will be null)
          supplier: true // Include supplier for root accounts
        },
        orderBy: { code: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: accounts,
        meta: {
          total: accounts.length,
          hierarchical: true
        }
      });
    }

    // Regular paginated query
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include, // Use the dynamically built include object
        orderBy: { code: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.account.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: accounts,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts',
      message: error.message
    });
  }
}

// POST /api/accounts - Create a new account or bulk create accounts
async function handlePost(req, res) {
  const isArray = Array.isArray(req.body);
  const accounts = isArray ? req.body : [req.body];

  // Validate all accounts before creating any
  const validationErrors = [];
  const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const { code, name, type } = account;

    if (!code || !name || !type) {
      validationErrors.push({
        index: i,
        error: 'Missing required fields',
        required: ['code', 'name', 'type'],
        account
      });
    }

    if (type && !validTypes.includes(type)) {
      validationErrors.push({
        index: i,
        error: 'Invalid account type',
        validTypes,
        received: type
      });
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors
    });
  }

  try {
    const results = [];
    const errors = [];

    // Process each account
    for (let i = 0; i < accounts.length; i++) {
      const { code, name, type, parentId, description, isActive = true } = accounts[i];

      try {
        // Check if code already exists
        const existingAccount = await prisma.account.findUnique({
          where: { code }
        });

        if (existingAccount) {
          errors.push({
            index: i,
            code,
            error: 'Account code already exists',
            existingAccount: {
              id: existingAccount.id,
              name: existingAccount.name
            }
          });
          continue;
        }

        // Validate parent account if provided
        if (parentId) {
          const parentAccount = await prisma.account.findUnique({
            where: { id: parseInt(parentId) }
          });

          if (!parentAccount) {
            errors.push({
              index: i,
              code,
              error: 'Parent account not found',
              parentId
            });
            continue;
          }

          // Validate that parent and child have compatible types
          if (parentAccount.type !== type) {
            errors.push({
              index: i,
              code,
              error: 'Parent and child accounts must have the same type',
              parentType: parentAccount.type,
              childType: type
            });
            continue;
          }
        }

        // Create the account
        const account = await prisma.account.create({
          data: {
            code,
            name,
            type,
            parentId: parentId ? parseInt(parentId) : null,
            description,
            isActive
          },
          include: {
            parent: true, // Include parent to return parent's data
            supplier: true // Include supplier if linked
          }
        });

        results.push(account);

      } catch (error) {
        console.error(`Error creating account ${code}:`, error);

        if (error.code === 'P2002') {
          errors.push({
            index: i,
            code,
            error: 'Account code already exists'
          });
        } else {
          errors.push({
            index: i,
            code,
            error: 'Failed to create account',
            message: error.message
          });
        }
      }
    }

    const response = {
      success: results.length > 0,
      created: results.length,
      failed: errors.length,
      data: isArray ? results : results[0] || null
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    if (results.length > 0 && errors.length === 0) {
      response.message = isArray ?
        `Successfully created ${results.length} accounts` :
        'Account created successfully';
    } else if (results.length > 0 && errors.length > 0) {
      response.message = `Created ${results.length} accounts with ${errors.length} failures`;
    }

    const statusCode = results.length > 0 ?
      (errors.length > 0 ? 207 : 201) : // 207 Multi-Status for partial success
      400;

    return res.status(statusCode).json(response);

  } catch (error) {
    console.error('POST Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create accounts',
      message: error.message
    });
  }
}

// Export for use in other modules (ES6 syntax)
export { handleGet };