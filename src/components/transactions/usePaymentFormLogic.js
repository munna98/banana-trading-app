// components/transactions/usePaymentFormLogic.js

import { useState, useEffect, useCallback } from "react";

export const usePaymentFormLogic = (
  initialSupplierId,
  initialPurchaseId,
  setGlobalError,
  paymentId = null // Added paymentId parameter
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
  const [selectedDebitAccountDetails, setSelectedDebitAccountDetails] =
    useState(null); // Stores full balance API response
  const [selectedPurchaseBalance, setSelectedPurchaseBalance] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false); // New state to track initial data load for edits

  // Helper to find supplier linked to an account
  const getSupplierIdFromAccount = useCallback(
    (accountId) => {
      const account = debitAccounts.find((acc) => acc.id === accountId);
      return account?.supplier?.id || null;
    },
    [debitAccounts]
  );

  // Shared function to fetch and set the selected debit account's balance
  const fetchAndSetDebitAccountBalance = useCallback(
    async (accountId) => {
      if (!accountId) {
        setSelectedDebitAccountDetails(null);
        return;
      }
      try {
        const response = await fetch(
          `/api/accounts/${accountId}/balance?context=payment`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch account balance"
          );
        }
        const data = await response.json();
        setSelectedDebitAccountDetails(data); // Store the full data object
      } catch (error) {
        console.error("Error fetching debit account balance:", error);
        setSelectedDebitAccountDetails(null);
        setGlobalError(`Error fetching account balance: ${error.message}`);
      }
    },
    [setGlobalError]
  );

  // Effect to load existing payment data if paymentId is provided (for edit mode)
  useEffect(() => {
    const loadExistingPayment = async () => {
      if (paymentId && !isInitialDataLoaded) {
        setAccountsLoading(true); // Set loading to true while fetching existing payment
        try {
          const response = await fetch(`/api/payments/${paymentId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch existing payment");
          }
          const { data: paymentData } = await response.json();

          // Set formData with fetched data
          setFormData((prev) => ({
            ...prev,
            purchaseId: paymentData.purchaseId || null,
            paymentMethod: paymentData.paymentMethod,
            amount: paymentData.amount,
            reference: paymentData.reference || "",
            notes: paymentData.notes || "",
            date: paymentData.date ? new Date(paymentData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            // Find the debit account ID from transaction entries
            debitAccountId: paymentData.transaction?.entries.find(entry => entry.debitAmount > 0)?.accountId || "",
          }));

          // Fetch balance for the pre-selected account
          if (paymentData.transaction?.entries.find(entry => entry.debitAmount > 0)?.accountId) {
            fetchAndSetDebitAccountBalance(paymentData.transaction.entries.find(entry => entry.debitAmount > 0).accountId);
          }

          setIsInitialDataLoaded(true); // Mark initial data as loaded
        } catch (error) {
          console.error("Error loading existing payment:", error);
          setGlobalError(`Error loading existing payment: ${error.message}`);
        } finally {
          setAccountsLoading(false); // Set loading back to false
        }
      }
    };

    loadExistingPayment();
  }, [paymentId, setGlobalError, fetchAndSetDebitAccountBalance, isInitialDataLoaded]);


  // Fetch initial data: Debit Accounts
  useEffect(() => {
    async function fetchInitialAccounts() {
      // Only fetch if not in edit mode or if initial data hasn't been loaded yet for edit
      if (!paymentId || !isInitialDataLoaded) {
        setAccountsLoading(true);
        try {
          const accountsResponse = await fetch(
            "/api/accounts?canBeDebitedForPayments=true&limit=500"
          );
          if (!accountsResponse.ok) {
            const errorData = await accountsResponse.json();
            throw new Error(errorData.message || "Failed to fetch accounts");
          }
          const accountsData = await accountsResponse.json();
          setDebitAccounts(accountsData.data || []);

          // This block is primarily for initial payment creation from supplier context
          if (
            initialSupplierId &&
            !paymentId && // Only apply if not editing
            accountsData.data &&
            accountsData.data.length > 0
          ) {
            const supplierAccount = accountsData.data.find(
              (acc) => acc.supplier?.id === parseInt(initialSupplierId)
            );
            if (supplierAccount) {
              setFormData((prev) => ({
                ...prev,
                debitAccountId: supplierAccount.id,
              }));
              fetchAndSetDebitAccountBalance(supplierAccount.id);
            }
          }
        } catch (error) {
          console.error("Error fetching initial accounts:", error);
          setGlobalError(`Error fetching accounts: ${error.message}`);
        } finally {
          setAccountsLoading(false);
        }
      }
    }

    fetchInitialAccounts();
  }, [initialSupplierId, paymentId, isInitialDataLoaded, fetchAndSetDebitAccountBalance, setGlobalError]);


  // Fetch purchases when the selected debit account (and thus supplier) changes
  useEffect(() => {
    async function fetchPurchases() {
      const currentSupplierId = getSupplierIdFromAccount(
        formData.debitAccountId
      );

      if (currentSupplierId) {
        setPurchasesLoading(true);
        try {
          const response = await fetch(
            `/api/purchases?supplierId=${currentSupplierId}&unpaidOnly=true`
          );
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch purchases");
          }
          const data = await response.json();

          setPurchases(data.data || []);

          // This block is primarily for initial payment creation from purchase context
          if (initialPurchaseId && data.data && data.data.length > 0 && !paymentId) {
            const purchase = data.data.find(
              (p) => p.id === parseInt(initialPurchaseId)
            );
            if (purchase) {
              setSelectedPurchaseBalance(
                purchase.totalAmount - purchase.paidAmount
              );
              setFormData((prev) => ({ ...prev, purchaseId: purchase.id }));
            }
          } else if (formData.purchaseId) { // If a purchase is already selected (e.g., from edit mode), update its balance
              const currentPurchase = data.data.find(p => p.id === formData.purchaseId);
              setSelectedPurchaseBalance(
                  currentPurchase ? currentPurchase.totalAmount - currentPurchase.paidAmount : 0
              );
          }


        } catch (error) {
          console.error("Error fetching purchases:", error);
          setGlobalError(`Error fetching purchases: ${error.message}`);
        } finally {
          setPurchasesLoading(false);
        }
      } else {
        setPurchases([]);
        setSelectedPurchaseBalance(0);
        setFormData((prev) => ({ ...prev, purchaseId: null }));
      }
    }

    fetchPurchases();
  }, [
    formData.debitAccountId,
    initialPurchaseId,
    paymentId, // Added paymentId dependency
    formData.purchaseId, // Added to re-evaluate if purchaseId changes
    getSupplierIdFromAccount,
    setGlobalError,
  ]);

  // Handle debit account selection
  const handleDebitAccountChange = async (e) => {
    const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";

    setFormData((prev) => ({
      ...prev,
      debitAccountId: selectedAccountId,
      purchaseId: null, // Reset purchase when debit account changes
    }));
    setSelectedPurchaseBalance(0); // Reset purchase balance

    fetchAndSetDebitAccountBalance(selectedAccountId);
  };

  // Handle purchase selection
  const handlePurchaseChange = (e) => {
    const selectedId = e.target.value ? parseInt(e.target.value) : null;
    setFormData((prev) => ({ ...prev, purchaseId: selectedId }));

    if (selectedId) {
      const purchase = purchases.find((p) => p.id === selectedId);
      setSelectedPurchaseBalance(
        purchase ? purchase.totalAmount - purchase.paidAmount : 0
      );
    } else {
      setSelectedPurchaseBalance(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    isInitialDataLoaded // Expose this to the component
  };
};