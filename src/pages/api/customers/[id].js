// pages/api/customers/[id].js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { id } = req.query
  const customerId = parseInt(id)

  if (isNaN(customerId)) {
    return res.status(400).json({ error: 'Invalid customer ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get single customer with related data
        const customer = await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            sales: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 sales
            },
            payments: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 payments
            }
          }
        })

        if (!customer) {
          return res.status(404).json({ error: 'Customer not found' })
        }

        res.status(200).json(customer)
        break

      case 'PUT':
        // Update customer
        const { name, phone, email, address, balance } = req.body

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (email !== undefined) updateData.email = email
        if (address !== undefined) updateData.address = address
        if (balance !== undefined) updateData.balance = parseFloat(balance)

        const updatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: updateData
        })

        res.status(200).json(updatedCustomer)
        break

      case 'DELETE':
        // Delete customer (check for related records first)
        const customerToDelete = await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            sales: true,
            payments: true
          }
        })

        if (!customerToDelete) {
          return res.status(404).json({ error: 'Customer not found' })
        }

        if (customerToDelete.sales.length > 0 || customerToDelete.payments.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete customer with existing sales or payments' 
          })
        }

        await prisma.customer.delete({
          where: { id: customerId }
        })

        res.status(200).json({ message: 'Customer deleted successfully' })
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Customer API error:', error)
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Customer with this data already exists' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' })
    }

    res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}