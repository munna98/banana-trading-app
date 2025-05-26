// pages/api/customers/index.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const { page = 1, limit = 10, search } = req.query
        const skip = (parseInt(page) - 1) * parseInt(limit)

        const where = search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ]
        } : {}

        const customers = await prisma.customer.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            sales: {
              select: {
                id: true,
                totalAmount: true,
                receivedAmount: true,
                date: true,
                invoiceNo: true
              }
            },
            receipts: {
              select: { id: true, amount: true, date: true }
            },
            account: true, // <--- Include the associated account
          },
          orderBy: { createdAt: 'desc' }
        })

        const total = await prisma.customer.count({ where })

        res.status(200).json({
          success: true,
          customers,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        })
        break

      case 'POST':
        const { name, phone, address } = req.body

        if (!name) {
          return res.status(400).json({
            success: false,
            error: 'Name is required',
            message: 'Name is required'
          })
        }

        // Start a Prisma transaction for atomicity
        const newCustomer = await prisma.$transaction(async (prisma) => {
          // 1. Find the 'Trade Receivables' parent account
          const tradeReceivablesAccount = await prisma.account.findFirst({
            where: {
              name: 'Trade Receivables', // Assuming 'Trade Receivables' is the name of your parent account
              type: 'ASSET' // Assuming 'Trade Receivables' is an ASSET type account
            }
          })

          if (!tradeReceivablesAccount) {
            throw new Error('Trade Receivables account not found. Please create it first.')
          }

          // 2. Create a new account for the customer under 'Trade Receivables'
          const customerAccount = await prisma.account.create({
            data: {
              name: `${name}`, // A descriptive name for the customer's account
              code: `CUST-${Date.now()}`, // Generate a unique code (consider a more robust system)
              type: 'ASSET', // Customer accounts are typically Assets
              parentId: tradeReceivablesAccount.id,
              description: `Account for customer: ${name}`,
              isActive: true,
            }
          })

          // 3. Create the new customer, linking it to the newly created account
          const customer = await prisma.customer.create({
            data: {
              name,
              phone,
              address,
              accountId: customerAccount.id, // Link the customer to its account
            },
            include: {
              account: true, // Include the created account in the response
            }
          })

          return customer
        })

        res.status(201).json({
          success: true,
          message: 'Customer created successfully with associated account',
          customer: newCustomer
        })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
          message: `Method ${req.method} not allowed`
        })
    }
  } catch (error) {
    console.error('Customer API error:', error)

    if (error.message.includes('Trade Receivables account not found')) {
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
        message: `A customer with the provided ${error.meta.target} already exists.`
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