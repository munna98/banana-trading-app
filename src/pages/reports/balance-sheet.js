import { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useRouter } from 'next/router';

export default function BalanceSheet() {
  const router = useRouter();
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBalanceSheetData();
  }, [asOfDate]);

  const fetchBalanceSheetData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reports/balance-sheet?asOfDate=${asOfDate}`);

      if (response.ok) {
        const data = await response.json();
        setBalanceSheetData(data);
      } else {
        throw new Error('Failed to fetch balance sheet data');
      }
    } catch (error) {
      console.error('Error fetching balance sheet data:', error);
      alert('Failed to load balance sheet data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const printBalanceSheet = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!balanceSheetData) return;

    const csvData = [];
    csvData.push(['Banana Trading Business - Balance Sheet']);
    csvData.push([`As of ${formatDate(asOfDate)}`]);
    csvData.push([]);

    // Assets
    csvData.push(['ASSETS']);
    csvData.push(['Current Assets']);
    csvData.push(['Cash & Bank', formatCurrency(balanceSheetData.assets.cash)]);
    csvData.push(['Accounts Receivable', formatCurrency(balanceSheetData.assets.accountsReceivable)]);
    csvData.push(['Inventory', formatCurrency(balanceSheetData.assets.inventory)]);
    csvData.push(['Total Current Assets', formatCurrency(balanceSheetData.assets.totalCurrent)]);
    csvData.push([]);
    csvData.push(['TOTAL ASSETS', formatCurrency(balanceSheetData.assets.total)]);
    csvData.push([]);

    // Liabilities
    csvData.push(['LIABILITIES']);
    csvData.push(['Current Liabilities']);
    csvData.push(['Accounts Payable', formatCurrency(balanceSheetData.liabilities.accountsPayable)]);
    csvData.push(['Total Current Liabilities', formatCurrency(balanceSheetData.liabilities.totalCurrent)]);
    csvData.push([]);
    csvData.push(['TOTAL LIABILITIES', formatCurrency(balanceSheetData.liabilities.total)]);
    csvData.push([]);

    // Equity
    csvData.push(['EQUITY']);
    csvData.push(['Retained Earnings', formatCurrency(balanceSheetData.equity.retainedEarnings)]);
    csvData.push(['Current Period Earnings', formatCurrency(balanceSheetData.equity.currentPeriodEarnings)]);
    csvData.push(['TOTAL EQUITY', formatCurrency(balanceSheetData.equity.total)]);
    csvData.push([]);
    csvData.push(['TOTAL LIABILITIES & EQUITY', formatCurrency(balanceSheetData.liabilities.total + balanceSheetData.equity.total)]);

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${asOfDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="header no-print">
        <h1>Balance Sheet</h1>
        <div className="actions">
          <div className="date-selector">
            <label htmlFor="asOfDate">As of Date:</label>
            <input
              type="date"
              id="asOfDate"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {balanceSheetData && (
            <>
              <Button onClick={printBalanceSheet} variant="secondary">
                Print
              </Button>
              <Button onClick={exportToCSV} variant="secondary">
                Export CSV
              </Button>
            </>
          )}
          <Button onClick={() => router.push('/reports')} variant="outline">
            Back to Reports
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <p>Loading balance sheet data...</p>
        </Card>
      ) : balanceSheetData ? (
        <Card>
          <div className="balance-sheet">
            <div className="report-header">
              <h2>Banana Trading Business</h2>
              <h3>Balance Sheet</h3>
              <p>As of {formatDate(asOfDate)}</p>
            </div>

            <div className="balance-sheet-content">
              {/* Assets Section */}
              <div className="section">
                <h4 className="section-title">ASSETS</h4>

                <div className="subsection">
                  <h5>Current Assets</h5>
                  <div className="line-item">
                    <span>Cash & Bank</span>
                    <span>{formatCurrency(balanceSheetData.assets.cash)}</span>
                  </div>
                  <div className="line-item">
                    <span>Accounts Receivable (Customers)</span>
                    <span>{formatCurrency(balanceSheetData.assets.accountsReceivable)}</span>
                  </div>
                  <div className="line-item">
                    <span>Inventory (Estimated)</span>
                    <span>{formatCurrency(balanceSheetData.assets.inventory)}</span>
                  </div>
                  <div className="line-item subtotal">
                    <span>Total Current Assets</span>
                    <span>{formatCurrency(balanceSheetData.assets.totalCurrent)}</span>
                  </div>
                </div>

                <div className="line-item total">
                  <span>TOTAL ASSETS</span>
                  <span>{formatCurrency(balanceSheetData.assets.total)}</span>
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="section">
                <h4 className="section-title">LIABILITIES</h4>

                <div className="subsection">
                  <h5>Current Liabilities</h5>
                  <div className="line-item">
                    <span>Accounts Payable (Suppliers)</span>
                    <span>{formatCurrency(balanceSheetData.liabilities.accountsPayable)}</span>
                  </div>
                  <div className="line-item subtotal">
                    <span>Total Current Liabilities</span>
                    <span>{formatCurrency(balanceSheetData.liabilities.totalCurrent)}</span>
                  </div>
                </div>

                <div className="line-item total">
                  <span>TOTAL LIABILITIES</span>
                  <span>{formatCurrency(balanceSheetData.liabilities.total)}</span>
                </div>
              </div>

              {/* Equity Section */}
              <div className="section">
                <h4 className="section-title">EQUITY</h4>

                <div className="subsection">
                  <div className="line-item">
                    <span>Retained Earnings</span>
                    <span className={balanceSheetData.equity.retainedEarnings >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(balanceSheetData.equity.retainedEarnings)}
                    </span>
                  </div>
                  <div className="line-item">
                    <span>Current Period Earnings</span>
                    <span className={balanceSheetData.equity.currentPeriodEarnings >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(balanceSheetData.equity.currentPeriodEarnings)}
                    </span>
                  </div>
                </div>

                <div className="line-item total">
                  <span>TOTAL EQUITY</span>
                  <span className={balanceSheetData.equity.total >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(balanceSheetData.equity.total)}
                  </span>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="section">
                <div className="line-item grand-total">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>{formatCurrency(balanceSheetData.liabilities.total + balanceSheetData.equity.total)}</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className="balance-check">
                {Math.abs(balanceSheetData.assets.total - (balanceSheetData.liabilities.total + balanceSheetData.equity.total)) < 0.01 ? (
                  <p className="balanced">✓ Balance Sheet is balanced</p>
                ) : (
                  <p className="unbalanced">⚠ Balance Sheet is not balanced</p>
                )}
              </div>
            </div>

            {/* Customer Balances Detail */}
            {balanceSheetData.customerDetails && balanceSheetData.customerDetails.length > 0 && (
              <div className="details-section">
                <h4>Customer Balances Detail</h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceSheetData.customerDetails.map(customer => (
                      <tr key={customer.id}>
                        <td>{customer.name}</td>
                        <td>{formatCurrency(customer.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{formatCurrency(balanceSheetData.assets.accountsReceivable)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Supplier Balances Detail */}
            {balanceSheetData.supplierDetails && balanceSheetData.supplierDetails.length > 0 && (
              <div className="details-section">
                <h4>Supplier Balances Detail</h4>
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Supplier Name</th>
                      <th>Outstanding Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {balanceSheetData.supplierDetails.map(supplier => (
                      <tr key={supplier.id}>
                        <td>{supplier.name}</td>
                        <td>{formatCurrency(supplier.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td><strong>Total</strong></td>
                      <td><strong>{formatCurrency(balanceSheetData.liabilities.accountsPayable)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <p>No data available for the selected date.</p>
        </Card>
      )}

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-selector label {
          font-weight: 500;
        }

        .date-selector input {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .report-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }

        .report-header h2 {
          margin-bottom: 5px;
          color: #333;
        }

        .report-header h3 {
          margin-bottom: 10px;
          color: #666;
        }

        .report-header p {
          color: #888;
        }

        .balance-sheet-content {
          margin-bottom: 30px;
        }

        .section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }

        .subsection {
          margin-left: 20px;
          margin-bottom: 15px;
        }

        .subsection h5 {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .line-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }

        .line-item.subtotal {
          font-weight: 600;
          border-bottom: 1px solid #ccc;
          margin-top: 10px;
        }

        .line-item.total {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #333;
          border-bottom: 2px solid #333;
          padding: 10px 0;
          margin-top: 10px;
        }

        .line-item.grand-total {
          font-weight: bold;
          font-size: 18px;
          border-top: 3px double #333;
          border-bottom: 3px double #333;
          padding: 15px 0;
          margin-top: 20px;
          background: #f8f9fa;
        }

        .positive {
          color: #28a745;
        }

        .negative {
          color: #dc3545;
        }

        .balance-check {
          text-align: center;
          margin: 20px 0;
          padding: 10px;
          border-radius: 4px;
        }

        .balanced {
          color: #28a745;
          background: #d4edda;
          padding: 10px;
          border-radius: 4px;
        }

        .unbalanced {
          color: #721c24;
          background: #f8d7da;
          padding: 10px;
          border-radius: 4px; /* Completed this line */
        }

        /* Added CSS for details-section and details-table for completeness */
        .details-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
        }
        .details-section h4 {
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .details-table th, .details-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .details-table th {
          background-color: #f2f2f2;
          font-weight: 600;
        }
        .details-table tfoot td {
          background-color: #f8f9fa;
        }
        .details-table td:last-child, .details-table th:last-child {
            text-align: right;
        }
        @media print {
          .no-print {
            display: none;
          }
          .container {
            max-width: 100%;
            padding: 0;
          }
          .header {
            display: none; /* Hide actions header when printing */
          }
          .card { /* Assuming Card component renders a div or similar */
            box-shadow: none;
            border: none;
          }
           .balance-sheet {
            font-size: 10pt; /* Adjust font size for print if needed */
          }
          .line-item, .line-item.subtotal, .line-item.total, .line-item.grand-total {
             padding: 3px 0; /* Reduce padding for print */
          }
          .details-table th, .details-table td {
            padding: 4px; /* Reduce table padding for print */
          }
        }
      `}</style>
    </div>
  );
}