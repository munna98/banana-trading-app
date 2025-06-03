// components/transactions/SaleSelection.js

export default function SaleSelection({ sales, formData, handleChange, loading }) { // Changed prop name from purchases to sales
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Link to Sale (Optional) {/* Label updated */}
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" // Changed icon to a checkmark in a circle
            />
          </svg>
        </div>
        {loading ? (
          <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 animate-pulse">
            Loading sales... {/* Text updated */}
          </div>
        ) : sales.length > 0 ? ( // Changed prop name
          <select
            id="saleId" // Changed id
            name="saleId" // Changed name
            value={formData.saleId || ""} // Changed formData key
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900" // Focus color changed to indigo
          >
            <option value="">
              General receipt (not linked to specific sale) {/* Text updated */}
            </option>
            {sales.map((sale) => ( // Changed prop name and variable name
              <option key={sale.id} value={sale.id}>
                Invoice #{sale.invoiceNo || sale.id} - Balance: ₹ {/* Text and variable names updated */}
                {(sale.totalAmount - sale.paidAmount).toFixed(2)}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-slate-500 italic py-3 pl-10">
            No unpaid sales found for this customer. {/* Text updated */}
          </p>
        )}
      </div>
    </div>
  );
}