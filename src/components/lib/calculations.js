// lib/calculations.js - Business logic for calculations

// Constants
export const DEFAULT_WEIGHT_DEDUCTION = 1.5; // kg per bunch
export const TAX_RATE = 0; // No tax for now, can be configured

// Calculate item amount with weight deduction
export const calculateItemAmount = (quantity, rate, weightDeduction = DEFAULT_WEIGHT_DEDUCTION) => {
  if (!quantity || !rate) return 0;
  
  // For bunches, deduct weight per bunch
  const adjustedQuantity = Math.max(0, quantity - weightDeduction);
  return parseFloat((adjustedQuantity * rate).toFixed(2));
};

// Calculate total purchase amount
export const calculatePurchaseTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const itemAmount = calculateItemAmount(
      item.quantity, 
      item.rate, 
      item.weightDeduction || DEFAULT_WEIGHT_DEDUCTION
    );
    return total + itemAmount;
  }, 0);
};

// Calculate total sale amount
export const calculateSaleTotal = (items) => {
  if (!Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const itemAmount = item.quantity * item.rate;
    return total + itemAmount;
  }, 0);
};

// Calculate balance for purchases/sales
export const calculateBalance = (totalAmount, paidAmount) => {
  return parseFloat((totalAmount - paidAmount).toFixed(2));
};

// Calculate supplier balance
export const calculateSupplierBalance = (purchases, payments) => {
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  return parseFloat((totalPurchases - totalPayments).toFixed(2));
};

// Calculate customer balance
export const calculateCustomerBalance = (sales, receipts) => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalReceipts = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  return parseFloat((totalSales - totalReceipts).toFixed(2));
};

// Calculate profit/loss for a period
export const calculateProfitLoss = (sales, purchases, expenses, startDate, endDate) => {
  const filteredSales = filterByDateRange(sales, startDate, endDate);
  const filteredPurchases = filterByDateRange(purchases, startDate, endDate);
  const filteredExpenses = filterByDateRange(expenses, startDate, endDate);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalCost = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;

  return {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    grossProfit: parseFloat(grossProfit.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    grossProfitMargin: totalRevenue > 0 ? parseFloat(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0,
    netProfitMargin: totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(2)) : 0
  };
};

// Calculate inventory value
export const calculateInventoryValue = (items, purchases) => {
  const itemPurchases = groupPurchasesByItem(purchases);
  
  return items.reduce((total, item) => {
    const itemPurchaseData = itemPurchases[item.id] || [];
    const averageRate = calculateAverageRate(itemPurchaseData);
    const currentStock = calculateCurrentStock(item.id, purchases, []); // Assuming no sales data for now
    
    return total + (currentStock * averageRate);
  }, 0);
};

// Calculate average purchase rate for an item
export const calculateAverageRate = (purchaseItems) => {
  if (!purchaseItems.length) return 0;
  
  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = purchaseItems.reduce((sum, item) => sum + (item.quantity - (item.weightDeduction || DEFAULT_WEIGHT_DEDUCTION)), 0);
  
  return totalQuantity > 0 ? parseFloat((totalAmount / totalQuantity).toFixed(2)) : 0;
};

// Calculate current stock for an item
export const calculateCurrentStock = (itemId, purchases, sales) => {
  const purchasedQuantity = purchases
    .flatMap(p => p.items || [])
    .filter(item => item.itemId === itemId)
    .reduce((sum, item) => sum + (item.quantity - (item.weightDeduction || DEFAULT_WEIGHT_DEDUCTION)), 0);

  const soldQuantity = sales
    .flatMap(s => s.items || [])
    .filter(item => item.itemId === itemId)
    .reduce((sum, item) => sum + item.quantity, 0);

  return Math.max(0, purchasedQuantity - soldQuantity);
};

// Calculate payment due dates and overdue amounts
export const calculatePaymentStatus = (transactions, dueDays = 30) => {
  const currentDate = new Date();
  
  return transactions.map(transaction => {
    const transactionDate = new Date(transaction.date);
    const dueDate = new Date(transactionDate);
    dueDate.setDate(dueDate.getDate() + dueDays);
    
    const isOverdue = currentDate > dueDate && transaction.balance > 0;
    const daysOverdue = isOverdue ? Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      ...transaction,
      dueDate,
      isOverdue,
      daysOverdue,
      status: transaction.balance === 0 ? 'paid' : isOverdue ? 'overdue' : 'pending'
    };
  });
};

// Calculate business summary statistics
export const calculateBusinessSummary = (data) => {
  const { purchases, sales, expenses, payments, receipts } = data;
  
  const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalReceipts = receipts.reduce((sum, r) => sum + r.amount, 0);
  
  const outstandingPayables = totalPurchases - totalPayments;
  const outstandingReceivables = totalSales - totalReceipts;
  const netCashFlow = totalReceipts - totalPayments - totalExpenses;
  
  return {
    totalPurchases: parseFloat(totalPurchases.toFixed(2)),
    totalSales: parseFloat(totalSales.toFixed(2)),
    totalExpenses: parseFloat(totalExpenses.toFixed(2)),
    totalPayments: parseFloat(totalPayments.toFixed(2)),
    totalReceipts: parseFloat(totalReceipts.toFixed(2)),
    outstandingPayables: parseFloat(outstandingPayables.toFixed(2)),
    outstandingReceivables: parseFloat(outstandingReceivables.toFixed(2)),
    netCashFlow: parseFloat(netCashFlow.toFixed(2)),
    grossProfit: parseFloat((totalSales - totalPurchases).toFixed(2)),
    netProfit: parseFloat((totalSales - totalPurchases - totalExpenses).toFixed(2))
  };
};

// Helper function to filter data by date range
const filterByDateRange = (data, startDate, endDate) => {
  if (!startDate || !endDate) return data;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
};

// Helper function to group purchases by item
const groupPurchasesByItem = (purchases) => {
  const grouped = {};
  
  purchases.forEach(purchase => {
    if (purchase.items) {
      purchase.items.forEach(item => {
        if (!grouped[item.itemId]) {
          grouped[item.itemId] = [];
        }
        grouped[item.itemId].push(item);
      });
    }
  });
  
  return grouped;
};

// Format currency for display
export const formatCurrency = (amount, currency = '₹') => {
  if (isNaN(amount)) return `${currency}0.00`;
  return `${currency}${parseFloat(amount).toFixed(2)}`;
};

// Format percentage for display
export const formatPercentage = (value) => {
  if (isNaN(value)) return '0.00%';
  return `${parseFloat(value).toFixed(2)}%`;
};

// Validate calculation inputs
export const validateCalculationInputs = (inputs) => {
  const errors = [];
  
  if (inputs.quantity !== undefined && (isNaN(inputs.quantity) || inputs.quantity < 0)) {
    errors.push('Quantity must be a valid positive number');
  }
  
  if (inputs.rate !== undefined && (isNaN(inputs.rate) || inputs.rate < 0)) {
    errors.push('Rate must be a valid positive number');
  }
  
  if (inputs.amount !== undefined && (isNaN(inputs.amount) || inputs.amount < 0)) {
    errors.push('Amount must be a valid positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};  