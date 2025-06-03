// components/transactions/ReceiptAccountSelection.js (or similar name)

export default function ReceiptAccountSelection({
  creditAccounts, // Changed from debitAccounts
  formData,
  handleChange,
  loading,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Select Account * {/* Label remains generic but implies credit context */}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9H19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
            />
          </svg>
        </div>
        {loading ? (
          <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 animate-pulse">
            Loading accounts...
          </div>
        ) : (
          <select
            id="creditAccountId" // Changed from debitAccountId
            name="creditAccountId" // Changed from debitAccountId
            value={formData.creditAccountId} // Changed from debitAccountId
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
          >
            <option value="">Choose an account...</option>
            {creditAccounts.map((account) => (
              // Changed from debitAccounts.map
              <option key={account.id} value={account.id}>
                {account.name}{" "}
                {account.parent ? `(${account.parent.name})` : ""}
                {account.customer ? ` (Customer: ${account.customer.name})` : ""}{" "}
                {/* Changed from supplier */}
              </option>
            ))}
          </select>
        )}
      </div> 
    </div>
  );
}