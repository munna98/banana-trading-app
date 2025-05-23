// context/reducers/dataReducer.js
import { ActionTypes } from '../types/actionTypes.js';

export function dataReducer(state, action) {
  switch (action.type) {
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
    
    // Expenses
    case ActionTypes.SET_EXPENSES:
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
    
    default:
      return state;
  }
}