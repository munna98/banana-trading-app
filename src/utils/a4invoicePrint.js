// utils/invoicePrint.js

// Business information - this could come from settings/database
const DEFAULT_BUSINESS_INFO = {
  name: 'BANANA TRADING BUSINESS',
  address: 'Your Business Address\nCity, State - PIN',
  phone: '+91-XXXXXXXXXX',
  email: 'business@example.com',
  gst: 'GST No: XXXXXXXXXXXXXXXXX'
};

// Generate printable HTML invoice
export const generatePurchaseInvoiceHTML = (purchase, businessInfo = DEFAULT_BUSINESS_INFO) => {
  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'number' ? amount : 0;
    return `₹${numericAmount.toFixed(2)}`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const calculateSubtotal = () => {
    return purchase.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (purchase.totalAmount || 0) - subtotal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Purchase Invoice - ${purchase.id}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { margin: 0.5in; }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .invoice-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .business-name {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 5px 0;
          color: #2563eb;
        }
        
        .business-details {
          font-size: 11px;
          color: #666;
          margin: 2px 0;
        }
        
        .invoice-title {
          font-size: 18px;
          font-weight: bold;
          margin: 15px 0 10px 0;
          text-align: center;
          background: #f8fafc;
          padding: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          gap: 20px;
        }
        
        .detail-section {
          flex: 1;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 3px 0;
          border-bottom: 1px dotted #ccc;
        }
        
        .detail-label {
          font-weight: bold;
          color: #374151;
        }
        
        .detail-value {
          color: #1f2937;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #e5e7eb;
          padding: 8px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f9fafb;
          font-weight: bold;
          color: #374151;
        }
        
        .items-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .text-right {
          text-align: right;
        }
        
        .totals-section {
          margin-top: 20px;
          border-top: 2px solid #333;
          padding-top: 15px;
        }
        
        .totals-table {
          width: 300px;
          margin-left: auto;
          border-collapse: collapse;
        }
        
        .totals-table td {
          padding: 5px 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-table .total-row {
          font-weight: bold;
          font-size: 14px;
          border-top: 2px solid #333;
          background-color: #f9fafb;
        }
        
        .payment-info {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .payment-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .payment-table th,
        .payment-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          text-align: left;
        }
        
        .payment-table th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
        }
        
        .status-paid {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .status-partial {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .status-unpaid {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .print-button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 20px 0;
          font-size: 14px;
        }
        
        .print-button:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
        <button class="print-button" onclick="window.close()" style="background: #64748b;">✕ Close</button>
      </div>
      
      <div class="invoice-header">
        <div class="business-name">${businessInfo.name}</div>
        <div class="business-details">${businessInfo.address.replace(/\n/g, '<br>')}</div>
        <div class="business-details">📞 ${businessInfo.phone} | 📧 ${businessInfo.email}</div>
        <div class="business-details">${businessInfo.gst}</div>
      </div>
      
      <div class="invoice-title">PURCHASE INVOICE</div>
      
      <div class="invoice-details">
        <div class="detail-section">
          <h3 style="margin-top: 0; color: #374151;">Purchase Details</h3>
          <div class="detail-row">
            <span class="detail-label">Invoice No:</span>
            <span class="detail-value">#${purchase.id}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Purchase Date:</span>
            <span class="detail-value">${formatDate(purchase.date)}</span>
          </div>
          ${purchase.invoiceNo ? `
          <div class="detail-row">
            <span class="detail-label">Supplier Invoice:</span>
            <span class="detail-value">${purchase.invoiceNo}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">
              <span class="status-badge ${
                purchase.balance === 0 ? 'status-paid' : 
                purchase.paidAmount > 0 ? 'status-partial' : 'status-unpaid'
              }">
                ${purchase.balance === 0 ? 'FULLY PAID' : 
                  purchase.paidAmount > 0 ? 'PARTIALLY PAID' : 'UNPAID'}
              </span>
            </span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3 style="margin-top: 0; color: #374151;">Supplier Details</h3>
          <div class="detail-row">
            <span class="detail-label">Name:</span>
            <span class="detail-value">${purchase.supplier?.name || 'N/A'}</span>
          </div>
          ${purchase.supplier?.email ? `
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${purchase.supplier.email}</span>
          </div>
          ` : ''}
          ${purchase.supplier?.phone ? `
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${purchase.supplier.phone}</span>
          </div>
          ` : ''}
        </div>
      </div>
      
      ${purchase.items && purchase.items.length > 0 ? `
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 5%">#</th>
            <th style="width: 35%">Item Description</th>
            <th style="width: 15%" class="text-right">Quantity</th>
            <th style="width: 15%" class="text-right">Net Weight</th>
            <th style="width: 15%" class="text-right">Unit Price</th>
            <th style="width: 15%" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${purchase.items.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.item?.name || 'Unknown Item'}</strong>
              ${item.item?.description ? `<br><small style="color: #666;">${item.item.description}</small>` : ''}
            </td>
            <td class="text-right">${item.quantity || 0}</td>
            <td class="text-right">${item.item?.netWeight ? `${item.item.netWeight} kg` : '-'}</td>
            <td class="text-right">${formatCurrency(item.unitPrice || 0)}</td>
            <td class="text-right"><strong>${formatCurrency(item.totalPrice || 0)}</strong></td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}
      
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td class="text-right">${formatCurrency(subtotal)}</td>
          </tr>
          ${taxAmount > 0 ? `
          <tr>
            <td>Tax/Other Charges:</td>
            <td class="text-right">${formatCurrency(taxAmount)}</td>
          </tr>
          ` : ''}
          <tr class="total-row">
            <td>Total Amount:</td>
            <td class="text-right">${formatCurrency(purchase.totalAmount || 0)}</td>
          </tr>
          <tr>
            <td>Paid Amount:</td>
            <td class="text-right" style="color: #059669;">${formatCurrency(purchase.paidAmount || 0)}</td>
          </tr>
          <tr>
            <td>Outstanding Balance:</td>
            <td class="text-right" style="color: ${purchase.balance > 0 ? '#dc2626' : '#059669'};">
              ${formatCurrency(Math.abs(purchase.balance || 0))}
            </td>
          </tr>
        </table>
      </div>
      
      ${purchase.payments && purchase.payments.length > 0 ? `
      <div class="payment-info">
        <h3 style="color: #374151; margin-bottom: 10px;">Payment History</h3>
        <table class="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Method</th>
              <th>Reference</th>
              <th class="text-right">Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${purchase.payments.map(payment => `
            <tr>
              <td>${formatDate(payment.date)}</td>
              <td>${payment.paymentMethod.replace('_', ' ')}</td>
              <td>${payment.reference || '-'}</td>
              <td class="text-right" style="color: #059669;">${formatCurrency(payment.amount)}</td>
              <td>${payment.notes || '-'}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>This is a computer-generated invoice and does not require a signature.</p>
        <p>Generated on ${formatDate(new Date())} | ${businessInfo.name}</p>
      </div>
    </body>
    </html>
  `;
};

// Function to open print preview
export const printPurchaseInvoice = (purchase, businessInfo) => {
  const htmlContent = generatePurchaseInvoiceHTML(purchase, businessInfo);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for the content to load, then focus for printing
    printWindow.onload = () => {
      printWindow.focus();
    };
  } else {
    alert('Pop-up blocked! Please allow pop-ups for this site to print invoices.');
  }
};

// Function to download invoice as HTML file
export const downloadPurchaseInvoice = (purchase, businessInfo) => {
  const htmlContent = generatePurchaseInvoiceHTML(purchase, businessInfo);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `purchase-invoice-${purchase.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};