// pages/purchases/index.js

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const response = await fetch('/api/purchases');
        const data = await response.json();
        setPurchases(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
      }
    }

    fetchPurchases();
  }, []);

  return (
    <div className="purchase-list">
      <div className="header">
        <h1>Purchases</h1>
        <Link href="/purchases/add" className="btn btn-primary">Add Purchase</Link>
      </div>

      <table className="purchase-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Supplier</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{new Date(p.date).toLocaleDateString()}</td>
              <td>{p.supplier?.name}</td>
              <td>₹{p.totalAmount.toFixed(2)}</td>
              <td>₹{p.paidAmount.toFixed(2)}</td>
              <td>₹{p.balance.toFixed(2)}</td>
              <td>
                <Link href={`/purchases/${p.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
