import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Add new expense page
export default function AddExpense() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date as default
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
      const response = await fetch('/api/expenses', {
        method: 'POST',
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
        // Redirect to expenses list on success
        router.push('/expenses');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      setError('An error occurred while adding the expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Add New Expense</h1>
          <Link href="/expenses" className="text-blue-500 hover:text-blue-700">
            Back to Expenses List
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
            <p className="text-gray-500 text-xs mt-1">You can select from the dropdown or enter a new category</p>
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
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </button>
            <Link
              href="/expenses"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}