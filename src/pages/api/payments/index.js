// API ROUTE FOR PAYMENTS
// pages/api/payments/index.js

import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  // Handle POST request to create new payment
  if (req.method === 'POST') {
    try {
      const { supplierId, amount, notes, date } = req.body;
      
      // Validate required fields
      if (!supplierId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Supplier and amount are required' });
      }
      
      // Begin transaction to update both payment and supplier balance
      const result = await prisma.$transaction(async (prisma) => {
        // Create new payment record
        const payment = await prisma.payment.create({
          data: {
            supplierId: parseInt(supplierId),
            amount: parseFloat(amount),
            notes,
            date: date ? new Date(date) : new Date()
          }
        });
        
        // Update supplier balance
        const supplier = await prisma.supplier.findUnique({
          where: { id: parseInt(supplierId) }
        });
        
        const updatedBalance = supplier.balance - parseFloat(amount);
        
        await prisma.supplier.update({
          where: { id: parseInt(supplierId) },
          data: { balance: updatedBalance }
        });
        
        return { payment, updatedBalance };
      });
      
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({ message: 'Failed to create payment', error: error.message });
    }
  }
  
  // Handle GET request to fetch all payments
  if (req.method === 'GET') {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          supplier: true
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      return res.status(200).json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
    }
  }
  
  // Return 405 Method Not Allowed for other request types
  return res.status(405).json({ message: 'Method not allowed' });
}