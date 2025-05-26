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
        // Get single supplier with related data, including the associated account
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
            },
            account: true, // <--- Include the associated account
          }
        })

        if (!supplier) {
          return res.status(404).json({ success: false, error: 'Supplier not found' })
        }

        res.status(200).json({ success: true, supplier })
        break

      case 'PUT':
        // Update supplier and potentially their associated account
        const { name, phone, address } = req.body

        // First, check if the supplier exists
        const existingSupplier = await prisma.supplier.findUnique({
          where: { id: supplierId },
          select: { accountId: true } // We only need the accountId for updates
        });

        if (!existingSupplier) {
          return res.status(404).json({ success: false, error: 'Supplier not found' });
        }

        // Use a transaction for consistency if updating both supplier and account
        const updatedSupplier = await prisma.$transaction(async (prisma) => {
          const updateSupplierData = {};
          if (name !== undefined) updateSupplierData.name = name;
          if (phone !== undefined) updateSupplierData.phone = phone;
          if (address !== undefined) updateSupplierData.address = address;

          const updated = await prisma.supplier.update({
            where: { id: supplierId },
            data: updateSupplierData,
            include: { account: true } // Include account in the response
          });

          // If the name changed, update the associated account's name as well
          if (name !== undefined && existingSupplier.accountId) {
            await prisma.account.update({
              where: { id: existingSupplier.accountId },
              data: { name: `${name}` } // Update the account name
            });
          }
          return updated;
        });

        res.status(200).json({ success: true, message: 'Supplier updated successfully', supplier: updatedSupplier })
        break

      case 'DELETE':
        // Delete supplier and their associated account
        const supplierToDelete = await prisma.supplier.findUnique({
          where: { id: supplierId },
          include: {
            purchases: true,
            payments: true,
            account: {
              include: {
                entries: true // Include ledger entries to check for transactions
              }
            }
          }
        })

        if (!supplierToDelete) {
          return res.status(404).json({ success: false, error: 'Supplier not found' })
        }

        if (supplierToDelete.purchases.length > 0 || supplierToDelete.payments.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete supplier with existing purchases or payments. Consider deactivating instead.',
            message: 'Supplier has associated transactions. Please settle or delete transactions before deleting the supplier.'
          })
        }

        // Use a transaction to ensure both supplier and account are deleted or none are
        await prisma.$transaction(async (prisma) => {
          // Check if the associated account has ledger entries before deleting
          if (supplierToDelete.account && supplierToDelete.account.ledgerEntries.length > 0) {
            // Option 1: Prevent deletion and suggest deactivation
            throw new Error('Associated account has ledger entries. Cannot delete account. Please deactivate supplier instead.');

            /*
            // Option 2: Deactivate the account instead of deleting (if you want to allow this)
            await prisma.account.update({
              where: { id: supplierToDelete.accountId },
              data: { isActive: false }
            });
            */
          }

          // Delete the supplier
          await prisma.supplier.delete({
            where: { id: supplierId }
          })

          // Delete the associated account ONLY if it exists and has no ledger entries
          if (supplierToDelete.accountId && (!supplierToDelete.account || supplierToDelete.account.ledgerEntries.length === 0)) {
            await prisma.account.delete({
              where: { id: supplierToDelete.accountId }
            })
          }
        })

        res.status(200).json({ success: true, message: 'Supplier and associated account deleted successfully' })
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        res.status(405).json({ success: false, error: `Method ${req.method} not allowed` })
    }
  } catch (error) {
    console.error('Supplier API error:', error)

    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Duplicate entry', message: `A supplier with the provided ${error.meta.target} already exists.` })
    }

    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Record not found', message: 'The record to be updated or deleted does not exist.' })
    }
    
    // Catch the custom error thrown for ledger entries
    if (error.message.includes('Associated account has ledger entries')) {
      return res.status(400).json({ success: false, error: 'Account has transactions', message: error.message });
    }

    res.status(500).json({ success: false, error: 'Internal server error', message: 'An error occurred while processing your request' })
  } finally {
    await prisma.$disconnect()
  }
}