// context/initialState.js

export const initialState = {
  // Global UI States (managed by uiReducer)
  ui: {
    loading: false,
    error: null, // Stores any global error message or object
    // These could be general app settings that influence UI behavior or presentation
    settings: {
      theme: 'light',
      currencySymbol: '₹', // Example UI setting
      dateFormat: 'DD-MM-YYYY', // Example UI setting
      // ... any other UI-specific settings
    },
    // Stats that are derived/calculated and primarily displayed in the UI
    stats: {
      totalItems: 0,
      totalSuppliers: 0,
      totalCustomers: 0,
      totalPurchasesValue: 0,
      totalSalesValue: 0,
      // ... more dashboard-type stats
    },
    // Note: selectedSupplier and selectedCustomer are moved to the 'data' slice for entity selection
    // If you prefer to manage current selections purely as UI state, you could keep them here
    // e.g., selectedSupplierId: null, selectedCustomerId: null,
  },

  // Core Application Data (managed by dataReducer)
  data: {
    items: [],
    suppliers: [],
    customers: [],
    expenses: [], // Assuming this refers to managing Expense Categories, not individual expense transactions
    accounts: [],
    expenseCategories: [],
    cashBookEntries: [],
    bankTransactions: [],
    reportingPeriods: [],
    inventorySnapshots: [],
    selectedSupplier: null, // Stores the full selected supplier object, if any
    selectedCustomer: null, // Stores the full selected customer object, if any
  },

  // Transactional Data (managed by transactionReducer)
  transactions: {
    purchases: [],
    sales: [],
    payments: [],
    receipts: [],
    transactions: [], // General financial transactions
  },

  // You might have other top-level slices for authentication, user, etc.
  // auth: {
  //   isAuthenticated: false,
  //   user: null,
  //   token: null,
  // },
};