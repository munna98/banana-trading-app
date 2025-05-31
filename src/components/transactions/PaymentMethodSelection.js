// components/transactions/PaymentMethodSelection.js
export default function PaymentMethodSelection({
  paymentMethods,
  formData,
  handleChange,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Payment Method <span className="text-red-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon; // Get icon component
          return (
            <label
              key={method.value}
              className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                formData.method === method.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="method"
                value={method.value}
                checked={formData.method === method.value}
                onChange={handleChange}
                className="sr-only"
              />
              <Icon className="w-6 h-4 mb-1 text-purple-600" />
              <span className="text-xs font-medium text-center text-slate-700">
                {method.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}