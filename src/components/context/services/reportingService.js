// context/services/reportingService.js (COMPLETE)
import { getPrismaClient, handleDatabaseError } from './prismaService.js';

const prisma = getPrismaClient();

export const reportingService = {
  // Create or update reporting period
  async createOrUpdatePeriod(periodData) {
    try {
      const existing = await prisma.reportingPeriod.findFirst({
        where: {
          startDate: periodData.startDate,
          endDate: periodData.endDate
        }
      });

      if (existing) {
        return await prisma.reportingPeriod.update({
          where: { id: existing.id },
          data: periodData
        });
      } else {
        return await prisma.reportingPeriod.create({
          data: periodData
        });
      }
    } catch (error) {
      handleDatabaseError(error, 'Creating/updating reporting period');
    }
  },

  // Generate profit & loss report
  async generateProfitLossReport(startDate, endDate) {
    try {
      // Revenue from sales
      const revenue = await prisma.sale.aggregate({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        _sum: { totalAmount: true }
      });

      // Cost of goods sold (purchases)
      const cogs = await prisma.purchase.aggregate({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        _sum: { totalAmount: true }
      });

      // Operating expenses
      const expenses = await prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      });

      const totalRevenue = revenue._sum.totalAmount || 0;
      const totalCOGS = cogs._sum.totalAmount || 0;
      const totalExpenses = expenses._sum.amount || 0;
      const grossProfit = totalRevenue - totalCOGS;
      const netProfit = grossProfit - totalExpenses;

      return {
        period: { startDate, endDate },
        revenue: totalRevenue,
        costOfGoodsSold: totalCOGS,
        grossProfit,
        operatingExpenses: totalExpenses,
        netProfit,
        grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating profit & loss report');
    }
  },

  // Generate balance sheet
  async generateBalanceSheet(asOfDate) {
    try {
      // Assets
      const assets = await prisma.account.findMany({
        where: { type: 'ASSET', isActive: true },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lte: asOfDate }
              }
            }
          }
        }
      });

      // Liabilities
      const liabilities = await prisma.account.findMany({
        where: { type: 'LIABILITY', isActive: true },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lte: asOfDate }
              }
            }
          }
        }
      });

      // Equity
      const equity = await prisma.account.findMany({
        where: { type: 'EQUITY', isActive: true },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lte: asOfDate }
              }
            }
          }
        }
      });

      // Calculate balances
      const calculateBalance = (accounts) => {
        return accounts.map(account => {
          const debitTotal = account.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
          const creditTotal = account.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
          
          let balance;
          if (['ASSET', 'EXPENSE'].includes(account.type)) {
            balance = debitTotal - creditTotal;
          } else {
            balance = creditTotal - debitTotal;
          }
          
          return {
            ...account,
            balance,
            entries: undefined // Remove entries from response
          };
        });
      };

      const assetBalances = calculateBalance(assets);
      const liabilityBalances = calculateBalance(liabilities);
      const equityBalances = calculateBalance(equity);

      const totalAssets = assetBalances.reduce((sum, acc) => sum + acc.balance, 0);
      const totalLiabilities = liabilityBalances.reduce((sum, acc) => sum + acc.balance, 0);
      const totalEquity = equityBalances.reduce((sum, acc) => sum + acc.balance, 0);

      return {
        asOfDate,
        assets: assetBalances,
        liabilities: liabilityBalances,
        equity: equityBalances,
        totals: {
          totalAssets,
          totalLiabilities,
          totalEquity,
          isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        }
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating balance sheet');
    }
  },

  // Generate cash flow statement
  async generateCashFlowStatement(startDate, endDate) {
    try {
      // Operating activities
      const operatingCashReceipts = await prisma.receipt.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
          paymentMethod: 'CASH'
        },
        _sum: { amount: true }
      });

      const operatingCashPayments = await prisma.payment.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
          paymentMethod: 'CASH'
        },
        _sum: { amount: true }
      });

      const netOperatingCashFlow = (operatingCashReceipts._sum.amount || 0) - (operatingCashPayments._sum.amount || 0);

      // Get opening and closing cash balances
      const openingCash = await prisma.account.findFirst({
        where: { 
          name: 'Cash',
          type: 'ASSET' 
        },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lt: startDate }
              }
            }
          }
        }
      });

      const closingCash = await prisma.account.findFirst({
        where: { 
          name: 'Cash',
          type: 'ASSET' 
        },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lte: endDate }
              }
            }
          }
        }
      });

      // Calculate cash balances
      const calculateCashBalance = (account) => {
        if (!account || !account.entries) return 0;
        const debitTotal = account.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
        const creditTotal = account.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);
        return debitTotal - creditTotal;
      };

      const openingCashBalance = calculateCashBalance(openingCash);
      const closingCashBalance = calculateCashBalance(closingCash);

      // Investing activities (asset purchases/sales)
      const investingInflows = await prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
          description: { contains: 'asset sale' }
        },
        _sum: { amount: true }
      });

      const investingOutflows = await prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
          description: { contains: 'asset purchase' }
        },
        _sum: { amount: true }
      });

      const netInvestingCashFlow = (investingInflows._sum.amount || 0) - (investingOutflows._sum.amount || 0);

      // Financing activities (loans, equity)
      const financingInflows = await prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
          OR: [
            { description: { contains: 'loan' } },
            { description: { contains: 'investment' } },
            { description: { contains: 'capital' } }
          ]
        },
        _sum: { amount: true }
      });

      const financingOutflows = await prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
          OR: [
            { description: { contains: 'loan payment' } },
            { description: { contains: 'dividend' } },
            { description: { contains: 'withdrawal' } }
          ]
        },
        _sum: { amount: true }
      });

      const netFinancingCashFlow = (financingInflows._sum.amount || 0) - (financingOutflows._sum.amount || 0);

      // Net change in cash
      const netCashChange = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

      return {
        period: { startDate, endDate },
        operatingActivities: {
          cashReceipts: operatingCashReceipts._sum.amount || 0,
          cashPayments: operatingCashPayments._sum.amount || 0,
          netOperatingCashFlow
        },
        investingActivities: {
          inflows: investingInflows._sum.amount || 0,
          outflows: investingOutflows._sum.amount || 0,
          netInvestingCashFlow
        },
        financingActivities: {
          inflows: financingInflows._sum.amount || 0,
          outflows: financingOutflows._sum.amount || 0,
          netFinancingCashFlow
        },
        cashSummary: {
          openingCashBalance,
          netCashChange,
          closingCashBalance,
          calculatedClosingBalance: openingCashBalance + netCashChange,
          isReconciled: Math.abs(closingCashBalance - (openingCashBalance + netCashChange)) < 0.01
        }
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating cash flow statement');
    }
  },

  // Generate trial balance
  async generateTrialBalance(asOfDate) {
    try {
      const accounts = await prisma.account.findMany({
        where: { isActive: true },
        include: {
          entries: {
            where: {
              transaction: {
                date: { lte: asOfDate }
              }
            }
          }
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ]
      });

      const trialBalanceData = accounts.map(account => {
        const debitTotal = account.entries.reduce((sum, entry) => sum + entry.debitAmount, 0);
        const creditTotal = account.entries.reduce((sum, entry) => sum + entry.creditAmount, 0);

        return {
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          debitBalance: debitTotal > creditTotal ? debitTotal - creditTotal : 0,
          creditBalance: creditTotal > debitTotal ? creditTotal - debitTotal : 0
        };
      });

      const totalDebits = trialBalanceData.reduce((sum, acc) => sum + acc.debitBalance, 0);
      const totalCredits = trialBalanceData.reduce((sum, acc) => sum + acc.creditBalance, 0);

      return {
        asOfDate,
        accounts: trialBalanceData,
        totals: {
          totalDebits,
          totalCredits,
          isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
          difference: totalDebits - totalCredits
        }
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating trial balance');
    }
  },

  // Generate aging report for receivables
  async generateAgingReport(asOfDate, type = 'RECEIVABLE') {
    try {
      const accountType = type === 'RECEIVABLE' ? 'ASSET' : 'LIABILITY';
      const accountNameFilter = type === 'RECEIVABLE' ? 'Accounts Receivable' : 'Accounts Payable';

      const transactions = await prisma.transaction.findMany({
        where: {
          date: { lte: asOfDate },
          entries: {
            some: {
              account: {
                type: accountType,
                name: { contains: accountNameFilter }
              }
            }
          }
        },
        include: {
          entries: {
            include: {
              account: true
            }
          },
          customer: true,
          supplier: true
        }
      });

      const agingBuckets = {
        current: [],      // 0-30 days
        days31to60: [],   // 31-60 days
        days61to90: [],   // 61-90 days
        over90: []        // Over 90 days
      };

      const daysDifference = (date1, date2) => {
        return Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
      };

      transactions.forEach(transaction => {
        const daysOverdue = daysDifference(transaction.date, asOfDate);
        const entity = transaction.customer || transaction.supplier;
        
        const relevantEntry = transaction.entries.find(entry => 
          entry.account.name.includes(accountNameFilter)
        );

        if (relevantEntry) {
          const amount = type === 'RECEIVABLE' ? relevantEntry.debitAmount : relevantEntry.creditAmount;
          
          const agingItem = {
            transactionId: transaction.id,
            date: transaction.date,
            entityName: entity?.name || 'Unknown',
            amount,
            daysOverdue
          };

          if (daysOverdue <= 30) {
            agingBuckets.current.push(agingItem);
          } else if (daysOverdue <= 60) {
            agingBuckets.days31to60.push(agingItem);
          } else if (daysOverdue <= 90) {
            agingBuckets.days61to90.push(agingItem);
          } else {
            agingBuckets.over90.push(agingItem);
          }
        }
      });

      const calculateTotal = (bucket) => bucket.reduce((sum, item) => sum + item.amount, 0);

      const totals = {
        current: calculateTotal(agingBuckets.current),
        days31to60: calculateTotal(agingBuckets.days31to60),
        days61to90: calculateTotal(agingBuckets.days61to90),
        over90: calculateTotal(agingBuckets.over90)
      };

      const grandTotal = Object.values(totals).reduce((sum, total) => sum + total, 0);

      return {
        asOfDate,
        type,
        buckets: agingBuckets,
        totals: {
          ...totals,
          grandTotal
        }
      };
    } catch (error) {
      handleDatabaseError(error, 'Generating aging report');
    }
  },

  // Get all available reporting periods
  async getReportingPeriods() {
    try {
      return await prisma.reportingPeriod.findMany({
        orderBy: { startDate: 'desc' }
      });
    } catch (error) {
      handleDatabaseError(error, 'Fetching reporting periods');
    }
  },

  // Delete a reporting period
  async deletePeriod(periodId) {
    try {
      return await prisma.reportingPeriod.delete({
        where: { id: periodId }
      });
    } catch (error) {
      handleDatabaseError(error, 'Deleting reporting period');
    }
  }
};