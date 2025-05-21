// pages/expenses/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function ExpenseDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/expenses/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setExpense(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching expense:', err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!expense) return <div className="p-4 text-red-600">Expense not found</div>;

  return (
    <div className="expense-details p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Expense #{expense.id}</h1>
      <div className="space-y-2">
        <p><strong>Category:</strong> {expense.category}</p>
        <p><strong>Amount:</strong> ₹{expense.amount.toFixed(2)}</p>
        <p><strong>Date:</strong> {dayjs(expense.date).format('YYYY-MM-DD')}</p>
        <p><strong>Description:</strong> {expense.description || '-'}</p>
      </div>
    </div>
  );
}
