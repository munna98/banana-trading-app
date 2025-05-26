// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer } from './reducers/appReducer.js';
import { initialState } from './types/initialState.js';
import { useDataFetching } from './hooks/useDataFetching.js';
import { useStats } from './hooks/useStats.js';

// Create the context
const AppContext = createContext();

// Custom hook to use the AppContext
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Default state structure to prevent undefined errors
const defaultState = {
  // Core Trading Data
  items: [],
  suppliers: [],
  customers: [],
  purchases: [],
  sales: [],
  purchaseItems: [],
  saleItems: [],
  
  // Payment & Receipt Management
  payments: [],
  receipts: [],
  
  // Accounting System
  transactions: [],
  transactionEntries: [],
  accounts: [],
  expenseCategories: [],
  cashBook: [],
  bankTransactions: [],
  
  // Reporting & Analytics
  reportingPeriods: [],
  inventorySnapshots: [],
  
  // UI State
  selectedItems: [],
  selectedSuppliers: [],
  selectedCustomers: [],
  selectedPurchases: [],
  selectedSales: [],
  selectedPayments: [],
  selectedReceipts: [],
  selectedTransactions: [],
  selectedAccounts: [],
  
  // Filter States
  filters: {
    dateRange: { start: null, end: null },
    paymentMethod: null,
    transactionType: null,
    accountType: null,
    isReconciled: null,
    supplier: null,
    customer: null,
    item: null
  },
  
  // Loading states
  loading: {},
  error: null,
  
  // Cache for computed values
  cache: {
    accountBalances: {},
    supplierBalances: {},
    customerBalances: {},
    itemStock: {},
    lastUpdated: null
  }
};

