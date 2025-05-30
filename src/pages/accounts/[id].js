import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AccountView() {
  const router = useRouter();
  const { id } = router.query;
  
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30'); // days
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(20);

  // Load account details
  const loadAccount = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/accounts/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load account');
      }

      if (data.success) {
        setAccount(data.data);
      } else {
        throw new Error(data.message || 'Failed to load account');
      }
    } catch (error) {
      console.error('Error loading account:', error);
      setError(error.message);
    }
  };

  // Load account balance
  const loadAccountBalance = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/accounts/${id}/balance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load balance');
      }

      if (data.success) {
        setBalanceInfo(data);
      } else {
        throw new Error(data.message || 'Failed to load balance');
      }
    } catch (error) {
      console.error('Error loading account balance:', error);
      setError(error.message);
    }
  };

  // Load account transactions
  const loadTransactions = async () => {
    if (!id) return;
    
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: transactionsPerPage,
        dateRange,
        filter: transactionFilter
      });

      const response = await fetch(`/api/accounts/${id}/transactions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load transactions');
      }

      if (data.success) {
        setTransactions(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load transactions');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError(error.message);
    }
  };

  // Load balance history
  const loadBalanceHistory = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/accounts/${id}/balance-history?days=${dateRange}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load balance history');
      }

      if (data.success) {
        setBalanceHistory(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load balance history');
      }
    } catch (error) {
      console.error('Error loading balance history:', error);
      // Don't set error for balance history as it's not critical
    }
  };

  // Initial data loading
  useEffect(() => {
    if (id) {
      setLoading(true);
      setError(null);
      
      Promise.all([
        loadAccount(),
        loadAccountBalance(),
        loadTransactions(),
        loadBalanceHistory()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [id]);

  // Reload transactions when filters change
  useEffect(() => {
    if (id && !loading) {
      loadTransactions();
    }
  }, [currentPage, dateRange, transactionFilter]);

  // Reload balance history when date range changes
  useEffect(() => {
    if (id && !loading) {
      loadBalanceHistory();
    }
  }, [dateRange]);

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadAccount(),
        loadAccountBalance(),
        loadTransactions(),
        loadBalanceHistory()
      ]);
    } catch (error) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Get account type display name
  const getAccountTypeDisplay = (type) => {
    const typeMap = {
      'ASSET': 'Asset',
      'LIABILITY': 'Liability',
      'EQUITY': 'Equity',
      'INCOME': 'Income',
      'EXPENSE': 'Expense'
    };
    return typeMap[type] || type;
  };

  // Get account type color
  const getAccountTypeColor = (type) => {
    const colorMap = {
      'ASSET': 'bg-blue-100 text-blue-800',
      'LIABILITY': 'bg-red-100 text-red-800',
      'EQUITY': 'bg-purple-100 text-purple-800',
      'INCOME': 'bg-green-100 text-green-800',
      'EXPENSE': 'bg-orange-100 text-orange-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  // Get transaction type display
  const getTransactionTypeDisplay = (type, amount) => {
    if (amount > 0) return 'Credit';
    if (amount < 0) return 'Debit';
    return type;
  };

  // Get transaction amount color
  const getTransactionAmountColor = (amount) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-center text-slate-500">
              <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading account details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={refreshData}
                    className="bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/accounts" className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Accounts
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 md:ml-2 text-sm font-medium text-slate-500 truncate">
                  {account?.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{account?.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(account?.type)}`}>
                  {getAccountTypeDisplay(account?.type)}
                </span>
                {!account?.isActive && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>Code: <span className="font-semibold text-slate-900">{account?.code}</span></span>
                {account?.description && (
                  <span>Description: <span className="font-semibold text-slate-900">{account.description}</span></span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={refreshData}
                className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <Link
                href={`/accounts/${id}/edit`}
                className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Account
              </Link>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Current Balance</h2>
            {balanceInfo ? (
              <div>
                <div className="text-4xl font-bold text-slate-900 mb-1">
                  ₹{balanceInfo.displayBalance?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-slate-500">
                  {balanceInfo.balanceDescription || 'Balance'}
                </div>
              </div>
            ) : (
              <div className="text-2xl text-slate-400">
                Balance not available
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                Balance History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Account Code</h3>
                    <p className="text-lg font-semibold text-slate-900">{account?.code}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Account Type</h3>
                    <p className="text-lg font-semibold text-slate-900">{getAccountTypeDisplay(account?.type)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Status</h3>
                    <p className="text-lg font-semibold text-slate-900">
                      {account?.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  {account?.parentId && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Parent Account</h3>
                      <p className="text-lg font-semibold text-slate-900">{account.parentId}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Created Date</h3>
                    <p className="text-lg font-semibold text-slate-900">
                      {account?.createdAt ? formatDate(account.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Last Updated</h3>
                    <p className="text-lg font-semibold text-slate-900">
                      {account?.updatedAt ? formatDate(account.updatedAt) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {account?.description && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                    <p className="text-slate-900">{account.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label htmlFor="dateRange" className="block text-sm font-medium text-slate-700 mb-2">
                      Date Range
                    </label>
                    <select
                      id="dateRange"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                      <option value="all">All time</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="transactionFilter" className="block text-sm font-medium text-slate-700 mb-2">
                      Transaction Type
                    </label>
                    <select
                      id="transactionFilter"
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">All Transactions</option>
                      <option value="debit">Debit Only</option>
                      <option value="credit">Credit Only</option>
                    </select>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                          <tr key={transaction.id || index} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {transaction.reference || '-'}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getTransactionAmountColor(transaction.amount)}`}>
                              {formatCurrency(transaction.amount)}
                              <span className="ml-1 text-xs">
                                ({getTransactionTypeDisplay(transaction.type, transaction.amount)})
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 font-medium">
                              ₹{transaction.runningBalance?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                            No transactions found for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Balance History Tab */}
            {activeTab === 'history' && (
              <div>
                <div className="mb-4">
                  <label htmlFor="historyDateRange" className="block text-sm font-medium text-slate-700 mb-2">
                    Time Period
                  </label>
                  <select
                    id="historyDateRange"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>

                {balanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {balanceHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {entry.description || 'Balance snapshot'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-900">
                            ₹{entry.balance.toFixed(2)}
                          </div>
                          {entry.change && (
                            <div className={`text-xs ${entry.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.change > 0 ? '+' : ''}₹{entry.change.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    No balance history available for the selected period.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}