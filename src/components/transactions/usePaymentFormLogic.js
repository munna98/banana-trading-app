// components/transactions/usePaymentFormLogic.js

import { useState, useEffect, useCallback, useRef } from "react";

export const usePaymentFormLogic = (
  initialSupplierId,
  initialPurchaseId,
  setGlobalError,
  paymentId = null
) => {
  const [debitAccounts, setDebitAccounts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [formData, setFormData] = useState({
    purchaseId: initialPurchaseId ? parseInt(initialPurchaseId) : null,
    paymentMethod: "CASH",
    amount: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    debitAccountId: "",
  });
  const [selectedDebitAccountDetails, setSelectedDebitAccountDetails] = useState(null);
  const [selectedPurchaseBalance, setSelectedPurchaseBalance] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Refs to track current requests and prevent race conditions
  const accountBalanceRequestRef = useRef(null);
  const purchasesRequestRef = useRef(null);
  const currentSupplierIdRef = useRef(null);

  // Helper to find supplier linked to an account
  const getSupplierIdFromAccount = useCallback(
    (accountId) => {
      const account = debitAccounts.find((acc) => acc.id === accountId);
      return account?.supplier?.id || null;
    },
    [debitAccounts]
  );

  // Centralized error handler
  const handleError = useCallback((error, context) => {
    console.error(`Error in ${context}:`, error);
    setGlobalError(`Error ${context}: ${error.message}`);
  }, [setGlobalError]);

  // Fetch account balance with race condition protection
  const fetchAccountBalance = useCallback(
    async (accountId) => {
      if (!accountId) {
        setSelectedDebitAccountDetails(null);
        return;
      }

      // Cancel previous request
      if (accountBalanceRequestRef.current) {
        accountBalanceRequestRef.current.cancelled = true;
      }

      const requestId = { cancelled: false };
      accountBalanceRequestRef.current = requestId;

      try {
        const response = await fetch(
          `/api/accounts/${accountId}/balance?context=payment`
        );
        
        // Check if request was cancelled
        if (requestId.cancelled) return;

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch account balance");
        }
        
        const data = await response.json();
        
        // Final check before setting state
        if (!requestId.cancelled) {
          setSelectedDebitAccountDetails(data);
        }
      } catch (error) {
        if (!requestId.cancelled) {
          setSelectedDebitAccountDetails(null);
          handleError(error, "fetching account balance");
        }
      }
    },
    [handleError]
  );

  // Fetch purchases with race condition protection
  const fetchPurchases = useCallback(
    async (supplierId) => {
      if (!supplierId) {
        setPurchases([]);
        setSelectedPurchaseBalance(0);
        return;
      }

      // Cancel previous request
      if (purchasesRequestRef.current) {
        purchasesRequestRef.current.cancelled = true;
      }

      const requestId = { cancelled: false };
      purchasesRequestRef.current = requestId;
      currentSupplierIdRef.current = supplierId;

      setPurchasesLoading(true);

      try {
        const response = await fetch(
          `/api/purchases?supplierId=${supplierId}&unpaidOnly=true`
        );

        // Check if request was cancelled or supplier changed
        if (requestId.cancelled || currentSupplierIdRef.current !== supplierId) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch purchases");
        }

        const data = await response.json();

        // Final check before setting state
        if (!requestId.cancelled && currentSupplierIdRef.current === supplierId) {
          setPurchases(data.data || []);
          
          // Handle purchase balance calculation
          const currentPurchaseId = formData.purchaseId;
          if (currentPurchaseId) {
            const currentPurchase = (data.data || []).find(p => p.id === currentPurchaseId);
            setSelectedPurchaseBalance(
              currentPurchase ? currentPurchase.totalAmount - currentPurchase.paidAmount : 0
            );
          } else {
            setSelectedPurchaseBalance(0);
          }
        }
      } catch (error) {
        if (!requestId.cancelled && currentSupplierIdRef.current === supplierId) {
          setPurchases([]);
          setSelectedPurchaseBalance(0);
          handleError(error, "fetching purchases");
        }
      } finally {
        if (!requestId.cancelled && currentSupplierIdRef.current === supplierId) {
          setPurchasesLoading(false);
        }
      }
    },
    [formData.purchaseId, handleError]
  );

  // Load existing payment data for edit mode
  const loadExistingPayment = useCallback(async () => {
    if (!paymentId) return;

    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch existing payment");
      }
      
      const { data: paymentData } = await response.json();
      const debitAccountId = paymentData.transaction?.entries.find(entry => entry.debitAmount > 0)?.accountId || "";

      setFormData(prev => ({
        ...prev,
        purchaseId: paymentData.purchaseId || null,
        paymentMethod: paymentData.paymentMethod,
        amount: paymentData.amount,
        reference: paymentData.reference || "",
        notes: paymentData.notes || "",
        date: paymentData.date ? new Date(paymentData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        debitAccountId,
      }));

      // Fetch balance for the pre-selected account
      if (debitAccountId) {
        await fetchAccountBalance(debitAccountId);
      }
    } catch (error) {
      handleError(error, "loading existing payment");
    }
  }, [paymentId, fetchAccountBalance, handleError]);

  // Load initial accounts
  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const response = await fetch("/api/accounts?canBeDebitedForPayments=true&limit=500");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch accounts");
      }
      
      const data = await response.json();
      setDebitAccounts(data.data || []);
      return data.data || [];
    } catch (error) {
      handleError(error, "fetching accounts");
      return [];
    } finally {
      setAccountsLoading(false);
    }
  }, [handleError]);

  // Apply initial selections based on URL parameters
  const applyInitialSelections = useCallback(async (accounts) => {
    let selectedAccountId = null;

    // For edit mode, account selection is handled in loadExistingPayment
    if (paymentId) return;

    // For new payments from supplier context
    if (initialSupplierId && accounts.length > 0) {
      const supplierAccount = accounts.find(
        acc => acc.supplier?.id === parseInt(initialSupplierId)
      );
      if (supplierAccount) {
        selectedAccountId = supplierAccount.id;
        setFormData(prev => ({
          ...prev,
          debitAccountId: selectedAccountId,
        }));
        await fetchAccountBalance(selectedAccountId);
      }
    }
  }, [paymentId, initialSupplierId, fetchAccountBalance]);

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      if (initializationComplete) return;

      try {
        // Step 1: Load existing payment data if in edit mode
        if (paymentId) {
          await loadExistingPayment();
        }

        // Step 2: Load accounts
        const accounts = await loadAccounts();

        // Step 3: Apply initial selections for new payments
        await applyInitialSelections(accounts);

        setInitializationComplete(true);
      } catch (error) {
        handleError(error, "initializing component");
      }
    };

    initialize();
  }, [initializationComplete, paymentId, loadExistingPayment, loadAccounts, applyInitialSelections, handleError]);

  // Handle supplier changes and fetch purchases
  useEffect(() => {
    if (!initializationComplete) return;

    const currentSupplierId = getSupplierIdFromAccount(formData.debitAccountId);
    
    if (currentSupplierId) {
      fetchPurchases(currentSupplierId);
    } else {
      setPurchases([]);
      setSelectedPurchaseBalance(0);
      // Clear purchase selection when no supplier
      if (formData.purchaseId) {
        setFormData(prev => ({ ...prev, purchaseId: null }));
      }
    }
  }, [formData.debitAccountId, initializationComplete, getSupplierIdFromAccount, fetchPurchases]);

  // Handle debit account selection
  const handleDebitAccountChange = useCallback(async (e) => {
    const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";

    setFormData(prev => ({
      ...prev,
      debitAccountId: selectedAccountId,
      purchaseId: null, // Reset purchase when account changes
    }));
    
    setSelectedPurchaseBalance(0);
    await fetchAccountBalance(selectedAccountId);
  }, [fetchAccountBalance]);

  // Handle purchase selection
  const handlePurchaseChange = useCallback((e) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    setFormData(prev => ({ ...prev, purchaseId: selectedId }));

    if (selectedId) {
      const purchase = purchases.find(p => p.id === selectedId);
      setSelectedPurchaseBalance(
        purchase ? purchase.totalAmount - purchase.paidAmount : 0
      );
    } else {
      setSelectedPurchaseBalance(0);
    }
  }, [purchases]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (accountBalanceRequestRef.current) {
        accountBalanceRequestRef.current.cancelled = true;
      }
      if (purchasesRequestRef.current) {
        purchasesRequestRef.current.cancelled = true;
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    debitAccounts,
    purchases,
    selectedDebitAccountDetails,
    selectedPurchaseBalance,
    accountsLoading,
    purchasesLoading,
    getSupplierIdFromAccount,
    handleDebitAccountChange,
    handlePurchaseChange,
    handleChange,
    initializationComplete,
  };
};