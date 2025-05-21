// pages/sales/index.js

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SalesList() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    async function fetchSales() {
      try {
        const response = await fetch('/api/sales');
        const data = await response.json();
        setSales(data);
      } catch (err) {
        console.error('Error fetching sales:', err);
      }
    }

    fetchSales();
  }, []);

  return (
    <div className="sales-list">
      <div className="header">
        <h1>Sales</h1>
        <Link href="/sales/add" className="btn btn-primary">Add Sale</Link>
      </div>

      <table className="sales-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Received</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>{s.customer?.name}</td>
              <td>₹{s.totalAmount.toFixed(2)}</td>
              <td>₹{s.receivedAmount.toFixed(2)}</td>
              <td>₹{s.balance.toFixed(2)}</td>
              <td>
                <Link href={`/sales/${s.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
