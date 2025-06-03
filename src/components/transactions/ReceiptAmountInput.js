// components/transactions/ReceiptAmountInput.js

export default function ReceiptAmountInput({ formData, handleChange, selectedSaleBalance, setFormData }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Receipt Amount * {/* Label updated */}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 font-medium">₹</span>
        </div>
        <input
          type="number"
          id="amount"
          name="amount"
          min="0.01"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          required
          placeholder="0.00"
          className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900" /* Focus color changed to indigo */
        />
      </div>
      {selectedSaleBalance > 0 && ( /* Prop name changed */
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                amount: selectedSaleBalance.toFixed(2), /* Prop name changed */
              }))
            }
            className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors" /* Colors changed to indigo */
          >
            Receive Full Sale Balance (₹{selectedSaleBalance.toFixed(2)}) {/* Text and prop name updated */}
          </button>
        </div>
      )}
    </div>
  );
}