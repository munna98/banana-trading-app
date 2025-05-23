import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../UI/Button';

const TransactionsTable = ({ transactions, filter = 'all' }) => {
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Filter and sort transactions
  const filteredTransactions = transactions?.filter(transaction => {
    // Apply type filter
    if (filter !== 'all' && transaction.type !== filter) return false;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(search) ||
        transaction.party?.toLowerCase().includes(search) ||
        transaction.reference?.toLowerCase().includes(search)
      );
    }

    return true;
  }) || [];

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'amount':
        aValue = Math.abs(a.amount);
        bValue = Math.abs(b.amount);
        break;
      case 'party':
        aValue = a.party || '';
        bValue = b.party || '';
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'purchase':
        return 'bg-red-100 text-red-800';
      case 'sale':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'receipt':
        return 'bg-purple-100 text-purple-800';
      case 'expense':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColor = (amount, type) => {
    if (type === 'sale' || type === 'receipt') {
      return 'text-green-600';
    } else if (type === 'purchase' || type === 'payment' || type === 'expense') {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const handleViewDetails = (transaction) => {
    switch (transaction.type) {
      case 'purchase':
        router.push(`/purchases/${transaction.id}`);
        break;
      case 'sale':
        router.push(`/sales/${transaction.id}`);
        break;
      case 'expense':
        router.push(`/expenses`); // Assuming a general expenses page, adjust if specific expense details are needed
        break;
      default:
        // For payments and receipts, show in transactions page
        router.push(`/transactions`); // Or a specific transactions detail page if applicable
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span className="text-blue-500">↑</span> : <span className="text-blue-500">↓</span>;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-600">
          Showing {sortedTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('date')}
              >
                Date
                <SortIcon field="date" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('type')}
              >
                Type
                <SortIcon field="type" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('description')}
              >
                Description
                <SortIcon field="description" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('party')}
              >
                Party
                <SortIcon field="party" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('reference')}
              >
                Reference
                <SortIcon field="reference" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('amount')}
              >
                Amount
                <SortIcon field="amount" />
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionTypeColor(
                      transaction.type
                    )}`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.party || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.reference || '-'}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${getAmountColor(
                    transaction.amount,
                    transaction.type
                  )}`}
                >
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    onClick={() => handleViewDetails(transaction)}
                    className="text-indigo-600 hover:text-indigo-900"
                    variant="ghost"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;