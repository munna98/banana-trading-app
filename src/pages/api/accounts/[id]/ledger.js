// pages/api/accounts/[id]/ledger.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validate ID parameter
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: 'Invalid account ID',
      message: 'Account ID must be a valid number',
    });
  }

  const accountId = parseInt(id);

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      error: `Method ${method} not allowed`,
      allowedMethods: ['GET'],
    });
  }

  try {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        name: true,
        type: true,
        openingBalance: true,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        accountId,
      });
    }

    // Fetch all transaction entries for the account, ordered by date
    const transactionEntries = await prisma.transactionEntry.findMany({
      where: { accountId },
      orderBy: {
        transaction: {
          date: 'asc', // Order by transaction date ascending
        },
      },
      include: {
        transaction: {
          select: {
            id: true,
            date: true,
            description: true,
            type: true, // e.g., 'PAYMENT', 'RECEIPT', 'JOURNAL'
          },
        },
      },
    });

    // Calculate running balance for the ledger
    let runningBalance = parseFloat(account.openingBalance || 0);
    const ledgerEntries = transactionEntries.map(entry => {
      let debit = parseFloat(entry.debitAmount || 0);
      let credit = parseFloat(entry.creditAmount || 0);

      // Adjust running balance based on account type's normal balance nature
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        runningBalance += (debit - credit);
      } else { // LIABILITY, INCOME, EQUITY
        runningBalance += (credit - debit);
      }

      return {
        id: entry.id,
        transactionId: entry.transaction.id,
        date: entry.transaction.date,
        description: entry.transaction.description,
        transactionType: entry.transaction.type,
        debitAmount: debit,
        creditAmount: credit,
        runningBalance: parseFloat(runningBalance.toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      openingBalance: parseFloat((account.openingBalance || 0).toFixed(2)),
      ledgerEntries,
    });

  } catch (error) {
    console.error('GET Account Ledger Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch account ledger',
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}