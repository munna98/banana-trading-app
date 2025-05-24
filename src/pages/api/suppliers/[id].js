// pages/api/suppliers/[id].js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const { id } = req.query
  const supplierId = parseInt(id)

  if (isNaN(supplierId)) {
    return res.status(400).json({ error: 'Invalid supplier ID' })
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get single supplier with related data
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
          include: {
            purchases: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 purchases
            },
            payments: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 payments
            }
          }
        })

        if (!supplier) {
          return res.status(404).json({ error: 'Supplier not found' })
        }

        res.status(200).json(supplier)
        break

      case 'PUT':
        // Update supplier
        const { name, phone, address, balance } = req.body

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (address !== undefined) updateData.address = address
        if (balance !== undefined) updateData.balance = parseFloat(balance)

        const updatedSupplier = await prisma.supplier.update({
          where: { id: supplierId },
          data: updateData
        })

        res.status(200).json(updatedSupplier)
        break

      case 'DELETE':
        // Delete supplier (check for related records first)
        const supplierToDelete = await prisma.supplier.findUnique({
          where: { id: supplierId },
          include: {
            purchases: true,
            payments: true
          }
        })

        if (!supplierToDelete) {
          return res.status(404).json({ error: 'Supplier not found' })
        }

        if (supplierToDelete.purchases.length > 0 || supplierToDelete.payments.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete supplier with existing purchases or payments' 
          })
        }

        await prisma.supplier.delete({
          where: { id: supplierId }
        })

        res.status(200).json({ message: 'Supplier deleted successfully' })
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Supplier API error:', error)
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Supplier with this data already exists' })
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Supplier not found' })
    }

    res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
}