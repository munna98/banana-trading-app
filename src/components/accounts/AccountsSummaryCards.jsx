//components/accounts/AccountsSummaryCards.js
import SummaryCard from './SummaryCard';

const AccountsSummaryCards = ({ accountTypeTotals, totalAccounts }) => {
  const cardData = [
    {
      title: 'Assets',
      count: accountTypeTotals.ASSET || 0,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      colorClasses: 'from-blue-50 to-blue-100 border-blue-200 bg-blue-500 text-blue-600 text-blue-900'
    },
    {
      title: 'Liabilities',
      count: accountTypeTotals.LIABILITY || 0,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      colorClasses: 'from-red-50 to-red-100 border-red-200 bg-red-500 text-red-600 text-red-900'
    },
    {
      title: 'Equity',
      count: accountTypeTotals.EQUITY || 0,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      colorClasses: 'from-purple-50 to-purple-100 border-purple-200 bg-purple-500 text-purple-600 text-purple-900'
    },
    {
      title: 'Income',
      count: accountTypeTotals.INCOME || 0,
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      colorClasses: 'from-green-50 to-green-100 border-green-200 bg-green-500 text-green-600 text-green-900'
    },
    {
      title: 'Expenses',
      count: accountTypeTotals.EXPENSE || 0,
      icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
      colorClasses: 'from-orange-50 to-orange-100 border-orange-200 bg-orange-500 text-orange-600 text-orange-900'
    },
    {
      title: 'Total',
      count: totalAccounts,
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      colorClasses: 'from-slate-50 to-slate-100 border-slate-200 bg-slate-500 text-slate-600 text-slate-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cardData.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </div>
  );
};

export default AccountsSummaryCards;