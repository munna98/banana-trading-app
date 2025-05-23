// lib/printer.js - Thermal printer integration
import { ipcRenderer } from 'electron';

// Printer configuration
const PRINTER_CONFIG = {
  width: 48, // Character width for 80mm thermal printer
  fontSize: 12,
  lineHeight: 1.2,
  margins: {
    top: 5,
    bottom: 5,
    left: 2,
    right: 2
  }
};

// ESC/POS Commands for thermal printers
const ESC_POS = {
  INIT: '\x1B\x40',        // Initialize printer
  CUT: '\x1D\x56\x00',     // Cut paper
  FEED: '\x0A',            // Line feed
  CENTER: '\x1B\x61\x01',  // Center alignment
  LEFT: '\x1B\x61\x00',    // Left alignment
  RIGHT: '\x1B\x61\x02',   // Right alignment
  BOLD_ON: '\x1B\x45\x01', // Bold on
  BOLD_OFF: '\x1B\x45\x00',// Bold off
  UNDERLINE_ON: '\x1B\x2D\x01', // Underline on
  UNDERLINE_OFF: '\x1B\x2D\x00', // Underline off
  DOUBLE_HEIGHT: '\x1B\x21\x10', // Double height
  NORMAL_SIZE: '\x1B\x21\x00',   // Normal size
  BARCODE_WIDTH: '\x1D\x77\x02', // Barcode width
  BARCODE_HEIGHT: '\x1D\x68\x64' // Barcode height
};

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};

// Check if printer is available
export const checkPrinterStatus = async () => {
  try {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const printers = await window.electronAPI.getPrinters();
      return {
        available: printers.length > 0,
        printers: printers,
        defaultPrinter: printers.find(p => p.isDefault) || printers[0]
      };
    }
    return { available: false, printers: [], defaultPrinter: null };
  } catch (error) {
    console.error('Failed to check printer status:', error);
    return { available: false, printers: [], defaultPrinter: null, error: error.message };
  }
};

// Print purchase invoice
export const printPurchaseInvoice = async (purchase, printerName = null) => {
  try {
    const invoiceData = formatPurchaseInvoice(purchase);
    return await sendToPrinter(invoiceData, printerName);
  } catch (error) {
    console.error('Failed to print purchase invoice:', error);
    return { success: false, error: error.message };
  }
};

// Print sale invoice
export const printSaleInvoice = async (sale, printerName = null) => {
  try {
    const invoiceData = formatSaleInvoice(sale);
    return await sendToPrinter(invoiceData, printerName);
  } catch (error) {
    console.error('Failed to print sale invoice:', error);
    return { success: false, error: error.message };
  }
};

// Print payment receipt
export const printPaymentReceipt = async (payment, printerName = null) => {
  try {
    const receiptData = formatPaymentReceipt(payment);
    return await sendToPrinter(receiptData, printerName);
  } catch (error) {
    console.error('Failed to print payment receipt:', error);
    return { success: false, error: error.message };
  }
};

// Print custom report
export const printReport = async (reportData, title, printerName = null) => {
  try {
    const formattedReport = formatReport(reportData, title);
    return await sendToPrinter(formattedReport, printerName);
  } catch (error) {
    console.error('Failed to print report:', error);
    return { success: false, error: error.message };
  }
};

