// context/index.js

// Main context exports
export { AppProvider, useAppContext } from './AppContext.js';

// Types
export { ActionTypes } from './types/actionTypes.js';
// Corrected path for initialState if it's directly in context/
export { initialState } from './types/initialState.js';

// Reducers
// appReducer is removed as it's now a combined rootReducer internally in AppContext
export { dataReducer } from './reducers/dataReducer.js';
export { transactionReducer } from './reducers/transactionReducer.js';
export { uiReducer } from './reducers/uiReducer.js';

// Services
// You might remove prismaService export if it's only used internally by other services
export { prismaService } from './services/prismaService.js';
export { itemService } from './services/itemService.js';
export { supplierService } from './services/supplierService.js';
export { customerService } from './services/customerService.js';
export { purchaseService } from './services/purchaseService.js';
export { saleService } from './services/saleService.js';
export { paymentService } from './services/paymentService.js';
export { receiptService } from './services/receiptService.js';
export { transactionService } from './services/transactionService.js'; // For the general Transaction model
export { accountService } from './services/accountService.js';
export { expenseCategoryService } from './services/expenseCategoryService.js';
export { cashBookService } from './services/cashBookService.js';
export { bankTransactionService } from './services/bankTransactionService.js';
export { reportingPeriodService } from './services/reportingPeriodService.js';
export { inventorySnapshotService } from './services/inventorySnapshotService.js';

// Hooks
export { useStats } from './hooks/useStats.js';
export { useDataFetching } from './hooks/useDataFetching.js';