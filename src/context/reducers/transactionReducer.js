// context/reducers/transactionReducer.js
import { ActionTypes } from '../types/actionTypes.js';

export function transactionReducer(state, action) {
  switch (action.type) {
    // Purchases
    case ActionTypes.SET_PURCHASES:
      return { ...state, purchases: action.payload };
    
    case ActionTypes.ADD_PURCHASE:
      return { ...state, purchases: [...state.purchases, action.payload] };
    
    case ActionTypes.UPDATE_PURCHASE:
      return {
        ...state,
        purchases: state.purchases.map(purchase =>
          purchase.id === action.payload.id ? action.payload : purchase
        )
      };
    
    case ActionTypes.DELETE_PURCHASE:
      return {
        ...state,
        purchases: state.purchases.filter(purchase => purchase.id !== action.payload)
      };
    
    // Sales
    case ActionTypes.SET_SALES:
      return { ...state, sales: action.payload };
    
    case ActionTypes.ADD_SALE:
      return { ...state, sales: [...state.sales, action.payload] };
    
    case ActionTypes.UPDATE_SALE:
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id ? action.payload : sale
        )
      };
    
    case ActionTypes.DELETE_SALE:
      return {
        ...state,
        sales: state.sales.filter(sale => sale.id !== action.payload)
      };
    
    // Payments
    case ActionTypes.SET_PAYMENTS:
      return { ...state, payments: action.payload };
    
    case ActionTypes.ADD_PAYMENT:
      return { ...state, payments: [...state.payments, action.payload] };
    
    // Receipts
    case ActionTypes.SET_RECEIPTS:
      return { ...state, receipts: action.payload };
    
    case ActionTypes.ADD_RECEIPT:
      return { ...state, receipts: [...state.receipts, action.payload] };
    
    default:
      return state;
  }
}