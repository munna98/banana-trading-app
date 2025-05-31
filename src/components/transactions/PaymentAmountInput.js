export default function PaymentAmountInput({ formData, handleChange, selectedPurchaseBalance, setFormData }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Payment Amount *
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
          className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
        />
      </div>
      {selectedPurchaseBalance > 0 && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                amount: selectedPurchaseBalance.toFixed(2),
              }))
            }
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Pay Full Purchase Balance (₹{selectedPurchaseBalance.toFixed(2)})
          </button>
        </div>
      )}
    </div>
  );
}