// pages/transactions/payments.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePaymentFormLogic } from "../../components/transactions/usePaymentFormLogic";
import { paymentMethods, getReferencePlaceholder, isReferenceRequired } from "../../lib/payments";

export default function MakePayment() {
  const router = useRouter();
  const { supplierId: initialSupplierId, purchaseId: initialPurchaseId } = router.query;

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null); // For errors not tied to specific fields

  const {
    formData,
    setFormData,
    debitAccounts,
    purchases,
    selectedDebitAccountDetails, // Now contains the full balance API response
    selectedPurchaseBalance,
    accountsLoading,
    purchasesLoading,
    getSupplierIdFromAccount,
    handleDebitAccountChange,
    handlePurchaseChange,
    handleChange,
  } = usePaymentFormLogic(initialSupplierId, initialPurchaseId, setGlobalError);

  const selectedDebitAccount = debitAccounts.find(
    (acc) => acc.id === formData.debitAccountId
  );
  const displaySupplierId = getSupplierIdFromAccount(formData.debitAccountId);

  // Display global errors
  useEffect(() => {
    if (globalError) {
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      errorDiv.textContent = globalError;
      document.body.appendChild(errorDiv);
      const timer = setTimeout(() => {
        document.body.removeChild(errorDiv);
        setGlobalError(null); // Clear the error after display
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null); // Clear previous errors

    // Client-side validation
    if (!formData.debitAccountId) {
      setGlobalError("Please select an account.");
      setLoading(false);
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setGlobalError("Please enter a valid payment amount greater than zero.");
      setLoading(false);
      return;
    }

    // --- START: MODIFIED PAYMENT RESTRICTION LOGIC ---
    if (selectedDebitAccountDetails) {
      // For ASSET accounts: Restrict if payment exceeds available funds.
      if (selectedDebitAccountDetails.type === 'ASSET' && amount > selectedDebitAccountDetails.availableForPayment) {
        setGlobalError("Insufficient funds in the selected account.");
        setLoading(false);
        return;
      }
      // For LIABILITY accounts: No explicit restriction based on balance for outgoing payments.
      // A payment to a liability account (which can include a supplier account)
      // either reduces an amount owed (positive balance) or increases an advance paid (negative balance).
      // In both scenarios, the payment is generally allowed as it's an action to the account.
    }
    // --- END: MODIFIED PAYMENT RESTRICTION LOGIC ---


    const currentSupplierId = getSupplierIdFromAccount(formData.debitAccountId);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supplierId: currentSupplierId,
          purchaseId: formData.purchaseId,
          amount: amount, // Use parsed amount
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
      setGlobalError("Error recording payment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-slate-600">Record a payment from an account</p>
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
                    {accountsLoading ? (
                      <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 animate-pulse">
                        Loading accounts...
                      </div>
                    ) : (
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
                    )}
                  </div>
                </div>

                {/* Purchase Selection (Optional, only if the selected debit account is linked to a supplier) */}
                {displaySupplierId && (
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
                      {purchasesLoading ? (
                        <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 animate-pulse">
                          Loading purchases...
                        </div>
                      ) : (purchases.length > 0 ? (
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
                      ) : (
                        <p className="text-sm text-slate-500 italic py-3 pl-10">
                          No unpaid purchases found for this supplier.
                        </p>
                      )
                      )}
                    </div>
                  </div>
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
                {isReferenceRequired(formData.paymentMethod) && (
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
                      loading ||
                      !formData.debitAccountId ||
                      parseFloat(formData.amount) <= 0 ||
                      // Only disable if it's an ASSET account and insufficient funds
                      (selectedDebitAccountDetails?.type === 'ASSET' && parseFloat(formData.amount) > selectedDebitAccountDetails.availableForPayment)
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
            {selectedDebitAccountDetails && (
              <div className={`rounded-2xl p-6 border ${
                  selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY' ? 'bg-red-50 to-red-100 border-red-200'
                : selectedDebitAccountDetails.balanceType === 'liability' ? 'bg-orange-50 to-orange-100 border-orange-200'
                : 'bg-green-50 to-green-100 border-green-200'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY' ? 'bg-red-500'
                      : selectedDebitAccountDetails.balanceType === 'liability' ? 'bg-orange-500'
                      : 'bg-green-500'
                    }`}>
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
                    <h3 className={`text-sm font-medium ${
                        selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY' ? 'text-red-900'
                      : selectedDebitAccountDetails.balanceType === 'liability' ? 'text-orange-900'
                      : 'text-green-900'
                    }`}>
                      {selectedDebitAccountDetails.accountName} Balance
                    </h3>
                    <p className={`text-2xl font-bold ${
                        selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY' ? 'text-red-600'
                      : selectedDebitAccountDetails.balanceType === 'liability' ? 'text-orange-600'
                      : 'text-green-600'
                    }`}>
                      ₹{selectedDebitAccountDetails.displayBalance.toFixed(2)}
                    </p>
                    {selectedDebitAccountDetails.balanceDescription && (
                      <p className={`text-xs ${
                          selectedDebitAccountDetails.balanceType === 'negative' && selectedDebitAccountDetails.type !== 'LIABILITY' ? 'text-red-700'
                        : selectedDebitAccountDetails.balanceType === 'liability' ? 'text-orange-700'
                        : 'text-green-700'
                      }`}>
                        {selectedDebitAccountDetails.balanceDescription}
                      </p>
                    )}
                    {selectedDebitAccountDetails.warningMessage && (
                      <p className="text-xs text-orange-700 mt-1">
                        ⚠️ {selectedDebitAccountDetails.warningMessage}
                      </p>
                    )}
                      {selectedDebitAccountDetails.contextMessage && (
                      <p className="text-xs text-green-700 mt-1 italic">
                        {selectedDebitAccountDetails.contextMessage}
                      </p>
                    )}
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
                      Purchase Balance Due
                    </h3>
                    <p className="text-2xl font-bold text-orange-600">
                      ₹{selectedPurchaseBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Preview */}
            {formData.amount && formData.debitAccountId && selectedDebitAccountDetails && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Paying from:</span>
                    <span className="font-semibold text-blue-900">
                      {selectedDebitAccountDetails.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payment Method:</span>
                    <span className="font-semibold text-blue-900">
                      {
                        paymentMethods.find(
                          (m) => m.value === formData.paymentMethod
                        )?.label
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Amount:</span>
                    <span className="font-semibold text-blue-900">
                      ₹{parseFloat(formData.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  {formData.reference && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Reference:</span>
                      <span className="font-semibold text-blue-900">
                        {formData.reference}
                      </span>
                    </div>
                  )}
                  <hr className="border-blue-200" />
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">
                      New Account Balance:
                    </span>
                    <span className="font-bold text-blue-900">
                      ₹
                      {(
                        selectedDebitAccountDetails.accountingBalance -
                        parseFloat(formData.amount || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}