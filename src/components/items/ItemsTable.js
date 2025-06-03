// components/ItemsTable.js
import Link from 'next/link';
import { useState } from 'react';

export default function ItemsTable({ items, onDeleteClick, searchTerm }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (items.length === 0) {
    return <EmptyState searchTerm={searchTerm} />;
  }

  const toggleDropdown = (itemId) => {
    setOpenDropdown(openDropdown === itemId ? null : itemId);
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
          {items.map((item) => (
            <ItemCard 
              key={item.id}
              item={item}
              onDeleteClick={onDeleteClick}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
              setOpenDropdown={setOpenDropdown}
            />
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Purchase Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Sales Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Profit Margin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {items.map((item, index) => (
                <ItemRow key={item.id} item={item} index={index} onDeleteClick={onDeleteClick} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Mobile Card Component
function ItemCard({ item, onDeleteClick, openDropdown, toggleDropdown, setOpenDropdown }) {
  const purchaseRate = item.purchaseRate || 0;
  const salesRate = item.salesRate || 0;
  const profitMargin = purchaseRate > 0 ? ((salesRate - purchaseRate) / purchaseRate * 100) : 0;

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                #{item.id}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.unit}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="relative ml-2">
            <button
              onClick={() => toggleDropdown(item.id)}
              className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
            </button>

            {/* Mobile Dropdown Menu */}
            {openDropdown === item.id && (
              <div className="absolute right-0 top-10 z-50 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                <Link
                  href={`/items/${item.id}/edit`}
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setOpenDropdown(null)}
                >
                  <svg className="w-4 h-4 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Item
                </Link>
                <button
                  onClick={() => {
                    setOpenDropdown(null);
                    onDeleteClick(item);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-4 h-4 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Item
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Rate:</span>
              <span className="text-slate-900 font-medium">₹{purchaseRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sales Rate:</span>
              <span className="text-slate-900 font-medium">₹{salesRate.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Profit Margin:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                profitMargin > 0 
                  ? 'bg-green-100 text-green-800' 
                  : profitMargin < 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {profitMargin > 0 ? '+' : ''}{profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Updated:</span>
              <span className="text-slate-900 text-xs">
                {new Date(item.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for individual table row (Desktop)
function ItemRow({ item, index, onDeleteClick }) {
  const purchaseRate = item.purchaseRate || 0;
  const salesRate = item.salesRate || 0;
  const profitMargin = purchaseRate > 0 ? ((salesRate - purchaseRate) / purchaseRate * 100) : 0;
  
  return (
    <tr className={`hover:bg-slate-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          #{item.id}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-600 max-w-xs truncate">
          {item.description || (
            <span className="text-slate-400 italic">No description</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.unit}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-900">
          ₹{purchaseRate.toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-900">
          ₹{salesRate.toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          profitMargin > 0 
            ? 'bg-green-100 text-green-800' 
            : profitMargin < 0 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-800'
        }`}>
          {profitMargin > 0 ? '+' : ''}{profitMargin.toFixed(1)}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {new Date(item.updatedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex items-center justify-center space-x-2">
          <Link
            href={`/items/${item.id}/edit`}
            className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors duration-150"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={() => onDeleteClick(item)}
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
  );
}

// Component for empty state
function EmptyState({ searchTerm }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No items found</h3>
        <p className="mt-1 text-sm text-slate-500">
          {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first item.'}
        </p>
        {!searchTerm && (
          <div className="mt-6">
            <Link
              href="/items/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Item
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}