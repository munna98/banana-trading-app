// pages/index.js
import { useState, useEffect } from 'react';
import { prisma } from '../lib/db';
import Link from 'next/link';

export default function Dashboard({ summary, recentTransactions, cashBook }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance > 10000) return 'text-red-600 font-semibold';
    if (balance > 5000) return 'text-orange-500 font-medium';
    return 'text-green-600';
  };

  const quickActions = [
    {
      title: 'New Purchase',
      href: '/purchases/add',
      icon: '📦',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Record purchase from supplier'
    },
    {
      title: 'New Sale',
      href: '/sales/add',
      icon: '💰',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Create new sale transaction'
    },
    {
      title: 'Make Payment',
      href: '/transactions/payments',
      icon: '💳',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Pay supplier balance'
    },
    {
      title: 'Receive Payment',
      href: '/transactions/receipts',
      icon: '💵',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Collect customer payment'
    },
    {
      title: 'Cash Book',
      href: '/cash-book',
      icon: '💸',
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'Manage cash transactions'
    },
    {
      title: 'Bank Reconciliation',
      href: '/bank/reconciliation',
      icon: '🏦',
      color: 'bg-cyan-500 hover:bg-cyan-600',
      description: 'Reconcile bank statements'
    },
    {
      title: 'Expense Categories',
      href: '/expenses/categories',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Manage expense categories'
    },
    {
      title: 'Financial Reports',
      href: '/reports/financial',
      icon: '📊',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'View P&L and Balance Sheet'
    }
  ];

  return (
    <div className="dashboard space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Banana Trading Dashboard
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Inventory Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Inventory</h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {summary.itemCount}
              </div>
              <div className="text-sm text-gray-500">
                Stock Value: {formatCurrency(summary.totalStockValue)}
              </div>
            </div>
            <div className="text-4xl">🍌</div>
          </div>
          <Link href="/items" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Manage Items →
          </Link>
        </div>

        {/* Suppliers Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Suppliers</h3>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {summary.supplierCount}
              </div>
              <div className={`text-sm ${getBalanceColor(summary.totalSupplierBalance)}`}>
                {formatCurrency(summary.totalSupplierBalance)} Outstanding
              </div>
            </div>
            <div className="text-4xl">🚛</div>
          </div>
          <Link href="/suppliers" className="inline-block mt-4 text-orange-600 hover:text-orange-800 font-medium">
            Manage Suppliers →
          </Link>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Customers</h3>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {summary.customerCount}
              </div>
              <div className={`text-sm ${getBalanceColor(summary.totalCustomerBalance)}`}>
                {formatCurrency(summary.totalCustomerBalance)} Receivable
              </div>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <Link href="/customers" className="inline-block mt-4 text-green-600 hover:text-green-800 font-medium">
            Manage Customers →
          </Link>
        </div>

        {/* Cash Position Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Cash Position</h3>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {formatCurrency(cashBook.closingCash)}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">In:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(cashBook.cashIn)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Out:</span>
                  <span className="text-red-600 font-medium">{formatCurrency(cashBook.cashOut)}</span>
                </div>
              </div>
            </div>
            <div className="text-4xl">💸</div>
          </div>
          <Link href="/cash-book" className="inline-block mt-4 text-purple-600 hover:text-purple-800 font-medium">
            View Cash Book →
          </Link>
        </div>
      </div>

      {/* Business Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Net Position</h3>
          <div className="text-2xl font-bold mb-1">
            {formatCurrency(summary.totalCustomerBalance - summary.totalSupplierBalance)}
          </div>
          <p className="text-sm opacity-90">Receivables - Payables</p>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Today's Activity</h3>
          <div className="text-2xl font-bold mb-1">
            {summary.todayPurchases + summary.todaySales}
          </div>
          <p className="text-sm opacity-90">Total Transactions</p>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
          <div className="text-2xl font-bold mb-1">
            {summary.paymentMethodStats.total}
          </div>
          <p className="text-sm opacity-90">Active Methods</p>
        </div>

        <div className="bg-gradient-to-r from-teal-400 to-teal-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Bank Status</h3>
          <div className="text-2xl font-bold mb-1">
            {summary.bankReconciliation.unreconciled}
          </div>
          <p className="text-sm opacity-90">Unreconciled Items</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className={`${action.color} text-white rounded-lg p-4 cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">📋</span>
            Recent Transactions
          </h2>
          <Link href="/transactions" className="text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </Link>
        </div>
        
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Party</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'SALE' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'PAYMENT' ? 'bg-orange-100 text-orange-800' :
                        transaction.type === 'RECEIPT' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.party || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.paymentMethod && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-right">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.balance > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {transaction.balance > 0 ? 'Pending' : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p>No recent transactions found</p>
            <p className="text-sm mt-2">Start by creating a purchase or sale</p>
          </div>
        )}
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">💳</span>
          Payment Method Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(summary.paymentMethodStats.breakdown).map(([method, count]) => (
            <div key={method} className="text-center">
              <div className="text-2xl font-bold text-gray-700">{count}</div>
              <div className="text-sm text-gray-500 capitalize">
                {method.replace('_', ' ').toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to serialize Date objects recursively
function serializeData(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeData);
  }
  
  if (typeof obj === 'object') {
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }
  
  return obj;
}

export async function getServerSideProps() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [
      itemCount,
      supplierCount,
      customerCount,
      totalStockValue,
      todayPurchases,
      todaySales,
      recentTransactions,
      cashBookToday,
      paymentMethods,
      bankTransactions
    ] = await Promise.all([
      // Basic counts
      prisma.item.count(),
      prisma.supplier.count(),
      prisma.customer.count(),
      
      // Calculate total stock value
      prisma.item.aggregate({
        _sum: {
          currentStock: true
        }
      }),
      
      // Today's activity
      prisma.purchase.count({
        where: { date: { gte: today } }
      }),
      prisma.sale.count({
        where: { date: { gte: today } }
      }),
      
      // Recent transactions from the Transaction table
      prisma.transaction.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          purchase: { include: { supplier: true } },
          sale: { include: { customer: true } },
          payment: { include: { supplier: true } },
          receipt: { include: { customer: true } }
        }
      }),
      
      // Today's cash book entry
      prisma.cashBook.findUnique({
        where: { date: today }
      }),
      
      // Payment method statistics
      prisma.payment.groupBy({
        by: ['paymentMethod'],
        _count: true
      }),
      
      // Bank reconciliation status
      prisma.bankTransaction.count({
        where: { isReconciled: false }
      })
    ]);

    // Calculate balances (since they're no longer stored)
    const [supplierBalances, customerBalances] = await Promise.all([
      // Supplier balances calculation
      prisma.supplier.findMany({
        include: {
          purchases: true,
          payments: true
        }
      }),
      
      // Customer balances calculation
      prisma.customer.findMany({
        include: {
          sales: true,
          receipts: true
        }
      })
    ]);

    const totalSupplierBalance = supplierBalances.reduce((total, supplier) => {
      const purchaseTotal = supplier.purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
      const paymentTotal = supplier.payments.reduce((sum, payment) => sum + payment.amount, 0);
      return total + (purchaseTotal - paymentTotal);
    }, 0);

    const totalCustomerBalance = customerBalances.reduce((total, customer) => {
      const saleTotal = customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const receiptTotal = customer.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
      return total + (saleTotal - receiptTotal);
    }, 0);

    // Format recent transactions - CONVERT DATES TO STRINGS
    const formattedTransactions = recentTransactions.map(transaction => {
      let party = null;
      let balance = 0;
      let paymentMethod = null;

      if (transaction.purchase) {
        party = transaction.purchase.supplier.name;
        balance = transaction.purchase.totalAmount - transaction.purchase.paidAmount;
      } else if (transaction.sale) {
        party = transaction.sale.customer.name;
        balance = transaction.sale.totalAmount - transaction.sale.receivedAmount;
      } else if (transaction.payment) {
        party = transaction.payment.supplier?.name;
        paymentMethod = transaction.payment.paymentMethod;
      } else if (transaction.receipt) {
        party = transaction.receipt.customer?.name;
        paymentMethod = transaction.receipt.paymentMethod;
      }

      return {
        date: transaction.date.toISOString(), // Convert Date to string
        type: transaction.type,
        party,
        amount: transaction.amount,
        balance,
        paymentMethod
      };
    });

    // Payment method breakdown
    const paymentMethodBreakdown = paymentMethods.reduce((acc, method) => {
      acc[method.paymentMethod] = method._count;
      return acc;
    }, {});

    // Default cash book if none exists for today
    const defaultCashBook = {
      openingCash: 0,
      cashIn: 0,
      cashOut: 0,
      closingCash: 0
    };

    // Serialize cashBook data to handle any Date fields
    const serializedCashBook = cashBookToday ? {
      openingCash: cashBookToday.openingCash || 0,
      cashIn: cashBookToday.cashIn || 0,
      cashOut: cashBookToday.cashOut || 0,
      closingCash: cashBookToday.closingCash || 0,
      // Convert date to string if it exists
      ...(cashBookToday.date && { date: cashBookToday.date.toISOString() })
    } : defaultCashBook;

    return {
      props: serializeData({
        summary: {
          itemCount,
          supplierCount,
          customerCount,
          totalStockValue: totalStockValue._sum.currentStock || 0,
          totalSupplierBalance,
          totalCustomerBalance,
          todayPurchases,
          todaySales,
          paymentMethodStats: {
            total: Object.keys(paymentMethodBreakdown).length,
            breakdown: paymentMethodBreakdown
          },
          bankReconciliation: {
            unreconciled: bankTransactions
          }
        },
        recentTransactions: formattedTransactions,
        cashBook: serializedCashBook
      })
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return default data in case of error
    return {
      props: serializeData({
        summary: {
          itemCount: 0,
          supplierCount: 0,
          customerCount: 0,
          totalStockValue: 0,
          totalSupplierBalance: 0,
          totalCustomerBalance: 0,
          todayPurchases: 0,
          todaySales: 0,
          paymentMethodStats: { total: 0, breakdown: {} },
          bankReconciliation: { unreconciled: 0 }
        },
        recentTransactions: [],
        cashBook: { openingCash: 0, cashIn: 0, cashOut: 0, closingCash: 0 }
      })
    };
  }
}