// context/index.js
// Main context exports
export { AppProvider, useAppContext } from './AppContext.js';

// Types
export { ActionTypes } from './types/actionTypes.js';
export { initialState } from './types/initialState.js';

// Reducers
export { appReducer } from './reducers/appReducer.js';
export { dataReducer } from './reducers/dataReducer.js';
export { transactionReducer } from './reducers/transactionReducer.js';
export { uiReducer } from './reducers/uiReducer.js';

// Services
export { prismaService } from './services/prismaService.js';
export { itemService } from './services/itemService.js';
export { supplierService } from './services/supplierService.js';
export { customerService } from './services/customerService.js';
export { purchaseService } from './services/purchaseService.js';
export { saleService } from './services/saleService.js';
export { expenseService } from './services/expenseService.js';

// Hooks
export { useStats } from './hooks/useStats.js';
export { useDataFetching } from './hooks/useDataFetching.js';