import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AccountsList({ initialAccounts = [], initialChartOfAccounts = [] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' or 'list'
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());
  const [accountBalances, setAccountBalances] = useState(new Map());

  // Effect to set accounts and chartOfAccounts when props change
  useEffect(() => { 
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  useEffect(() => {
    setChartOfAccounts(initialChartOfAccounts);
  }, [initialChartOfAccounts]);


  // Filter accounts based on search criteria
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.code && account.code.toLowerCase().includes(searchTerm.toLowerCase())); // Added check for account.code

    const matchesType = filterType === 'all' || account.type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && account.isActive) ||
      (filterStatus === 'inactive' && !account.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get account type display name
  const getAccountTypeDisplay = (type) => {
    const typeMap = {
      'ASSET': 'Asset',
      'LIABILITY': 'Liability',
      'EQUITY': 'Equity',
      'REVENUE': 'Revenue',
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
      'REVENUE': 'bg-green-100 text-green-800',
      'EXPENSE': 'bg-orange-100 text-orange-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Toggle expanded state for account
  const toggleAccountExpansion = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Load account balance
  const loadAccountBalance = async (accountId) => {
    if (accountBalances.has(accountId)) return; // Don't load if already loaded or loading
    try {
      const balance = await accountService.getBalance(accountId);
      setAccountBalances(prev => new Map(prev.set(accountId, balance)));
    } catch (error) {
      console.error('Error loading account balance:', error);
      // Optionally, set a specific error state for this account's balance
      setAccountBalances(prev => new Map(prev.set(accountId, { error: 'Failed to load' })));
    }
  };

  // Render account tree (recursive)
  const renderAccountTree = (account, level = 0) => {
    if (!account) return null; // Add a guard clause for undefined account
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedAccounts.has(account.id);
    const balanceInfo = accountBalances.get(account.id);

    return (
      <div key={account.id} className="border-l-2 border-slate-200">
        <div
          className={`flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-150 ${
            level > 0 ? `ml-${level * 4}` : '' // This Tailwind class might not work dynamically as intended for arbitrary levels.
          }`}
          style={{ marginLeft: `${level * 1.5}rem` }} // Inline style is more reliable for dynamic margins.
        >
          <div className="flex items-center flex-1 min-w-0"> {/* Added min-w-0 for better truncation */}
            {hasChildren && (
              <button
                onClick={() => toggleAccountExpansion(account.id)}
                className="mr-2 p-1 rounded hover:bg-slate-200 transition-colors duration-150"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!hasChildren && <div className="w-6 h-6 mr-2"></div>} {/* Placeholder for alignment */}

            <div className="flex items-center space-x-3 overflow-hidden"> {/* Added overflow-hidden */}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {account.code}
              </span>
              <span className="font-medium text-slate-900 truncate" title={account.name}>{account.name}</span> {/* Added truncate and title */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                {getAccountTypeDisplay(account.type)}
              </span>
              {!account.isActive && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 ml-4"> {/* Added ml-4 for spacing */}
            {balanceInfo ? (
              balanceInfo.error ? (
                <div className="text-right">
                  <span className="text-xs text-red-500">{balanceInfo.error}</span>
                 </div>
              ) : (
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    ₹{Math.abs(balanceInfo.balance).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {balanceInfo.balance >= 0 ?
                      (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Debit' : 'Credit') :
                      (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Credit' : 'Debit')
                    }
                  </div>
                </div>
              )
            ) : (
              <button
                onClick={() => loadAccountBalance(account.id)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Load Balance
              </button>
            )}

            <div className="flex space-x-2">
              <Link
                href={`/accounts/${account.id}`}
                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View
              </Link>
              <Link
                href={`/accounts/${account.id}/edit`}
                className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-4 pl-2"> {/* Adjusted padding/margin for children */}
            {account.children.map(childAccount => renderAccountTree(childAccount, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate account type totals
  const accountTypeTotals = accounts.reduce((totals, account) => {
    totals[account.type] = (totals[account.type] || 0) + 1;
    return totals;
  }, {});

  const activeAccountsCount = accounts.filter(acc => acc.isActive).length;
  const inactiveAccountsCount = accounts.filter(acc => !acc.isActive).length;

  const getParentAccountName = (parentId) => {
    if (!parentId) return 'N/A';
    const parent = accounts.find(acc => acc.id === parentId);
    return parent ? parent.name : 'Unknown';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Chart of Accounts</h1>
              <p className="text-slate-600">Manage your accounting structure and account hierarchy</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/accounts/a"
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Account
              </Link>
              <Link
                href="/reports/trial-balance"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Trial Balance
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Asset Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Assets</h3>
                <p className="text-2xl font-bold text-blue-600">{accountTypeTotals.ASSET || 0}</p>
              </div>
            </div>
          </div>
          {/* Liability Card */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-900">Liabilities</h3>
                <p className="text-2xl font-bold text-red-600">{accountTypeTotals.LIABILITY || 0}</p>
              </div>
            </div>
          </div>
          {/* Equity Card */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-purple-900">Equity</h3>
                <p className="text-2xl font-bold text-purple-600">{accountTypeTotals.EQUITY || 0}</p>
              </div>
            </div>
          </div>
          {/* Revenue Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-900">Revenue</h3>
                <p className="text-2xl font-bold text-green-600">{accountTypeTotals.REVENUE || 0}</p>
              </div>
            </div>
          </div>
          {/* Expense Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-orange-900">Expenses</h3>
                <p className="text-2xl font-bold text-orange-600">{accountTypeTotals.EXPENSE || 0}</p>
              </div>
            </div>
          </div>
          {/* Total Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-slate-900">Total</h3>
                <p className="text-2xl font-bold text-slate-600">{accounts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-slate-900">View Accounts</h3>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                    viewMode === 'chart' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Chart View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filterType" className="block text-sm font-medium text-slate-700 mb-2">Account Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <select
                    id="filterType"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="ASSET">Assets</option>
                    <option value="LIABILITY">Liabilities</option>
                    <option value="EQUITY">Equity</option>
                    <option value="REVENUE">Revenue</option>
                    <option value="EXPENSE">Expenses</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active ({activeAccountsCount})</option>
                    <option value="inactive">Inactive ({inactiveAccountsCount})</option>
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2"> {/* Adjusted for better layout on larger screens */}
                <label htmlFor="searchTerm" className="block text-sm font-medium text-slate-700 mb-2">Search Accounts</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="searchTerm"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by account name or code..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && viewMode === 'list' && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredAccounts.length} of {accounts.length} accounts
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Accounts Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {viewMode === 'chart' ? (
            // Chart of Accounts View
            <div>
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Chart of Accounts</h3>
                <p className="text-sm text-slate-600">Hierarchical view of your account structure</p>
              </div>
              <div className="divide-y divide-slate-200">
                {chartOfAccounts.length > 0 ? (
                  chartOfAccounts.map(account => renderAccountTree(account))
                ) : (
                  <div className="text-center py-12 px-4">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No accounts found</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by creating your first account.</p>
                    <div className="mt-6">
                      <Link
                        href="/accounts/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add Account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // List View
            filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Code</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Account Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Parent Account</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Balance</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredAccounts.map((account) => {
                      const balanceInfo = accountBalances.get(account.id);
                      return (
                        <tr key={account.id} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{account.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{account.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                              {getAccountTypeDisplay(account.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getParentAccountName(account.parentId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {account.isActive ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">
                            {balanceInfo ? (
                               balanceInfo.error ? (
                                <span className="text-xs text-red-500">{balanceInfo.error}</span>
                               ) : (
                                <>
                                  <div className="font-semibold text-slate-900">
                                    ₹{Math.abs(balanceInfo.balance).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {balanceInfo.balance >= 0 ?
                                      (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Dr' : 'Cr') :
                                      (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Cr' : 'Dr')
                                    }
                                  </div>
                                </>
                               )
                            ) : (
                              <button
                                onClick={() => loadAccountBalance(account.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Load
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <div className="flex items-center justify-center space-x-2">
                                <Link
                                  href={`/accounts/${account.id}`}
                                  className="text-blue-600 hover:text-blue-800 transition-colors duration-150 p-1 rounded hover:bg-blue-100"
                                  title="View Account"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Link>
                                <Link
                                  href={`/accounts/${account.id}/edit`}
                                  className="text-amber-600 hover:text-amber-800 transition-colors duration-150 p-1 rounded hover:bg-amber-100"
                                  title="Edit Account"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                 <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10v.01M10 14v.01M14 10v.01M14 14v.01M5 19h14M5 5h14" />
                  </svg>
                <h3 className="mt-2 text-sm font-medium text-slate-900">No accounts match your filters</h3>
                <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
                 <div className="mt-6">
                    <button
                        onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                        setFilterStatus('all');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Clear all filters
                    </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}