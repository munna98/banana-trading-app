// pages/reports/profit-loss.js

import { useState, useEffect } from 'react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

export default function ProfitLossReport() {
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
        endDate: new Date().toISOString().split('T')[0] // Today
    });

    useEffect(() => {
        fetchProfitLossData();
    }, [dateRange]);

    const fetchProfitLossData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
            const response = await fetch(`/api/reports/profit-loss?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            } else {
                throw new Error('Failed to fetch profit and loss data.');
            }
        } catch (error) {
            console.error('Error fetching profit and loss data:', error);
            alert('Failed to load profit and loss report.');
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

    return (
        <div className="container">
            <div className="header">
                <h1>Profit & Loss Report</h1>
                <div className="date-range-selector">
                    <label htmlFor="startDate">From:</label>
                    <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={dateRange.startDate}
                        onChange={handleDateChange}
                        disabled={isLoading}
                    />
                    <label htmlFor="endDate">To:</label>
                    <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={dateRange.endDate}
                        onChange={handleDateChange}
                        disabled={isLoading}
                    />
                    <Button onClick={fetchProfitLossData} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Generate Report'}
                    </Button>
                </div>
            </div>

            {isLoading && !reportData ? (
                <Card>
                    <p>Generating Profit & Loss report...</p>
                </Card>
            ) : reportData ? (
                <Card>
                    <div className="report-summary">
                        <div className="summary-item total-sales">
                            <h3>Total Sales Revenue</h3>
                            <p className="value positive">{formatCurrency(reportData.totalSales)}</p>
                        </div>
                        <div className="summary-item cost-of-goods">
                            <h3>Cost of Goods Sold (COGS)</h3>
                            <p className="value negative">{formatCurrency(reportData.totalCogs)}</p>
                        </div>
                        <div className="summary-item gross-profit">
                            <h3>Gross Profit</h3>
                            <p className={`value ${reportData.grossProfit >= 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(Math.abs(reportData.grossProfit))}
                                {reportData.grossProfit < 0 && ' (Loss)'}
                            </p>
                        </div>
                        <div className="summary-item total-expenses">
                            <h3>Total Operating Expenses</h3>
                            <p className="value negative">{formatCurrency(reportData.totalExpenses)}</p>
                        </div>
                        <div className="summary-item net-profit">
                            <h2>Net Profit / Loss</h2>
                            <p className={`value large ${reportData.netProfit >= 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(Math.abs(reportData.netProfit))}
                                {reportData.netProfit < 0 ? ' (Net Loss)' : ' (Net Profit)'}
                            </p>
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>Expense Breakdown</h3>
                        {reportData.expenseCategories.length > 0 ? (
                            <ul className="expense-list">
                                {reportData.expenseCategories.map(expense => (
                                    <li key={expense.category}>
                                        <span>{expense.category}</span>
                                        <span>{formatCurrency(expense.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No expenses recorded for this period.</p>
                        )}
                    </div>
                </Card>
            ) : (
                <Card>
                    <p>No data available for the selected date range. Please adjust the dates and try again.</p>
                </Card>
            )}

            <style jsx>{`
                .container {
                    padding: 20px;
                    max-width: 900px;
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

                .date-range-selector {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .date-range-selector label {
                    font-weight: bold;
                }

                .date-range-selector input[type="date"] {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    flex-grow: 1;
                    min-width: 150px;
                }

                .report-summary {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                    text-align: center;
                }

                .summary-item {
                    padding: 20px;
                    border-radius: 8px;
                    background-color: #f8f9fa;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .summary-item h3 {
                    color: #666;
                    margin-bottom: 10px;
                    font-size: 1.1em;
                }

                .summary-item .value {
                    font-size: 1.8em;
                    font-weight: bold;
                }

                .summary-item .value.large {
                    font-size: 2.5em;
                    color: #333; /* Default for large value */
                }

                .positive {
                    color: #28a745; /* Green for positive values */
                }

                .negative {
                    color: #dc3545; /* Red for negative values */
                }

                .net-profit {
                    grid-column: 1 / -1; /* Spans all columns */
                    background-color: #e6ffe6; /* Lighter green for net profit card */
                    border: 1px solid #28a745;
                    padding: 25px;
                }
                
                .net-profit.negative {
                    background-color: #ffe6e6; /* Lighter red for net loss card */
                    border: 1px solid #dc3545;
                }


                .details-section {
                    margin-top: 30px;
                }

                .details-section h3 {
                    margin-bottom: 15px;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 10px;
                }

                .expense-list {
                    list-style: none;
                    padding: 0;
                }

                .expense-list li {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px dashed #eee;
                }

                .expense-list li:last-child {
                    border-bottom: none;
                }

                @media (max-width: 768px) {
                    .report-summary {
                        grid-template-columns: 1fr;
                    }
                    .header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .date-range-selector {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>
        </div>
    );
}