// pages/expenses/add.js

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function AddExpense() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
      }),
    });

    if (res.ok) {
      router.push('/expenses');
    } else {
      const error = await res.json();
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="add-expense p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border px-2 py-1 w-full"
          />
        </div>

        <div>
          <label className="block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="border px-2 py-1 w-full"
          />
        </div>

        <button type="submit" className="btn btn-primary">Save Expense</button>
      </form>
    </div>
  );
}
