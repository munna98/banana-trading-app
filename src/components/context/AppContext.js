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

// AppProvider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Get data fetching functions
  const dataFetching = useDataFetching(dispatch);
  
  // Get calculated stats
  const stats = useStats(state);
  
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
    // State
    state,
    dispatch,
    
    // Stats
    stats,
    
    // Data fetching functions
    ...dataFetching,
    
    // Helper functions
    isLoading: (key) => state.loading[key] || false,
    hasError: () => !!state.error,
    getError: () => state.error,
    
    // Quick accessors
    items: state.items,
    suppliers: state.suppliers,
    customers: state.customers,
    purchases: state.purchases,
    sales: state.sales,
    expenses: state.expenses,
    
    // UI state
    selectedItems: state.selectedItems,
    selectedSuppliers: state.selectedSuppliers,
    selectedCustomers: state.selectedCustomers
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}