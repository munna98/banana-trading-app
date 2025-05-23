// lib/printer.js

/**
 * @file This file provides functions to generate printable HTML invoices
 * for purchases and sales, simulating thermal printer output.
 * In a real Electron app, this HTML would be passed to `webContents.print()`.
 */

// ESC/POS command constants
const ESC = '\x1B';
const GS = '\x1D';

// Printer commands
const COMMANDS = {
  // Initialize printer
  INIT: ESC + '@',

  // Text formatting
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  UNDERLINE_ON: ESC + '-' + '\x01',
  UNDERLINE_OFF: ESC + '-' + '\x00',
  DOUBLE_HEIGHT_ON: ESC + '!' + '\x10',
  DOUBLE_WIDTH_ON: ESC + '!' + '\x20',
  DOUBLE_SIZE_ON: ESC + '!' + '\x30',
  NORMAL_SIZE: ESC + '!' + '\x00',

  // Text alignment
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',

  // Line spacing
  LINE_SPACING_DEFAULT: ESC + '2',
  LINE_SPACING_SET: ESC + '3',

  // Paper handling
  PAPER_CUT: GS + 'V' + '\x41' + '\x03',
  PAPER_CUT_PARTIAL: GS + 'V' + '\x42' + '\x03',
  FEED_LINE: '\n',
  FEED_LINES: (n) => '\n'.repeat(n),

  // Drawer control
  OPEN_DRAWER: ESC + 'p' + '\x00' + '\x19' + '\xFA'
};

// Printer configuration
const PRINTER_CONFIG = {
  characterWidth: 42, // Characters per line for 80mm paper
  smallCharacterWidth: 56, // Characters per line for small font
  maxLines: 1000, // Maximum lines per receipt
  encoding: 'utf8'
};

class ThermalPrinter {
  constructor(config = {}) {
    this.config = { ...PRINTER_CONFIG, ...config };
    this.buffer = '';
    this.isConnected = false;
    this.printerPort = null;
  }

