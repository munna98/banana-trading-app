// types/initialState.js

export const initialState = {
  // Core data arrays
  items: [],
  suppliers: [],
  customers: [],
  purchases: [],
  sales: [],
  expenses: [],
  
  // UI selection state
  selectedItems: [],
  selectedSuppliers: [],
  selectedCustomers: [],
  
  // Loading states for different operations
  loading: {
    items: false,
    suppliers: false,
    customers: false,
    purchases: false,
    sales: false,
    expenses: false,
    general: false
  },
  
  // Error handling
  error: null,
  
  // UI state
  ui: {
    currentPage: 'dashboard',
    sidebarOpen: true,
    theme: 'light',
    notifications: []
  },
  
  // Filters and search
  filters: {
    dateRange: {
      start: null,
      end: null
    },
    itemSearch: '',
    supplierSearch: '',
    customerSearch: '',
    purchaseSearch: '',
    saleSearch: '',
    expenseSearch: ''
  },
  
  // Pagination
  pagination: {
    items: { page: 1, limit: 10, total: 0 },
    suppliers: { page: 1, limit: 10, total: 0 },
    customers: { page: 1, limit: 10, total: 0 },
    purchases: { page: 1, limit: 10, total: 0 },
    sales: { page: 1, limit: 10, total: 0 },
    expenses: { page: 1, limit: 10, total: 0 }
  },
  
  // Form states
  forms: {
    item: {
      isOpen: false,
      mode: 'create', // 'create' or 'edit'
      data: null
    },
    supplier: {
      isOpen: false,
      mode: 'create',
      data: null
    },
    customer: {
      isOpen: false,
      mode: 'create',
      data: null
    },
    purchase: {
      isOpen: false,
      mode: 'create',
      data: null
    },
    sale: {
      isOpen: false,
      mode: 'create',
      data: null
    },
    expense: {
      isOpen: false,
      mode: 'create',
      data: null
    }
  },
  
  // Settings
  settings: {
    currency: 'INR',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    taxRate: 0,
    companyInfo: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    }
  },
  
  // Cache for performance
  cache: {
    lastFetch: {
      items: null,
      suppliers: null,
      customers: null,
      purchases: null,
      sales: null,
      expenses: null
    }
  }
};