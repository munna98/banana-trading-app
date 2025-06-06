// components/transactions/useReceiptFormLogic.js

import { useState, useEffect, useCallback, useRef } from "react";

export const useReceiptFormLogic = (
  initialCustomerId,
  initialSaleId,
  setGlobalError,
  receiptId = null // <--- Add receiptId for edit mode
) => {
  const [creditAccounts, setCreditAccounts] = useState([]);
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    saleId: initialSaleId ? parseInt(initialSaleId) : null,
    paymentMethod: "CASH",
    amount: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    creditAccountId: "",
  });
  const [selectedCreditAccountDetails, setSelectedCreditAccountDetails] =
    useState(null); // Stores full balance API response
  const [selectedSaleBalance, setSelectedSaleBalance] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false); // <--- New state for initialization

  // Refs to track current requests and prevent race conditions
  const accountBalanceRequestRef = useRef(null);
  const salesRequestRef = useRef(null); // Changed from purchasesRequestRef
  const currentCustomerIdRef = useRef(null); // Changed from currentSupplierIdRef

  // Helper to find customer linked to an account
  const getCustomerIdFromAccount = useCallback(
    (accountId) => {
      const account = creditAccounts.find((acc) => acc.id === accountId);
      return account?.customer?.id || null;
    },
    [creditAccounts]
  );

  // Centralized error handler
  const handleError = useCallback(
    (error, context) => {
      console.error(`Error in ${context}:`, error);
      setGlobalError(`Error ${context}: ${error.message}`);
    },
    [setGlobalError]
  );

  // Fetch account balance with race condition protection
  const fetchAccountBalance = useCallback(
    async (accountId) => {
      if (!accountId) {
        setSelectedCreditAccountDetails(null);
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
          `/api/accounts/${accountId}/balance?context=receipt`
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
          setSelectedCreditAccountDetails(data);
        }
      } catch (error) {
        if (!requestId.cancelled) {
          setSelectedCreditAccountDetails(null);
          handleError(error, "fetching account balance");
        }
      }
    },
    [handleError]
  );

  // Fetch sales with race condition protection (similar to fetchPurchases)
  const fetchSales = useCallback(
    async (customerId) => {
      if (!customerId) {
        setSales([]);
        setSelectedSaleBalance(0);
        return;
      }

      // Cancel previous request
      if (salesRequestRef.current) {
        salesRequestRef.current.cancelled = true;
      }

      const requestId = { cancelled: false };
      salesRequestRef.current = requestId;
      currentCustomerIdRef.current = customerId; // <--- Track current customer ID

      setSalesLoading(true);

      try {
        const response = await fetch(
          `/api/sales?customerId=${customerId}&unpaidOnly=true`
        );

        // Check if request was cancelled or customer changed
        if (requestId.cancelled || currentCustomerIdRef.current !== customerId) {
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch sales");
        }

        const data = await response.json();

        // Final check before setting state
        if (!requestId.cancelled && currentCustomerIdRef.current === customerId) {
          setSales(data.data || []);

          // Handle sale balance calculation (if a sale is already selected)
          const currentSaleId = formData.saleId;
          if (currentSaleId) {
            const currentSale = (data.data || []).find(
              (s) => s.id === currentSaleId
            );
            setSelectedSaleBalance(
              currentSale ? currentSale.totalAmount - currentSale.paidAmount : 0
            );
          } else {
            setSelectedSaleBalance(0);
          }
        }
      } catch (error) {
        if (!requestId.cancelled && currentCustomerIdRef.current === customerId) {
          setSales([]);
          setSelectedSaleBalance(0);
          handleError(error, "fetching sales");
        }
      } finally {
        if (!requestId.cancelled && currentCustomerIdRef.current === customerId) {
          setSalesLoading(false);
        }
      }
    },
    [formData.saleId, handleError] // Depend on formData.saleId to recalculate balance if sale changes
  );

  // Load existing receipt data for edit mode
  const loadExistingReceipt = useCallback(async () => {
    if (!receiptId) return;

    try {
      const response = await fetch(`/api/receipts/${receiptId}`); // <--- Adjust API endpoint for receipts
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch existing receipt");
      }

      const { data: receiptData } = await response.json();
      const creditAccountId =
        receiptData.transaction?.entries.find((entry) => entry.creditAmount > 0) // <--- Check creditAmount for receipts
          ?.accountId || "";

      setFormData((prev) => ({
        ...prev,
        saleId: receiptData.saleId || null,
        paymentMethod: receiptData.paymentMethod,
        amount: receiptData.amount,
        reference: receiptData.reference || "",
        notes: receiptData.notes || "",
        date: receiptData.date
          ? new Date(receiptData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        creditAccountId,
      }));

      // Fetch balance for the pre-selected account
      if (creditAccountId) {
        await fetchAccountBalance(creditAccountId);
      }
    } catch (error) {
      handleError(error, "loading existing receipt");
    }
  }, [receiptId, fetchAccountBalance, handleError]);

  // Load initial accounts (accounts that can be credited for receipts)
  const loadAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const response = await fetch(
        "/api/accounts?canBeCreditedForReceipts=true&limit=500" // <--- Adjust API endpoint for receipts
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch accounts");
      }

      const data = await response.json();
      setCreditAccounts(data.data || []);
      return data.data || [];
    } catch (error) {
      handleError(error, "fetching accounts");
      return [];
    } finally {
      setAccountsLoading(false);
    }
  }, [handleError]);

  // Apply initial selections based on URL parameters (for new receipts)
  const applyInitialSelections = useCallback(
    async (accounts) => {
      let selectedAccountId = null;

      // For edit mode, account selection is handled in loadExistingReceipt
      if (receiptId) return;

      // For new receipts from customer context
      if (initialCustomerId && accounts.length > 0) {
        const customerAccount = accounts.find(
          (acc) => acc.customer?.id === parseInt(initialCustomerId)
        );
        if (customerAccount) {
          selectedAccountId = customerAccount.id;
          setFormData((prev) => ({
            ...prev,
            creditAccountId: selectedAccountId,
          }));
          await fetchAccountBalance(selectedAccountId);
        }
      }
      // If initialSaleId is present and no customerId, still try to set the sale.
      // However, `fetchSales` depends on `customerId`, so it might not run until account is selected.
      // This is generally okay if sales are loaded after customer/account.
      if (initialSaleId) {
        setFormData((prev) => ({
          ...prev,
          saleId: parseInt(initialSaleId),
        }));
      }
    },
    [receiptId, initialCustomerId, initialSaleId, fetchAccountBalance]
  );

  // Initialize component: load accounts and existing data/initial selections
  useEffect(() => {
    const initialize = async () => {
      if (initializationComplete) return;

      try {
        // Step 1: Load accounts first, as they are needed for both new and edit modes
        const accounts = await loadAccounts();

        // Step 2: Load existing receipt data if in edit mode
        // This will update formData, which might then trigger fetchSales.
        if (receiptId) {
          await loadExistingReceipt();
        }

        // Step 3: Apply initial selections for new receipts (only if not in edit mode)
        else {
          await applyInitialSelections(accounts);
        }

        setInitializationComplete(true);
      } catch (error) {
        handleError(error, "initializing component");
      }
    };

    initialize();
  }, [
    initializationComplete,
    receiptId,
    loadExistingReceipt,
    loadAccounts,
    applyInitialSelections,
    handleError,
  ]);

  // Fetch sales when the selected credit account (and thus customer) changes
  useEffect(() => {
    if (!initializationComplete) return;

    const currentCustomerId = getCustomerIdFromAccount(
      formData.creditAccountId
    );

    if (currentCustomerId) {
      fetchSales(currentCustomerId);
    } else {
      setSales([]);
      setSelectedSaleBalance(0);
      // Clear sale selection when no customer/account
      if (formData.saleId) {
        setFormData((prev) => ({ ...prev, saleId: null }));
      }
    }
  }, [
    formData.creditAccountId,
    initializationComplete,
    getCustomerIdFromAccount,
    fetchSales,
  ]);

  // Handle credit account selection
  const handleCreditAccountChange = useCallback(
    async (e) => {
      const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";

      setFormData((prev) => ({
        ...prev,
        creditAccountId: selectedAccountId,
        saleId: null, // Reset sale when credit account changes
      }));
      setSelectedSaleBalance(0); // Reset sale balance

      await fetchAccountBalance(selectedAccountId);
    },
    [fetchAccountBalance]
  );

  // Handle sale selection
  const handleSaleChange = useCallback(
    (e) => {
      const selectedId = e.target.value ? parseInt(e.target.value) : null;
      setFormData((prev) => ({ ...prev, saleId: selectedId }));

      if (selectedId) {
        const sale = sales.find((s) => s.id === selectedId);
        setSelectedSaleBalance(sale ? sale.totalAmount - sale.paidAmount : 0);
      } else {
        setSelectedSaleBalance(0);
      }
    },
    [sales]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (accountBalanceRequestRef.current) {
        accountBalanceRequestRef.current.cancelled = true;
      }
      if (salesRequestRef.current) {
        salesRequestRef.current.cancelled = true;
      }
    };
  }, []);

  return {
    formData,
    setFormData,
    creditAccounts,
    sales,
    selectedCreditAccountDetails,
    selectedSaleBalance,
    accountsLoading,
    salesLoading,
    getCustomerIdFromAccount,
    handleCreditAccountChange,
    handleSaleChange,
    handleChange,
    initializationComplete, // <--- Export initializationComplete
  };
};