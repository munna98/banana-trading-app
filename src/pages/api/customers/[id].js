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
          where: { id: customerId },
          include: {
            account: true, // <--- Include the associated account
            sales: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 sales
            },
            receipts: {
              orderBy: { date: 'desc' },
              take: 10 // Last 10 receipts
            }
          }
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
        const { name, phone, address } = req.body

        // First, check if the customer exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { id: customerId },
          select: { accountId: true } // We only need the accountId for updates
        });

        if (!existingCustomer) {
          return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Use a transaction for consistency if updating both customer and account
        const updatedCustomer = await prisma.$transaction(async (prisma) => {
          const updateCustomerData = {};
          if (name !== undefined) updateCustomerData.name = name;
          if (phone !== undefined) updateCustomerData.phone = phone;
          if (address !== undefined) updateCustomerData.address = address;

          const updated = await prisma.customer.update({
            where: { id: customerId },
            data: updateCustomerData,
            include: { account: true } // Include account in the response
          });

          // If the name changed, update the associated account's name as well
          if (name !== undefined && existingCustomer.accountId) {
            await prisma.account.update({
              where: { id: existingCustomer.accountId },
              data: { name: `${name}` } // Update the account name
            });
          }
          return updated;
        });

        res.status(200).json({
          success: true,
          message: 'Customer updated successfully',
          customer: updatedCustomer
        })
        break

      case 'DELETE':
        // Delete customer and their associated account
        const customerToDelete = await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            sales: true,
            receipts: true,
            account: {
              include: {
                ledgerEntries: true // Include ledger entries to check for transactions
              }
            }
          }
        })

        if (!customerToDelete) {
          return res.status(404).json({
            success: false,
            error: 'Customer not found'
          })
        }

        if (customerToDelete.sales.length > 0 || customerToDelete.receipts.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete customer with existing sales or receipts. Consider deactivating instead.',
            message: 'Customer has associated transactions. Please settle or delete transactions before deleting the customer.'
          })
        }

        // Use a transaction to ensure both customer and account are deleted or none are
        await prisma.$transaction(async (prisma) => {
          // Check if the associated account has ledger entries before deleting
          if (customerToDelete.account && customerToDelete.account.ledgerEntries.length > 0) {
            // Option 1: Prevent deletion and suggest deactivation
            throw new Error('Associated account has ledger entries. Cannot delete account. Please deactivate customer instead.');

            /*
            // Option 2: Deactivate the account instead of deleting (if you want to allow this)
            await prisma.account.update({
              where: { id: customerToDelete.accountId },
              data: { isActive: false }
            });
            */
          }

          // Delete the customer
          await prisma.customer.delete({
            where: { id: customerId }
          })

          // Delete the associated account ONLY if it exists and has no ledger entries
          if (customerToDelete.accountId && (!customerToDelete.account || customerToDelete.account.ledgerEntries.length === 0)) {
            await prisma.account.delete({
              where: { id: customerToDelete.accountId }
            })
          }
        })

        res.status(200).json({
          success: true,
          message: 'Customer and associated account deleted successfully'
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

    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Duplicate entry', message: `A customer with the provided ${error.meta.target} already exists.` })
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
        message: 'The record to be updated or deleted does not exist.'
      })
    }
    
    // Catch the custom error thrown for ledger entries
    if (error.message.includes('Associated account has ledger entries')) {
      return res.status(400).json({ success: false, error: 'Account has transactions', message: error.message });
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