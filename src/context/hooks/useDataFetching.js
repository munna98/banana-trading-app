// context/hooks/useDataFetching.js
import { useCallback } from 'react';
import { ActionTypes } from '../types/actionTypes.js';
import { itemService } from '../services/itemService.js';
import { supplierService } from '../services/supplierService.js';
import { customerService } from '../services/customerService.js';
import { purchaseService } from '../services/purchaseService.js';
import { saleService } from '../services/saleService.js';
import { expenseService } from '../services/expenseService.js';

export function useDataFetching(dispatch) {
  // Generic loading and error handling
  const handleAsyncOperation = useCallback(async (operation, loadingType) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { [loadingType]: true } });
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    
    try {
      return await operation();
    } catch (error) {
      dispatch({ 
        type: ActionTypes.SET_ERROR, 
        payload: error.message || 'An error occurred' 
      });
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { [loadingType]: false } });
    }
  }, [dispatch]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const [items, suppliers, customers, purchases, sales, expenses] = await Promise.all([
        itemService.getAll(),
        supplierService.getAll(),
        customerService.getAll(),
        purchaseService.getAll(),
        saleService.getAll(),
        expenseService.getAll()
      ]);

      dispatch({ type: ActionTypes.SET_ITEMS, payload: items || [] });
      dispatch({ type: ActionTypes.SET_SUPPLIERS, payload: suppliers || [] });
      dispatch({ type: ActionTypes.SET_CUSTOMERS, payload: customers || [] });
      dispatch({ type: ActionTypes.SET_PURCHASES, payload: purchases || [] });
      dispatch({ type: ActionTypes.SET_SALES, payload: sales || [] });
      dispatch({ type: ActionTypes.SET_EXPENSES, payload: expenses || [] });

      return { items, suppliers, customers, purchases, sales, expenses };
    }, 'general');
  }, [dispatch, handleAsyncOperation]);

  // Items
  const fetchItems = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const items = await itemService.getAll();
      dispatch({ type: ActionTypes.SET_ITEMS, payload: items || [] });
      return items;
    }, 'items');
  }, [dispatch, handleAsyncOperation]);

  const createItem = useCallback(async (itemData) => {
    return handleAsyncOperation(async () => {
      const newItem = await itemService.create(itemData);
      dispatch({ type: ActionTypes.ADD_ITEM, payload: newItem });
      return newItem;
    }, 'items');
  }, [dispatch, handleAsyncOperation]);

  const updateItem = useCallback(async (id, itemData) => {
    return handleAsyncOperation(async () => {
      const updatedItem = await itemService.update(id, itemData);
      dispatch({ type: ActionTypes.UPDATE_ITEM, payload: updatedItem });
      return updatedItem;
    }, 'items');
  }, [dispatch, handleAsyncOperation]);

  const deleteItem = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await itemService.delete(id);
      dispatch({ type: ActionTypes.DELETE_ITEM, payload: id });
    }, 'items');
  }, [dispatch, handleAsyncOperation]);

  // Suppliers
  const fetchSuppliers = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const suppliers = await supplierService.getAll();
      dispatch({ type: ActionTypes.SET_SUPPLIERS, payload: suppliers || [] });
      return suppliers;
    }, 'suppliers');
  }, [dispatch, handleAsyncOperation]);

  const createSupplier = useCallback(async (supplierData) => {
    return handleAsyncOperation(async () => {
      const newSupplier = await supplierService.create(supplierData);
      dispatch({ type: ActionTypes.ADD_SUPPLIER, payload: newSupplier });
      return newSupplier;
    }, 'suppliers');
  }, [dispatch, handleAsyncOperation]);

  const updateSupplier = useCallback(async (id, supplierData) => {
    return handleAsyncOperation(async () => {
      const updatedSupplier = await supplierService.update(id, supplierData);
      dispatch({ type: ActionTypes.UPDATE_SUPPLIER, payload: updatedSupplier });
      return updatedSupplier;
    }, 'suppliers');
  }, [dispatch, handleAsyncOperation]);

  const deleteSupplier = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await supplierService.delete(id);
      dispatch({ type: ActionTypes.DELETE_SUPPLIER, payload: id });
    }, 'suppliers');
  }, [dispatch, handleAsyncOperation]);

  // Customers
  const fetchCustomers = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const customers = await customerService.getAll();
      dispatch({ type: ActionTypes.SET_CUSTOMERS, payload: customers || [] });
      return customers;
    }, 'customers');
  }, [dispatch, handleAsyncOperation]);

  const createCustomer = useCallback(async (customerData) => {
    return handleAsyncOperation(async () => {
      const newCustomer = await customerService.create(customerData);
      dispatch({ type: ActionTypes.ADD_CUSTOMER, payload: newCustomer });
      return newCustomer;
    }, 'customers');
  }, [dispatch, handleAsyncOperation]);

  const updateCustomer = useCallback(async (id, customerData) => {
    return handleAsyncOperation(async () => {
      const updatedCustomer = await customerService.update(id, customerData);
      dispatch({ type: ActionTypes.UPDATE_CUSTOMER, payload: updatedCustomer });
      return updatedCustomer;
    }, 'customers');
  }, [dispatch, handleAsyncOperation]);

  const deleteCustomer = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await customerService.delete(id);
      dispatch({ type: ActionTypes.DELETE_CUSTOMER, payload: id });
    }, 'customers');
  }, [dispatch, handleAsyncOperation]);

  // Purchases
  const fetchPurchases = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const purchases = await purchaseService.getAll();
      dispatch({ type: ActionTypes.SET_PURCHASES, payload: purchases || [] });
      return purchases;
    }, 'purchases');
  }, [dispatch, handleAsyncOperation]);

  const createPurchase = useCallback(async (purchaseData) => {
    return handleAsyncOperation(async () => {
      const newPurchase = await purchaseService.create(purchaseData);
      dispatch({ type: ActionTypes.ADD_PURCHASE, payload: newPurchase });
      // Refresh suppliers to update balance
      await fetchSuppliers();
      return newPurchase;
    }, 'purchases');
  }, [dispatch, handleAsyncOperation, fetchSuppliers]);

  const deletePurchase = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await purchaseService.delete(id);
      dispatch({ type: ActionTypes.DELETE_PURCHASE, payload: id });
      // Refresh suppliers to update balance
      await fetchSuppliers();
    }, 'purchases');
  }, [dispatch, handleAsyncOperation, fetchSuppliers]);

  // Sales
  const fetchSales = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const sales = await saleService.getAll();
      dispatch({ type: ActionTypes.SET_SALES, payload: sales || [] });
      return sales;
    }, 'sales');
  }, [dispatch, handleAsyncOperation]);

  const createSale = useCallback(async (saleData) => {
    return handleAsyncOperation(async () => {
      const newSale = await saleService.create(saleData);
      dispatch({ type: ActionTypes.ADD_SALE, payload: newSale });
      // Refresh customers to update balance
      await fetchCustomers();
      return newSale;
    }, 'sales');
  }, [dispatch, handleAsyncOperation, fetchCustomers]);

  const deleteSale = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await saleService.delete(id);
      dispatch({ type: ActionTypes.DELETE_SALE, payload: id });
      // Refresh customers to update balance
      await fetchCustomers();
    }, 'sales');
  }, [dispatch, handleAsyncOperation, fetchCustomers]);

  // Expenses
  const fetchExpenses = useCallback(async () => {
    return handleAsyncOperation(async () => {
      const expenses = await expenseService.getAll();
      dispatch({ type: ActionTypes.SET_EXPENSES, payload: expenses || [] });
      return expenses;
    }, 'expenses');
  }, [dispatch, handleAsyncOperation]);

  const createExpense = useCallback(async (expenseData) => {
    return handleAsyncOperation(async () => {
      const newExpense = await expenseService.create(expenseData);
      dispatch({ type: ActionTypes.ADD_EXPENSE, payload: newExpense });
      return newExpense;
    }, 'expenses');
  }, [dispatch, handleAsyncOperation]);

  const updateExpense = useCallback(async (id, expenseData) => {
    return handleAsyncOperation(async () => {
      const updatedExpense = await expenseService.update(id, expenseData);
      dispatch({ type: ActionTypes.UPDATE_EXPENSE, payload: updatedExpense });
      return updatedExpense;
    }, 'expenses');
  }, [dispatch, handleAsyncOperation]);

  const deleteExpense = useCallback(async (id) => {
    return handleAsyncOperation(async () => {
      await expenseService.delete(id);
      dispatch({ type: ActionTypes.DELETE_EXPENSE, payload: id });
    }, 'expenses');
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
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    // Customers
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Purchases
    fetchPurchases,
    createPurchase,
    deletePurchase,
    
    // Sales
    fetchSales,
    createSale,
    deleteSale,
    
    // Expenses
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense
  };
}