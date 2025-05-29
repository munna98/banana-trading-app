import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AccountView() {
  const router = useRouter();
  const { id } = router.query;

  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [entriesPage, setEntriesPage] = useState(1);
  const [entriesLimit] = useState(20);
  const [hasMoreEntries, setHasMoreEntries] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0); // Added to store total entries count for pagination

  // Load account details
  const loadAccount = async (accountId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/accounts/${accountId}?includeChildren=true&includeParent=true`);
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
    } finally {
      setLoading(false);
    }
  };

  // Load account balance
  const loadBalance = async (accountId) => {
    try {
      setBalanceLoading(true);

      const response = await fetch(`/api/accounts/${accountId}/balance`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load balance');
      }

      if (data.success) {
        setBalance(data.data);
      } else {
        throw new Error(data.message || 'Failed to load balance');
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance({ error: error.message }); // Set error in balance state
    } finally {
      setBalanceLoading(false);
    }
  };

  // Load transaction entries
  const loadEntries = async (accountId, page = 1, reset = false) => {
    try {
      setEntriesLoading(true);

      // Corrected API call for pagination: use _limit and _page parameters
      // This assumes your API supports these common pagination query parameters.
      // If your API uses different parameters (e.g., skip/take, offset/count), adjust accordingly.
      const response = await fetch(`/api/accounts/${accountId}/entries?_limit=${entriesLimit}&_page=${page}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load entries');
      }

      if (data.success && data.data) { // Assuming data.data is an array of entries
        const newEntries = data.data;
        setEntries(reset ? newEntries : [...entries, ...newEntries]);
        // Assuming your API returns total count in `data.metadata.total` or similar
        const total = data.metadata?.total || 0;
        setTotalEntries(total);
        setHasMoreEntries(newEntries.length + (reset ? 0 : entries.length) < total);
      } else {
        // If data.data is not an array or success is false, clear entries
        setEntries([]);
        setHasMoreEntries(false);
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      // Optionally, set an error state specifically for entries
    } finally {
      setEntriesLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (id) {
      loadAccount(id);
      loadBalance(id);
    }
  }, [id]);

  // Load entries when switching to entries tab or when entriesPage changes
  useEffect(() => {
    if (id && activeTab === 'entries') {
      // Only load if entries are empty or page changes
      if (entriesPage === 1 && entries.length === 0) {
        loadEntries(id, 1, true);
      } else if (entriesPage > 1) {
        loadEntries(id, entriesPage);
      }
    }
  }, [id, activeTab, entriesPage]); // Add entriesPage as a dependency

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

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get entry type display
  const getEntryTypeDisplay = (type) => { // Removed 'amount' as it's not used
    if (type === 'DEBIT') {
      return { label: 'Dr', color: 'text-red-600' };
    } else {
      return { label: 'Cr', color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading account</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => id && loadAccount(id)}
                    className="bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/accounts"
                    className="bg-slate-100 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Back to Accounts
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Account not found</h3>
            <p className="mt-1 text-sm text-gray-500">The requested account could not be found.</p>
            <div className="mt-6">
              <Link
                href="/accounts"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Accounts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/accounts"
                className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Accounts
              </Link>
              <div className="border-l border-slate-300 pl-4">
                <h1 className="text-3xl font-bold text-slate-900">{account.name}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                    {account.code}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(account.type)}`}>
                    {getAccountTypeDisplay(account.type)}
                  </span>
                  {!account.isActive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                      Inactive
                    </span>
                  )}
                  {account.isSeeded && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      System Account
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/accounts/${account.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Account
              </Link>
              <button
                onClick={() => {
                  if (id) {
                    loadAccount(id);
                    loadBalance(id);
                    if (activeTab === 'entries') {
                      setEntriesPage(1); // Reset page when refreshing entries tab
                      loadEntries(id, 1, true);
                    }
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Balance</h3>
              {balanceLoading ? (
                <div className="flex items-center text-slate-500">
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading balance...
                </div>
              ) : balance?.error ? (
                <div className="text-red-600">
                  <p className="text-sm">Error: {balance.error}</p>
                </div>
              ) : balance ? (
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {formatCurrency(balance.balance)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {balance.balance >= 0 ?
                      (['ASSET', 'EXPENSE'].includes(balance.accountType) ? 'Debit Balance' : 'Credit Balance') :
                      (['ASSET', 'EXPENSE'].includes(balance.accountType) ? 'Credit Balance' : 'Debit Balance')
                    }
                  </div>
                  {balance.openingBalance !== undefined && balance.openingBalance !== 0 && (
                    <div className="text-sm text-slate-500 mt-2">
                      Opening Balance: {formatCurrency(balance.openingBalance)}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => id && loadBalance(id)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Load Balance
                </button>
              )}
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Last updated</p>
              <p>{formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { id: 'entries', name: 'Transaction Entries', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'hierarchy', name: 'Account Hierarchy', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'entries' && entries.length === 0) {
                      setEntriesPage(1); // Ensure entries page is reset to 1 when switching to entries tab
                      loadEntries(id, 1, true);
                    }
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm inline-flex items-center ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Account Details */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Account Code</label>
                        <p className="mt-1 text-sm text-slate-900">{account.code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Account Name</label>
                        <p className="mt-1 text-sm text-slate-900">{account.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Account Type</label>
                        <p className="mt-1 text-sm text-slate-900">{getAccountTypeDisplay(account.type)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Status</label>
                        <p className="mt-1 text-sm text-slate-900">
                          {account.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Parent Account</label>
                        <p className="mt-1 text-sm text-slate-900">
                          {account.parent ? (
                            <Link
                              href={`/accounts/${account.parent.id}`}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              {account.parent.name} ({account.parent.code})
                            </Link>
                          ) : (
                            'Root Account'
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Opening Balance</label>
                        <p className="mt-1 text-sm text-slate-900">
                          {account.openingBalance ? formatCurrency(account.openingBalance) : '₹0.00'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Created Date</label>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(account.createdAt)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700">Last Updated</label>
                        <p className="mt-1 text-sm text-slate-900">{formatDate(account.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {account.description && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Description</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">{account.description}</p>
                  </div>
                )}

                {/* Payment Settings */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Payment Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${account.canDebitOnPayment ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-slate-700">Can Debit on Payment</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${account.canCreditOnReceipt ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-slate-700">Can Credit on Receipt</span>
                    </div>
                  </div>
                </div>

                {/* Child Accounts */}
                {account.children && account.children.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">
                      Child Accounts ({account.children.length})
                    </h4>
                    <div className="bg-slate-50 rounded-lg overflow-hidden">
                      <div className="space-y-2 p-4">
                        {account.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                {child.code}
                              </span>
                              <span className="font-medium text-slate-900">{child.name}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(child.type)}`}>
                                {getAccountTypeDisplay(child.type)}
                              </span>
                            </div>
                            <Link
                              href={`/accounts/${child.id}`}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              View →
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'entries' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Transaction Entries</h4>
                {entriesLoading && entries.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-slate-600">Loading transaction entries...</p>
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No entries found</h3>
                    <p className="mt-1 text-sm text-gray-500">This account has no transaction entries yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                entry.type === 'DEBIT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {getEntryTypeDisplay(entry.type).label}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {entry.transaction?.reference || `Transaction #${entry.transaction?.id}`}
                              </p>
                              <p className="text-sm text-slate-600">{entry.transaction?.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${getEntryTypeDisplay(entry.type).color}`}>
                              {formatCurrency(entry.amount)}
                            </p>
                            <p className="text-sm text-slate-500">{formatDate(entry.transaction?.date)}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {hasMoreEntries && (
                      <div className="text-center py-4">
                        <button
                          onClick={() => setEntriesPage((prevPage) => prevPage + 1)}
                          disabled={entriesLoading}
                          className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-colors duration-150 disabled:opacity-50"
                        >
                          {entriesLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading more...
                            </>
                          ) : (
                            'Load More Entries'
                          )}
                        </button>
                      </div>
                    )}
                    {!hasMoreEntries && entries.length > 0 && (
                      <div className="text-center text-slate-500 text-sm py-4">
                        You've reached the end of the transaction entries.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hierarchy' && (
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Account Hierarchy</h4>
                <div className="bg-slate-50 p-6 rounded-lg shadow-inner">
                  {account.parent && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-700">Parent Account:</p>
                      <Link
                        href={`/accounts/${account.parent.id}`}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center mt-1"
                      >
                        <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-2 2v-10a1 1 0 00-1-1h-3" />
                        </svg>
                        <span className="font-medium">{account.parent.name} ({account.parent.code})</span>
                      </Link>
                    </div>
                  )}

                  <div className={`flex items-center ${account.parent ? 'ml-8' : ''}`}>
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-slate-900 text-lg">{account.name} (Current Account)</span>
                  </div>

                  {account.children && account.children.length > 0 ? (
                    <div className="ml-8 mt-4 space-y-2">
                      <p className="text-sm font-medium text-slate-700">Child Accounts:</p>
                      {account.children.map((child) => (
                        <div key={child.id} className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <Link
                            href={`/accounts/${child.id}`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {child.name} ({child.code})
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-8 mt-4 text-sm text-slate-500">No direct child accounts.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}