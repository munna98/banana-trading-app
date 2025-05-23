import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

// View and edit individual expense page
export default function ExpenseDetail({ expense: initialExpense }) {
  const router = useRouter();
  const { id } = router.query;
  
  const [expense, setExpense] = useState(initialExpense);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    category: initialExpense?.category || '',
    amount: initialExpense?.amount || '',
    description: initialExpense?.description || '',
    date: initialExpense?.date ? new Date(initialExpense.date).toISOString().split('T')[0] : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Common expense categories for dropdown
  const commonCategories = [
    'Transportation',
    'Packaging',
    'Labor',
    'Utilities',
    'Rent',
    'Maintenance',
    'Office Supplies',
    'Marketing',
    'Miscellaneous'
  ];

  // If expense not found
  if (!expense) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>Expense not found. It may have been deleted or doesn't exist.</p>
        </div>
        <Link href="/expenses" className="text-blue-500 hover:text-blue-700">
          Return to Expenses List
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For amount, ensure it's a valid number
    if (name === 'amount' && value !== '') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate form
    if (!formData.category || !formData.amount || formData.amount <= 0) {
      setError('Please provide a category and a valid amount');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (response.ok) {
        const updatedExpense = await response.json();
        setExpense(updatedExpense);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      setError('An error occurred while updating the expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await fetch(`/api/expenses/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/expenses');
        } else {
          alert('Failed to delete expense');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Expense' : 'Expense Details'}
          </h1>
          <Link href="/expenses" className="text-blue-500 hover:text-blue-700">
            Back to Expenses List
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isEditing ? (
          // Edit form
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                Category*
              </label>
              <div className="relative">
                <input
                  list="expense-categories"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter or select a category"
                  required
                />
                <datalist id="expense-categories">
                  {commonCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                Amount*
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 pl-8 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
                placeholder="Enter expense details (optional)"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          // View details
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-500">ID</div>
              <div className="font-medium">{expense.id}</div>
            </div>
            
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{expense.category}</div>
            </div>
            
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-500">Amount</div>
              <div className="font-medium text-lg">${expense.amount.toFixed(2)}</div>
            </div>
            
            <div className="mb-4 pb-4 border-b">
              <div className="text-sm text-gray-500">Date</div>
              <div className="font-medium">
                {format(new Date(expense.date), 'MMMM d, yyyy')}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="text-sm text-gray-500">Description</div>
              <div className="font-medium">
                {expense.description || <span className="text-gray-400 italic">No description provided</span>}
              </div>
            </div>
            
            <div className="flex justify-between">
              <div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded focus:outline-none focus:shadow-outline"
                >
                  Edit Expense
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Delete
                </button>
              </div>
              <Link
                href="/expenses"
                className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 pt-3"
              >
                Back to List
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Server-side data fetching
export async function getServerSideProps({ params }) {
  const { id } = params;
  const prisma = new PrismaClient();
  
  try {
    const expense = await prisma.expense.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    
    if (!expense) {
      return {
        props: {
          expense: null,
        },
      };
    }
    
    return {
      props: {
        expense: JSON.parse(JSON.stringify(expense)),
      },
    };
  } catch (error) {
    console.error('Error fetching expense:', error);
    return {
      props: {
        expense: null,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}