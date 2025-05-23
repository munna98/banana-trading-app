// context/reducers/uiReducer.js
import { ActionTypes } from '../types/actionTypes.js';

export function uiReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SELECT_SUPPLIER:
      return { ...state, selectedSupplier: action.payload };
    
    case ActionTypes.SELECT_CUSTOMER:
      return { ...state, selectedCustomer: action.payload };
      
    case ActionTypes.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
      
    case ActionTypes.UPDATE_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } };
    
    default:
      return state;
  }
}