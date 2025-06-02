// utils/thermal80mmInvoice.js

// Business information - this could come from settings/database
const DEFAULT_BUSINESS_INFO = {
  name: 'BANANA TRADING BUSINESS',
  address: 'Your Business Address\nCity, State - PIN',
  phone: '+91-XXXXXXXXXX',
  email: 'business@example.com',
  gst: 'GST No: XXXXXXXXXXXXXXXXX'
};

// 80mm thermal printer configuration
const THERMAL_CONFIG = {
  paperWidth: 48, // characters per line for 80mm paper
  separatorChar: '-',
  doubleChar: '=',
  spaceChar: ' '
};

// Helper functions for thermal formatting
const centerText = (text, width = THERMAL_CONFIG.paperWidth) => {
  if (text.length >= width) return text.substring(0, width);
  const padding = Math.floor((width - text.length) / 2);
  return ' '.repeat(padding) + text;
};

const leftRightAlign = (left, right, width = THERMAL_CONFIG.paperWidth) => {
  const maxLeftWidth = width - right.length - 1;
  const leftText = left.length > maxLeftWidth ? left.substring(0, maxLeftWidth) : left;
  const spaces = width - leftText.length - right.length;
  return leftText + ' '.repeat(Math.max(1, spaces)) + right;
};

const repeatChar = (char, count = THERMAL_CONFIG.paperWidth) => char.repeat(count);