// Format purchase invoice for printing
const formatPurchaseInvoice = (purchase) => {
  const { width } = PRINTER_CONFIG;
  let output = '';

  // Header
  output += ESC_POS.INIT;
  output += ESC_POS.CENTER;
  output += ESC_POS.BOLD_ON;
  output += ESC_POS.DOUBLE_HEIGHT;
  output += 'BANANA TRADING\n';
  output += ESC_POS.NORMAL_SIZE;
  output += 'PURCHASE INVOICE\n';
  output += ESC_POS.BOLD_OFF;
  output += ESC_POS.LEFT;
  
  // Separator line
  output += '='.repeat(width) + '\n';
  
  // Invoice details
  output += `Invoice #: ${purchase.id}\n`;
  output += `Date: ${formatDate(purchase.date)}\n`;
  output += `Supplier: ${purchase.supplier?.name || 'N/A'}\n`;
  
  if (purchase.supplier?.phone) {
    output += `Phone: ${purchase.supplier.phone}\n`;
  }
  
  output += '='.repeat(width) + '\n';
  
  // Items header
  output += ESC_POS.BOLD_ON;
  output += padString('Item', 15) + padString('Qty', 6) + padString('Rate', 8) + padString('Amount', 8) + '\n';
  output += ESC_POS.BOLD_OFF;
  output += '-'.repeat(width) + '\n';
  
  // Items
  purchase.items?.forEach(item => {
    output += padString(item.item?.name || 'Item', 15);
    output += padString(item.quantity.toString(), 6);
    output += padString(item.rate.toFixed(2), 8);
    output += padString(item.amount.toFixed(2), 8);
    output += '\n';
    
    if (item.weightDeduction > 0) {
      output += `  (Weight deduction: ${item.weightDeduction}kg)\n`;
    }
  });
  
  output += '-'.repeat(width) + '\n';
  
  // Totals
  output += ESC_POS.BOLD_ON;
  output += padString('TOTAL:', width - 10, 'right') + padString(purchase.totalAmount.toFixed(2), 10, 'right') + '\n';
  
  if (purchase.paidAmount > 0) {
    output += padString('PAID:', width - 10, 'right') + padString(purchase.paidAmount.toFixed(2), 10, 'right') + '\n';
  }
  
  if (purchase.balance > 0) {
    output += padString('BALANCE:', width - 10, 'right') + padString(purchase.balance.toFixed(2), 10, 'right') + '\n';
  }
  
  output += ESC_POS.BOLD_OFF;
  output += '='.repeat(width) + '\n';
  
  // Footer
  output += ESC_POS.CENTER;
  output += 'Thank you for your business!\n';
  output += formatDate(new Date()) + '\n';
  
  // Cut paper
  output += '\n\n';
  output += ESC_POS.CUT;
  
  return output;
};

// Format sale invoice for printing
const formatSaleInvoice = (sale) => {
  const { width } = PRINTER_CONFIG;
  let output = '';

  // Header
  output += ESC_POS.INIT;
  output += ESC_POS.CENTER;
  output += ESC_POS.BOLD_ON;
  output += ESC_POS.DOUBLE_HEIGHT;
  output += 'BANANA TRADING\n';
  output += ESC_POS.NORMAL_SIZE;
  output += 'SALE INVOICE\n';
  output += ESC_POS.BOLD_OFF;
  output += ESC_POS.LEFT;
  
  // Separator line
  output += '='.repeat(width) + '\n';
  
  // Invoice details
  output += `Invoice #: ${sale.id}\n`;
  output += `Date: ${formatDate(sale.date)}\n`;
  output += `Customer: ${sale.customer?.name || 'Walk-in'}\n`;
  
  if (sale.customer?.phone) {
    output += `Phone: ${sale.customer.phone}\n`;
  }
  
  output += '='.repeat(width) + '\n';
  
  // Items header
  output += ESC_POS.BOLD_ON;
  output += padString('Item', 15) + padString('Qty', 6) + padString('Rate', 8) + padString('Amount', 8) + '\n';
  output += ESC_POS.BOLD_OFF;
  output += '-'.repeat(width) + '\n';
  
  // Items
  sale.items?.forEach(item => {
    output += padString(item.item?.name || 'Item', 15);
    output += padString(item.quantity.toString(), 6);
    output += padString(item.rate.toFixed(2), 8);
    output += padString(item.amount.toFixed(2), 8);
    output += '\n';
  });
  
  output += '-'.repeat(width) + '\n';
  
  // Totals
  output += ESC_POS.BOLD_ON;
  output += padString('TOTAL:', width - 10, 'right') + padString(sale.totalAmount.toFixed(2), 10, 'right') + '\n';
  
  if (sale.receivedAmount > 0) {
    output += padString('RECEIVED:', width - 10, 'right') + padString(sale.receivedAmount.toFixed(2), 10, 'right') + '\n';
  }
  
  if (sale.balance > 0) {
    output += padString('BALANCE:', width - 10, 'right') + padString(sale.balance.toFixed(2), 10, 'right') + '\n';
  }
  
  output += ESC_POS.BOLD_OFF;
  output += '='.repeat(width) + '\n';
  
  // Footer
  output += ESC_POS.CENTER;
  output += 'Thank you for your purchase!\n';
  output += formatDate(new Date()) + '\n';
  
  // Cut paper
  output += '\n\n';
  output += ESC_POS.CUT;
  
  return output;
};

