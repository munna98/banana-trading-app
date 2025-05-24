// pages/api/customers/index.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        // Get all customers with optional pagination and search
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
              select: { id: true, amount: true, date: true }
            },
            payments: {
              select: { id: true, amount: true, date: true }
            }
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
        // Create new customer
        const { name, phone, address, balance = 0 } = req.body

        if (!name) {
          return res.status(400).json({ 
            success: false, 
            error: 'Name is required',
            message: 'Name is required'
          })
        }

        const newCustomer = await prisma.customer.create({
          data: {
            name,
            phone,
            address,
            balance: parseFloat(balance)
          }
        })

        res.status(201).json({
          success: true,
          message: 'Customer created successfully',
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
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    })
  } finally {
    await prisma.$disconnect()
  }
}