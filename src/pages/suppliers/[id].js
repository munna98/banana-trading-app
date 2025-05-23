// SUPPLIER DETAIL PAGE
// pages/suppliers/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { prisma } from '../../lib/db';
import Link from 'next/link';

export default function SupplierDetail({ supplier, transactions }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('purchases');
  
  // Calculate summary stats
  const totalPurchases = transactions.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPayments = transactions.payments.reduce((sum, p) => sum + p.amount, 0);
  
  return (
    <div className="supplier-detail">
      <div className="page-header">
        <h1>Supplier: {supplier.name}</h1>
        <div className="header-actions">
          <Link href={`/suppliers/${supplier.id}/edit`}>
            <a className="btn btn-warning">Edit Supplier</a>
          </Link>
          <Link href={`/transactions/payments?supplierId=${supplier.id}`}>
            <a className="btn btn-primary">Make Payment</a>
          </Link>
        </div>
      </div>
      
      <div className="supplier-info">
        <div className="info-card">
          <h3>Contact Information</h3>
          <p><strong>Phone:</strong> {supplier.phone || 'Not provided'}</p>
          <p><strong>Address:</strong> {supplier.address || 'Not provided'}</p>
        </div>
        
        <div className="info-card">
          <h3>Financial Summary</h3>
          <p><strong>Total Purchases:</strong> ₹{totalPurchases.toFixed(2)}</p>
          <p><strong>Total Payments:</strong> ₹{totalPayments.toFixed(2)}</p>
          <p className={supplier.balance > 0 ? 'text-danger' : 'text-success'}>
            <strong>Current Balance:</strong> ₹{supplier.balance.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="transaction-history">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
            onClick={() => setActiveTab('purchases')}
          >
            Purchases
          </button>
          <button 
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'purchases' && (
            <div className="purchases-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>{purchase.id}</td>
                      <td>{new Date(purchase.date).toLocaleDateString()}</td>
                      <td>₹{purchase.totalAmount.toFixed(2)}</td>
                      <td>₹{purchase.paidAmount.toFixed(2)}</td>
                      <td>₹{purchase.balance.toFixed(2)}</td>
                      <td>
                        <Link href={`/purchases/${purchase.id}`}>
                          <a className="btn btn-info btn-sm">View</a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {transactions.purchases.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">No purchases found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'payments' && (
            <div className="payments-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>{new Date(payment.date).toLocaleDateString()}</td>
                      <td>₹{payment.amount.toFixed(2)}</td>
                      <td>{payment.notes || '-'}</td>
                    </tr>
                  ))}
                  {transactions.payments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center">No payments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  const supplier = await prisma.supplier.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!supplier) {
    return {
      notFound: true
    };
  }
  
  const purchases = await prisma.purchase.findMany({
    where: { supplierId: parseInt(id) },
    orderBy: { date: 'desc' }
  });
  
  const payments = await prisma.payment.findMany({
    where: { supplierId: parseInt(id) },
    orderBy: { date: 'desc' }
  });
  
  return {
    props: {
      supplier: JSON.parse(JSON.stringify(supplier)),
      transactions: {
        purchases: JSON.parse(JSON.stringify(purchases)),
        payments: JSON.parse(JSON.stringify(payments))
      }
    }
  };
}