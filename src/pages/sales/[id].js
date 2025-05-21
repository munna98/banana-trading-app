// pages/sales/[id].js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SaleDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [sale, setSale] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/sales/${id}`)
        .then(res => res.json())
        .then(setSale)
        .catch(err => console.error('Error loading sale:', err));
    }
  }, [id]);

  if (!sale) return <div>Loading...</div>;

  return (
    <div className="sale-details">
      <h1>Sale #{sale.id}</h1>
      <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
      <p><strong>Customer:</strong> {sale.customer?.name}</p>

      <h3>Items</h3>
      <table className="item-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i}>
              <td>{item.item?.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.rate}</td>
              <td>₹{(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p><strong>Total Amount:</strong> ₹{sale.totalAmount.toFixed(2)}</p>
      <p><strong>Received:</strong> ₹{sale.receivedAmount.toFixed(2)}</p>
      <p><strong>Balance:</strong> ₹{sale.balance.toFixed(2)}</p>
    </div>
  );
}
