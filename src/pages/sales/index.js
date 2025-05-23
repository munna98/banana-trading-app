import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { prisma } from '../../lib/db';

export default function SalesList({ initialSales }) {
  const router = useRouter();
  const [sales, setSales] = useState(initialSales);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Filter sales based on search criteria
  const filteredSales = sales.filter(sale => {
    const matchesCustomer = filterCustomer === '' ||
      (sale.customer && sale.customer.name.toLowerCase().includes(filterCustomer.toLowerCase()));

    let matchesDateRange = true;
    const saleDate = new Date(sale.date);

    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      // Adjust fromDate to the beginning of the day for accurate comparison
      fromDate.setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && saleDate >= fromDate;
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // End of the day
      matchesDateRange = matchesDateRange && saleDate <= toDate;
    }

    return matchesCustomer && matchesDateRange;
  });

  // Calculate totals
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalReceived = filteredSales.reduce((sum, sale) => sum + sale.receivedAmount, 0);
  const totalBalance = filteredSales.reduce((sum, sale) => sum + sale.balance, 0);

  // Delete sale handler
  async function handleDeleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/sales/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete sale' }));
        throw new Error(errorData.message || 'Failed to delete sale');
      }

      setSales(sales.filter(s => s.id !== id));
      alert('Sale deleted successfully');
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales</h1>
              <p className="text-slate-600">Track and manage all your sales transactions</p>
            </div>
            <Link
              href="/sales/add"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl hover:from-pink-500 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Sale
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Filter Sales</h3>
            <p className="text-sm text-slate-600">Use filters to find specific sales</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">Customer</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filterCustomer}
                  onChange={(e) => setFilterCustomer(e.target.value)}
                  placeholder="Filter by customer name"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>
          </div>
          {(filterCustomer || filterDateFrom || filterDateTo) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredSales.length} of {sales.length} sales
              </p>
              <button
                onClick={() => {
                  setFilterCustomer('');
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                <h3 className="text-sm font-medium text-blue-900">Total Sales</h3>
                <p className="text-2xl font-bold text-blue-600">{filteredSales.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-pink-900">Total Amount</h3>
                <p className="text-2xl font-bold text-pink-600">₹{totalAmount.toFixed(2)}</p>
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
                <h3 className="text-sm font-medium text-green-900">Total Received</h3>
                <p className="text-2xl font-bold text-green-600">₹{totalReceived.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-900">Outstanding</h3>
                <p className="text-2xl font-bold text-red-600">₹{totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Received Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          #{sale.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {new Date(sale.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{sale.customer ? sale.customer.name : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">₹{sale.totalAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-medium">₹{sale.receivedAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          sale.balance > 0
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          ₹{Math.abs(sale.balance).toFixed(2)}
                          {sale.balance > 0 && <span className="ml-1 text-xs">(Due)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/sales/${sale.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-150"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No sales found</h3>
              <p className="mt-1 text-sm text-slate-500">
                {(filterCustomer || filterDateFrom || filterDateTo)
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by adding your first sale.'}
              </p>
              {!(filterCustomer || filterDateFrom || filterDateTo) && (
                <div className="mt-6">
                  <Link
                    href="/sales/add"
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Sale
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        customer: true, // Assuming you have a relation to a Customer model
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Convert Date objects to string to prevent serialization errors
    const serializedSales = sales.map(sale => ({
      ...sale,
      date: sale.date.toISOString(),
      // If customer has Date objects, serialize them too
      customer: sale.customer ? { ...sale.customer, createdAt: sale.customer.createdAt.toISOString() } : null,
    }));

    return {
      props: {
        initialSales: serializedSales,
      },
    };
  } catch (error) {
    console.error("Error fetching sales list:", error);
    return {
      props: {
        initialSales: [], // Return empty array on error or handle differently
      },
    };
  }
} 