  // Initialize printer connection
  async connect(portPath = 'auto') {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Electron environment - use IPC to communicate with main process
        const result = await window.electronAPI.connectPrinter(portPath);
        this.isConnected = result.success;
        this.printerPort = result.port;
        return result;
      } else {
        // Web environment - use Web Serial API or other web-based printer connection
        console.warn('Printer connection requires Electron environment');
        return { success: false, message: 'Printer connection requires desktop app' };
      }
    } catch (error) {
      console.error('Printer connection error:', error);
      return { success: false, message: error.message };
    }
  }

  // Disconnect printer
  async disconnect() {
    try {
      if (this.isConnected && window.electronAPI) {
        await window.electronAPI.disconnectPrinter();
      }
      this.isConnected = false;
      this.printerPort = null;
    } catch (error) {
      console.error('Printer disconnection error:', error);
    }
  }

  // Send data to printer
  async send(data) {
    try {
      if (!this.isConnected) {
        throw new Error('Printer not connected');
      }

      if (window.electronAPI) {
        return await window.electronAPI.printData(data);
      } else {
        console.warn('Print data:', data);
        return { success: true, message: 'Print simulation (desktop app required for actual printing)' };
      }
    } catch (error) {
      console.error('Print error:', error);
      return { success: false, message: error.message };
    }
  }

  // Add text to buffer
  text(content, formatting = {}) {
    let formattedText = '';

    // Apply formatting
    if (formatting.bold) formattedText += COMMANDS.BOLD_ON;
    if (formatting.underline) formattedText += COMMANDS.UNDERLINE_ON;
    if (formatting.doubleHeight) formattedText += COMMANDS.DOUBLE_HEIGHT_ON;
    if (formatting.doubleWidth) formattedText += COMMANDS.DOUBLE_WIDTH_ON;
    if (formatting.doubleSize) formattedText += COMMANDS.DOUBLE_SIZE_ON;

    // Apply alignment
    if (formatting.align === 'center') formattedText += COMMANDS.ALIGN_CENTER;
    else if (formatting.align === 'right') formattedText += COMMANDS.ALIGN_RIGHT;
    else formattedText += COMMANDS.ALIGN_LEFT;

    // Add content
    formattedText += content;

    // Reset formatting
    if (formatting.bold) formattedText += COMMANDS.BOLD_OFF;
    if (formatting.underline) formattedText += COMMANDS.UNDERLINE_OFF;
    if (formatting.doubleHeight || formatting.doubleWidth || formatting.doubleSize) {
      formattedText += COMMANDS.NORMAL_SIZE;
    }

    this.buffer += formattedText;
    return this;
  }

  // Add line break
  newLine(count = 1) {
    this.buffer += COMMANDS.FEED_LINES(count);
    return this;
  }

  // Add separator line
  separator(char = '-', width = this.config.characterWidth) {
    this.buffer += char.repeat(width) + COMMANDS.FEED_LINE;
    return this;
  }

  // Add formatted line with left and right alignment
  leftRight(leftText, rightText, totalWidth = this.config.characterWidth) {
    const leftLength = leftText.length;
    const rightLength = rightText.length;
    const spacesNeeded = Math.max(1, totalWidth - leftLength - rightLength);

    this.buffer += leftText + ' '.repeat(spacesNeeded) + rightText + COMMANDS.FEED_LINE;
    return this;
  }

  // Add table row
  tableRow(columns, widths) {
    if (columns.length !== widths.length) {
      throw new Error('Columns and widths arrays must have the same length');
    }

    let row = '';
    for (let i = 0; i < columns.length; i++) {
      const content = String(columns[i] || '');
      const width = widths[i];

      if (content.length > width) {
        row += content.substring(0, width);
      } else {
        row += content.padEnd(width);
      }
    }

    this.buffer += row + COMMANDS.FEED_LINE;
    return this;
  }

  // Add QR code (if printer supports it)
  qrCode(data, size = 6) {
    // QR Code commands for ESC/POS
    const qrCommands = [
      GS + '(' + 'k' + '\x04' + '\x00' + '\x31' + 'A' + String.fromCharCode(size) + '\x00',
      GS + '(' + 'k' + String.fromCharCode(data.length + 3) + '\x00' + '\x31' + 'P' + '0' + data,
      GS + '(' + 'k' + '\x03' + '\x00' + '\x31' + 'Q' + '0'
    ].join('');

    this.buffer += COMMANDS.ALIGN_CENTER + qrCommands + COMMANDS.ALIGN_LEFT;
    return this;
  }

  // Cut paper
  cut(partial = false) {
    this.buffer += partial ? COMMANDS.PAPER_CUT_PARTIAL : COMMANDS.PAPER_CUT;
    return this;
  }

  // Open cash drawer
  openDrawer() {
    this.buffer += COMMANDS.OPEN_DRAWER;
    return this;
  }

  // Clear buffer
  clear() {
    this.buffer = '';
    return this;
  }

  // Get buffer content
  getBuffer() {
    return this.buffer;
  }

  // Print buffer content
  async print() {
    const data = COMMANDS.INIT + this.buffer;
    const result = await this.send(data);
    this.clear(); // Clear buffer after printing
    return result;
  }
}

