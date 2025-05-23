// lib/calculations.js - Business logic and calculations for Banana Trading System

// Weight and quantity calculations
export const weightCalculations = {
  // Calculate net weight after deduction (default 1.5kg per bunch)
  calculateNetWeight: (grossWeight, deductionPerBunch = 1.5, bunches = 1) => {
    const totalDeduction = deductionPerBunch * bunches;
    const netWeight = Math.max(0, grossWeight - totalDeduction);
    return parseFloat(netWeight.toFixed(2));
  },

  // Calculate total bunches from weight
  calculateBunches: (totalWeight, averageWeightPerBunch = 15) => {
    return Math.round(totalWeight / averageWeightPerBunch);
  },

  // Calculate gross weight from net weight
  calculateGrossWeight: (netWeight, deductionPerBunch = 1.5, bunches = 1) => {
    const totalDeduction = deductionPerBunch * bunches;
    return parseFloat((netWeight + totalDeduction).toFixed(2));
  },

  // Weight conversion utilities
  convertKgToGrams: (kg) => kg * 1000,
  convertGramsToKg: (grams) => grams / 1000,
  convertPoundsToKg: (pounds) => pounds * 0.453592,
  convertKgToPounds: (kg) => kg / 0.453592,
};

// Purchase calculations
export const purchaseCalculations = {
  // Calculate purchase item amount
  calculateItemAmount: (quantity, rate, weightDeduction = 1.5) => {
    const netQuantity = Math.max(0, quantity - weightDeduction);
    const amount = netQuantity * rate;
    return {
      netQuantity: parseFloat(netQuantity.toFixed(2)),
      amount: parseFloat(amount.toFixed(2))
    };
  },

  // Calculate total purchase amount
  calculatePurchaseTotal: (items) => {
    const total = items.reduce((sum, item) => {
      const { amount } = purchaseCalculations.calculateItemAmount(
        item.quantity, 
        item.rate, 
        item.weightDeduction || 1.5
      );
      return sum + amount;
    }, 0);
    return parseFloat(total.toFixed(2));
  },

  // Calculate purchase balance
  calculatePurchaseBalance: (totalAmount, paidAmount = 0) => {
    const balance = totalAmount - paidAmount;
    return parseFloat(balance.toFixed(2));
  },

  // Calculate average purchase rate
  calculateAverageRate: (purchases) => {
    if (purchases.length === 0) return 0;
    
    const totalAmount = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalQuantity = purchases.reduce((sum, p) => {
      return sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
    
    return totalQuantity > 0 ? parseFloat((totalAmount / totalQuantity).toFixed(2)) : 0;
  }
};

// Sales calculations
export const salesCalculations = {
  // Calculate sale item amount
  calculateItemAmount: (quantity, rate) => {
    const amount = quantity * rate;
    return parseFloat(amount.toFixed(2));
  },

  // Calculate total sale amount
  calculateSaleTotal: (items) => {
    const total = items.reduce((sum, item) => {
      return sum + salesCalculations.calculateItemAmount(item.quantity, item.rate);
    }, 0);
    return parseFloat(total.toFixed(2));
  },

  // Calculate sale balance
  calculateSaleBalance: (totalAmount, receivedAmount = 0) => {
    const balance = totalAmount - receivedAmount;
    return parseFloat(balance.toFixed(2));
  },

  // Calculate profit margin
  calculateProfitMargin: (salePrice, costPrice) => {
    if (costPrice === 0) return 0;
    const profit = salePrice - costPrice;
    const margin = (profit / costPrice) * 100;
    return parseFloat(margin.toFixed(2));
  },

  // Calculate markup percentage
  calculateMarkup: (salePrice, costPrice) => {
    if (costPrice === 0) return 0;
    const markup = ((salePrice - costPrice) / costPrice) * 100;
    return parseFloat(markup.toFixed(2));
  }
};

// Balance and payment calculations
export const balanceCalculations = {
  // Calculate supplier balance
  calculateSupplierBalance: (purchases, payments) => {
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalPurchases - totalPayments;
    return parseFloat(balance.toFixed(2));
  },

  // Calculate customer balance
  calculateCustomerBalance: (sales, receipts) => {
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalReceipts = receipts.reduce((sum, r) => sum + r.amount, 0);
    const balance = totalSales - totalReceipts;
    return parseFloat(balance.toFixed(2));
  },

  // Calculate outstanding amounts
  calculateOutstandingAmounts: (suppliers, customers) => {
    const suppliersOwed = suppliers.reduce((sum, s) => sum + Math.max(0, s.balance), 0);
    const customersOwe = customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
    
    return {
      suppliersOwed: parseFloat(suppliersOwed.toFixed(2)),
      customersOwe: parseFloat(customersOwe.toFixed(2)),
      netBalance: parseFloat((customersOwe - suppliersOwed).toFixed(2))
    };
  }
};

// Financial calculations
export const financialCalculations = {
  // Calculate gross profit
  calculateGrossProfit: (sales, purchases) => {
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    return parseFloat((totalSales - totalPurchases).toFixed(2));
  },

  // Calculate net profit (after expenses)
  calculateNetProfit: (sales, purchases, expenses) => {
    const grossProfit = financialCalculations.calculateGrossProfit(sales, purchases);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    return parseFloat((grossProfit - totalExpenses).toFixed(2));
  },

  // Calculate profit margin percentage
  calculateProfitMarginPercentage: (profit, sales) => {
    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    if (totalSales === 0) return 0;
    return parseFloat(((profit / totalSales) * 100).toFixed(2));
  },

  // Calculate return on investment
  calculateROI: (profit, investment) => {
    if (investment === 0) return 0;
    return parseFloat(((profit / investment) * 100).toFixed(2));
  },

  // Calculate cash flow
  calculateCashFlow: (receipts, payments, expenses) => {
    const totalReceipts = receipts.reduce((sum, r) => sum + r.amount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      inflow: parseFloat(totalReceipts.toFixed(2)),
      outflow: parseFloat((totalPayments + totalExpenses).toFixed(2)),
      netFlow: parseFloat((totalReceipts - totalPayments - totalExpenses).toFixed(2))
    };
  }
};

// Inventory calculations
export const inventoryCalculations = {
  // Calculate current stock levels
  calculateStockLevels: (purchases, sales) => {
    const stockLevels = {};
    
    // Add purchases to stock
    purchases.forEach(purchase => {
      purchase.items.forEach(item => {
        if (!stockLevels[item.itemId]) {
          stockLevels[item.itemId] = { purchased: 0, sold: 0, current: 0 };
        }
        const netQuantity = Math.max(0, item.quantity - (item.weightDeduction || 1.5));
        stockLevels[item.itemId].purchased += netQuantity;
      });
    });
    
    // Subtract sales from stock
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!stockLevels[item.itemId]) {
          stockLevels[item.itemId] = { purchased: 0, sold: 0, current: 0 };
        }
        stockLevels[item.itemId].sold += item.quantity;
      });
    });
    
    // Calculate current stock
    Object.keys(stockLevels).forEach(itemId => {
      stockLevels[itemId].current = Math.max(0, 
        stockLevels[itemId].purchased - stockLevels[itemId].sold
      );
      
      // Round to 2 decimal places
      Object.keys(stockLevels[itemId]).forEach(key => {
        stockLevels[itemId][key] = parseFloat(stockLevels[itemId][key].toFixed(2));
      });
    });
    
    return stockLevels;
  },

  // Calculate stock turnover ratio
  calculateStockTurnover: (costOfGoodsSold, averageInventory) => {
    if (averageInventory === 0) return 0;
    return parseFloat((costOfGoodsSold / averageInventory).toFixed(2));
  },

  // Calculate stock value
  calculateStockValue: (stockLevels, latestRates) => {
    let totalValue = 0;
    
    Object.keys(stockLevels).forEach(itemId => {
      const currentStock = stockLevels[itemId].current;
      const rate = latestRates[itemId] || 0;
      totalValue += currentStock * rate;
    });
    
    return parseFloat(totalValue.toFixed(2));
  }
};

