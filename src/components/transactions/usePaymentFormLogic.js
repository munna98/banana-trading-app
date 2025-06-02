// components/transactions/usePaymentFormLogic.js

import { useState, useEffect, useCallback } from "react";

export const usePaymentFormLogic = (
  initialSupplierId,
  initialPurchaseId,
  setGlobalError
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

  // Fetch initial data: Debit Accounts
  useEffect(() => {
    async function fetchInitialAccounts() {
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

        if (
          initialSupplierId &&
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

    fetchInitialAccounts();
  }, [initialSupplierId, fetchAndSetDebitAccountBalance, setGlobalError]);

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

          // FIX: Use data.data instead of data
          setPurchases(data.data || []); // <-- This was the issue!

          if (initialPurchaseId && data.data && data.data.length > 0) {
            const purchase = data.data.find(
              // <-- And here too
              (p) => p.id === parseInt(initialPurchaseId)
            );
            if (purchase) {
              setSelectedPurchaseBalance(
                purchase.totalAmount - purchase.paidAmount
              );
              setFormData((prev) => ({ ...prev, purchaseId: purchase.id }));
            }
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
  };
};
