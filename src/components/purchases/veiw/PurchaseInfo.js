// components/purchase/PurchaseInfo.js

export default function PurchaseInfo({ purchase, formatDate }) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Purchase Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-semibold text-slate-900">{purchase.supplier.name}</p>
            {purchase.supplier.email && (
              <p className="text-sm text-slate-600">{purchase.supplier.email}</p>
            )}
            {purchase.supplier.phone && (
              <p className="text-sm text-slate-600">{purchase.supplier.phone}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Date</label>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-semibold text-slate-900">{formatDate(purchase.date)}</p>
          </div>
        </div>
        {purchase.invoiceNo && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Number</label>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-semibold text-slate-900">{purchase.invoiceNo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}