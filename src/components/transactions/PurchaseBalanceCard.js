export default function PurchaseBalanceCard({ selectedPurchaseBalance }) {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-orange-900">
            Purchase Balance Due
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            ₹{selectedPurchaseBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}