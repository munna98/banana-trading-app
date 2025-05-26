// context/hooks/useDataFetching.js
import { useCallback } from 'react';
import { ActionTypes } from '../types/actionTypes.js';

// Import all your service files
import { itemService } from '../services/itemService.js';
import { supplierService } from '../services/supplierService.js';
import { customerService } from '../services/customerService.js';
import { purchaseService } from '../services/purchaseService.js';
import { saleService } from '../services/saleService.js';
import { expenseService } from '../services/expenseService.js'; // Assuming this maps to a general 'expense' type or your ExpenseCategory
import { paymentService } from '../services/paymentService.js'; // New Service
import { receiptService } from '../services/receiptService.js'; // New Service
import { transactionService } from '../services/transactionService.js'; // New Service
import { accountService } from '../services/accountService.js'; // New Service
import { expenseCategoryService } from '../services/expenseCategoryService.js'; // New Service (explicit for ExpenseCategory model)
import { cashBookService } from '../services/cashBookService.js'; // New Service
import { bankTransactionService } from '../services/bankTransactionService.js'; // New Service
import { reportingPeriodService } from '../services/reportingPeriodService.js'; // New Service
import { inventorySnapshotService } from '../services/inventorySnapshotService.js'; // New Service


export function useDataFetching(dispatch) {
  // Generic loading and error handling
  const handleAsyncOperation = useCallback(async (operation, loadingType) => {
    // Set global loading true
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.CLEAR_ERROR });

    try {
      return await operation();
    } catch (error) {
      console.error(`Error in ${loadingType} operation:`, error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || `Failed to complete ${loadingType} operation.`,
      });
      throw error; // Re-throw to allow component to handle if needed
    } finally {
      // Set global loading false
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [dispatch]);

  // --- Utility Fetching for Dependent Data ---
  // These are helpers for other operations to refresh related data
  const fetchSuppliers = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const suppliers = await supplierService.getAll();
      dispatch({ type: ActionTypes.SET_SUPPLIERS, payload: suppliers || [] });
      return suppliers;
    }, 'fetchSuppliers');
  }, [dispatch, handleAsyncOperation]);

  const fetchCustomers = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const customers = await customerService.getAll();
      dispatch({ type: ActionTypes.SET_CUSTOMERS, payload: customers || [] });
      return customers;
    }, 'fetchCustomers');
  }, [dispatch, handleAsyncOperation]);

  // --- Fetch All Initial Data ---
  const fetchAllData = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const [
        items,
        suppliers,
        customers,
        purchases,
        sales,
        payments,
        receipts,
        transactions,
        accounts,
        expenseCategories,
        cashBookEntries,
        bankTransactions,
        reportingPeriods,
        inventorySnapshots,
      ] = await Promise.all([
        itemService.getAll(),
        supplierService.getAll(),
        customerService.getAll(),
        purchaseService.getAll(),
        saleService.getAll(),
        paymentService.getAll(),
        receiptService.getAll(),
        transactionService.getAll(),
        accountService.getAll(),
        expenseCategoryService.getAll(),
        cashBookService.getAll(),
        bankTransactionService.getAll(),
        reportingPeriodService.getAll(),
        inventorySnapshotService.getAll(),
      ]);

      // Dispatch actions to update the respective state slices
      dispatch({ type: ActionTypes.SET_ITEMS, payload: items || [] });
      dispatch({ type: ActionTypes.SET_SUPPLIERS, payload: suppliers || [] });
      dispatch({ type: ActionTypes.SET_CUSTOMERS, payload: customers || [] });

      // Transactional data
      dispatch({ type: ActionTypes.SET_PURCHASES, payload: purchases || [] });
      dispatch({ type: ActionTypes.SET_SALES, payload: sales || [] });
      dispatch({ type: ActionTypes.SET_PAYMENTS, payload: payments || [] });
      dispatch({ type: ActionTypes.SET_RECEIPTS, payload: receipts || [] });
      dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions || [] });

      // Accounting and Inventory Data
      dispatch({ type: ActionTypes.SET_ACCOUNTS, payload: accounts || [] });
      dispatch({ type: ActionTypes.SET_EXPENSE_CATEGORIES, payload: expenseCategories || [] });
      dispatch({ type: ActionTypes.SET_CASH_BOOK_ENTRIES, payload: cashBookEntries || [] });
      dispatch({ type: ActionTypes.SET_BANK_TRANSACTIONS, payload: bankTransactions || [] });
      dispatch({ type: ActionTypes.SET_REPORTING_PERIODS, payload: reportingPeriods || [] });
      dispatch({ type: ActionTypes.SET_INVENTORY_SNAPSHOTS, payload: inventorySnapshots || [] });

      return {
        items, suppliers, customers, purchases, sales,
        payments, receipts, transactions, accounts, expenseCategories,
        cashBookEntries, bankTransactions, reportingPeriods, inventorySnapshots
      };
    }, 'fetchAllData');
  }, [dispatch, handleAsyncOperation]);

  // --- CRUD Operations for Each Model ---

  // Items
  const fetchItems = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const items = await itemService.getAll();
      dispatch({ type: ActionTypes.SET_ITEMS, payload: items || [] });
      return items;
    }, 'fetchItems');
  }, [dispatch, handleAsyncOperation]);

  const createItem = useCallback(async (itemData) => {
    return handleAsyncOperation(async () => {
      const newItem = await itemService.create(itemData);
      dispatch({ type: ActionTypes.ADD_ITEM, payload: newItem });
      return newItem;
    }, 'createItem');
  }, [dispatch, handleAsyncOperation]);

  const updateItem = useCallback(async (id, itemData) => {
    return handleAsyncOperation(async () => {
      const updatedItem = await itemService.update(id, itemData);
      dispatch({ type: ActionTypes.UPDATE_ITEM, payload: updatedItem });
      return updatedItem;
    }, 'updateItem');
  }, [dispatch, handleAsyncOperation]);

  const deleteItem = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await itemService.delete(id);
      dispatch({ type: ActionTypes.DELETE_ITEM, payload: id });
    }, 'deleteItem');
  }, [dispatch, handleAsyncOperation]);


  // Suppliers (fetchSuppliers moved up as a helper)
  const createSupplier = useCallback(async (supplierData) => {
    return handleAsyncOperation(async () => {
      const newSupplier = await supplierService.create(supplierData);
      dispatch({ type: ActionTypes.ADD_SUPPLIER, payload: newSupplier });
      return newSupplier;
    }, 'createSupplier');
  }, [dispatch, handleAsyncOperation]);

  const updateSupplier = useCallback(async (id, supplierData) => {
    return handleAsyncOperation(async () => {
      const updatedSupplier = await supplierService.update(id, supplierData);
      dispatch({ type: ActionTypes.UPDATE_SUPPLIER, payload: updatedSupplier });
      return updatedSupplier;
    }, 'updateSupplier');
  }, [dispatch, handleAsyncOperation]);

  const deleteSupplier = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await supplierService.delete(id);
      dispatch({ type: ActionTypes.DELETE_SUPPLIER, payload: id });
    }, 'deleteSupplier');
  }, [dispatch, handleAsyncOperation]);


  // Customers (fetchCustomers moved up as a helper)
  const createCustomer = useCallback(async (customerData) => {
    return handleAsyncOperation(async () => {
      const newCustomer = await customerService.create(customerData);
      dispatch({ type: ActionTypes.ADD_CUSTOMER, payload: newCustomer });
      return newCustomer;
    }, 'createCustomer');
  }, [dispatch, handleAsyncOperation]);

  const updateCustomer = useCallback(async (id, customerData) => {
    return handleAsyncOperation(async () => {
      const updatedCustomer = await customerService.update(id, customerData);
      dispatch({ type: ActionTypes.UPDATE_CUSTOMER, payload: updatedCustomer });
      return updatedCustomer;
    }, 'updateCustomer');
  }, [dispatch, handleAsyncOperation]);

  const deleteCustomer = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await customerService.delete(id);
      dispatch({ type: ActionTypes.DELETE_CUSTOMER, payload: id });
    }, 'deleteCustomer');
  }, [dispatch, handleAsyncOperation]);


  // Purchases
  const fetchPurchases = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const purchases = await purchaseService.getAll();
      dispatch({ type: ActionTypes.SET_PURCHASES, payload: purchases || [] });
      return purchases;
    }, 'fetchPurchases');
  }, [dispatch, handleAsyncOperation]);

  const createPurchase = useCallback(async (purchaseData) => {
    return handleAsyncOperation(async () => {
      const newPurchase = await purchaseService.create(purchaseData);
      dispatch({ type: ActionTypes.ADD_PURCHASE, payload: newPurchase });
      await fetchSuppliers(); // Refresh suppliers to update their balance (if applicable)
      return newPurchase;
    }, 'createPurchase');
  }, [dispatch, handleAsyncOperation, fetchSuppliers]);

  const updatePurchase = useCallback(async (id, purchaseData) => {
    return handleAsyncOperation(async () => {
      const updatedPurchase = await purchaseService.update(id, purchaseData);
      dispatch({ type: ActionTypes.UPDATE_PURCHASE, payload: updatedPurchase });
      await fetchSuppliers(); // Refresh suppliers to update their balance (if applicable)
      return updatedPurchase;
    }, 'updatePurchase');
  }, [dispatch, handleAsyncOperation, fetchSuppliers]);

  const deletePurchase = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await purchaseService.delete(id);
      dispatch({ type: ActionTypes.DELETE_PURCHASE, payload: id });
      await fetchSuppliers(); // Refresh suppliers to update their balance (if applicable)
    }, 'deletePurchase');
  }, [dispatch, handleAsyncOperation, fetchSuppliers]);


  // Sales
  const fetchSales = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const sales = await saleService.getAll();
      dispatch({ type: ActionTypes.SET_SALES, payload: sales || [] });
      return sales;
    }, 'fetchSales');
  }, [dispatch, handleAsyncOperation]);

  const createSale = useCallback(async (saleData) => {
    return handleAsyncOperation(async () => {
      const newSale = await saleService.create(saleData);
      dispatch({ type: ActionTypes.ADD_SALE, payload: newSale });
      await fetchCustomers(); // Refresh customers to update their balance (if applicable)
      await fetchItems(); // Assuming sale affects item stock
      return newSale;
    }, 'createSale');
  }, [dispatch, handleAsyncOperation, fetchCustomers, fetchItems]);

  const updateSale = useCallback(async (id, saleData) => {
    return handleAsyncOperation(async () => {
      const updatedSale = await saleService.update(id, saleData);
      dispatch({ type: ActionTypes.UPDATE_SALE, payload: updatedSale });
      await fetchCustomers(); // Refresh customers to update their balance (if applicable)
      await fetchItems(); // Assuming sale affects item stock
      return updatedSale;
    }, 'updateSale');
  }, [dispatch, handleAsyncOperation, fetchCustomers, fetchItems]);

  const deleteSale = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await saleService.delete(id);
      dispatch({ type: ActionTypes.DELETE_SALE, payload: id });
      await fetchCustomers(); // Refresh customers to update their balance (if applicable)
      await fetchItems(); // Assuming sale affects item stock
    }, 'deleteSale');
  }, [dispatch, handleAsyncOperation, fetchCustomers, fetchItems]);


  // Payments (New)
  const fetchPayments = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const payments = await paymentService.getAll();
      dispatch({ type: ActionTypes.SET_PAYMENTS, payload: payments || [] });
      return payments;
    }, 'fetchPayments');
  }, [dispatch, handleAsyncOperation]);

  const createPayment = useCallback(async (paymentData) => {
    return handleAsyncOperation(async () => {
      const newPayment = await paymentService.create(paymentData);
      dispatch({ type: ActionTypes.ADD_PAYMENT, payload: newPayment });
      // Potentially refresh purchases/suppliers if this payment updates their balance
      if (newPayment.purchaseId) await fetchPurchases();
      if (newPayment.supplierId) await fetchSuppliers();
      return newPayment;
    }, 'createPayment');
  }, [dispatch, handleAsyncOperation, fetchPurchases, fetchSuppliers]);

  const updatePayment = useCallback(async (id, paymentData) => {
    return handleAsyncOperation(async () => {
      const updatedPayment = await paymentService.update(id, paymentData);
      dispatch({ type: ActionTypes.UPDATE_PAYMENT, payload: updatedPayment });
      if (updatedPayment.purchaseId) await fetchPurchases();
      if (updatedPayment.supplierId) await fetchSuppliers();
      return updatedPayment;
    }, 'updatePayment');
  }, [dispatch, handleAsyncOperation, fetchPurchases, fetchSuppliers]);

  const deletePayment = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await paymentService.delete(id);
      dispatch({ type: ActionTypes.DELETE_PAYMENT, payload: id });
      // Re-fetch related data to update balances
      // Need to know original purchaseId/supplierId before delete if not in payload
      // For simplicity here, we're not trying to guess original IDs
      // A more robust solution might retrieve payment first or rely on backend to handle cascades
    }, 'deletePayment');
  }, [dispatch, handleAsyncOperation]);


  // Receipts (New)
  const fetchReceipts = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const receipts = await receiptService.getAll();
      dispatch({ type: ActionTypes.SET_RECEIPTS, payload: receipts || [] });
      return receipts;
    }, 'fetchReceipts');
  }, [dispatch, handleAsyncOperation]);

  const createReceipt = useCallback(async (receiptData) => {
    return handleAsyncOperation(async () => {
      const newReceipt = await receiptService.create(receiptData);
      dispatch({ type: ActionTypes.ADD_RECEIPT, payload: newReceipt });
      // Potentially refresh sales/customers if this receipt updates their balance
      if (newReceipt.saleId) await fetchSales();
      if (newReceipt.customerId) await fetchCustomers();
      return newReceipt;
    }, 'createReceipt');
  }, [dispatch, handleAsyncOperation, fetchSales, fetchCustomers]);

  const updateReceipt = useCallback(async (id, receiptData) => {
    return handleAsyncOperation(async () => {
      const updatedReceipt = await receiptService.update(id, receiptData);
      dispatch({ type: ActionTypes.UPDATE_RECEIPT, payload: updatedReceipt });
      if (updatedReceipt.saleId) await fetchSales();
      if (updatedReceipt.customerId) await fetchCustomers();
      return updatedReceipt;
    }, 'updateReceipt');
  }, [dispatch, handleAsyncOperation, fetchSales, fetchCustomers]);

  const deleteReceipt = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await receiptService.delete(id);
      dispatch({ type: ActionTypes.DELETE_RECEIPT, payload: id });
      // Similar to payments, re-fetch related data or rely on backend for cascades
    }, 'deleteReceipt');
  }, [dispatch, handleAsyncOperation]);

  // Transactions (New)
  const fetchTransactions = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const transactions = await transactionService.getAll();
      dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions || [] });
      return transactions;
    }, 'fetchTransactions');
  }, [dispatch, handleAsyncOperation]);

  const createTransaction = useCallback(async (transactionData) => {
    return handleAsyncOperation(async () => {
      const newTransaction = await transactionService.create(transactionData);
      dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: newTransaction });
      return newTransaction;
    }, 'createTransaction');
  }, [dispatch, handleAsyncOperation]);

  const updateTransaction = useCallback(async (id, transactionData) => {
    return handleAsyncOperation(async () => {
      const updatedTransaction = await transactionService.update(id, transactionData);
      dispatch({ type: ActionTypes.UPDATE_TRANSACTION, payload: updatedTransaction });
      return updatedTransaction;
    }, 'updateTransaction');
  }, [dispatch, handleAsyncOperation]);

  const deleteTransaction = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await transactionService.delete(id);
      dispatch({ type: ActionTypes.DELETE_TRANSACTION, payload: id });
    }, 'deleteTransaction');
  }, [dispatch, handleAsyncOperation]);

  // Accounts (New)
  const fetchAccounts = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const accounts = await accountService.getAll();
      dispatch({ type: ActionTypes.SET_ACCOUNTS, payload: accounts || [] });
      return accounts;
    }, 'fetchAccounts');
  }, [dispatch, handleAsyncOperation]);

  const createAccount = useCallback(async (accountData) => {
    return handleAsyncOperation(async () => {
      const newAccount = await accountService.create(accountData);
      dispatch({ type: ActionTypes.ADD_ACCOUNT, payload: newAccount });
      return newAccount;
    }, 'createAccount');
  }, [dispatch, handleAsyncOperation]);

  const updateAccount = useCallback(async (id, accountData) => {
    return handleAsyncOperation(async () => {
      const updatedAccount = await accountService.update(id, accountData);
      dispatch({ type: ActionTypes.UPDATE_ACCOUNT, payload: updatedAccount });
      return updatedAccount;
    }, 'updateAccount');
  }, [dispatch, handleAsyncOperation]);

  const deleteAccount = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await accountService.delete(id);
      dispatch({ type: ActionTypes.DELETE_ACCOUNT, payload: id });
    }, 'deleteAccount');
  }, [dispatch, handleAsyncOperation]);

  // Expense Categories (New)
  const fetchExpenseCategories = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const expenseCategories = await expenseCategoryService.getAll();
      dispatch({ type: ActionTypes.SET_EXPENSE_CATEGORIES, payload: expenseCategories || [] });
      return expenseCategories;
    }, 'fetchExpenseCategories');
  }, [dispatch, handleAsyncOperation]);

  const createExpenseCategory = useCallback(async (categoryData) => {
    return handleAsyncOperation(async () => {
      const newCategory = await expenseCategoryService.create(categoryData);
      dispatch({ type: ActionTypes.ADD_EXPENSE_CATEGORY, payload: newCategory });
      return newCategory;
    }, 'createExpenseCategory');
  }, [dispatch, handleAsyncOperation]);

  const updateExpenseCategory = useCallback(async (id, categoryData) => {
    return handleAsyncOperation(async () => {
      const updatedCategory = await expenseCategoryService.update(id, categoryData);
      dispatch({ type: ActionTypes.UPDATE_EXPENSE_CATEGORY, payload: updatedCategory });
      return updatedCategory;
    }, 'updateExpenseCategory');
  }, [dispatch, handleAsyncOperation]);

  const deleteExpenseCategory = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await expenseCategoryService.delete(id);
      dispatch({ type: ActionTypes.DELETE_EXPENSE_CATEGORY, payload: id });
    }, 'deleteExpenseCategory');
  }, [dispatch, handleAsyncOperation]);


  // Cash Book Entries (New)
  const fetchCashBookEntries = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const cashBookEntries = await cashBookService.getAll();
      dispatch({ type: ActionTypes.SET_CASH_BOOK_ENTRIES, payload: cashBookEntries || [] });
      return cashBookEntries;
    }, 'fetchCashBookEntries');
  }, [dispatch, handleAsyncOperation]);

  const createCashBookEntry = useCallback(async (entryData) => {
    return handleAsyncOperation(async () => {
      const newEntry = await cashBookService.create(entryData);
      dispatch({ type: ActionTypes.ADD_CASH_BOOK_ENTRY, payload: newEntry });
      return newEntry;
    }, 'createCashBookEntry');
  }, [dispatch, handleAsyncOperation]);

  const updateCashBookEntry = useCallback(async (id, entryData) => {
    return handleAsyncOperation(async () => {
      const updatedEntry = await cashBookService.update(id, entryData);
      dispatch({ type: ActionTypes.UPDATE_CASH_BOOK_ENTRY, payload: updatedEntry });
      return updatedEntry;
    }, 'updateCashBookEntry');
  }, [dispatch, handleAsyncOperation]);

  const deleteCashBookEntry = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await cashBookService.delete(id);
      dispatch({ type: ActionTypes.DELETE_CASH_BOOK_ENTRY, payload: id });
    }, 'deleteCashBookEntry');
  }, [dispatch, handleAsyncOperation]);


  // Bank Transactions (New)
  const fetchBankTransactions = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const bankTransactions = await bankTransactionService.getAll();
      dispatch({ type: ActionTypes.SET_BANK_TRANSACTIONS, payload: bankTransactions || [] });
      return bankTransactions;
    }, 'fetchBankTransactions');
  }, [dispatch, handleAsyncOperation]);

  const createBankTransaction = useCallback(async (transactionData) => {
    return handleAsyncOperation(async () => {
      const newTransaction = await bankTransactionService.create(transactionData);
      dispatch({ type: ActionTypes.ADD_BANK_TRANSACTION, payload: newTransaction });
      return newTransaction;
    }, 'createBankTransaction');
  }, [dispatch, handleAsyncOperation]);

  const updateBankTransaction = useCallback(async (id, transactionData) => {
    return handleAsyncOperation(async () => {
      const updatedTransaction = await bankTransactionService.update(id, transactionData);
      dispatch({ type: ActionTypes.UPDATE_BANK_TRANSACTION, payload: updatedTransaction });
      return updatedTransaction;
    }, 'updateBankTransaction');
  }, [dispatch, handleAsyncOperation]);

  const deleteBankTransaction = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await bankTransactionService.delete(id);
      dispatch({ type: ActionTypes.DELETE_BANK_TRANSACTION, payload: id });
    }, 'deleteBankTransaction');
  }, [dispatch, handleAsyncOperation]);


  // Reporting Periods (New)
  const fetchReportingPeriods = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const reportingPeriods = await reportingPeriodService.getAll();
      dispatch({ type: ActionTypes.SET_REPORTING_PERIODS, payload: reportingPeriods || [] });
      return reportingPeriods;
    }, 'fetchReportingPeriods');
  }, [dispatch, handleAsyncOperation]);

  const createReportingPeriod = useCallback(async (periodData) => {
    return handleAsyncOperation(async () => {
      const newPeriod = await reportingPeriodService.create(periodData);
      dispatch({ type: ActionTypes.ADD_REPORTING_PERIOD, payload: newPeriod });
      return newPeriod;
    }, 'createReportingPeriod');
  }, [dispatch, handleAsyncOperation]);

  const updateReportingPeriod = useCallback(async (id, periodData) => {
    return handleAsyncOperation(async () => {
      const updatedPeriod = await reportingPeriodService.update(id, periodData);
      dispatch({ type: ActionTypes.UPDATE_REPORTING_PERIOD, payload: updatedPeriod });
      return updatedPeriod;
    }, 'updateReportingPeriod');
  }, [dispatch, handleAsyncOperation]);

  const deleteReportingPeriod = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await reportingPeriodService.delete(id);
      dispatch({ type: ActionTypes.DELETE_REPORTING_PERIOD, payload: id });
    }, 'deleteReportingPeriod');
  }, [dispatch, handleAsyncOperation]);


  // Inventory Snapshots (New)
  const fetchInventorySnapshots = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const snapshots = await inventorySnapshotService.getAll();
      dispatch({ type: ActionTypes.SET_INVENTORY_SNAPSHOTS, payload: snapshots || [] });
      return snapshots;
    }, 'fetchInventorySnapshots');
  }, [dispatch, handleAsyncOperation]);

  const createInventorySnapshot = useCallback(async (snapshotData) => {
    return handleAsyncOperation(async () => {
      const newSnapshot = await inventorySnapshotService.create(snapshotData);
      dispatch({ type: ActionTypes.ADD_INVENTORY_SNAPSHOT, payload: newSnapshot });
      return newSnapshot;
    }, 'createInventorySnapshot');
  }, [dispatch, handleAsyncOperation]);

  const updateInventorySnapshot = useCallback(async (id, snapshotData) => {
    return handleAsyncOperation(async () => {
      const updatedSnapshot = await inventorySnapshotService.update(id, snapshotData);
      dispatch({ type: ActionTypes.UPDATE_INVENTORY_SNAPSHOT, payload: updatedSnapshot });
      return updatedSnapshot;
    }, 'updateInventorySnapshot');
  }, [dispatch, handleAsyncOperation]);

  const deleteInventorySnapshot = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await inventorySnapshotService.delete(id);
      dispatch({ type: ActionTypes.DELETE_INVENTORY_SNAPSHOT, payload: id });
    }, 'deleteInventorySnapshot');
  }, [dispatch, handleAsyncOperation]);


  return {
    // General
    fetchAllData,

    // Items
    fetchItems,
    createItem,
    updateItem,
    deleteItem,

    // Suppliers
    fetchSuppliers, // Exporting as it might be useful directly
    createSupplier,
    updateSupplier,
    deleteSupplier,

    // Customers
    fetchCustomers, // Exporting as it might be useful directly
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Purchases
    fetchPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,

    // Sales
    fetchSales,
    createSale,
    updateSale,
    deleteSale,

    // Payments
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,

    // Receipts
    fetchReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,

    // Transactions
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,

    // Accounts
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,

    // Expense Categories (Explicitly for the model)
    fetchExpenseCategories,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,

    // Cash Book Entries
    fetchCashBookEntries,
    createCashBookEntry,
    updateCashBookEntry,
    deleteCashBookEntry,

    // Bank Transactions
    fetchBankTransactions,
    createBankTransaction,
    updateBankTransaction,
    deleteBankTransaction,

    // Reporting Periods
    fetchReportingPeriods,
    createReportingPeriod,
    updateReportingPeriod,
    deleteReportingPeriod,

    // Inventory Snapshots
    fetchInventorySnapshots,
    createInventorySnapshot,
    updateInventorySnapshot,
    deleteInventorySnapshot,
  };
}