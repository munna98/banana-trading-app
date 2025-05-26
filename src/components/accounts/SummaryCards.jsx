const ACCOUNT_TYPE_CONFIG = {
  ASSET: {
    label: 'Assets',
    color: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-900',
    countColor: 'text-blue-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    )
  },
  LIABILITY: {
    label: 'Liabilities',
    color: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-500',
    textColor: 'text-red-900',
    countColor: 'text-red-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    )
  },
  EQUITY: {
    label: 'Equity',
    color: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-900',
    countColor: 'text-purple-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    )
  },
  REVENUE: {
    label: 'Revenue',
    color: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-500',
    textColor: 'text-green-900',
    countColor: 'text-green-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    )
  },
  EXPENSE: {
    label: 'Expenses',
    color: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    bgColor: 'bg-orange-500',
    textColor: 'text-orange-900',
    countColor: 'text-orange-600',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    )
  }
};

function SummaryCard({ type, count, config }) {
  return (
    <div className={`bg-gradient-to-br ${config.color} rounded-2xl p-6 border ${config.borderColor}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {config.icon}
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className={`text-sm font-medium ${config.textColor}`}>{config.label}</h3>
          <p className={`text-2xl font-bold ${config.countColor}`}>{count}</p>
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards({ accountTypeTotals, totalAccounts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {Object.entries(ACCOUNT_TYPE_CONFIG).map(([type, config]) => (
        <SummaryCard
          key={type}
          type={type}
          count={accountTypeTotals[type] || 0}
          config={config}
        />
      ))}
      
      {/* Total Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-slate-900">Total</h3>
            <p className="text-2xl font-bold text-slate-600">{totalAccounts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}