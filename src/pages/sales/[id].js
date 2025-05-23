// SALES DETAILS AND INVOICE PRINTING
// pages/sales/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { prisma } from '../../lib/db';

export default function SaleDetails({ sale }) {
  const router = useRouter();
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Handle invoice printing
  const handlePrint = async () => {
    if (!window.electron) {
      alert('Printing is only available in desktop app');
      return;
    }

    setIsPrinting(true);

    try {
      // Format invoice data for the printer
      const invoiceData = {
        id: sale.id,
        date: sale.date, // Ensure this date format is compatible with your printInvoice function
        type: 'sale',
        customer: sale.customer,
        totalAmount: sale.totalAmount,
        receivedAmount: sale.receivedAmount,
        balance: sale.balance,
        items: sale.items.map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }))
      };

      // Send to printer
      const result = await window.electron.printInvoice(invoiceData);

      if (result.success) {
        alert('Invoice printed successfully!');
      } else {
        throw new Error(result.error || 'Printing failed');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Error printing invoice: ' + error.message);
    } finally {
      setIsPrinting(false);
    }
  };

  // Handle recording a payment receipt
  const handleReceivePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    // Optional: Validate if paymentAmount exceeds sale.balance
    if (parseFloat(paymentAmount) > sale.balance) {
      alert('Payment amount cannot exceed the outstanding balance.');
      return;
    }

    try {
      // In a real app, this would be an API call
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId: sale.id, // It's often good to link the receipt directly to the sale
          customerId: sale.customerId,
          amount: parseFloat(paymentAmount),
          notes: `Payment against Sale #${sale.id}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to record payment' }));
        throw new Error(errorData.message || 'Failed to record payment');
      }

      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount(''); // Reset payment amount
      // Refresh the page to show updated balance
      router.reload();

    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    }
  };

  // Format date for display
  // The sale.date is already stringified by getServerSideProps
  const formattedDate = new Date(sale.date).toLocaleDateString();

  // If sale is not found (though getServerSideProps should handle this with notFound)
  if (!sale) {
    return (
      <Layout>
        <div className="sale-details">
          <div className="page-header">
            <h1>Sale Not Found</h1>
            <div className="header-actions">
              <Button
                className="btn-secondary"
                onClick={() => router.push('/sales')}
              >
                Back to Sales
              </Button>
            </div>
          </div>
          <Card>
            <p>The requested sale could not be found.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="sale-details">
        <div className="page-header">
          <h1>Sale Invoice #{sale.id}</h1>
          <div className="header-actions">
            <Button
              className="btn-secondary"
              onClick={() => router.push('/sales')}
            >
              Back to Sales
            </Button>
          </div>
        </div>

        <Card>
          <div className="invoice-container" id="invoice-to-print">
            <div className="invoice-header">
              <div className="invoice-title">
                <h2>BANANA TRADING CO.</h2>
                <p>Sale Invoice</p>
              </div>

              <div className="invoice-info">
                <p><strong>Invoice #:</strong> {sale.id}</p>
                <p><strong>Date:</strong> {formattedDate}</p>
                <p><strong>Customer:</strong> {sale.customer.name}</p>
                <p><strong>Phone:</strong> {sale.customer.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="invoice-body">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item.name}</td>
                      <td>{item.quantity} {item.item.unit}</td>
                      <td>₹{item.rate.toFixed(2)}</td>
                      <td>₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total Amount</strong></td>
                    <td><strong>₹{sale.totalAmount.toFixed(2)}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan="3">Received Amount</td>
                    <td>₹{sale.receivedAmount.toFixed(2)}</td>
                  </tr>
                  <tr className="balance-row">
                    <td colSpan="3"><strong>Balance</strong></td>
                    <td><strong>₹{sale.balance.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>

              {sale.notes && (
                <div className="invoice-notes">
                  <h4>Notes:</h4>
                  <p>{sale.notes}</p>
                </div>
              )}

              <div className="invoice-footer">
                <div className="invoice-terms">
                  <p>Thank you for your business!</p>
                </div>

                <div className="invoice-actions">
                  <Button
                    className="btn-primary"
                    onClick={handlePrint}
                    disabled={isPrinting}
                  >
                    {isPrinting ? 'Printing...' : 'Print Invoice'}
                  </Button>

                  {sale.balance > 0 && (
                    <Button
                      className="btn-success"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Receive Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Receipt Modal */}
        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Receive Payment</h3>
                <button
                  className="close-btn"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount(''); // Reset on close
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Customer</label>
                  <input
                    type="text"
                    value={sale.customer.name}
                    readOnly
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Outstanding Balance</label>
                  <input
                    type="text"
                    value={`₹${sale.balance.toFixed(2)}`}
                    readOnly
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="payment-amount">Payment Amount</label>
                  <input
                    type="number"
                    id="payment-amount"
                    min="0.01" // Should not be 0
                    max={sale.balance.toFixed(2)} // Max should be the balance
                    step="0.01"
                    className="form-control"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount received"
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button
                  className="btn-primary"
                  onClick={handleReceivePayment}
                  // Optional: Disable if paymentAmount is invalid
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > sale.balance}
                >
                  Record Payment
                </Button>
                <Button
                  className="btn-secondary"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentAmount(''); // Reset on cancel
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .sale-details {
            // Add any specific styles for the page container if needed
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .page-header h1 {
            margin: 0;
          }
          .header-actions {
            // Styles for header actions container
          }
          .invoice-container {
            padding: 1rem; // Default padding
          }

          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container, .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px; /* Adjust padding for printing */
              margin: 0;
              border: none;
              box-shadow: none;
            }
            .invoice-actions, .header-actions, .page-header Button { /* Hide buttons in print view */
              display: none !important;
            }
            .modal-overlay { /* Hide modal in print view */
                display: none !important;
            }
          }

          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
          }

          .invoice-title h2 {
            margin: 0 0 0.5rem 0;
            color: #333;
          }

          .invoice-title p {
            margin: 0;
            font-size: 1.2rem;
            color: #666;
          }

          .invoice-info p {
            margin: 0.25rem 0;
            text-align: right; /* Align info to the right */
          }

          .invoice-items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2rem;
          }

          .invoice-items-table th,
          .invoice-items-table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .invoice-items-table th:nth-child(3), /* Rate */
          .invoice-items-table td:nth-child(3),
          .invoice-items-table th:nth-child(4), /* Amount */
          .invoice-items-table td:nth-child(4),
          .invoice-items-table tfoot td:nth-child(2) { /* Totals */
            text-align: right;
          }


          .invoice-items-table th {
            background-color: #f9f9f9;
          }

          .invoice-items-table tfoot td {
            padding-top: 0.75rem;
            border-top: 1px solid #ddd;
            border-bottom: none;
          }
           .invoice-items-table tfoot tr:last-child td {
             border-bottom: none; /* Remove bottom border from the last tfoot row */
           }


          .balance-row td {
            font-weight: bold;
            color: ${sale.balance > 0 ? '#d32f2f' : '#2e7d32'};
          }

          .invoice-notes {
            padding: 1rem;
            background-color: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 2rem;
            border: 1px solid #eee;
          }

          .invoice-notes h4 {
            margin-top: 0;
            margin-bottom: 0.5rem;
          }

          .invoice-notes p {
            margin: 0;
            white-space: pre-wrap; /* Preserve line breaks in notes */
          }

          .invoice-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
          }

          .invoice-actions {
            display: flex;
            gap: 0.75rem;
          }

          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal {
            background-color: white;
            border-radius: 8px;
            max-width: 500px;
            width: 90%; /* Responsive width */
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            animation: fadeInModal 0.3s ease-out;
          }

          @keyframes fadeInModal {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }


          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #eee;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.25rem;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 1.75rem; /* Larger close button */
            cursor: pointer;
            color: #888;
            padding: 0.25rem 0.5rem; /* Add some padding for easier clicking */
          }
          .close-btn:hover {
            color: #333;
          }


          .modal-body {
            padding: 1.5rem;
          }

          .modal-footer {
            padding: 1rem 1.5rem;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            background-color: #f9f9f9; /* Light background for footer */
            border-bottom-left-radius: 8px; /* Match modal border radius */
            border-bottom-right-radius: 8px;
          }

          .form-group {
            margin-bottom: 1.25rem; /* Increased spacing */
          }
          .form-group:last-child {
            margin-bottom: 0;
          }


          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #555;
          }

          .form-control {
            width: 100%;
            padding: 0.65rem 0.75rem; /* Slightly larger padding */
            border: 1px solid #ccc; /* Slightly darker border */
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box; /* Ensure padding doesn't expand width */
            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .form-control:focus {
            border-color: #007bff; /* Highlight focus */
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            outline: none;
          }

          .form-control[readOnly] {
            background-color: #e9ecef; /* Bootstrap's readonly color */
            opacity: 1;
          }
        `}</style>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const saleId = parseInt(id);
    if (isNaN(saleId)) {
      // If id is not a number, it's definitely not found.
      return { notFound: true };
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        items: {
          include: {
            item: true  // Assuming 'item' is the relation field on SaleItem model to Item model
          }
        }
      }
    });

    if (!sale) {
      return { notFound: true };
    }

    // Convert Date objects to string to prevent serialization errors
    // Prisma returns Date objects for DateTime fields
    const serializableSale = {
      ...sale,
      date: sale.date.toISOString(),
      items: sale.items.map(item => ({
        ...item,
        // If SaleItem has any Date fields, serialize them here too
        // e.g., createdAt: item.createdAt.toISOString(),
      })),
      // If customer has any Date fields, serialize them here too
      // customer: {
      //   ...sale.customer,
      //   // e.g., memberSince: sale.customer.memberSince?.toISOString(),
      // }
    };

    return {
      props: {
        sale: serializableSale,
      },
    };
  } catch (error) {
    console.error("Error fetching sale details:", error);
    // You could return a specific error page or redirect
    // For simplicity, returning notFound for any server-side error during fetch
    return { notFound: true };
  }
}