// components/transactions/ReceiptAccountBalanceCard.js

export default function ReceiptAccountBalanceCard({ selectedCreditAccountDetails }) {
  // Use a different prop name to clearly indicate it's for credit accounts
  const accountDetails = selectedCreditAccountDetails;

  // If no account is selected or details are not loaded, don't render anything
  if (!accountDetails) {
    return null;
  }

  // Determine classes based on balance type and account type
  // For receipts:
  // - ASSET accounts (Cash/Bank) will typically be debited, so positive balance is good.
  // - REVENUE/LIABILITY accounts (Accounts Receivable, Sales Revenue) will typically be credited.
  //   A 'negative' balance on AR might mean outstanding amount due to customer (unlikely for receipt context, but possible for returns).
  //   A 'positive' balance on AR means customer owes us money.
  //   For simplicity in styling, we'll generally treat AR/Revenue as 'good' when they have a positive *credit* balance,
  //   which often translates to a positive `displayBalance` if it's formatted as a positive number representing what's owed/earned.

  const isPositiveBalance = accountDetails.displayBalance >= 0; // Check the actual number
  const isAssetAccount = accountDetails.type === 'ASSET';
  const isLiabilityOrRevenueAccount = accountDetails.type === 'LIABILITY' || accountDetails.type === 'REVENUE';


  const balanceCardClasses = `rounded-2xl p-6 border ${
    // If it's an asset account with a positive balance, or a liability/revenue account with a credit balance (which means it's 'positive' as per accounting rules for these types)
    (isAssetAccount && isPositiveBalance) || (isLiabilityOrRevenueAccount && isPositiveBalance) // Assuming displayBalance is formatted to be positive for credit balances
      ? 'bg-green-50 to-green-100 border-green-200' // Green for good/expected balance
      : 'bg-red-50 to-red-100 border-red-200' // Red for unexpected/negative balance (e.g., overdraft in cash, or credit balance on an asset like AR meaning we owe them)
  }`;

  const iconBgClasses = `w-12 h-12 rounded-xl flex items-center justify-center ${
    (isAssetAccount && isPositiveBalance) || (isLiabilityOrRevenueAccount && isPositiveBalance)
      ? 'bg-green-500'
      : 'bg-red-500'
  }`;

  const textClasses = `text-sm font-medium ${
    (isAssetAccount && isPositiveBalance) || (isLiabilityOrRevenueAccount && isPositiveBalance)
      ? 'text-green-900'
      : 'text-red-900'
  }`;

  const amountClasses = `text-2xl font-bold ${
    (isAssetAccount && isPositiveBalance) || (isLiabilityOrRevenueAccount && isPositiveBalance)
      ? 'text-green-600'
      : 'text-red-600'
  }`;

  const descriptionClasses = `text-xs ${
    (isAssetAccount && isPositiveBalance) || (isLiabilityOrRevenueAccount && isPositiveBalance)
      ? 'text-green-700'
      : 'text-red-700'
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
            {accountDetails.accountName} Balance {/* Still refers to the account name */}
          </h3>
          <p className={amountClasses}>
            ₹{accountDetails.displayBalance.toFixed(2)}
          </p>
          {accountDetails.balanceDescription && (
            <p className={descriptionClasses}>
              {accountDetails.balanceDescription}
            </p>
          )}
          {accountDetails.warningMessage && (
            <p className="text-xs text-orange-700 mt-1">
              ⚠️ {accountDetails.warningMessage}
            </p>
          )}
          {accountDetails.contextMessage && (
            <p className="text-xs text-green-700 mt-1 italic">
              {accountDetails.contextMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}