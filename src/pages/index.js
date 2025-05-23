// pages/index.js
import { useState, useEffect } from 'react';
import { prisma } from '../lib/db';
import Card from '../components/UI/Card';
import Link from 'next/link';

export default function Dashboard({ summary, recentTransactions }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
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
      title: 'Add Expense',
      href: '/expenses/add',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Record business expense'
    },
    {
      title: 'View Reports',
      href: '/reports',
      icon: '📊',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Generate business reports'
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
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-500">Current Time</div>
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
              <div className="text-sm text-gray-500">Banana Types</div>
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

        {/* Today's Activity Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Today's Activity</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Purchases:</span>
                  <span className="font-semibold text-blue-600">{summary.todayPurchases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sales:</span>
                  <span className="font-semibold text-green-600">{summary.todaySales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expenses:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(summary.todayExpenses)}</span>
                </div>
              </div>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        transaction.type === 'Purchase' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'Sale' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {transaction.party}
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

      {/* Business Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Cash Flow</h3>
          <div className="text-2xl font-bold mb-1">
            {formatCurrency(summary.totalCustomerBalance - summary.totalSupplierBalance)}
          </div>
          <p className="text-sm opacity-90">Net Receivable</p>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Daily Activity</h3>
          <div className="text-2xl font-bold mb-1">
            {summary.todayPurchases + summary.todaySales}
          </div>
          <p className="text-sm opacity-90">Total Transactions</p>
        </div>

        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Business Growth</h3>
          <div className="text-2xl font-bold mb-1">
            {summary.customerCount + summary.supplierCount}
          </div>
          <p className="text-sm opacity-90">Total Partners</p>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    itemCount,
    supplierCount,
    customerCount,
    suppliers,
    customers,
    todayPurchases,
    todaySales,
    todayExpensesData,
    recentPurchases,
    recentSales
  ] = await Promise.all([
    prisma.item.count(),
    prisma.supplier.count(),
    prisma.customer.count(),
    prisma.supplier.findMany(),
    prisma.customer.findMany(),
    prisma.purchase.count({
      where: {
        date: {
          gte: today
        }
      }
    }),
    prisma.sale.count({
      where: {
        date: {
          gte: today
        }
      }
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: today
        }
      }
    }),
    // Recent purchases
    prisma.purchase.findMany({
      take: 3,
      orderBy: { date: 'desc' },
      include: { supplier: true }
    }),
    // Recent sales
    prisma.sale.findMany({
      take: 3,
      orderBy: { date: 'desc' },
      include: { customer: true }
    })
  ]);

  const totalSupplierBalance = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0);
  const totalCustomerBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const todayExpenses = todayExpensesData.reduce((sum, expense) => sum + expense.amount, 0);

  // Combine and format recent transactions
  const recentTransactions = [
    ...recentPurchases.map(purchase => ({
      date: purchase.date,
      type: 'Purchase',
      party: purchase.supplier.name,
      amount: purchase.totalAmount,
      balance: purchase.balance
    })),
    ...recentSales.map(sale => ({
      date: sale.date,
      type: 'Sale',
      party: sale.customer.name,
      amount: sale.totalAmount,
      balance: sale.balance
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return {
    props: {
      summary: {
        itemCount,
        supplierCount,
        customerCount,
        totalSupplierBalance,
        totalCustomerBalance,
        todayPurchases,
        todaySales,
        todayExpenses
      },
      recentTransactions
    }
  };
}