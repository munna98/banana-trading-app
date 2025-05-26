// components/SummaryCards.js
export default function SummaryCards({ items }) {
  const totalItems = items.length;
  const avgPurchaseRate = totalItems > 0 
    ? (items.reduce((sum, item) => sum + (item.purchaseRate || 0), 0) / totalItems).toFixed(2)
    : '0.00';
  const avgSalesRate = totalItems > 0
    ? (items.reduce((sum, item) => sum + (item.salesRate || 0), 0) / totalItems).toFixed(2)
    : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SummaryCard
        title="Total Items"
        value={totalItems}
        bgColor="blue"
        icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
      <SummaryCard
        title="Avg Purchase Rate"
        value={`₹${avgPurchaseRate}`}
        bgColor="green"
        icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      />
      <SummaryCard
        title="Avg Sales Rate"
        value={`₹${avgSalesRate}`}
        bgColor="purple"
        icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </div>
  );
}

function SummaryCard({ title, value, bgColor, icon }) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      titleText: 'text-blue-900',
      valueText: 'text-blue-600'
    },
    green: {
      bg: 'from-green-50 to-green-100',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      titleText: 'text-green-900',
      valueText: 'text-green-600'
    },
    purple: {
      bg: 'from-purple-50 to-purple-100',
      border: 'border-purple-200',
      iconBg: 'bg-purple-500',
      titleText: 'text-purple-900',
      valueText: 'text-purple-600'
    }
  };

  const colors = colorClasses[bgColor];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border ${colors.border}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${colors.titleText}`}>{title}</h3>
          <p className={`text-3xl font-bold ${colors.valueText}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}