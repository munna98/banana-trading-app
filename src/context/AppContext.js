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
  items: [],
  suppliers: [],
  customers: [],
  purchases: [],
  sales: [],
  expenses: [],
  selectedItems: [],
  selectedSuppliers: [],
  selectedCustomers: [],
  loading: {},
  error: null
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
    
    // Quick accessors (use safe state with fallbacks)
    items: safeState.items || [],
    suppliers: safeState.suppliers || [],
    customers: safeState.customers || [],
    purchases: safeState.purchases || [],
    sales: safeState.sales || [],
    expenses: safeState.expenses || [],
    
    // UI state
    selectedItems: safeState.selectedItems || [],
    selectedSuppliers: safeState.selectedSuppliers || [],
    selectedCustomers: safeState.selectedCustomers || []
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}