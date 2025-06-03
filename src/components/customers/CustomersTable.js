// components/customers/CustomersTable.js

import Link from 'next/link';
import { useState } from 'react';

export default function CustomersTable({ customers, onDeleteClick }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No customers found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your search terms or get started by adding your first customer.
        </p>
        <div className="mt-6">
          <Link
            href="/customers/add"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Customer
          </Link>
        </div>
      </div>
    );
  }

  const toggleDropdown = (customerId) => {
    setOpenDropdown(openDropdown === customerId ? null : customerId);
  };

  // Close dropdown when clicking outside
  const handleBackdropClick = () => {
    setOpenDropdown(null);
  };

  return (
    <>
      {/* Backdrop for mobile dropdown */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={handleBackdropClick}
        />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        {/* Mobile Card View */}
        <div className="block md:hidden">
          {customers.map((customer) => {
            // Assuming customer has totalSales and totalReceived properties
            const totalSales = customer.totalSales || 0;
            const totalReceived = customer.totalReceived || 0;
            const balance = totalSales - totalReceived;

            return (
              <div key={customer.id} className="border-b border-slate-200 last:border-b-0">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          #{customer.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{customer.name}</h3>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(customer.id)}
                        className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors duration-150"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                      </button>

                      {/* Mobile Dropdown Menu */}
                      {openDropdown === customer.id && (
                        <div className="absolute right-0 top-10 z-50 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <svg className="w-4 h-4 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>
                          <Link
                            href={`/customers/${customer.id}/edit`}
                            className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <svg className="w-4 h-4 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Customer
                          </Link>
                          <Link
                            href={`/transactions/receipts?customerId=${customer.id}`}
                            className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <svg className="w-4 h-4 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Record Receipt
                          </Link>
                          <button
                            onClick={() => {
                              setOpenDropdown(null);
                              onDeleteClick(customer);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Customer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phone:</span>
                      <span className="text-slate-900">
                        {customer.phone || <span className="text-slate-400 italic">No phone</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Address:</span>
                      <span className="text-slate-900 text-right max-w-48 truncate">
                        {customer.address || <span className="text-slate-400 italic">No address</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Sales:</span>
                      <span className="text-slate-900 font-medium">₹{totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Received:</span>
                      <span className="text-green-600 font-medium">₹{totalReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Balance:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        balance > 0
                          ? 'bg-red-100 text-red-800'
                          : balance < 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        ₹{Math.abs(balance).toFixed(2)}
                        {balance > 0 && <span className="ml-1">(Due)</span>}
                        {balance < 0 && <span className="ml-1">(Advance)</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Received</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {customers.map((customer, index) => {
                const totalSales = customer.totalSales || 0;
                const totalReceived = customer.totalReceived || 0;
                const balance = totalSales - totalReceived;

                return (
                  <tr key={customer.id} className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        #{customer.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {customer.phone || (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {customer.address || (
                          <span className="text-slate-400 italic">No address</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        ₹{totalSales.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ₹{totalReceived.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        balance > 0
                          ? 'bg-red-100 text-red-800'
                          : balance < 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        ₹{Math.abs(balance).toFixed(2)}
                        {balance > 0 && <span className="ml-1 text-xs">(Due)</span>}
                        {balance < 0 && <span className="ml-1 text-xs">(Advance)</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center relative group">
                      {/* Three dots icon - always visible */}
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors duration-150 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                      </div>

                      {/* Action buttons overlay - shows on hover, positioned to the right */}
                      <div className="absolute top-0 right-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center h-full bg-white/95 backdrop-blur-sm border-l border-slate-200 pr-6">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          <Link
                            href={`/customers/${customer.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors duration-150 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <Link
                            href={`/transactions/receipts?customerId=${customer.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors duration-150 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            Receive
                          </Link>
                          <button
                            onClick={() => onDeleteClick(customer)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-150 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}