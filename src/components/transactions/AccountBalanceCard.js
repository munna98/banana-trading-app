export default function AccountBalanceCard({ selectedDebitAccountDetails }) {
  const balanceCardClasses = `rounded-2xl p-6 border ${
    selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY'
      ? 'bg-red-50 to-red-100 border-red-200'
      : selectedDebitAccountDetails.balanceType === 'liability'
      ? 'bg-orange-50 to-orange-100 border-orange-200'
      : 'bg-green-50 to-green-100 border-green-200'
  }`;

  const iconBgClasses = `w-12 h-12 rounded-xl flex items-center justify-center ${
    selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY'
      ? 'bg-red-500'
      : selectedDebitAccountDetails.balanceType === 'liability'
      ? 'bg-orange-500'
      : 'bg-green-500'
  }`;

  const textClasses = `text-sm font-medium ${
    selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY'
      ? 'text-red-900'
      : selectedDebitAccountDetails.balanceType === 'liability'
      ? 'text-orange-900'
      : 'text-green-900'
  }`;

  const amountClasses = `text-2xl font-bold ${
    selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY'
      ? 'text-red-600'
      : selectedDebitAccountDetails.balanceType === 'liability'
      ? 'text-orange-600'
      : 'text-green-600'
  }`;

  const descriptionClasses = `text-xs ${
    selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY'
      ? 'text-red-700'
      : selectedDebitAccountDetails.balanceType === 'liability'
      ? 'text-orange-700'
      : 'text-green-700'
  }`;

  return (
    <div className={balanceCardClasses}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={iconBgClasses}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className={textClasses}>
            {selectedDebitAccountDetails.accountName} Balance
          </h3>
          <p className={amountClasses}>
            ₹{selectedDebitAccountDetails.displayBalance.toFixed(2)}
          </p>
          {selectedDebitAccountDetails.balanceDescription && (
            <p className={descriptionClasses}>
              {selectedDebitAccountDetails.balanceDescription}
            </p>
          )}
          {selectedDebitAccountDetails.warningMessage && (
            <p className="text-xs text-orange-700 mt-1">
              ⚠️ {selectedDebitAccountDetails.warningMessage}
            </p>
          )}
          {selectedDebitAccountDetails.contextMessage && (
            <p className="text-xs text-green-700 mt-1 italic">
              {selectedDebitAccountDetails.contextMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}