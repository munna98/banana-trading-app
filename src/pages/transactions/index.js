import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Function to fetch data from APIs and normalize it
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterPaymentMethod !== 'all') {
        queryParams.append('paymentMethod', filterPaymentMethod);
      }
      if (filterDateFrom) {
        queryParams.append('startDate', filterDateFrom);
      }
      if (filterDateTo) {
        queryParams.append('endDate', filterDateTo);
      }
      // You might need to add entity filtering at the API level for more efficiency
      // or handle it client-side if API doesn't support generic entity name filter.
      // For now, entityName filtering will be client-side on the combined data.

      const paymentsResponse = await fetch(`/api/payments?${queryParams.toString()}`);
      const receiptsResponse = await fetch(`/api/receipts?${queryParams.toString()}`);

      if (!paymentsResponse.ok) throw new Error(`Failed to fetch payments: ${paymentsResponse.statusText}`);
      if (!receiptsResponse.ok) throw new Error(`Failed to fetch receipts: ${receiptsResponse.statusText}`);

      const paymentsData = await paymentsResponse.json();
      const receiptsData = await receiptsResponse.json();

      const combinedTransactions = [
        ...paymentsData.data.map(p => ({
          id: p.id,
          type: 'payment',
          date: p.date,
          entityName: p.supplier?.name || 'N/A',
          entityId: p.supplierId,
          paymentMethod: p.paymentMethod,
          amount: p.amount,
          reference: p.reference,
          notes: p.notes,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        ...receiptsData.data.map(r => ({
          id: r.id,
          type: 'receipt',
          date: r.date,
          entityName: r.customer?.name || 'N/A',
          entityId: r.customerId,
          paymentMethod: r.paymentMethod,
          amount: r.amount,
          reference: r.reference,
          notes: r.notes,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
      ];

      // Sort by date descending
      combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(combinedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterPaymentMethod, filterDateFrom, filterDateTo]); // Dependencies for useCallback

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions based on client-side search criteria (entity name, type)
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;

    const matchesEntity = filterEntity === '' ||
      (transaction.entityName && transaction.entityName.toLowerCase().includes(filterEntity.toLowerCase()));

    return matchesType && matchesEntity;
  });

  // Calculate totals
  const totalPayments = filteredTransactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceipts = filteredTransactions
    .filter(t => t.type === 'receipt')
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalReceipts - totalPayments;

  // Get payment method display name
  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      'CASH': 'Cash',
      'BANK_TRANSFER': 'Bank Transfer',
      'UPI': 'UPI',
      'CHEQUE': 'Cheque',
      'CARD': 'Card'
    };
    return methodMap[method] || method;
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CASH':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'BANK_TRANSFER':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'UPI':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'CHEQUE':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'CARD':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    try {
      const endpoint = type === 'payment' ? `/api/payments/${id}` : `/api/receipts/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        fetchTransactions(); // Re-fetch all transactions after deletion
      } else {
        const errorData = await response.json();
        alert(`Failed to delete ${type}: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      alert(`An error occurred while deleting the ${type}.`);
    }
  };

  const handleEdit = (id, type) => {
    // Navigate to the edit page for the specific payment or receipt
    if (type === 'payment') {
      router.push(`/transactions/payments/edit/${id}`);
    } else if (type === 'receipt') {
      router.push(`/transactions/receipts/edit/${id}`);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Transactions</h1>
              <p className="text-slate-600">Overview of all financial ins and outs</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/transactions/payments/"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Make Payment
              </Link>
              <Link
                href="/transactions/receipts/"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Receive Payment
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Filter Transactions</h3>
            <p className="text-sm text-slate-600">Refine your view of transactions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="all">All Transactions</option>
                  <option value="payment">Payments</option>
                  <option value="receipt">Receipts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="all">All Methods</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Entity Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  placeholder="Filter by customer/supplier"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {(filterEntity || filterDateFrom || filterDateTo || filterType !== 'all' || filterPaymentMethod !== 'all') && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <button
                onClick={() => {
                  setFilterEntity('');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                  setFilterType('all');
                  setFilterPaymentMethod('all');
                  // Re-fetch data to clear API-level filters
                  fetchTransactions();
                }}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-900">Total Transactions</h3>
                <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</p>
              </div>
            </div>
          </div>

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
                <h3 className="text-sm font-medium text-red-900">Total Payments</h3>
                <p className="text-2xl font-bold text-red-600">₹{totalPayments.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-green-900">Total Receipts</h3>
                <p className="text-2xl font-bold text-green-600">₹{totalReceipts.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 1m3-1V6m0-6h.01M5 12h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm12 5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-purple-900">Net Cash Flow</h3>
                <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netFlow.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg text-slate-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <p className="text-lg">Error: {error}</p>
              <p className="text-sm text-slate-500">Please try again later.</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment Method</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={`${transaction.type}-${transaction.id}`} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          #{transaction.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'payment' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type === 'payment' ? 'Payment' : 'Receipt'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">
                          {transaction.entityName || 'General Transaction'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2 text-slate-500">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                          </span>
                          <span className="text-sm font-medium text-slate-900">
                            {getPaymentMethodDisplay(transaction.paymentMethod)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">₹{transaction.amount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {transaction.reference || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {transaction.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction.id, transaction.type)}
                            className="inline-flex items-center px-3 py-1.5 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id, transaction.type)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                          {/* Existing View Supplier/Customer link, keep if still needed */}
                          {/* {transaction.entityId && (
                            transaction.type === 'payment' ? (
                              <Link
                                href={`/suppliers/${transaction.entityId}`}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Supplier
                              </Link>
                            ) : (
                              <Link
                                href={`/customers/${transaction.entityId}`}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Customer
                              </Link>
                            )
                          )} */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No transactions found</h3>
              <p className="mt-1 text-sm text-slate-500">Adjust your filters or add new transactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// No getServerSideProps is needed here anymore.