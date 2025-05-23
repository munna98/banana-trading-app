import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

// Main expenses list page
export default function ExpensesList({ initialExpenses }) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [filterCategory, setFilterCategory] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Extract unique categories from expenses
    const uniqueCategories = [...new Set(expenses.map(expense => expense.category))];
    setCategories(uniqueCategories);
  }, [expenses]);

  // Calculate total expense amount
  const totalAmount = expenses
    .filter(expense => {
      // Apply category filter if set
      if (filterCategory && expense.category !== filterCategory) return false;
      
      // Apply date range filter if set
      if (dateRange.from && new Date(expense.date) < new Date(dateRange.from)) return false;
      if (dateRange.to && new Date(expense.date) > new Date(dateRange.to)) return false;
      
      return true;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Handle expense deletion
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove deleted expense from UI
          setExpenses(expenses.filter(expense => expense.id !== id));
        } else {
          alert('Failed to delete expense');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  // Filter expenses based on category and date range
  const filteredExpenses = expenses.filter(expense => {
    // Apply category filter if set
    if (filterCategory && expense.category !== filterCategory) return false;
    
    // Apply date range filter if set
    if (dateRange.from && new Date(expense.date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(expense.date) > new Date(dateRange.to)) return false;
    
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Expenses Management</h1>
        {/* Removed <a> tag, applied class directly to Link */}
        <Link href="/expenses/add" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Add New Expense
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={filterCategory}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input
              type="date"
              name="from"
              value={dateRange.from}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              name="to"
              value={dateRange.to}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p className="text-lg font-medium">
          Total Expenses: <span className="font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
          {filterCategory && <span> for category "{filterCategory}"</span>}
        </p>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">ID</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">Category</th>
              <th className="py-2 px-4 border-b text-left">Description</th>
              <th className="py-2 px-4 border-b text-right">Amount</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{expense.id}</td>
                  <td className="py-2 px-4 border-b">
                    {format(new Date(expense.date), 'yyyy-MM-dd')}
                  </td>
                  <td className="py-2 px-4 border-b">{expense.category}</td>
                  <td className="py-2 px-4 border-b">{expense.description || '-'}</td>
                  <td className="py-2 px-4 border-b text-right">${expense.amount.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      {/* Removed <a> tag, applied class directly to Link */}
                      <Link 
                        href={`/expenses/${expense.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">
                  No expenses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Server-side data fetching
export async function getServerSideProps() {
  const prisma = new PrismaClient();
  
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        date: 'desc',
      },
    });
    
    return {
      props: {
        initialExpenses: JSON.parse(JSON.stringify(expenses)),
      },
    };
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return {
      props: {
        initialExpenses: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}