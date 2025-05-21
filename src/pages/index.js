// DASHBOARD PAGE
// pages/index.js

import { useState, useEffect } from 'react';
import { prisma } from '../lib/db';
import Card from '../components/UI/Card';
import Link from 'next/link';

export default function Dashboard({ summary }) {
  return (
    <div className="dashboard">
      <h1>Banana Trading Dashboard</h1>
      
      <div className="summary-cards">
        <Card title="Inventory">
          <div className="card-stat">{summary.itemCount} Types</div>
          <Link href="/items">
            <a className="card-link">Manage Items</a>
          </Link>
        </Card>
        
        <Card title="Suppliers">
          <div className="card-stat">{summary.supplierCount} Suppliers</div>
          <div className="card-stat">₹{summary.totalSupplierBalance.toFixed(2)} Outstanding</div>
          <Link href="/suppliers">
            <a className="card-link">Manage Suppliers</a>
          </Link>
        </Card>
        
        <Card title="Customers">
          <div className="card-stat">{summary.customerCount} Customers</div>
          <div className="card-stat">₹{summary.totalCustomerBalance.toFixed(2)} Receivable</div>
          <Link href="/customers">
            <a className="card-link">Manage Customers</a>
          </Link>
        </Card>
        
        <Card title="Today's Activity">
          <div className="card-stat">Purchases: {summary.todayPurchases}</div>
          <div className="card-stat">Sales: {summary.todaySales}</div>
          <div className="card-stat">Expenses: ₹{summary.todayExpenses.toFixed(2)}</div>
        </Card>
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link href="/purchases/add">
            <a className="btn btn-primary">New Purchase</a>
          </Link>
          <Link href="/sales/add">
            <a className="btn btn-success">New Sale</a>
          </Link>
          <Link href="/transactions/payments">
            <a className="btn btn-warning">Make Payment</a>
          </Link>
          <Link href="/transactions/receipts">
            <a className="btn btn-info">Receive Payment</a>
          </Link>
          <Link href="/expenses/add">
            <a className="btn btn-secondary">Add Expense</a>
          </Link>
          <Link href="/reports">
            <a className="btn btn-dark">View Reports</a>
          </Link>
        </div>
      </div>
      
      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        {/* Display recent transactions table here */}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [
    itemCount, 
    supplierCount,
    customerCount,
    suppliers,
    customers,
    todayPurchases,
    todaySales,
    todayExpensesData
  ] = await Promise.all([
    prisma.item.count(),
    prisma.supplier.count(),
    prisma.customer.count(),
    prisma.supplier.findMany(),
    prisma.customer.findMany(),
    prisma.purchase.count({
      where: {
        date: {
          gte: today
        }
      }
    }),
    prisma.sale.count({
      where: {
        date: {
          gte: today
        }
      }
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: today
        }
      }
    })
  ]);
  
  const totalSupplierBalance = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0);
  const totalCustomerBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const todayExpenses = todayExpensesData.reduce((sum, expense) => sum + expense.amount, 0);
  
  return {
    props: {
      summary: {
        itemCount,
        supplierCount,
        customerCount,
        totalSupplierBalance,
        totalCustomerBalance,
        todayPurchases,
        todaySales,
        todayExpenses
      }
    }
  };
}
