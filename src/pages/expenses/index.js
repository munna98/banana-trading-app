// pages/expenses/index.js

import { useState } from 'react';
import { prisma } from '../../lib/db';
import Link from 'next/link';
import dayjs from 'dayjs';

export default function ExpenseList({ expenses }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = expenses.filter((exp) =>
    exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (exp.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="expenses-list p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Link href="/expenses/add">
          <a className="btn btn-primary">Add Expense</a>
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by category or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 w-full"
        />
      </div>

      <table className="w-full border table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Category</th>
            <th className="border px-2 py-1">Amount</th>
            <th className="border px-2 py-1">Description</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((exp) => (
            <tr key={exp.id}>
              <td className="border px-2 py-1">{dayjs(exp.date).format('YYYY-MM-DD')}</td>
              <td className="border px-2 py-1">{exp.category}</td>
              <td className="border px-2 py-1 text-red-600">₹{exp.amount.toFixed(2)}</td>
              <td className="border px-2 py-1">{exp.description || '-'}</td>
            </tr>
          ))}
          {filteredExpenses.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-2">No expenses found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps() {
  const expenses = await prisma.expense.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return {
    props: {
      expenses: JSON.parse(JSON.stringify(expenses)),
    },
  };
}