// Receipt templates
export const receiptTemplates = {
  // Purchase invoice template
  purchaseInvoice: (purchase, supplier, items, businessInfo = {}) => {
    const printer = new ThermalPrinter();
    const date = new Date(purchase.date).toLocaleDateString('en-IN');

    // Define column widths for the items table
    const itemColWidths = [
      Math.floor(printer.config.characterWidth * 0.4), // Item Name
      Math.floor(printer.config.characterWidth * 0.2), // Qty
      Math.floor(printer.config.characterWidth * 0.2), // Rate
      Math.floor(printer.config.characterWidth * 0.2)  // Amount
    ];

    printer
      .text(businessInfo.name || 'BANANA TRADING BUSINESS', { align: 'center', bold: true, doubleSize: true })
      .newLine()
      .text(businessInfo.address || 'Business Address', { align: 'center' })
      .text(businessInfo.phone || 'Phone: +91-XXXXXXXXXX', { align: 'center' })
      .newLine()
      .separator('=')
      .text('PURCHASE INVOICE', { align: 'center', bold: true })
      .separator('=')
      .leftRight('Invoice No:', `PUR-${purchase.id.toString().padStart(6, '0')}`)
      .leftRight('Date:', date)
      .leftRight('Supplier:', supplier.name)
      .text(`Phone: ${supplier.phone || 'N/A'}`, { align: 'left' }) // Completed line
      .separator('-')
      .tableRow(['Item', 'Qty', 'Rate', 'Amount'], itemColWidths)
      .separator('-');

    items.forEach(item => {
      printer.tableRow([
        item.item.name,
        `${item.quantity} ${item.item.unit}`,
        item.rate.toFixed(2),
        item.amount.toFixed(2)
      ], itemColWidths);
    });

    printer
      .separator('-')
      .leftRight('Total Amount:', `₹ ${purchase.totalAmount.toFixed(2)}`, printer.config.characterWidth)
      .leftRight('Paid Amount:', `₹ ${purchase.paidAmount.toFixed(2)}`, printer.config.characterWidth)
      .leftRight('Balance Due:', `₹ ${purchase.balance.toFixed(2)}`, printer.config.characterWidth)
      .separator('=')
      .text('Thank you for your business!', { align: 'center' })
      .newLine(2)
      .cut();

    return printer.getBuffer();
  },

  // Sale invoice template
  saleInvoice: (sale, customer, items, businessInfo = {}) => {
    const printer = new ThermalPrinter();
    const date = new Date(sale.date).toLocaleDateString('en-IN');

    // Define column widths for the items table
    const itemColWidths = [
      Math.floor(printer.config.characterWidth * 0.4), // Item Name
      Math.floor(printer.config.characterWidth * 0.2), // Qty
      Math.floor(printer.config.characterWidth * 0.2), // Rate
      Math.floor(printer.config.characterWidth * 0.2)  // Amount
    ];

    printer
      .text(businessInfo.name || 'BANANA TRADING BUSINESS', { align: 'center', bold: true, doubleSize: true })
      .newLine()
      .text(businessInfo.address || 'Business Address', { align: 'center' })
      .text(businessInfo.phone || 'Phone: +91-XXXXXXXXXX', { align: 'center' })
      .newLine()
      .separator('=')
      .text('SALE INVOICE', { align: 'center', bold: true })
      .separator('=')
      .leftRight('Invoice No:', `SAL-${sale.id.toString().padStart(6, '0')}`)
      .leftRight('Date:', date)
      .leftRight('Customer:', customer.name)
      .text(`Phone: ${customer.phone || 'N/A'}`, { align: 'left' })
      .separator('-')
      .tableRow(['Item', 'Qty', 'Rate', 'Amount'], itemColWidths)
      .separator('-');

    items.forEach(item => {
      printer.tableRow([
        item.item.name,
        `${item.quantity} ${item.item.unit}`,
        item.rate.toFixed(2),
        item.amount.toFixed(2)
      ], itemColWidths);
    });

    printer
      .separator('-')
      .leftRight('Total Amount:', `₹ ${sale.totalAmount.toFixed(2)}`, printer.config.characterWidth)
      .leftRight('Received Amount:', `₹ ${sale.receivedAmount.toFixed(2)}`, printer.config.characterWidth)
      .leftRight('Balance Due:', `₹ ${sale.balance.toFixed(2)}`, printer.config.characterWidth)
      .separator('=')
      .text('Thank you for your business!', { align: 'center' })
      .newLine(2)
      .cut();

    return printer.getBuffer();
  }
};
