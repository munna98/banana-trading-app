// pages/api/accounts/[id]/balance.js

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { method, query } = req;
  const { id, context } = query; // Add context parameter

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
        canDebitOnPayment: true,
        canCreditOnReceipt: true,
        supplier: {
          select: {
            id: true,
            name: true,
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
          }
        }
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found',
        accountId,
      });
    }

    const balanceResult = await prisma.transactionEntry.aggregate({
      where: { accountId },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const totalDebits = balanceResult._sum.debitAmount || 0;
    const totalCredits = balanceResult._sum.creditAmount || 0;

    // Calculate raw accounting balance
    let accountingBalance;
    if (['ASSET', 'EXPENSE'].includes(account.type)) {
      accountingBalance = totalDebits - totalCredits; // Debit balance accounts
    } else {
      accountingBalance = totalCredits - totalDebits; // Credit balance accounts
    }

    // Include opening balance in the calculation
    const currentAccountingBalance = parseFloat(accountingBalance) + parseFloat(account.openingBalance || 0);

    // Determine balance type (debit or credit)
    const balanceTypeInfo = getBalanceType(account, currentAccountingBalance);

    // Determine user-friendly balance and context
    const balanceInfo = getUserFriendlyBalance(account, currentAccountingBalance, context);

    return res.status(200).json({
      success: true,
      accountId: account.id,
      accountName: account.name,
      accountType: account.type,
      
      // Raw accounting data
      accountingBalance: parseFloat(currentAccountingBalance.toFixed(2)),
      openingBalance: parseFloat((account.openingBalance || 0).toFixed(2)),
      transactionBalance: parseFloat(accountingBalance.toFixed(2)),
      totalDebits: parseFloat(totalDebits.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      
      // Balance type information
      ...balanceTypeInfo,
      
      // User-friendly balance information
      ...balanceInfo,
      
      // Account capabilities
      canDebitOnPayment: account.canDebitOnPayment,
      canCreditOnReceipt: account.canCreditOnReceipt,
      
      // Related entities
      supplier: account.supplier,
      customer: account.customer,
    });
  } catch (error) {
    console.error('GET Account Balance Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch account balance',
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Determine if the account has a debit or credit balance
 */
function getBalanceType(account, accountingBalance) {
  let balanceNature;
  let hasNormalBalance;
  
  // Determine the normal balance type for this account type
  const normalDebitAccounts = ['ASSET', 'EXPENSE'];
  const normalCreditAccounts = ['LIABILITY', 'INCOME', 'EQUITY'];
  
  if (normalDebitAccounts.includes(account.type)) {
    // These accounts normally have debit balances
    balanceNature = accountingBalance >= 0 ? 'debit' : 'credit';
    hasNormalBalance = accountingBalance >= 0;
  } else if (normalCreditAccounts.includes(account.type)) {
    // These accounts normally have credit balances
    balanceNature = accountingBalance >= 0 ? 'credit' : 'debit';
    hasNormalBalance = accountingBalance >= 0;
  } else {
    // Fallback for unknown account types
    balanceNature = accountingBalance >= 0 ? 'credit' : 'debit';
    hasNormalBalance = true;
  }

  return {
    balanceNature,
    hasNormalBalance,
    absoluteBalance: Math.abs(accountingBalance),
    isZeroBalance: accountingBalance === 0
  };
}

/**
 * Convert accounting balance to user-friendly format based on account type and context
 */
function getUserFriendlyBalance(account, accountingBalance, context) {
  const balanceInfo = {
    balance: parseFloat(accountingBalance.toFixed(2)),
    displayBalance: parseFloat(accountingBalance.toFixed(2)),
    balanceType: 'neutral',
    balanceDescription: '',
    availableForPayment: 0,
    availableForReceipt: 0,
    warningMessage: null,
  };

  switch (account.type) {
    case 'ASSET':
      // Assets: Positive = we own money/resources
      if (accountingBalance > 0) {
        balanceInfo.balanceType = 'positive';
        balanceInfo.balanceDescription = 'Available balance';
        balanceInfo.availableForPayment = accountingBalance;
      } else if (accountingBalance < 0) {
        balanceInfo.balanceType = 'negative';
        balanceInfo.balanceDescription = 'Overdrawn';
        balanceInfo.availableForPayment = 0;
        balanceInfo.warningMessage = 'This account is overdrawn';
      } else {
        balanceInfo.balanceDescription = 'Zero balance';
      }
      break;

    case 'LIABILITY':
      // Liabilities: Positive = we owe money, Negative = they owe us
      if (accountingBalance > 0) {
        balanceInfo.balanceType = 'liability';
        balanceInfo.balanceDescription = account.supplier 
          ? `Amount owed to ${account.supplier.name}`
          : 'Amount owed';
        balanceInfo.availableForPayment = accountingBalance; // Can pay down the liability
      } else if (accountingBalance < 0) {
        balanceInfo.balanceType = 'asset';
        balanceInfo.displayBalance = Math.abs(accountingBalance);
        balanceInfo.balanceDescription = account.supplier 
          ? `Advance paid to ${account.supplier.name}`
          : 'Advance/Credit balance';
        balanceInfo.availableForPayment = 0; // Can't pay more when they owe us
      } else {
        balanceInfo.balanceDescription = 'No outstanding balance';
      }
      break;

    case 'EXPENSE':
      // Expenses: Positive = money spent
      balanceInfo.balanceType = 'expense';
      balanceInfo.balanceDescription = 'Total expenses';
      // Expenses don't have "available" amounts for payment in the traditional sense
      break;

    case 'INCOME':
      // Income: Positive = money earned
      balanceInfo.balanceType = 'income';
      balanceInfo.balanceDescription = 'Total income';
      break;

    case 'EQUITY':
      // Equity accounts
      balanceInfo.balanceType = 'equity';
      balanceInfo.balanceDescription = 'Equity balance';
      break;
  }

  // Context-specific adjustments
  if (context === 'payment') {
    // When making payments, focus on what's available to spend
    if (account.type === 'ASSET') {
      balanceInfo.contextMessage = accountingBalance > 0 
        ? `₹${accountingBalance.toFixed(2)} available for payments`
        : 'Insufficient funds for payment';
    } else if (account.type === 'LIABILITY' && accountingBalance > 0) {
      balanceInfo.contextMessage = `₹${accountingBalance.toFixed(2)} outstanding - can be paid down`;
    }
  } else if (context === 'receipt') {
    // When receiving money, focus on what can be received
    if (account.type === 'ASSET') {
      balanceInfo.contextMessage = 'Can receive payments to this account';
    }
  }

  return balanceInfo;
}