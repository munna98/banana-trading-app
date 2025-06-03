// components/transactions/SaleBalanceCard.js

export default function SaleBalanceCard({ selectedSaleBalance }) {
  // If no sale is selected or the balance is zero, don't render the card
  if (!selectedSaleBalance || selectedSaleBalance === 0) {
    return null;
  }

  // Determine styling based on the sale balance
  const cardClasses = `rounded-2xl p-6 border ${
    selectedSaleBalance > 0
      ? 'bg-amber-50 to-amber-100 border-amber-200' // Amber for balance still due from customer
      : 'bg-green-50 to-green-100 border-green-200' // Green if balance is 0 or negative (overpaid/credit)
  }`;

  const iconBgClasses = `w-12 h-12 rounded-xl flex items-center justify-center ${
    selectedSaleBalance > 0
      ? 'bg-amber-500'
      : 'bg-green-500'
  }`;

  const textClasses = `text-sm font-medium ${
    selectedSaleBalance > 0
      ? 'text-amber-900'
      : 'text-green-900'
  }`;

  const amountClasses = `text-2xl font-bold ${
    selectedSaleBalance > 0
      ? 'text-amber-600'
      : 'text-green-600'
  }`;

  return (
    <div className={cardClasses}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={iconBgClasses}>
            {/* Icon representing a sale or money received (e.g., a checkmark in a circle) */}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className={textClasses}>
            Sale Balance Due
          </h3>
          <p className={amountClasses}>
            ₹{selectedSaleBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}