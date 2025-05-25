// context/reducers/transactionReducer.js
import { ActionTypes } from '../types/actionTypes.js';

export function transactionReducer(state, action) {
  switch (action.type) {
    // --- Core Trading Transactions ---

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
    case ActionTypes.UPDATE_PAYMENT:
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };
    case ActionTypes.DELETE_PAYMENT:
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload)
      };

    // Receipts
    case ActionTypes.SET_RECEIPTS:
      return { ...state, receipts: action.payload };
    case ActionTypes.ADD_RECEIPT:
      return { ...state, receipts: [...state.receipts, action.payload] };
    case ActionTypes.UPDATE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.map(receipt =>
          receipt.id === action.payload.id ? action.payload : receipt
        )
      };
    case ActionTypes.DELETE_RECEIPT:
      return {
        ...state,
        receipts: state.receipts.filter(receipt => receipt.id !== action.payload)
      };

    // --- General Transactions (from Accounting System) ---
    // This model links to purchases, sales, payments, receipts, and expenses (if applicable)
    case ActionTypes.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload };
    case ActionTypes.ADD_TRANSACTION:
      return { ...state, transactions: [...state.transactions, action.payload] };
    case ActionTypes.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction.id === action.payload.id ? action.payload : transaction
        )
      };
    case ActionTypes.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };

    default:
      return state;
  }
}