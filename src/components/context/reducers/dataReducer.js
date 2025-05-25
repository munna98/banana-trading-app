// context/reducers/dataReducer.js
import { ActionTypes } from '../types/actionTypes.js';

export function dataReducer(state, action) {
  switch (action.type) {
    // --- Core Trading Models (Non-Transactional Data) ---

    // Items
    case ActionTypes.SET_ITEMS:
      return { ...state, items: action.payload };
    case ActionTypes.ADD_ITEM:
      return { ...state, items: [...state.items, action.payload] };
    case ActionTypes.UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case ActionTypes.DELETE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    // Suppliers
    case ActionTypes.SET_SUPPLIERS:
      return { ...state, suppliers: action.payload };
    case ActionTypes.ADD_SUPPLIER:
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case ActionTypes.UPDATE_SUPPLIER:
      return {
        ...state,
        suppliers: state.suppliers.map(supplier =>
          supplier.id === action.payload.id ? action.payload : supplier
        )
      };
    case ActionTypes.DELETE_SUPPLIER:
      return {
        ...state,
        suppliers: state.suppliers.filter(supplier => supplier.id !== action.payload)
      };
    case ActionTypes.SELECT_SUPPLIER: // Keeping selection here as it relates to supplier data
      return { ...state, selectedSupplier: action.payload };

    // Customers
    case ActionTypes.SET_CUSTOMERS:
      return { ...state, customers: action.payload };
    case ActionTypes.ADD_CUSTOMER:
      return { ...state, customers: [...state.customers, action.payload] };
    case ActionTypes.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    case ActionTypes.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    case ActionTypes.SELECT_CUSTOMER: // Keeping selection here as it relates to customer data
      return { ...state, selectedCustomer: action.payload };

    // Expenses (Assuming these refer to managing Expense Categories, not individual expense transactions)
    case ActionTypes.SET_EXPENSES: // This action type might be better named SET_EXPENSE_CATEGORIES if it's about the model
      return { ...state, expenses: action.payload };
    case ActionTypes.ADD_EXPENSE:
      return { ...state, expenses: [...state.expenses, action.payload] };
    case ActionTypes.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case ActionTypes.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };

    // --- Accounting & Inventory System Models (Non-Transactional Data) ---

    // Accounts
    case ActionTypes.SET_ACCOUNTS:
      return { ...state, accounts: action.payload };
    case ActionTypes.ADD_ACCOUNT:
      return { ...state, accounts: [...state.accounts, action.payload] };
    case ActionTypes.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        )
      };
    case ActionTypes.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload)
      };

    // Expense Categories (Explicitly for the ExpenseCategory model)
    case ActionTypes.SET_EXPENSE_CATEGORIES:
      return { ...state, expenseCategories: action.payload };
    case ActionTypes.ADD_EXPENSE_CATEGORY:
      return { ...state, expenseCategories: [...state.expenseCategories, action.payload] };
    case ActionTypes.UPDATE_EXPENSE_CATEGORY:
      return {
        ...state,
        expenseCategories: state.expenseCategories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };
    case ActionTypes.DELETE_EXPENSE_CATEGORY:
      return {
        ...state,
        expenseCategories: state.expenseCategories.filter(category => category.id !== action.payload)
      };

    // Cash Book Entries
    case ActionTypes.SET_CASH_BOOK_ENTRIES:
      return { ...state, cashBookEntries: action.payload };
    case ActionTypes.ADD_CASH_BOOK_ENTRY:
      return { ...state, cashBookEntries: [...state.cashBookEntries, action.payload] };
    case ActionTypes.UPDATE_CASH_BOOK_ENTRY:
      return {
        ...state,
        cashBookEntries: state.cashBookEntries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        )
      };
    case ActionTypes.DELETE_CASH_BOOK_ENTRY:
      return {
        ...state,
        cashBookEntries: state.cashBookEntries.filter(entry => entry.id !== action.payload)
      };

    // Bank Transactions
    case ActionTypes.SET_BANK_TRANSACTIONS:
      return { ...state, bankTransactions: action.payload };
    case ActionTypes.ADD_BANK_TRANSACTION:
      return { ...state, bankTransactions: [...state.bankTransactions, action.payload] };
    case ActionTypes.UPDATE_BANK_TRANSACTION:
      return {
        ...state,
        bankTransactions: state.bankTransactions.map(bankTrans =>
          bankTrans.id === action.payload.id ? action.payload : bankTrans
        )
      };
    case ActionTypes.DELETE_BANK_TRANSACTION:
      return {
        ...state,
        bankTransactions: state.bankTransactions.filter(bankTrans => bankTrans.id !== action.payload)
      };

    // Reporting Periods
    case ActionTypes.SET_REPORTING_PERIODS:
      return { ...state, reportingPeriods: action.payload };
    case ActionTypes.ADD_REPORTING_PERIOD:
      return { ...state, reportingPeriods: [...state.reportingPeriods, action.payload] };
    case ActionTypes.UPDATE_REPORTING_PERIOD:
      return {
        ...state,
        reportingPeriods: state.reportingPeriods.map(period =>
          period.id === action.payload.id ? action.payload : period
        )
      };
    case ActionTypes.DELETE_REPORTING_PERIOD:
      return {
        ...state,
        reportingPeriods: state.reportingPeriods.filter(period => period.id !== action.payload)
      };

    // Inventory Snapshots
    case ActionTypes.SET_INVENTORY_SNAPSHOTS:
      return { ...state, inventorySnapshots: action.payload };
    case ActionTypes.ADD_INVENTORY_SNAPSHOT:
      return { ...state, inventorySnapshots: [...state.inventorySnapshots, action.payload] };
    case ActionTypes.UPDATE_INVENTORY_SNAPSHOT:
      return {
        ...state,
        inventorySnapshots: state.inventorySnapshots.map(snapshot =>
          snapshot.id === action.payload.id ? action.payload : snapshot
        )
      };
    case ActionTypes.DELETE_INVENTORY_SNAPSHOT:
      return {
        ...state,
        inventorySnapshots: state.inventorySnapshots.filter(snapshot => snapshot.id !== action.payload)
      };

    // --- General Application State (Non-Entity Specific) ---
    case ActionTypes.UPDATE_STATS:
      return { ...state, stats: action.payload };
    case ActionTypes.UPDATE_SETTINGS:
      return { ...state, settings: action.payload };

    default:
      return state;
  }
}