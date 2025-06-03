// pages/api/suppliers/index.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { page = '1', limit = '10', search } = req.query
      const pageNum = Math.max(parseInt(page, 10) || 1, 1)
      const limitNum = Math.max(parseInt(limit, 10) || 10, 1)
      const skip = (pageNum - 1) * limitNum

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}

      const suppliers = await prisma.supplier.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          purchases: { select: { id: true, totalAmount: true, date: true } },
          payments: { select: { id: true, amount: true, date: true } },
          account: true, // Include the associated account
        },
        orderBy: { createdAt: 'desc' }
      })

      const total = await prisma.supplier.count({ where })

      return res.status(200).json({
        success: true,
        suppliers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      })
    }

    if (req.method === 'POST') {
      const { name, phone, address } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
          message: 'Name is required'
        })
      }

      // Start a Prisma transaction
      const newSupplier = await prisma.$transaction(async (prisma) => {
        // 1. Find the 'Trade Payables' parent account
        const tradePayablesAccount = await prisma.account.findFirst({
          where: {
            name: 'Trade Payables', // Assuming 'Trade Payables' is the name of your parent account
            type: 'LIABILITY' // Assuming 'Trade Payables' is a LIABILITY type account
          }
        })

        if (!tradePayablesAccount) {
          throw new Error('Trade Payables account not found. Please create it first.')
        }

        // 2. Create a new account for the supplier under 'Trade Payables'
        const supplierAccount = await prisma.account.create({
          data: {
            name: `${name}`, // A descriptive name for the supplier's account
            code: `SUPP-${Date.now()}`, // Generate a unique code (you might want a more robust system)
            type: 'LIABILITY', // Supplier accounts are typically Liabilities
            parentId: tradePayablesAccount.id,
            description: `Account for supplier: ${name}`,
            isActive: true,
            // --- NEW: Set canDebitOnPayment and canCreditOnReceipt to true for supplier accounts ---
            canDebitOnPayment: true,
            canCreditOnReceipt: true,
            // --- END NEW ---
          }
        })

        // 3. Create the new supplier, linking it to the newly created account
        const supplier = await prisma.supplier.create({
          data: {
            name, 
            phone,
            address,
            accountId: supplierAccount.id, // Link the supplier to its account
          },
          include: {
            account: true, // Include the created account in the response
          }
        })

        return supplier
      })


      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully with associated account',
        supplier: newSupplier
      })
    }

    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
      message: `Method ${req.method} not allowed`
    })
  } catch (error) {
    console.error('Supplier API error:', error)
    // Handle specific errors for better client feedback
    if (error.message.includes('Trade Payables account not found')) {
      return res.status(404).json({
        success: false,
        error: 'Dependent account not found',
        message: error.message
      })
    }
    // Prisma unique constraint error (e.g., if phone is unique and duplicate)
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate entry',
        message: `A supplier with the provided ${error.meta.target} already exists.`
      });
    }
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    })
  } finally {
    await prisma.$disconnect()
  }
}
