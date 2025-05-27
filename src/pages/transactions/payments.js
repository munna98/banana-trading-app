// pages/transactions/payments.js

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function MakePayment() {
  const router = useRouter();
  const { supplierId: initialSupplierId, purchaseId: initialPurchaseId } =
    router.query;

  const [debitAccounts, setDebitAccounts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purchaseId: initialPurchaseId ? parseInt(initialPurchaseId) : null,
    paymentMethod: "CASH",
    amount: "",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
    debitAccountId: "",
  });
  const [selectedDebitAccountBalance, setSelectedDebitAccountBalance] =
    useState(0);
  const [selectedPurchaseBalance, setSelectedPurchaseBalance] = useState(0);

  const paymentMethods = [
    { value: "CASH", label: "Cash", icon: "💵", requiresReference: false },
    {
      value: "BANK_TRANSFER",
      label: "Bank Transfer",
      icon: "🏦",
      requiresReference: true,
    },
    { value: "CHEQUE", label: "Cheque", icon: "📄", requiresReference: true },
    { value: "UPI", label: "UPI", icon: "📱", requiresReference: true },
    { value: "CARD", label: "Card", icon: "💳", requiresReference: true },
  ];

  // Helper to find supplier linked to an account (now uses account.supplier.id from API)
  // This helper is still useful for explicitly getting the supplier ID from a debitAccount ID
  const getSupplierIdFromAccount = useCallback(
    (accountId) => {
      const account = debitAccounts.find((acc) => acc.id === accountId);
      return account?.supplier?.id || null; // Access supplier.id directly from the fetched account object
    },
    [debitAccounts]
  );

  // Fetch initial data: Debit Accounts
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const accountsResponse = await fetch(
          "/api/accounts?canBeDebitedForPayments=true&limit=500"
        );
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
            const accountBalanceResponse = await fetch(
              `/api/accounts/${supplierAccount.id}/balance`
            );
            const accountBalanceData = await accountBalanceResponse.json();
            setSelectedDebitAccountBalance(accountBalanceData.balance || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    }

    fetchInitialData();
  }, [initialSupplierId]);

  // *** REVISED useEffect for fetching purchases ***
  useEffect(() => {
    async function fetchPurchases() {
      const currentSupplierId = getSupplierIdFromAccount(
        formData.debitAccountId
      );

      if (currentSupplierId) {
        try {
          const response = await fetch(
            `/api/purchases?supplierId=${currentSupplierId}&unpaidOnly=true`
          );
          const data = await response.json();
          setPurchases(data);

          if (initialPurchaseId && data.length > 0) {
            const purchase = data.find(
              (p) => p.id === parseInt(initialPurchaseId)
            );
            if (purchase) {
              setFormData((prev) => ({ ...prev, purchaseId: purchase.id }));
              setSelectedPurchaseBalance(
                purchase ? purchase.totalAmount - purchase.paidAmount : 0
              );
            }
          }
        } catch (error) {
          console.error("Error fetching purchases:", error);
        }
      } else {
        setPurchases([]);
        setSelectedPurchaseBalance(0);
        setFormData((prev) => ({ ...prev, purchaseId: null }));
      }
    }

    // Trigger fetchPurchases whenever debitAccountId changes
    fetchPurchases();
  }, [formData.debitAccountId, initialPurchaseId, getSupplierIdFromAccount]); // Add getSupplierIdFromAccount to dependencies

  // Handle debit account selection
  const handleDebitAccountChange = async (e) => {
    const selectedAccountId = e.target.value ? parseInt(e.target.value) : "";
    let accountBalance = 0;

    if (selectedAccountId) {
      const selectedAccount = debitAccounts.find(
        (acc) => acc.id === selectedAccountId
      );
      if (selectedAccount) {
        try {
          const accountBalanceResponse = await fetch(
            `/api/accounts/${selectedAccountId}/balance`
          );
          const accountBalanceData = await accountBalanceResponse.json();
          accountBalance = accountBalanceData.balance || 0;
        } catch (error) {
          console.error("Error fetching debit account balance:", error);
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      debitAccountId: selectedAccountId,
      purchaseId: null, // Reset purchase when debit account changes
    }));
    setSelectedDebitAccountBalance(accountBalance);
    setSelectedPurchaseBalance(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const getReferencePlaceholder = useCallback((method) => {
    switch (method) {
      case "CHEQUE":
        return "Cheque number";
      case "UPI":
        return "Transaction ID";
      case "BANK_TRANSFER":
        return "Reference number";
      case "CARD":
        return "Last 4 digits";
      default:
        return "Reference";
    }
  }, []);

  const isReferenceRequired = useCallback(() => {
    const method = paymentMethods.find(
      (m) => m.value === formData.paymentMethod
    );
    return method?.requiresReference || false;
  }, [formData.paymentMethod]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Get the current supplierId based on the selected debit account
    const currentSupplierId = getSupplierIdFromAccount(formData.debitAccountId);

    try {
      if (!formData.debitAccountId || !formData.amount) {
        throw new Error("Please select an account and enter an amount.");
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supplierId: currentSupplierId, // Pass the derived supplierId to the backend
          purchaseId: formData.purchaseId,
          amount: parseFloat(formData.amount),
          debitAccountId: parseInt(formData.debitAccountId),
        }),
      });

      if (response.ok) {
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent = "Payment recorded successfully!";
        document.body.appendChild(successDiv);

        setTimeout(() => {
          document.body.removeChild(successDiv);
          // Use the derived supplierId for redirection
          if (currentSupplierId) {
            router.push(`/suppliers/${currentSupplierId}`);
          } else {
            router.push(`/transactions/`);
          }
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      errorDiv.textContent = "Error recording payment: " + error.message;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const selectedDebitAccount = debitAccounts.find(
    (acc) => acc.id === formData.debitAccountId
  );
  const displaySupplierId = getSupplierIdFromAccount(formData.debitAccountId); // Get it for conditional rendering

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Make Payment
                </h1>
                <p className="text-slate-600">
                  Record a payment from an account
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Selection - Primary field for debit account */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Account *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9H19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </div>
                    <select
                      id="debitAccountId"
                      name="debitAccountId"
                      value={formData.debitAccountId}
                      onChange={handleDebitAccountChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    >
                      <option value="">Choose an account...</option>
                      {debitAccounts.map((account) => {
                        return (
                          <option key={account.id} value={account.id}>
                            {account.name}{" "}
                            {account.parent ? `(${account.parent.name})` : ""}
                            {account.supplier
                              ? ` (Supplier: ${account.supplier.name})`
                              : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Purchase Selection (Optional, only if the selected debit account is linked to a supplier) */}
                {displaySupplierId &&
                  purchases.length > 0 && ( // Use displaySupplierId here
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Link to Purchase (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <select
                          id="purchaseId"
                          name="purchaseId"
                          value={formData.purchaseId || ""}
                          onChange={handlePurchaseChange}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                        >
                          <option value="">
                            General payment (not linked to specific purchase)
                          </option>
                          {purchases.map((purchase) => (
                            <option key={purchase.id} value={purchase.id}>
                              Invoice #{purchase.invoiceNo || purchase.id} -
                              Balance: ₹
                              {(
                                purchase.totalAmount - purchase.paidAmount
                              ).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                {/* Message if supplier is selected but no purchases found */}
                {displaySupplierId &&
                  purchases.length === 0 && ( // Use displaySupplierId here
                    <p className="text-sm text-slate-500 italic">
                      No unpaid purchases found for this supplier.
                    </p>
                  )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.paymentMethod === method.value
                            ? "border-pink-500 bg-pink-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="text-2xl mb-1">{method.icon}</span>
                        <span className="text-xs font-medium text-center text-slate-700">
                          {method.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reference Number (conditionally displayed) */}
                {isReferenceRequired() && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {getReferencePlaceholder(formData.paymentMethod)}{" "}
                      (Optional)
                    </label>
                    <input
                      type="text"
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      placeholder={getReferencePlaceholder(
                        formData.paymentMethod
                      )}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>
                )}

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>
                  {/* Quick amount buttons for purchase balance */}
                  {selectedPurchaseBalance > 0 && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: selectedPurchaseBalance.toFixed(2),
                          }))
                        }
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Pay Full Purchase Balance (₹
                        {selectedPurchaseBalance.toFixed(2)})
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Add any additional notes about this payment..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900 resize-none"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 focus:ring-2 focus:ring-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading || !formData.debitAccountId || !formData.amount
                    }
                    className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Payment Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Current Debit Account Balance Card */}
            {selectedDebitAccount && ( // Use selectedDebitAccount for name
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-red-900">
                      {selectedDebitAccount.name} Balance
                    </h3>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{selectedDebitAccountBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Balance (if selected) */}
            {selectedPurchaseBalance > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-orange-900">
                      Purchase Balance
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{selectedPurchaseBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Preview */}
            {formData.amount && formData.debitAccountId && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Paying from:</span>
                    <span className="font-semibold text-green-900">
                      {selectedDebitAccount?.name} {/* Use optional chaining */}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Method:</span>
                    <span className="font-semibold text-green-900">
                      {
                        paymentMethods.find(
                          (m) => m.value === formData.paymentMethod
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-semibold text-green-900">
                      ₹{parseFloat(formData.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  {formData.reference && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Reference:</span>
                      <span className="font-semibold text-green-900">
                        {formData.reference}
                      </span>
                    </div>
                  )}
                  <hr className="border-green-200" />
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">
                      New Account Balance:
                    </span>
                    <span className="font-bold text-green-900">
                      ₹
                      {(
                        selectedDebitAccountBalance -
                        parseFloat(formData.amount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <h3 className="lg font-semibold text-purple-900 mb-4">
                💡 Payment Tips
              </h3>
              <ul className="space-y-3 text-sm text-purple-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  Select the specific account for this payment (e.g., a
                  supplier's dedicated payable account, or an expense account).
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  If paying a supplier, you can optionally link it to a specific
                  unpaid purchase.
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  Reference numbers help track digital payments, but are
                  optional.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
