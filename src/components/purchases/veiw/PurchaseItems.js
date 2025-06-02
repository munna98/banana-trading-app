// components/purchase/PurchaseItems.js

export default function PurchaseItems({ items, formatCurrency }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Purchase Items</h2>
        <p className="text-slate-600">Items included in this purchase</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Item</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Net Weight</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{item.item?.name || 'Unknown Item'}</div>
                  {item.item?.description && (
                    <div className="text-sm text-slate-500">{item.item.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-900">{item.quantity}</td>
                <td className="px-6 py-4 text-slate-900">{item.item?.netWeight || '-'}</td>
                <td className="px-6 py-4 text-slate-900">{formatCurrency(item.unitPrice)}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}