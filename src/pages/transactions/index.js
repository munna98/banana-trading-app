// pages/transactions/index.js

import Link from 'next/link';
import { prisma } from '../../lib/db';

export default function TransactionsPage({ payments, receipts }) {
  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <Link href="/transactions/payments">
            <a className="btn btn-primary">Add Payment</a>
          </Link>
          <Link href="/transactions/receipts">
            <a className="btn btn-success">Add Receipt</a>
          </Link>
        </div>
      </div>

      <div className="transaction-section">
        <h2>Payments</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.supplier?.name || 'N/A'}</td>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>₹{payment.amount.toFixed(2)}</td>
                <td>{payment.notes || '-'}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="5" className="text-center">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="transaction-section">
        <h2>Receipts</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(receipt => (
              <tr key={receipt.id}>
                <td>{receipt.id}</td>
                <td>{receipt.customer?.name || 'N/A'}</td>
                <td>{new Date(receipt.date).toLocaleDateString()}</td>
                <td>₹{receipt.amount.toFixed(2)}</td>
                <td>{receipt.notes || '-'}</td>
              </tr>
            ))}
            {receipts.length === 0 && (
              <tr><td colSpan="5" className="text-center">No receipts found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const payments = await prisma.payment.findMany({
    include: { supplier: true },
    orderBy: { date: 'desc' }
  });

  const receipts = await prisma.receipt.findMany({
    include: { customer: true },
    orderBy: { date: 'desc' }
  });

  return {
    props: {
      payments: JSON.parse(JSON.stringify(payments)),
      receipts: JSON.parse(JSON.stringify(receipts))
    }
  };
}