// Statistical calculations
export const statisticalCalculations = {
  // Calculate average
  average: (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
  },

  // Calculate median
  median: (numbers) => {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
    }
    return sorted[mid];
  },

  // Calculate growth rate
  calculateGrowthRate: (currentValue, previousValue) => {
    if (previousValue === 0) return 0;
    return parseFloat((((currentValue - previousValue) / previousValue) * 100).toFixed(2));
  },

  // Calculate moving average
  movingAverage: (data, period) => {
    if (data.length < period) return data;
    
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(parseFloat((sum / period).toFixed(2)));
    }
    return result;
  }
};

// Utility functions
export const calculationUtils = {
  // Round to specified decimal places
  round: (number, decimals = 2) => {
    return parseFloat(number.toFixed(decimals));
  },

  // Format currency
  formatCurrency: (amount, currency = '₹') => {
    return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  },

  // Format percentage
  formatPercentage: (value) => {
    return `${value.toFixed(2)}%`;
  },

  // Safe division
  safeDivide: (numerator, denominator, defaultValue = 0) => {
    return denominator === 0 ? defaultValue : numerator / denominator;
  },

  // Calculate percentage
  calculatePercentage: (part, whole) => {
    if (whole === 0) return 0;
    return parseFloat(((part / whole) * 100).toFixed(2));
  },

  // Compare periods
  comparePeriods: (currentData, previousData, metric) => {
    const current = currentData.reduce((sum, item) => sum + item[metric], 0);
    const previous = previousData.reduce((sum, item) => sum + item[metric], 0);
    
    return {
      current: calculationUtils.round(current),
      previous: calculationUtils.round(previous),
      difference: calculationUtils.round(current - previous),
      growthRate: statisticalCalculations.calculateGrowthRate(current, previous)
    };
  }
};

// Export all calculation modules
export default {
  weight: weightCalculations,
  purchase: purchaseCalculations,
  sales: salesCalculations,
  balance: balanceCalculations,
  financial: financialCalculations,
  inventory: inventoryCalculations,
  statistical: statisticalCalculations,
  utils: calculationUtils
};