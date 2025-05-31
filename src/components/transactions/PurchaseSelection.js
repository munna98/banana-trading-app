export default function PurchaseSelection({ purchases, formData, handleChange, loading }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Link to Purchase (Optional)
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        {loading ? (
          <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 animate-pulse">
            Loading purchases...
          </div>
        ) : purchases.length > 0 ? (
          <select
            id="purchaseId"
            name="purchaseId"
            value={formData.purchaseId || ""}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
          >
            <option value="">
              General payment (not linked to specific purchase)
            </option>
            {purchases.map((purchase) => (
              <option key={purchase.id} value={purchase.id}>
                Invoice #{purchase.invoiceNo || purchase.id} - Balance: ₹
                {(purchase.totalAmount - purchase.paidAmount).toFixed(2)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-slate-500 italic py-3 pl-10">
            No unpaid purchases found for this supplier.
          </p>
        )}
      </div>
    </div>
  );
}