// pages/api/accounts/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid account ID',
      message: 'Account ID must be a valid number'
    });
  }

  const accountId = parseInt(id);

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, accountId);
      case 'PUT':
        return await handlePut(req, res, accountId);
      case 'DELETE':
        return await handleDelete(req, res, accountId);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          error: `Method ${method} not allowed`,
          allowedMethods: ['GET', 'PUT', 'DELETE']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/accounts/[id] - Get a specific account with optional includes
async function handleGet(req, res, accountId) {
  const {
    includeChildren,
    includeParent,
    includeEntries,
    includeFullHierarchy,
    entriesLimit = 50
  } = req.query;

  try {
    // Build include clause based on query parameters
    const include = {};

    if (includeChildren === 'true') {
      include.children = {
        where: { isActive: true },
        orderBy: { code: 'asc' },
        include: includeFullHierarchy === 'true' ? {
          children: {
            include: {
              children: true // Support nested hierarchy
            }
          }
        } : undefined
      };
    }

    if (includeParent === 'true') {
      include.parent = true;
    }

    if (includeEntries === 'true') {
      include.entries = {
        take: parseInt(entriesLimit),
        orderBy: { createdAt: 'desc' },
        include: {
          transaction: {
            select: {
              id: true,
              reference: true,
              date: true,
              type: true,
              description: true
            }
          }
        }
      };
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        accountId
      });
    }

    // Calculate additional metadata
    const metadata = {};

    // Count children if not included
    if (includeChildren !== 'true') {
      metadata.childrenCount = await prisma.account.count({
        where: { parentId: accountId, isActive: true }
      });
    }

    // Count total entries if not included or limited
    if (includeEntries !== 'true') {
      metadata.entriesCount = await prisma.transactionEntry.count({
        where: { accountId }
      });
    } else if (parseInt(entriesLimit) < metadata.entriesCount) {
      metadata.totalEntries = await prisma.transactionEntry.count({
        where: { accountId }
      });
      metadata.showingEntries = parseInt(entriesLimit);
    }

    // Calculate account balance
    const balanceResult = await prisma.transactionEntry.aggregate({
      where: { accountId },
      _sum: {
        debit: true,
        credit: true
      }
    });

    const totalDebits = balanceResult._sum.debit || 0;
    const totalCredits = balanceResult._sum.credit || 0;
    
    // Balance calculation depends on account type
    let balance;
    if (['ASSET', 'EXPENSE'].includes(account.type)) {
      balance = totalDebits - totalCredits; // Debit balance accounts
    } else {
      balance = totalCredits - totalDebits; // Credit balance accounts
    }

    metadata.balance = {
      current: balance,
      totalDebits,
      totalCredits
    };

    return res.status(200).json({
      success: true,
      data: account,
      metadata
    });

  } catch (error) {
    console.error('GET Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch account',
      message: error.message
    });
  }
}

