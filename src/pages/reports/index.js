// REPORTS DASHBOARD
// pages/reports/index.js

import Link from 'next/link';

export default function ReportsDashboard() {
  return (
    <div className="reports-dashboard">
      <h1>Reports</h1>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>Financial Reports</h3>
          <ul>
            <li>
              <Link href="/reports/balance-sheet">
                <a>Balance Sheet</a>
              </Link>
            </li>
            <li>
              <Link href="/reports/profit-loss">
                <a>Profit & Loss Statement</a>
              </Link>
            </li>
            <li>
              <Link href="/reports/cash-flow">
                <a>Cash Flow</a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="report-card">
          <h3>Inventory Reports</h3>
          <ul>
            <li>
              <Link href="/reports/inventory-summary">
                <a>Inventory Summary</a>
              </Link>
            </li>
            <li>
              <Link href="/reports/item-transactions">
                <a>Item Transactions</a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="report-card">
          <h3>Supplier Reports</h3>
          <ul>
            <li>
              <Link href="/reports/supplier-balances">
                <a>Supplier Balances</a>
              </Link>
            </li>
            <li>
              <Link href="/reports/supplier-transactions">
                <a>Supplier Transaction History</a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="report-card">
          <h3>Customer Reports</h3>
          <ul>
            <li>
              <Link href="/reports/customer-balances">
                <a>Customer Balances</a>
              </Link>
            </li>
            <li>
              <Link href="/reports/customer-transactions">
                <a>Customer Transaction History</a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="report-card">
          <h3>Custom Report</h3>
          <p>Create a custom report with specific filters and parameters.</p>
          <Link href="/reports/custom-report">
            <a className="btn btn-primary">Create Custom Report</a>
          </Link>
        </div>
      </div>
    </div>
  );
}