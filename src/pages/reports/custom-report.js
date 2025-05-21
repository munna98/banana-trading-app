import { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/router';

export default function CustomReport() {
  const router = useRouter();
  const [reportType, setReportType] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [filterType, setFilterType] = useState('all');
  const [filterId, setFilterId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fetch dropdown data on component mount
  useEffect(() => {
    async function fetchFilterData() {
      try {
        setIsLoading(true);
        const [suppliersRes, customersRes, itemsRes] = await Promise.all([
          fetch('/api/suppliers').then(res => res.json()),
          fetch('/api/customers').then(res => res.json()),
          fetch('/api/items').then(res => res.json())
        ]);
        
        setSuppliers(suppliersRes);
        setCustomers(customersRes);
        setItems(itemsRes);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        alert('Failed to load filter options');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchFilterData();
  }, []);
  
  // Reset filter ID when filter type changes
  useEffect(() => {
    setFilterId('');
  }, [filterType]);
  
  // Handle form input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate the report
  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Construct query parameters
      const params = new URLSearchParams({
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        filterType,
        filterId: filterId || ''
      });
      
      const response = await fetch(`/api/reports/custom?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Calculate report totals
  const calculateTotals = () => {
    if (!reportData || !reportData.data) return null;
    
    switch (reportType) {
      case 'transactions':
        return {
          purchases: reportData.data.purchases?.reduce((sum, p) => sum + p.totalAmount, 0) || 0,
          payments: reportData.data.payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
          sales: reportData.data.sales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0,
          receipts: reportData.data.receipts?.reduce((sum, r) => sum + r.amount, 0) || 0
        };
      case 'inventory':
        return { 
          purchased: reportData.data.reduce((sum, item) => sum + item.purchased, 0),
          sold: reportData.data.reduce((sum, item) => sum + item.sold, 0) 
        };
      case 'financials':
        return { 
          income: (reportData.data.sales || 0) + (reportData.data.receipts || 0),
          expenses: (reportData.data.purchases || 0) + (reportData.data.payments || 0) + (reportData.data.expenses || 0),
          profit: ((reportData.data.sales || 0) + (reportData.data.receipts || 0)) - 
                 ((reportData.data.purchases || 0) + (reportData.data.payments || 0) + (reportData.data.expenses || 0))
        };
      default:
        return null;
    }
  };
  
  const totals = calculateTotals();
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Print report
  const printReport = () => {
    window.print();
  };
  
  // Export to CSV
  const exportToCSV = () => {
    // Implement CSV export logic here
    alert('CSV export functionality will be implemented here');
  };
  
  return (
    <div className="container">
      <div className="header">
        <h1>Custom Report</h1>
        <div className="actions">
          {reportData && (
            <>
              <Button onClick={printReport} variant="secondary">
                Print Report
              </Button>
              <Button onClick={exportToCSV} variant="secondary">
                Export to CSV
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Card>
        <div className="report-filters">
          <div className="form-group">
            <label htmlFor="reportType">Report Type</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              disabled={isLoading}
            >
              <option value="transactions">Transaction Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financials">Financial Report</option>
            </select>
          </div>
          
          <div className="date-range">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="filter-options">
            <div className="form-group">
              <label htmlFor="filterType">Filter By</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Records</option>
                <option value="supplier">Supplier</option>
                <option value="customer">Customer</option>
                <option value="item">Item</option>
              </select>
            </div>
            
            {filterType !== 'all' && (
              <div className="form-group">
                <label htmlFor="filterId">
                  {filterType === 'supplier' ? 'Supplier' : 
                   filterType === 'customer' ? 'Customer' : 'Item'}
                </label>
                <select
                  id="filterId"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select {filterType}</option>
                  {filterType === 'supplier' && suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {filterType === 'customer' && customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {filterType === 'item' && items.map(i => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="generate-button">
            <Button 
              onClick={generateReport}
              disabled={isLoading || isGenerating || (filterType !== 'all' && !filterId)}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </Card>
      
      {isGenerating && <p>Generating report...</p>}
      
      {reportData && (
        <Card>
          <div className="report-header">
            <h2>
              {reportType === 'transactions' ? 'Transaction' : 
               reportType === 'inventory' ? 'Inventory' : 'Financial'} Report
            </h2>
            <p>
              {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
              {filterType !== 'all' && filterId && (
                <>
                  <br />
                  Filtered by: {filterType} - {
                    filterType === 'supplier' ? suppliers.find(s => s.id == filterId)?.name :
                    filterType === 'customer' ? customers.find(c => c.id == filterId)?.name :
                    items.find(i => i.id == filterId)?.name
                  }
                </>
              )}
            </p>
          </div>
          
          <div className="report-content">
            {reportType === 'transactions' && (
              <div className="transactions-report">
                <h3>Purchases</h3>
                {reportData.data.purchases?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                        <th>Paid</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.purchases.map(purchase => (
                        <tr key={purchase.id}>
                          <td>{purchase.id}</td>
                          <td>{formatDate(purchase.date)}</td>
                          <td>{purchase.supplier.name}</td>
                          <td>₹{purchase.totalAmount.toFixed(2)}</td>
                          <td>₹{purchase.paidAmount.toFixed(2)}</td>
                          <td>₹{purchase.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Total Purchases</td>
                        <td>₹{totals.purchases.toFixed(2)}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : <p>No purchases found in this period</p>}
                
                <h3>Payments</h3>
                {reportData.data.payments?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.payments.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>{formatDate(payment.date)}</td>
                          <td>{payment.supplier.name}</td>
                          <td>₹{payment.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Total Payments</td>
                        <td>₹{totals.payments.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : <p>No payments found in this period</p>}
                
                <h3>Sales</h3>
                {reportData.data.sales?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Received</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.sales.map(sale => (
                        <tr key={sale.id}>
                          <td>{sale.id}</td>
                          <td>{formatDate(sale.date)}</td>
                          <td>{sale.customer.name}</td>
                          <td>₹{sale.totalAmount.toFixed(2)}</td>
                          <td>₹{sale.receivedAmount.toFixed(2)}</td>
                          <td>₹{sale.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Total Sales</td>
                        <td>₹{totals.sales.toFixed(2)}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : <p>No sales found in this period</p>}
                
                <h3>Receipts</h3>
                {reportData.data.receipts?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.receipts.map(receipt => (
                        <tr key={receipt.id}>
                          <td>{receipt.id}</td>
                          <td>{formatDate(receipt.date)}</td>
                          <td>{receipt.customer.name}</td>
                          <td>₹{receipt.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3">Total Receipts</td>
                        <td>₹{totals.receipts.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                ) : <p>No receipts found in this period</p>}
              </div>
            )}
            
            {reportType === 'inventory' && (
              <div className="inventory-report">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Purchased (Bunches)</th>
                      <th>Sold (Bunches)</th>
                      <th>In Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.purchased}</td>
                        <td>{item.sold}</td>
                        <td>{item.purchased - item.sold}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      <td>{totals.purchased}</td>
                      <td>{totals.sold}</td>
                      <td>{totals.purchased - totals.sold}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {reportType === 'financials' && (
              <div className="financial-report">
                <div className="financial-summary">
                  <div className="summary-card income">
                    <h4>Income</h4>
                    <p>₹{totals.income.toFixed(2)}</p>
                    <div className="breakdown">
                      <span>Sales: ₹{(reportData.data.sales || 0).toFixed(2)}</span>
                      <span>Receipts: ₹{(reportData.data.receipts || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card expenses">
                    <h4>Expenses</h4>
                    <p>₹{totals.expenses.toFixed(2)}</p>
                    <div className="breakdown">
                      <span>Purchases: ₹{(reportData.data.purchases || 0).toFixed(2)}</span>
                      <span>Payments: ₹{(reportData.data.payments || 0).toFixed(2)}</span>
                      <span>Other Expenses: ₹{(reportData.data.expenses || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card profit">
                    <h4>Profit/Loss</h4>
                    <p className={totals.profit >= 0 ? 'positive' : 'negative'}>
                      ₹{Math.abs(totals.profit).toFixed(2)} {totals.profit >= 0 ? 'Profit' : 'Loss'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .report-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .date-range {
          display: flex;
          gap: 10px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        select, input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .generate-button {
          align-self: flex-end;
        }
        .report-header {
          margin-bottom: 20px;
          text-align: center;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .data-table th, .data-table td {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        .data-table th {
          background-color: #f5f5f5;
        }
        .data-table tfoot td {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .financial-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h4 {
          margin-top: 0;
        }
        .summary-card p {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        .breakdown {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 14px;
        }
        .income {
          background-color: #e6f7ee;
        }
        .expenses {
          background-color: #ffece6;
        }
        .profit {
          background-color: #e6f0ff;
        }
        .positive {
          color: #28a745;
        }
        .negative {
          color: #dc3545;
        }
        
        @media print {
          .header, .report-filters, .actions {
            display: none;
          }
          .report-header {
            text-align: left;
          }
          .data-table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}