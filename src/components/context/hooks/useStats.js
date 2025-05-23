// context/hooks/useStats.js
import { useMemo } from 'react';

export function useStats(state) {
  const stats = useMemo(() => {
    const { purchases, sales, expenses, suppliers, customers, items } = state;

    // Calculate total purchases
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    
    // Calculate total sales
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate profit/loss
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;
    
    // Calculate outstanding balances
    const supplierBalance = suppliers.reduce((sum, supplier) => sum + (supplier.balance || 0), 0);
    const customerBalance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);
    
    // Calculate pending amounts
    const pendingPurchases = purchases.reduce((sum, purchase) => sum + (purchase.balance || 0), 0);
    const pendingSales = sales.reduce((sum, sale) => sum + (sale.balance || 0), 0);
    
    // Calculate current month stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthPurchases = purchases
      .filter(p => {
        const date = new Date(p.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, purchase) => sum + purchase.totalAmount, 0);
    
    const currentMonthSales = sales
      .filter(s => {
        const date = new Date(s.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const currentMonthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate inventory value (if items have cost and stock)
    const inventoryValue = items.reduce((sum, item) => {
      const stock = item.stock || 0;
      const cost = item.cost || 0;
      return sum + (stock * cost);
    }, 0);
    
    // Top performing items by sales
    const itemSalesMap = new Map();
    sales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(saleItem => {
          const itemId = saleItem.itemId;
          const currentTotal = itemSalesMap.get(itemId) || { quantity: 0, amount: 0, name: saleItem.item?.name || 'Unknown' };
          itemSalesMap.set(itemId, {
            ...currentTotal,
            quantity: currentTotal.quantity + saleItem.quantity,
            amount: currentTotal.amount + saleItem.amount
          });
        });
      }
    });
    
    const topSellingItems = Array.from(itemSalesMap.entries())
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Calculate cash flow
    const totalReceived = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0);
    const totalPaid = purchases.reduce((sum, purchase) => sum + (purchase.paidAmount || 0), 0) + totalExpenses;
    const cashFlow = totalReceived - totalPaid;
    
    return {
      // Totals
      totalPurchases,
      totalSales,
      totalExpenses,
      
      // Profit/Loss
      grossProfit,
      netProfit,
      profitMargin: totalSales > 0 ? ((grossProfit / totalSales) * 100).toFixed(2) : 0,
      
      // Balances
      supplierBalance,
      customerBalance,
      pendingPurchases,
      pendingSales,
      
      // Current Month
      currentMonthPurchases,
      currentMonthSales,
      currentMonthExpenses,
      currentMonthProfit: currentMonthSales - currentMonthPurchases - currentMonthExpenses,
      
      // Inventory
      inventoryValue,
      totalItems: items.length,
      
      // Performance
      topSellingItems,
      
      // Cash Flow
      cashFlow,
      totalReceived,
      totalPaid,
      
      // Counts
      totalSuppliers: suppliers.length,
      totalCustomers: customers.length,
      totalTransactions: purchases.length + sales.length
    };
  }, [state]);

  return stats;
}