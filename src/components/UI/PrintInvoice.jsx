// src/components/UI/PrintInvoice.jsx
import React, { useRef } from 'react';
import Button from './Button';

const PrintInvoice = ({
  type = 'purchase', // 'purchase' or 'sale'
  data,
  onPrint,
  showPrintButton = true,
  thermalPrint = false
}) => {
  const printRef = useRef();

  // Formats a number as Indian Rupee currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Formats a date object into a readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handles the print action, either for thermal printer or browser print
  const handlePrint = async () => {
    if (thermalPrint && onPrint) {
      // If thermalPrint is true and onPrint function is provided,
      // call the external onPrint function for thermal printer integration.
      await onPrint(data);
    } else {
      // Otherwise, use the browser's native print functionality.
      const printContent = printRef.current; // Get the content to be printed
      const originalContent = document.body.innerHTML; // Store original body content

      // Replace body content with the invoice content for printing
      document.body.innerHTML = printContent.innerHTML;
      window.print(); // Trigger browser print dialog
      // Restore original body content and reload the page to reset styles/scripts
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  // Calculates the amount for a single item, considering weight deduction for purchase type
  const calculateItemAmount = (item) => {
    if (type === 'purchase' && item.weightDeduction) {
      const adjustedQuantity = item.quantity - item.weightDeduction;
      return adjustedQuantity * item.rate;
    }
    return item.quantity * item.rate;
  };

  // Calculates the total weight of all items, considering deductions for purchase type
  const getTotalWeight = () => {
    return data.items?.reduce((total, item) => {
      if (type === 'purchase' && item.weightDeduction) {
        return total + (item.quantity - item.weightDeduction);
      }
      return total + item.quantity;
    }, 0) || 0;
  };

  // Calculates the original total weight of all items before any deductions
  const getOriginalWeight = () => {
    return data.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  // Calculates the total deduction applied across all items
  const getTotalDeduction = () => {
    return data.items?.reduce((total, item) => total + (item.weightDeduction || 0), 0) || 0;
  };

  // If no data is provided, display a message
  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        No invoice data available
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Print Button - visible only if showPrintButton is true and not during print */}
      {showPrintButton && (
        <div className="mb-6 flex justify-end no-print">
          <Button onClick={handlePrint} variant="primary" size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </Button>
        </div>
      )}

      {/* Invoice Content - this div will be printed */}
      <div ref={printRef} className="invoice-content">
        {/* Conditional rendering for Thermal Print Layout */}
        {thermalPrint ? (
          <div className="font-mono text-sm max-w-xs mx-auto">
            {/* Header for Thermal Print */}
            <div className="text-center mb-4 border-b-2 border-dashed pb-2">
              <h1 className="font-bold text-lg">BANANA TRADING</h1>
              <p className="text-xs mt-1">Business Management System</p>
              <p className="text-xs">Date: {formatDate(data.date)}</p>
            </div>

            {/* Invoice Details for Thermal Print */}
            <div className="mb-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Invoice #:</span>
                <span>{data.id}</span>
              </div>
              <div className="flex justify-between">
                <span>{type === 'purchase' ? 'Supplier:' : 'Customer:'}</span>
                <span>{type === 'purchase' ? data.supplier?.name : data.customer?.name}</span>
              </div>
              {(data.supplier?.phone || data.customer?.phone) && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span>{type === 'purchase' ? data.supplier?.phone : data.customer?.phone}</span>
                </div>
              )}
            </div>

            {/* Items for Thermal Print */}
            <div className="border-t border-dashed pt-2 mb-4">
              <div className="text-xs font-bold mb-2">ITEMS:</div>
              {data.items?.map((item, index) => (
                <div key={index} className="mb-3 text-xs">
                  <div className="font-semibold">{item.item?.name}</div>
                  <div className="flex justify-between">
                    <span>Qty:</span>
                    <span>{item.quantity} kg</span>
                  </div>
                  {type === 'purchase' && item.weightDeduction > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Deduction:</span>
                        <span>-{item.weightDeduction} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Net Qty:</span>
                        <span>{item.quantity - item.weightDeduction} kg</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>₹{item.rate}/kg</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Amount:</span>
                    <span>₹{calculateItemAmount(item).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary for Thermal Print */}
            <div className="border-t border-dashed pt-2 space-y-1 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Total Weight:</span>
                <span>{getTotalWeight().toFixed(2)} kg</span>
              </div>
              {type === 'purchase' && getTotalDeduction() > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Original Weight:</span>
                    <span>{getOriginalWeight().toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deduction:</span>
                    <span>{getTotalDeduction().toFixed(2)} kg</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg">
                <span>TOTAL:</span>
                <span>₹{data.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>₹{(data.paidAmount || data.receivedAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span>₹{data.balance?.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer for Thermal Print */}
            <div className="text-center text-xs mt-4 pt-2 border-t border-dashed">
              <p>Thank you for your business!</p>
              <p className="mt-1">--- Invoice End ---</p>
            </div>
          </div>
        ) : (
          /* A4 Print Layout */
          <div className="max-w-4xl mx-auto p-8">
            {/* Header for A4 Print */}
            <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">BANANA TRADING</h1>
              <p className="text-lg text-gray-600">Business Management System</p>
              <p className="text-sm text-gray-500 mt-2">
                Invoice Date: {formatDate(data.date)}
              </p>
            </div>

            {/* Invoice Info Section for A4 Print */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {type === 'purchase' ? 'Purchase Invoice' : 'Sales Invoice'}
                </h3>
                <p><strong>Invoice #:</strong> {data.id}</p>
                <p><strong>Date:</strong> {formatDate(data.date)}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {type === 'purchase' ? 'Supplier Details' : 'Customer Details'}
                </h3>
                <p><strong>Name:</strong> {type === 'purchase' ? data.supplier?.name : data.customer?.name}</p>
                {(data.supplier?.phone || data.customer?.phone) && (
                  <p><strong>Phone:</strong> {type === 'purchase' ? data.supplier?.phone : data.customer?.phone}</p>
                )}
                {(data.supplier?.address || data.customer?.address) && (
                  <p><strong>Address:</strong> {type === 'purchase' ? data.supplier?.address : data.customer?.address}</p>
                )}
              </div>
            </div>

            {/* Items Table for A4 Print */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Quantity (kg)</th>
                      {type === 'purchase' && (
                        <>
                          <th className="border border-gray-300 px-4 py-2 text-right">Deduction (kg)</th>
                          <th className="border border-gray-300 px-4 py-2 text-right">Net Qty (kg)</th>
                        </>
                      )}
                      <th className="border border-gray-300 px-4 py-2 text-right">Rate (₹/kg)</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-4 py-2">{item.item?.name}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                        {type === 'purchase' && (
                          <>
                            <td className="border border-gray-300 px-4 py-2 text-right">{item.weightDeduction || 0}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity - (item.weightDeduction || 0)}</td>
                          </>
                        )}
                        <td className="border border-gray-300 px-4 py-2 text-right">{item.rate}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          {formatCurrency(calculateItemAmount(item))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    {/* Total Weight Row */}
                    <tr className="bg-gray-50">
                      <td colSpan={type === 'purchase' ? 4 : 2} className="border border-gray-300 px-4 py-2 text-right font-bold">Total Weight:</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">{getTotalWeight().toFixed(2)} kg</td>
                    </tr>
                    {/* Original Weight and Total Deduction Rows (only for purchase type with deductions) */}
                    {type === 'purchase' && getTotalDeduction() > 0 && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-bold">Original Weight:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold">{getOriginalWeight().toFixed(2)} kg</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-bold">Total Deduction:</td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-bold">{getTotalDeduction().toFixed(2)} kg</td>
                        </tr>
                      </>
                    )}
                    {/* Total Amount Row */}
                    <tr className="bg-gray-200">
                      <td colSpan={type === 'purchase' ? 4 : 2} className="border border-gray-300 px-4 py-2 text-right font-bold text-lg">Total Amount:</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold text-lg">
                        {formatCurrency(data.totalAmount || 0)}
                      </td>
                    </tr>
                    {/* Paid Amount Row */}
                    <tr className="bg-gray-50">
                      <td colSpan={type === 'purchase' ? 4 : 2} className="border border-gray-300 px-4 py-2 text-right font-bold">Paid Amount:</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                        {formatCurrency(data.paidAmount || data.receivedAmount || 0)}
                      </td>
                    </tr>
                    {/* Balance Due Row */}
                    <tr className="bg-gray-50">
                      <td colSpan={type === 'purchase' ? 4 : 2} className="border border-gray-300 px-4 py-2 text-right font-bold">Balance Due:</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                        {formatCurrency(data.balance || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer for A4 Print */}
            <div className="text-center text-gray-600 text-sm mt-8 pt-4 border-t border-gray-300">
              <p>Thank you for your business!</p>
              <p className="mt-2">For any inquiries, please contact us.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintInvoice;