// AppProvider component
export function AppProvider({ children }) {
  // Ensure initialState has the proper structure
  const safeInitialState = initialState || defaultState;
  const [state, dispatch] = useReducer(appReducer, safeInitialState);
  
  // Ensure state is never undefined by merging with defaults
  const safeState = {
    ...defaultState,
    ...state
  };
  
  // Get data fetching functions
  const dataFetching = useDataFetching(dispatch);
  
  // Get calculated stats (pass the safe state)
  const stats = useStats(safeState);
  
  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dataFetching.fetchAllData();
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Helper functions for balance calculations
  const getSupplierBalance = (supplierId) => {
    const supplier = safeState.suppliers.find(s => s.id === supplierId);
    if (!supplier) return 0;
    
    const totalPurchases = safeState.purchases
      .filter(p => p.supplierId === supplierId)
      .reduce((sum, p) => sum + p.totalAmount, 0);
    
    const totalPayments = safeState.payments
      .filter(p => p.supplierId === supplierId)
      .reduce((sum, p) => sum + p.amount, 0);
    
    return totalPurchases - totalPayments;
  };
  
  const getCustomerBalance = (customerId) => {
    const customer = safeState.customers.find(c => c.id === customerId);
    if (!customer) return 0;
    
    const totalSales = safeState.sales
      .filter(s => s.customerId === customerId)
      .reduce((sum, s) => sum + s.totalAmount, 0);
    
    const totalReceipts = safeState.receipts
      .filter(r => r.customerId === customerId)
      .reduce((sum, r) => sum + r.amount, 0);
    
    return totalSales - totalReceipts;
  };
  
  const getAccountBalance = (accountId) => {
    const entries = safeState.transactionEntries.filter(e => e.accountId === accountId);
    return entries.reduce((balance, entry) => {
      return balance + entry.debitAmount - entry.creditAmount;
    }, 0);
  };
  
  const getItemCurrentStock = (itemId) => {
    const item = safeState.items.find(i => i.id === itemId);
    return item ? item.currentStock : 0;
  };
  
  // Helper functions for filtering
  const getFilteredData = (dataType, filters = {}) => {
    const data = safeState[dataType] || [];
    
    return data.filter(item => {
      // Date range filter
      if (filters.dateRange?.start && filters.dateRange?.end) {
        const itemDate = new Date(item.date || item.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (itemDate < startDate || itemDate > endDate) return false;
      }
      
      // Payment method filter
      if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      
      // Transaction type filter
      if (filters.transactionType && item.type !== filters.transactionType) {
        return false;
      }
      
      // Account type filter
      if (filters.accountType && item.type !== filters.accountType) {
        return false;
      }
      
      // Supplier filter
      if (filters.supplier && item.supplierId !== filters.supplier) {
        return false;
      }
      
      // Customer filter
      if (filters.customer && item.customerId !== filters.customer) {
        return false;
      }
      
      // Item filter
      if (filters.item && item.itemId !== filters.item) {
        return false;
      }
      
      return true;
    });
  };
  
  // Context value
  const contextValue = {
    // State (use safe state)
    state: safeState,
    dispatch,
    
    // Stats
    stats,
    
    // Data fetching functions
    ...dataFetching,
    
    // Helper functions
    isLoading: (key) => safeState.loading?.[key] || false,
    hasError: () => !!safeState.error,
    getError: () => safeState.error,
    
    // Balance calculations
    getSupplierBalance,
    getCustomerBalance,
    getAccountBalance,
    getItemCurrentStock,
    
    // Data filtering
    getFilteredData,
    
    // Quick accessors (use safe state with fallbacks)
    items: safeState.items || [],
    suppliers: safeState.suppliers || [],
    customers: safeState.customers || [],
    purchases: safeState.purchases || [],
    sales: safeState.sales || [],
    purchaseItems: safeState.purchaseItems || [],
    saleItems: safeState.saleItems || [],
    payments: safeState.payments || [],
    receipts: safeState.receipts || [],
    transactions: safeState.transactions || [],
    transactionEntries: safeState.transactionEntries || [],
    accounts: safeState.accounts || [],
    expenseCategories: safeState.expenseCategories || [],
    cashBook: safeState.cashBook || [],
    bankTransactions: safeState.bankTransactions || [],
    reportingPeriods: safeState.reportingPeriods || [],
    inventorySnapshots: safeState.inventorySnapshots || [],
    
    // UI state
    selectedItems: safeState.selectedItems || [],
    selectedSuppliers: safeState.selectedSuppliers || [],
    selectedCustomers: safeState.selectedCustomers || [],
    selectedPurchases: safeState.selectedPurchases || [],
    selectedSales: safeState.selectedSales || [],
    selectedPayments: safeState.selectedPayments || [],
    selectedReceipts: safeState.selectedReceipts || [],
    selectedTransactions: safeState.selectedTransactions || [],
    selectedAccounts: safeState.selectedAccounts || [],
    
    // Filters
    filters: safeState.filters || defaultState.filters,
    
    // Cache
    cache: safeState.cache || defaultState.cache,
    
    // Enum values for dropdowns/forms
    enums: {
      unitTypes: ['KG', 'PIECE'],
      paymentMethods: ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD'],
      transactionTypes: [
        'PURCHASE', 'SALE', 'PAYMENT', 'RECEIPT', 
        'EXPENSE', 'BANK_CHARGE', 'OPENING_BALANCE', 'ADJUSTMENT'
      ],
      accountTypes: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']
    },
    
    // Summary data helpers
    getSummaryData: () => ({
      totalSuppliers: safeState.suppliers.length,
      totalCustomers: safeState.customers.length,
      totalItems: safeState.items.length,
      totalPurchases: safeState.purchases.length,
      totalSales: safeState.sales.length,
      totalPayments: safeState.payments.length,
      totalReceipts: safeState.receipts.length,
      totalTransactions: safeState.transactions.length,
      pendingSupplierPayments: safeState.suppliers.filter(s => getSupplierBalance(s.id) > 0).length,
      pendingCustomerReceipts: safeState.customers.filter(c => getCustomerBalance(c.id) > 0).length,
      lowStockItems: safeState.items.filter(i => i.currentStock < 10).length,
      unreconciledBankTransactions: safeState.bankTransactions.filter(bt => !bt.isReconciled).length
    })
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}