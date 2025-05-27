// pages/api/accounts/chart.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      error: `Method ${method} not allowed`,
      allowedMethods: ['GET'],
      message: 'Chart of accounts is read-only'
    });
  }

  try {
    // Get hierarchical chart of accounts (root accounts with all children)
    const accounts = await prisma.account.findMany({
      where: {
        parentId: null, // Only root accounts
        isActive: true  // Only active accounts by default
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                children: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: accounts,
      meta: {
        total: accounts.length,
        hierarchical: true,
        activeOnly: true
      }
    });

  } catch (error) {
    console.error('Chart API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch chart of accounts',
      message: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}