const formatCurrency = (amount) => {
  const numericAmount = typeof amount === 'number' ? amount : 0;
  return `Rs${numericAmount.toFixed(2)}`;
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const wrapText = (text, width = THERMAL_CONFIG.paperWidth) => {
  if (!text || text.length <= width) return [text || ''];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word.length > width ? word.substring(0, width) : word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

// Generate thermal receipt content for purchase invoice
export const generateThermalPurchaseInvoice = (purchase, businessInfo = DEFAULT_BUSINESS_INFO) => {
  const calculateSubtotal = () => {
    return purchase.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (purchase.totalAmount || 0) - subtotal;

  let receipt = '';

  // Header
  receipt += centerText(businessInfo.name) + '\n';
  receipt += repeatChar(THERMAL_CONFIG.doubleChar) + '\n';
  
  // Business address (wrapped)
  const addressLines = businessInfo.address.split('\n');
  addressLines.forEach(line => {
    const wrappedLines = wrapText(line);
    wrappedLines.forEach(wrappedLine => {
      receipt += centerText(wrappedLine) + '\n';
    });
  });
  
  receipt += centerText(`Ph: ${businessInfo.phone}`) + '\n';
  if (businessInfo.email) {
    receipt += centerText(businessInfo.email) + '\n';
  }
  receipt += centerText(businessInfo.gst) + '\n';
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  
  // Invoice title
  receipt += centerText('PURCHASE INVOICE') + '\n';
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  
  // Invoice details
  receipt += leftRightAlign('Invoice No:', `#${purchase.id}`) + '\n';
  receipt += leftRightAlign('Date:', formatDate(purchase.date)) + '\n';
  
  if (purchase.invoiceNo) {
    receipt += leftRightAlign('Supplier Inv:', purchase.invoiceNo) + '\n';
  }
  
  // Status
  const status = purchase.balance === 0 ? 'PAID' : 
                purchase.paidAmount > 0 ? 'PARTIAL' : 'UNPAID';
  receipt += leftRightAlign('Status:', status) + '\n';
  
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  
  // Supplier details
  receipt += 'SUPPLIER DETAILS:\n';
  receipt += `Name: ${purchase.supplier?.name || 'N/A'}\n`;
  
  if (purchase.supplier?.phone) {
    receipt += `Phone: ${purchase.supplier.phone}\n`;
  }
  if (purchase.supplier?.email) {
    const emailLines = wrapText(purchase.supplier.email);
    emailLines.forEach(line => {
      receipt += `Email: ${line}\n`;
    });
  }
  
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  
  // Items
  if (purchase.items && purchase.items.length > 0) {
    receipt += 'ITEMS:\n';
    receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
    
    purchase.items.forEach((item, index) => {
      // Item name
      const itemName = item.item?.name || 'Unknown Item';
      const wrappedName = wrapText(itemName, 44);
      receipt += `${index + 1}. ${wrappedName[0]}\n`;
      if (wrappedName.length > 1) {
        wrappedName.slice(1).forEach(line => {
          receipt += `   ${line}\n`;
        });
      }
      
      // Item details
      receipt += `   Qty: ${item.quantity || 0}`;
      if (item.item?.netWeight) {
        receipt += ` | Wt: ${item.item.netWeight}kg`;
      }
      receipt += '\n';
      
      receipt += leftRightAlign(`   Rate: ${formatCurrency(item.unitPrice || 0)}`, 
                                `Total: ${formatCurrency(item.totalPrice || 0)}`) + '\n';
      
      if (index < purchase.items.length - 1) {
        receipt += '   ' + repeatChar('.', 42) + '\n';
      }
    });
  }
  
  receipt += repeatChar(THERMAL_CONFIG.doubleChar) + '\n';
  
  // Totals
  receipt += leftRightAlign('Subtotal:', formatCurrency(subtotal)) + '\n';
  
  if (taxAmount > 0) {
    receipt += leftRightAlign('Tax/Charges:', formatCurrency(taxAmount)) + '\n';
  }
  
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  receipt += leftRightAlign('TOTAL AMOUNT:', formatCurrency(purchase.totalAmount || 0)) + '\n';
  receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
  
  receipt += leftRightAlign('Paid Amount:', formatCurrency(purchase.paidAmount || 0)) + '\n';
  receipt += leftRightAlign('Balance:', formatCurrency(Math.abs(purchase.balance || 0))) + '\n';
  
  // Payment history
  if (purchase.payments && purchase.payments.length > 0) {
    receipt += repeatChar(THERMAL_CONFIG.separatorChar) + '\n';
    receipt += 'PAYMENT HISTORY:\n';
    
    purchase.payments.forEach((payment, index) => {
      receipt += `${index + 1}. ${formatDate(payment.date)}\n`;
      receipt += `   ${payment.paymentMethod.replace('_', ' ').toUpperCase()}\n`;
      receipt += leftRightAlign(`   ${payment.reference || 'No Ref'}`, 
                                formatCurrency(payment.amount)) + '\n';
      if (payment.notes) {
        const noteLines = wrapText(payment.notes, 44);
        noteLines.forEach(line => {
          receipt += `   ${line}\n`;
        });
      }
      if (index < purchase.payments.length - 1) {
        receipt += '   ' + repeatChar('.', 42) + '\n';
      }
    });
  }
  
  receipt += repeatChar(THERMAL_CONFIG.doubleChar) + '\n';
  
  // Footer
  receipt += centerText('Thank You!') + '\n';
  receipt += centerText(`Generated: ${formatDate(new Date())}`) + '\n';
  receipt += centerText('Computer Generated Invoice') + '\n';
  
  // Add some spacing at the end for cutting
  receipt += '\n\n\n';
  
  return receipt;
};

// Generate HTML preview for thermal receipt (for testing/preview)
export const generateThermalInvoiceHTML = (purchase, businessInfo = DEFAULT_BUSINESS_INFO) => {
  const thermalContent = generateThermalPurchaseInvoice(purchase, businessInfo);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Thermal Invoice Preview - ${purchase.id}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { 
            margin: 0; 
            size: 80mm auto;
          }
        }
        
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          line-height: 1.2;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 10px;
          width: 80mm;
          box-sizing: border-box;
        }
        
        .thermal-content {
          white-space: pre-wrap;
          word-wrap: break-word;
          background: #fff;
          border: 1px solid #ddd;
          padding: 10px;
          margin: 0;
        }
        
        .preview-header {
          text-align: center;
          background: #f0f0f0;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          font-family: Arial, sans-serif;
        }
        
        .controls {
          margin: 10px 0;
          text-align: center;
        }
        
        .btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          margin: 0 5px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn:hover {
          background: #0056b3;
        }
        
        .btn-secondary {
          background: #6c757d;
        }
        
        .btn-secondary:hover {
          background: #545b62;
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <div class="preview-header">
          <strong>80mm Thermal Receipt Preview</strong><br>
          <small>This shows how your invoice will look on thermal printer</small>
        </div>
        <div class="controls">
          <button class="btn" onclick="window.print()">🖨️ Print</button>
          <button class="btn btn-secondary" onclick="downloadThermalText()">💾 Download Text</button>
          <button class="btn btn-secondary" onclick="window.close()">✕ Close</button>
        </div>
      </div>
      
      <div class="thermal-content">${thermalContent.replace(/\n/g, '\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      
      <script>
        function downloadThermalText() {
          const content = \`${thermalContent.replace(/`/g, '\\`')}\`;
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'thermal-invoice-${purchase.id}.txt';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      </script>
    </body>
    </html>
  `;
};

// Function to print thermal invoice
export const printThermalInvoice = (purchase, businessInfo) => {
  const htmlContent = generateThermalInvoiceHTML(purchase, businessInfo);
  const printWindow = window.open('', '_blank', 'width=350,height=600');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.focus();
    };
  } else {
    alert('Pop-up blocked! Please allow pop-ups for this site to print thermal invoices.');
  }
};

// Function to get raw thermal content (for direct printer communication)
export const getThermalPrintData = (purchase, businessInfo) => {
  return generateThermalPurchaseInvoice(purchase, businessInfo);
};

// Function to download thermal invoice as text file
export const downloadThermalInvoice = (purchase, businessInfo) => {
  const thermalContent = generateThermalPurchaseInvoice(purchase, businessInfo);
  const blob = new Blob([thermalContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `thermal-invoice-${purchase.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// ESC/POS commands for thermal printers (optional advanced features)
export const generateESCPOSCommands = (purchase, businessInfo) => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  // Basic ESC/POS commands
  const commands = {
    init: ESC + '@',           // Initialize printer
    bold: ESC + 'E' + '\x01',  // Bold on
    boldOff: ESC + 'E' + '\x00', // Bold off
    center: ESC + 'a' + '\x01', // Center align
    left: ESC + 'a' + '\x00',   // Left align
    cut: GS + 'V' + 'A' + '\x03', // Cut paper
    doubleHeight: ESC + '!' + '\x10', // Double height
    normal: ESC + '!' + '\x00'  // Normal text
  };
  
  const thermalContent = generateThermalPurchaseInvoice(purchase, businessInfo);
  
  // Wrap content with ESC/POS commands
  return commands.init + 
         commands.center + commands.bold + commands.doubleHeight +
         businessInfo.name + '\n' +
         commands.normal + commands.boldOff +
         thermalContent +
         commands.cut;
};