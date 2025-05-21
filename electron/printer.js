// THERMAL PRINTER INTEGRATION
// electron/printer.js

const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

async function printInvoice(invoiceData) {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON, // Change according to your printer type
      interface: 'printer:auto',
      options: {
        timeout: 5000
      }
    });

    // Check if printer is connected
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error('Printer not connected');
    }

    // Print header
    printer.alignCenter();
    printer.bold(true);
    printer.println("BANANA TRADING CO.");
    printer.bold(false);
    printer.println("Invoice Receipt");
    printer.drawLine();

    // Invoice details
    printer.alignLeft();
    printer.println(`Invoice #: ${invoiceData.id}`);
    printer.println(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`);
    
    if (invoiceData.type === 'purchase') {
      printer.println(`Supplier: ${invoiceData.supplier.name}`);
    } else {
      printer.println(`Customer: ${invoiceData.customer.name}`);
    }
    
    printer.drawLine();

    // Items
    printer.alignLeft();
    printer.tableCustom([
      { text: "Item", width: 0.4 },
      { text: "Qty", width: 0.2, align: "right" },
      { text: "Price", width: 0.2, align: "right" },
      { text: "Amount", width: 0.2, align: "right" }
    ]);
    
    invoiceData.items.forEach(item => {
      printer.tableCustom([
        { text: item.name, width: 0.4 },
        { text: item.quantity.toString(), width: 0.2, align: "right" },
        { text: item.rate.toFixed(2), width: 0.2, align: "right" },
        { text: item.amount.toFixed(2), width: 0.2, align: "right" }
      ]);
    });

    printer.drawLine();

    // Totals
    printer.alignRight();
    printer.println(`Total: ${invoiceData.totalAmount.toFixed(2)}`);
    
    if (invoiceData.type === 'purchase') {
      printer.println(`Paid: ${invoiceData.paidAmount.toFixed(2)}`);
      printer.println(`Balance: ${invoiceData.balance.toFixed(2)}`);
    } else {
      printer.println(`Received: ${invoiceData.receivedAmount.toFixed(2)}`);
      printer.println(`Balance: ${invoiceData.balance.toFixed(2)}`);
    }

    // Footer
    printer.alignCenter();
    printer.drawLine();
    printer.println("Thank you for your business!");
    
    // Cut paper
    printer.cut();
    
    // Execute print job
    await printer.execute();
    
    return true;
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw error;
  }
}

module.exports = { printInvoice };
