//components/accounts/AccountsChartView.js
import AccountTreeNode from './AccountTreeNode';

const AccountsChartView = ({ 
  chartOfAccounts, 
  expandedAccounts, 
  toggleAccountExpansion, 
  accountBalances, 
  loadAccountBalance 
}) => {
  return (
    <div className="divide-y divide-slate-200">
      {chartOfAccounts.length > 0 ? (
        chartOfAccounts.map(account => (
          <AccountTreeNode
            key={account.id}
            account={account}
            level={0}
            expandedAccounts={expandedAccounts}
            toggleAccountExpansion={toggleAccountExpansion}
            accountBalances={accountBalances}
            loadAccountBalance={loadAccountBalance}
          />
        ))
      ) : (
        <div className="p-6 text-center text-slate-500">
          No accounts found in the chart of accounts.
        </div>
      )}
    </div>
  );
};

export default AccountsChartView;