// Format payment receipt for printing
const formatPaymentReceipt = (payment) => {
  const { width } = PRINTER_CONFIG;
  let output = '';

  // Header
  output += ESC_POS.INIT;
  output += ESC_POS.CENTER;
  output += ESC_POS.BOLD_ON;
  output += ESC_POS.DOUBLE_HEIGHT;
  output += 'BANANA TRADING\n';
  output += ESC_POS.NORMAL_SIZE;
  output += 'PAYMENT RECEIPT\n';
  output += ESC_POS.BOLD_OFF;
  output += ESC_POS.LEFT;
  
  // Separator line
  output += '='.repeat(width) + '\n';
  
  // Receipt details
  output += `Receipt #: ${payment.id}\n`;
  output += `Date: ${formatDate(payment.date)}\n`;
  
  if (payment.supplier) {
    output += `Paid to: ${payment.supplier.name}\n`;
  } else if (payment.customer) {
    output += `Received from: ${payment.customer.name}\n`;
  }
  
  output += '='.repeat(width) + '\n';
  
  // Amount
  output += ESC_POS.BOLD_ON;
  output += ESC_POS.CENTER;
  output += `AMOUNT: ₹${payment.amount.toFixed(2)}\n`;
  output += ESC_POS.BOLD_OFF;
  output += ESC_POS.LEFT;
  
  if (payment.notes) {
    output += `Notes: ${payment.notes}\n`;
  }
  
  output += '='.repeat(width) + '\n';
  
  // Footer
  output += ESC_POS.CENTER;
  output += 'Thank you!\n';
  output += formatDate(new Date()) + '\n';
  
  // Cut paper
  output += '\n\n';
  output += ESC_POS.CUT;
  
  return output;
};

// Format report for printing
const formatReport = (data, title) => {
  const { width } = PRINTER_CONFIG;
  let output = '';

  // Header
  output += ESC_POS.INIT;
  output += ESC_POS.CENTER;
  output += ESC_POS.BOLD_ON;
  output += ESC_POS.DOUBLE_HEIGHT;
  output += 'BANANA TRADING\n';
  output += ESC_POS.NORMAL_SIZE;
  output += title.toUpperCase() + '\n';
  output += ESC_POS.BOLD_OFF;
  output += ESC_POS.LEFT;
  
  // Separator line
  output += '='.repeat(width) + '\n';
  
  // Report date
  output += `Generated: ${formatDate(new Date())}\n`;
  output += '='.repeat(width) + '\n';
  
  // Report data
  if (Array.isArray(data)) {
    data.forEach(item => {
      // Attempt to format objects within the report data more cleanly
      if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, value]) => {
          output += `${key}: ${value}\n`;
        });
        output += '-'.repeat(width) + '\n'; // Add a separator for each item in array
      } else {
        output += item.toString() + '\n';
      }
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.entries(data).forEach(([key, value]) => {
      output += `${key}: ${value}\n`;
    });
  } else {
    output += data.toString() + '\n';
  }
  
  output += '='.repeat(width) + '\n';
  
  // Cut paper
  output += '\n\n';
  output += ESC_POS.CUT;
  
  return output;
};

// Send data to printer
const sendToPrinter = async (data, printerName = null) => {
  try {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.print({
        data: data,
        printer: printerName,
        options: {
          silent: true,
          deviceName: printerName
        }
      });
      
      return { success: true, result };
    } else {
      // Fallback for web - open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<pre>${data}</pre>`);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
      
      return { success: true, result: 'Printed via browser' };
    }
  } catch (error) {
    console.error('Print failed:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to pad strings for alignment
const padString = (str, length, align = 'left') => {
  if (str.length >= length) return str.substring(0, length);
  
  const padding = ' '.repeat(length - str.length);
  
  switch (align) {
    case 'right':
      return padding + str;
    case 'center':
      const leftPad = Math.floor(padding.length / 2);
      const rightPad = padding.length - leftPad;
      return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
    default:
      return str + padding;
  }
};