// PUT /api/accounts/[id] - Update a specific account
async function handlePut(req, res, accountId) {
  const { code, name, type, parentId, description, isActive } = req.body;

  try {
    // Check if account exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
      include: { 
        children: true,
        entries: { take: 1 } // Just check if any entries exist
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        accountId
      });
    }

    // Validation for critical changes
    if (type && type !== existingAccount.type) {
      // Check if account has transaction entries
      if (existingAccount.entries.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot change account type when account has transaction entries'
        });
      }

      // Check if children have incompatible types
      if (existingAccount.children.length > 0) {
        const incompatibleChildren = existingAccount.children.filter(child => child.type !== type);
        if (incompatibleChildren.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot change account type when children have different types',
            incompatibleChildren: incompatibleChildren.map(child => ({
              id: child.id,
              code: child.code,
              name: child.name,
              type: child.type
            }))
          });
        }
      }

      // Validate account type
      const validTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid account type',
          validTypes
        });
      }
    }

    // If updating code, check for conflicts
    if (code && code !== existingAccount.code) {
      const codeConflict = await prisma.account.findUnique({
        where: { code }
      });

      if (codeConflict) {
        return res.status(409).json({
          success: false,
          error: 'Account code already exists',
          conflictingAccount: {
            id: codeConflict.id,
            code: codeConflict.code,
            name: codeConflict.name
          }
        });
      }
    }

    // Validate parent account if changing
    if (parentId !== undefined && parentId !== existingAccount.parentId) {
      if (parentId) {
        const parentAccount = await prisma.account.findUnique({
          where: { id: parseInt(parentId) }
        });

        if (!parentAccount) {
          return res.status(400).json({
            success: false,
            error: 'Parent account not found',
            parentId
          });
        }

        // Check for circular reference
        if (parseInt(parentId) === accountId) {
          return res.status(400).json({
            success: false,
            error: 'Account cannot be its own parent'
          });
        }

        // Check if trying to make a child the parent (circular reference)
        const isChildOfCurrent = await isDescendant(accountId, parseInt(parentId));
        if (isChildOfCurrent) {
          return res.status(400).json({
            success: false,
            error: 'Cannot create circular reference - proposed parent is a descendant of this account'
          });
        }

        // Validate type compatibility
        const accountType = type || existingAccount.type;
        if (parentAccount.type !== accountType) {
          return res.status(400).json({
            success: false,
            error: 'Parent and child accounts must have the same type',
            parentType: parentAccount.type,
            childType: accountType
          });
        }
      }
    }

    // Build update data
    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (parentId !== undefined) updateData.parentId = parentId ? parseInt(parentId) : null;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update the account
    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
      include: {
        parent: true,
        children: {
          orderBy: { code: 'asc' }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: account,
      message: 'Account updated successfully'
    });

  } catch (error) {
    console.error('PUT Error:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Account code already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update account',
      message: error.message
    });
  }
}

// DELETE /api/accounts/[id] - Delete a specific account
async function handleDelete(req, res, accountId) {
  const { force = false } = req.query;

  try {
    // Get account with related data
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        children: true,
        entries: { take: 1 }, // Just check if any entries exist
        _count: {
          select: {
            children: true,
            entries: true
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        accountId
      });
    }

    // Safety checks unless force is true
    if (!force) {
      if (account._count.children > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete account with child accounts',
          childrenCount: account._count.children,
          suggestion: 'Delete or reassign child accounts first, or use force=true',
          children: account.children.map(child => ({
            id: child.id,
            code: child.code,
            name: child.name
          }))
        });
      }

      if (account._count.entries > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete account with transaction entries',
          entriesCount: account._count.entries,
          suggestion: 'This account has transaction history and should be deactivated instead of deleted'
        });
      }
    }

    // If force delete, handle cascading
    if (force && account._count.children > 0) {
      // Update children to have no parent (make them root accounts)
      await prisma.account.updateMany({
        where: { parentId: accountId },
        data: { parentId: null }
      });
    }

    // Delete the account
    await prisma.account.delete({
      where: { id: accountId }
    });

    return res.status(200).json({
      success: true,
      message: force ? 'Account force deleted successfully' : 'Account deleted successfully',
      deletedAccount: {
        id: account.id,
        code: account.code,
        name: account.name
      },
      ...(force && account._count.children > 0 && {
        orphanedChildren: account._count.children
      })
    });

  } catch (error) {
    console.error('DELETE Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: error.message
    });
  }
}

// Helper function to check if an account is a descendant of another
async function isDescendant(ancestorId, potentialDescendantId) {
  const descendant = await prisma.account.findUnique({
    where: { id: potentialDescendantId },
    select: { parentId: true }
  });

  if (!descendant || !descendant.parentId) {
    return false;
  }

  if (descendant.parentId === ancestorId) {
    return true;
  }

  return await isDescendant(ancestorId, descendant.parentId);
}