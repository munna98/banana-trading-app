// context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { combineReducers } from 'redux'; // Import combineReducers
import { initialState } from './initialState.js'; // Corrected path to initialState.js
import { useDataFetching } from './hooks/useDataFetching.js';
import { useStats } from './hooks/useStats.js';
import { ActionTypes } from './types/actionTypes.js'; // Make sure ActionTypes is imported for SET_ERROR

// Import your individual reducers
import { uiReducer } from './reducers/uiReducer.js';
import { dataReducer } from './reducers/dataReducer.js';
import { transactionReducer } from './reducers/transactionReducer.js';

// Combine the reducers into a single root reducer
const rootReducer = combineReducers({
  ui: uiReducer,
  data: dataReducer,
  transactions: transactionReducer,
  // Add other reducers here if you create more (e.g., authReducer)
});

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
  // Use the combined rootReducer with the structured initialState
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Get data fetching functions
  const dataFetching = useDataFetching(dispatch);

  // Get calculated stats - Pass the ENTIRE state object
  const stats = useStats(state); // <--- This is the crucial change!

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dataFetching.fetchAllData();
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Dispatch an error action to update UI state
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message || 'An error occurred' });
      }
    };

    loadInitialData();
  }, [dataFetching, dispatch]); // Added dispatch and dataFetching to dependency array

  // Context value
  const contextValue = {
    // State
    state, // The entire combined state object
    dispatch,

    // Stats (calculated from useStats hook)
    stats,

    // Data fetching functions
    ...dataFetching, // This spread assumes useDataFetching returns an object of functions

    // Helper functions - now accessing 'ui' slice for loading/error
    isLoading: () => state.ui.loading, // Assuming a single global loading flag in ui.loading
    hasError: () => !!state.ui.error,
    getError: () => state.ui.error,

    // Quick accessors - now accessing through nested state structure
    // Core Trading Data
    items: state.data.items,
    suppliers: state.data.suppliers,
    customers: state.data.customers,
    expenses: state.data.expenses, // If expense refers to categories/types

    // Transactional Data
    purchases: state.transactions.purchases,
    sales: state.transactions.sales,
    payments: state.transactions.payments,
    receipts: state.transactions.receipts,
    transactions: state.transactions.transactions, // General accounting transactions

    // Accounting & Inventory Data
    accounts: state.data.accounts,
    expenseCategories: state.data.expenseCategories,
    cashBookEntries: state.data.cashBookEntries,
    bankTransactions: state.data.bankTransactions,
    reportingPeriods: state.data.reportingPeriods,
    inventorySnapshots: state.data.inventorySnapshots,

    // Selected Entities (from data slice)
    selectedSupplier: state.data.selectedSupplier,
    selectedCustomer: state.data.selectedCustomer,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}