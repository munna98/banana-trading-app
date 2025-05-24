// pages/api/customers/[id].js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { id } = req.query
  const customerId = parseInt(id)

  if (isNaN(customerId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid customer ID' 
    })
  }

  try {
    switch (req.method) {
      case 'GET':
        const customer = await prisma.customer.findUnique({
          where: { id: customerId }
        })

        if (!customer) {
          return res.status(404).json({ 
            success: false, 
            error: 'Customer not found' 
          })
        }

        res.status(200).json({
          success: true,
          customer: customer
        })
        break

      case 'PUT':
        const { name, phone, address, balance } = req.body

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (address !== undefined) updateData.address = address
        if (balance !== undefined) updateData.balance = parseFloat(balance)

        const updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: updateData
        })

        res.status(200).json({
          success: true,
          customer: updatedCustomer
        })
        break

      case 'DELETE':
        await prisma.customer.delete({
          where: { id: customerId }
        })

        res.status(200).json({ 
          success: true, 
          message: 'Customer deleted successfully' 
        })
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).json({ 
          success: false, 
          error: `Method ${req.method} not allowed` 
        })
    }
  } catch (error) {
    console.error('Customer API error:', error)

    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Customer not found' 
      })
    }

    res.status(500).json({ 
      success: false, 
      error: 'Internal server error'
    })
  } finally {
    await prisma.$disconnect()
  }
}