import Link from 'next/link';
import { getAccountTypeDisplay, getAccountTypeColor } from '../utils/accountHelpers';

export default function AccountTreeNode({
  account,
  level = 0,
  expandedAccounts,
  accountBalances,
  onToggleExpansion,
  onLoadBalance
}) {
  if (!account) return null;

  const hasChildren = account.children && account.children.length > 0;
  const isExpanded = expandedAccounts.has(account.id);
  const balanceInfo = accountBalances.get(account.id);

  return (
    <div key={account.id} className="border-l-2 border-slate-200">
      <div
        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-150"
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren && (
            <button
              onClick={() => onToggleExpansion(account.id)}
              className="mr-2 p-1 rounded hover:bg-slate-200 transition-colors duration-150"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {!hasChildren && <div className="w-6 h-6 mr-2"></div>}

          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              {account.code}
            </span>
            <span className="font-medium text-slate-900 truncate" title={account.name}>
              {account.name}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
              {getAccountTypeDisplay(account.type)}
            </span>
            {!account.isActive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-4">
          {balanceInfo ? (
            balanceInfo.error ? (
              <div className="text-right">
                <span className="text-xs text-red-500">{balanceInfo.error}</span>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-900">
                  ₹{Math.abs(balanceInfo.balance).toFixed(2)}
                </div>
                <div className="text-xs text-slate-500">
                  {balanceInfo.balance >= 0 ?
                    (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Debit' : 'Credit') :
                    (['ASSET', 'EXPENSE'].includes(balanceInfo.accountType) ? 'Credit' : 'Debit')
                  }
                </div>
              </div>
            )
          ) : (
            <button
              onClick={() => onLoadBalance(account.id)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Load Balance
            </button>
          )}

          <div className="flex space-x-2">
            <Link
              href={`/accounts/${account.id}`}
              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Link>
            <Link
              href={`/accounts/${account.id}/edit`}
              className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-slate-200 ml-4 pl-2">
          {account.children.map(childAccount => (
            <AccountTreeNode
              key={childAccount.id}
              account={childAccount}
              level={level + 1}
              expandedAccounts={expandedAccounts}
              accountBalances={accountBalances}
              onToggleExpansion={onToggleExpansion}
              onLoadBalance={onLoadBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}