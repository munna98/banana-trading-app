// REPORTS DASHBOARD
// pages/reports/index.js

import { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/router';

export default function ReportsIndex() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // Fetch dashboard summary data
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const response = await fetch(`/api/reports/dashboard?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      alert('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Quick report actions
  const quickReports = [
    {
      title: 'Balance Sheet',
      description: 'View current financial position',
      icon: '📊',
      path: '/reports/balance-sheet',
      color: 'blue'
    },
    {
      title: 'Profit & Loss',
      description: 'View income and expenses',
      icon: '💰',
      path: '/reports/profit-loss',
      color: 'green'
    },
    {
      title: 'Custom Report',
      description: 'Create custom filtered reports',
      icon: '📈',
      path: '/reports/custom-report',
      color: 'purple'
    }
  ];

  return (
    <div className="container">
      <div className="header">
        <h1>Reports Dashboard</h1>
        <div className="date-range-selector">
          <input
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
            disabled={isLoading}
          />
          <span>to</span>
          <input
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Quick Stats */}
      {isLoading ? (
        <Card>
          <p>Loading dashboard data...</p>
        </Card>
      ) : dashboardData && (
        <div className="dashboard-stats">
          <Card>
            <div className="stat-grid">
              <div className="stat-item">
                <h3>Total Sales</h3>
                <p className="stat-value positive">{formatCurrency(dashboardData.totalSales)}</p>
                <span className="stat-count">{dashboardData.salesCount} transactions</span>
              </div>
              
              <div className="stat-item">
                <h3>Total Purchases</h3>
                <p className="stat-value negative">{formatCurrency(dashboardData.totalPurchases)}</p>
                <span className="stat-count">{dashboardData.purchasesCount} transactions</span>
              </div>
              
              <div className="stat-item">
                <h3>Net Profit</h3>
                <p className={`stat-value ${dashboardData.netProfit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(Math.abs(dashboardData.netProfit))}
                  {dashboardData.netProfit < 0 && ' Loss'}
                </p>
                <span className="stat-count">Current period</span>
              </div>
              
              <div className="stat-item">
                <h3>Total Expenses</h3>
                <p className="stat-value negative">{formatCurrency(dashboardData.totalExpenses)}</p>
                <span className="stat-count">{dashboardData.expensesCount} entries</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Outstanding Balances */}
      {dashboardData && (
        <div className="balances-section">
          <div className="balances-grid">
            <Card>
              <h3>Customer Balances</h3>
              <div className="balance-summary">
                <p className="balance-total positive">
                  Total Receivable: {formatCurrency(dashboardData.totalCustomerBalance)}
                </p>
                {dashboardData.topCustomerBalances.length > 0 ? (
                  <div className="balance-list">
                    {dashboardData.topCustomerBalances.map(customer => (
                      <div key={customer.id} className="balance-item">
                        <span>{customer.name}</span>
                        <span className="positive">{formatCurrency(customer.balance)}</span>
                      </div>
                    ))}
                    {dashboardData.totalCustomers > 5 && (
                      <p className="more-info">
                        +{dashboardData.totalCustomers - 5} more customers
                      </p>
                    )}
                  </div>
                ) : (
                  <p>No outstanding customer balances</p>
                )}
              </div>
            </Card>

            <Card>
              <h3>Supplier Balances</h3>
              <div className="balance-summary">
                <p className="balance-total negative">
                  Total Payable: {formatCurrency(dashboardData.totalSupplierBalance)}
                </p>
                {dashboardData.topSupplierBalances.length > 0 ? (
                  <div className="balance-list">
                    {dashboardData.topSupplierBalances.map(supplier => (
                      <div key={supplier.id} className="balance-item">
                        <span>{supplier.name}</span>
                        <span className="negative">{formatCurrency(supplier.balance)}</span>
                      </div>
                    ))}
                    {dashboardData.totalSuppliers > 5 && (
                      <p className="more-info">
                        +{dashboardData.totalSuppliers - 5} more suppliers
                      </p>
                    )}
                  </div>
                ) : (
                  <p>No outstanding supplier balances</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Quick Report Actions */}
      <div className="quick-reports">
        <h2>Generate Reports</h2>
        <div className="reports-grid">
          {quickReports.map((report, index) => (
            <Card key={index}>
              <div className={`report-card ${report.color}`}>
                <div className="report-icon">{report.icon}</div>
                <h3>{report.title}</h3>
                <p>{report.description}</p>
                <Button 
                  onClick={() => router.push(report.path)}
                  variant="primary"
                >
                  Generate Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboardData && dashboardData.recentActivity && (
        <Card>
          <h3>Recent Activity</h3>
          <div className="recent-activity">
            {dashboardData.recentActivity.length > 0 ? (
              <div className="activity-list">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-type">{activity.type}</div>
                    <div className="activity-details">
                      <span className="activity-description">{activity.description}</span>
                      <span className="activity-amount">{formatCurrency(activity.amount)}</span>
                    </div>
                    <div className="activity-date">{formatDate(activity.date)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No recent activity</p>
            )}
          </div>
        </Card>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .date-range-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .date-range-selector input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .stat-item {
          text-align: center;
          padding: 20px;
        }
        
        .stat-item h3 {
          color: #666;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .stat-value.positive {
          color: #28a745;
        }
        
        .stat-value.negative {
          color: #dc3545;
        }
        
        .stat-count {
          color: #666;
          font-size: 12px;
        }
        
        .balances-section {
          margin: 30px 0;
        }
        
        .balances-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .balance-summary h3 {
          margin-bottom: 15px;
        }
        
        .balance-total {
          font-weight: bold;
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 4px;
          background: #f8f9fa;
        }
        
        .balance-list {
          max-height: 200px;
          overflow-y: auto;
        }
        
        .balance-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .balance-item:last-child {
          border-bottom: none;
        }
        
        .positive {
          color: #28a745;
        }
        
        .negative {
          color: #dc3545;
        }
        
        .more-info {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 10px;
        }
        
        .quick-reports {
          margin: 30px 0;
        }
        
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .report-card {
          text-align: center;
          padding: 30px 20px;
        }
        
        .report-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .report-card h3 {
          margin-bottom: 10px;
        }
        
        .report-card p {
          color: #666;
          margin-bottom: 20px;
        }
        
        .recent-activity {
          margin-top: 15px;
        }
        
        .activity-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .activity-item {
          display: grid;
          grid-template-columns: 100px 1fr 100px;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
          align-items: center;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-type {
          font-weight: bold;
          color: #495057;
          font-size: 12px;
          text-transform: uppercase;
        }
        
        .activity-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .activity-date {
          font-size: 12px;
          color: #666;
          text-align: right;
        }
        
        @media (max-width: 768px) {
          .balances-grid {
            grid-template-columns: 1fr;
          }
          
          .reports-grid {
            grid-template-columns: 1fr;
          }
          
          .header {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}