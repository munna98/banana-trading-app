// components/purchase/FinancialSummary.js

export default function FinancialSummary({ purchase, formatCurrency }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs font-medium text-blue-900">Total Amount</h3>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(purchase.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-xs font-medium text-green-900">Paid Amount</h3>
            <p className="text-xl font-bold text-green-600">{formatCurrency(purchase.paidAmount)}</p>
          </div>
        </div>
      </div>

      <div className={`bg-gradient-to-br rounded-2xl p-4 border ${
        purchase.balance > 0 
          ? 'from-red-50 to-red-100 border-red-200' 
          : 'from-green-50 to-green-100 border-green-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            purchase.balance > 0 ? 'bg-red-500' : 'bg-green-500'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                purchase.balance > 0 
                  ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                  : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              } />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className={`text-xs font-medium ${purchase.balance > 0 ? 'text-red-900' : 'text-green-900'}`}>
              {purchase.balance > 0 ? 'Outstanding Balance' : 'Fully Paid'}
            </h3>
            <p className={`text-xl font-bold ${purchase.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(purchase.balance))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}