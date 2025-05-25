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
          payments: { select: { id: true, amount: true, date: true } }
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
      const { name, phone, address, balance = 0 } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
          message: 'Name is required'
        })
      }

      const newSupplier = await prisma.supplier.create({
        data: {
          name,
          phone,
          address,
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
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
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    })
  } finally {
    await prisma.$disconnect()
  }
}
