import React from 'react';

export default function ItemListTable({ items, editItem, removeItem, calculateTotalAmount }) {
  if (!items || items.length === 0) {
    return null; // Don't render the table if there are no items
  }

  return (
    <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Item</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">No. of Bunches</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Net Weight</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rate</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.quantity} {item.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.numberOfBunches}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{item.effectiveQuantity.toFixed(2)} {item.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">₹{item.rate.toFixed(2)}/{item.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">₹{item.amount.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => editItem(index)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-900"
                    title="Remove Item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <td colSpan="5" className="px-6 py-4 text-right text-lg font-bold text-slate-900">Grand Total:</td>
            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-slate-900">₹{calculateTotalAmount().toFixed(2)}</td>
            <td className="px-6 py-4"></td> 
          </tr>
        </tfoot>
      </table>
    </div>
  );
}