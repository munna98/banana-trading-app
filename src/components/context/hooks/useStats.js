// context/hooks/useStats.js
import { useMemo } from 'react';

export function useStats(state) {
  const stats = useMemo(() => {
    // Destructure relevant data from the nested state slices
    const { items, suppliers, customers, expenses, accounts, cashBookEntries, bankTransactions } = state.data;
    const { purchases, sales, payments, receipts, transactions } = state.transactions;

    // --- Core Financial Calculations ---

    // Calculate total purchases value
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

    // Calculate total sales value
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate total expenses (assuming 'expenses' here refers to individual expense transactions linked to the 'Transaction' model, or the 'ExpenseCategory' model)
    // If 'expenses' in state.data is a list of *categories*, then this calculation should use 'transactions' filtered by expense type.
    // For now, assuming state.data.expenses are actual expense records with an 'amount'.
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate gross profit and net profit
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses; // Basic net profit before other income/deductions

    // --- Balance and Pending Amounts ---

    // Calculate outstanding balances (assuming 'balance' property exists on supplier/customer objects)
    const supplierBalance = suppliers.reduce((sum, supplier) => sum + (supplier.balance || 0), 0);
    const customerBalance = customers.reduce((sum, customer) => sum + (customer.balance || 0), 0);

    // Calculate pending amounts from purchases and sales (if they track balance directly)
    const pendingPurchases = purchases.reduce((sum, purchase) => sum + (purchase.balance || 0), 0);
    const pendingSales = sales.reduce((sum, sale) => sum + (sale.balance || 0), 0);

    // --- Current Month Stats ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

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

    // --- Inventory Stats ---

    // Calculate inventory value (if items have cost and current stock)
    const inventoryValue = items.reduce((sum, item) => {
      const stock = item.stock || 0;
      const cost = item.cost || 0; // Assuming 'cost' or 'unitPrice'
      return sum + (stock * cost);
    }, 0);

    // --- Performance Metrics ---

    // Top performing items by sales
    const itemSalesMap = new Map();
    sales.forEach(sale => {
      // Assuming sale.items is an array of sale line items
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(saleItem => {
          const itemId = saleItem.itemId;
          // Ensure item is available in `items` array for name lookup
          const itemDetail = items.find(i => i.id === itemId);
          const itemName = itemDetail ? itemDetail.name : 'Unknown Item';

          const currentTotal = itemSalesMap.get(itemId) || { quantity: 0, amount: 0, name: itemName };
          itemSalesMap.set(itemId, {
            ...currentTotal,
            quantity: currentTotal.quantity + (saleItem.quantity || 0),
            amount: currentTotal.amount + (saleItem.amount || 0) // Assuming saleItem.amount is total for this line item
          });
        });
      }
    });

    const topSellingItems = Array.from(itemSalesMap.entries())
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Get top 5

    // --- Cash Flow (more detailed with Payments & Receipts) ---
    // Assuming 'payments' are money paid out (e.g., to suppliers, for expenses)
    // Assuming 'receipts' are money received (e.g., from customers)

    const totalPaymentsMade = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalReceiptsReceived = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

    // Cash flow based on actual payments and receipts
    const operationalCashFlow = totalReceiptsReceived - totalPaymentsMade - totalExpenses; // Basic cash flow

    // Cash in bank (simple sum, more complex if considering opening balances and specific accounts)
    const totalCashInBank = bankTransactions.reduce((sum, bt) => sum + bt.amount, 0);
    const totalCashInHand = cashBookEntries.reduce((sum, cbe) => sum + cbe.amount, 0);
    const totalAvailableCash = totalCashInBank + totalCashInHand;


    return {
      // Totals
      totalPurchases,
      totalSales,
      totalExpenses, // Overall expenses
      totalPaymentsMade,
      totalReceiptsReceived,

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
      totalItems: items.length, // Count of unique item types

      // Performance
      topSellingItems,

      // Cash Flow
      operationalCashFlow,
      totalAvailableCash,
      totalCashInBank,
      totalCashInHand,

      // Counts
      totalSuppliers: suppliers.length,
      totalCustomers: customers.length,
      // Total transactions includes all entries in the 'transactions' array from the accounting system
      totalGeneralTransactions: transactions.length,
      totalSalesTransactions: sales.length,
      totalPurchaseTransactions: purchases.length,
      totalPaymentTransactions: payments.length,
      totalReceiptTransactions: receipts.length,
    };
  }, [
    state.data.items,
    state.data.suppliers,
    state.data.customers,
    state.data.expenses, // Dependency for expenses calculation
    state.data.accounts, // Included for completeness, though not directly used in these stats
    state.data.cashBookEntries,
    state.data.bankTransactions,
    state.transactions.purchases,
    state.transactions.sales,
    state.transactions.payments,
    state.transactions.receipts,
    state.transactions.transactions, // Dependency for total general transactions
  ]);

  return stats;
}