// CUSTOMER DETAIL PAGE
// pages/customers/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { prisma } from '../../lib/db';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';

export default function CustomerDetail({ customer, transactions }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sales');
  
  // Calculate summary stats
  const totalSales = transactions.sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceipts = transactions.receipts.reduce((sum, r) => sum + r.amount, 0);
  
  return (
    <Layout>
      <div className="customer-detail">
        <div className="page-header">
          <h1>Customer: {customer.name}</h1>
          <div className="header-actions">
            <Link href={`/customers/${customer.id}/edit`}>
              <a className="btn btn-warning">Edit Customer</a>
            </Link>
            <Link href={`/transactions/receipts?customerId=${customer.id}`}>
              <a className="btn btn-primary">Receive Payment</a>
            </Link>
          </div>
        </div>
        
        <div className="customer-info">
          <div className="info-card">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> {customer.phone || 'Not provided'}</p>
            <p><strong>Address:</strong> {customer.address || 'Not provided'}</p>
          </div>
          
          <div className="info-card">
            <h3>Financial Summary</h3>
            <p><strong>Total Sales:</strong> ₹{totalSales.toFixed(2)}</p>
            <p><strong>Total Payments:</strong> ₹{totalReceipts.toFixed(2)}</p>
            <p className={customer.balance > 0 ? 'text-danger' : 'text-success'}>
              <strong>Current Balance:</strong> ₹{customer.balance.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="transaction-history">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales
            </button>
            <button 
              className={`tab ${activeTab === 'receipts' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipts')}
            >
              Payments
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'sales' && (
              <div className="sales-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Total Amount</th>
                      <th>Received Amount</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{sale.id}</td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>₹{sale.totalAmount.toFixed(2)}</td>
                        <td>₹{sale.receivedAmount.toFixed(2)}</td>
                        <td>₹{sale.balance.toFixed(2)}</td>
                        <td>
                          <Link href={`/sales/${sale.id}`}>
                            <a className="btn btn-info btn-sm">View</a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {transactions.sales.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">No sales found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'receipts' && (
              <div className="receipts-list">
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
                    {transactions.receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td>{receipt.id}</td>
                        <td>{new Date(receipt.date).toLocaleDateString()}</td>
                        <td>₹{receipt.amount.toFixed(2)}</td>
                        <td>{receipt.notes || '-'}</td>
                      </tr>
                    ))}
                    {transactions.receipts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center">No payments received</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!customer) {
    return {
      notFound: true
    };
  }
  
  const sales = await prisma.sale.findMany({
    where: { customerId: parseInt(id) },
    orderBy: { date: 'desc' }
  });
  
  const receipts = await prisma.receipt.findMany({
    where: { customerId: parseInt(id) },
    orderBy: { date: 'desc' }
  });
  
  return {
    props: {
      customer: JSON.parse(JSON.stringify(customer)),
      transactions: {
        sales: JSON.parse(JSON.stringify(sales)),
        receipts: JSON.parse(JSON.stringify(receipts))
      }
    }
  };
}