// context/reducers/appReducer.js
import { uiReducer } from './uiReducer.js';
import { dataReducer } from './dataReducer.js';
import { transactionReducer } from './transactionReducer.js';

export function appReducer(state, action) {
  // Try each reducer in order
  let newState = uiReducer(state, action);
  if (newState !== state) return newState;

  newState = dataReducer(state, action);
  if (newState !== state) return newState;

  newState = transactionReducer(state, action);
  if (newState !== state) return newState;

  // If no reducer handled the action, return the original state
  return state;
}