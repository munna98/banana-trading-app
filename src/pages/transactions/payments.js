import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePaymentFormLogic } from "../../components/transactions/usePaymentFormLogic";
import { paymentMethods } from "../../lib/payments";

import PaymentForm from "../../components/transactions/PaymentForm";
import PaymentSidebar from "../../components/transactions/PaymentSidebar";

// Custom hook for toast notifications
const useToast = () => {
  const showToast = useCallback((message, type = 'success') => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    const timer = setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, type === 'success' ? 2000 : 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return { showToast };
};

// Custom hook for form validation
const usePaymentValidation = () => {
  const validatePayment = useCallback((formData, selectedDebitAccountDetails) => {
    // Validate account selection
    if (!formData.debitAccountId) {
      throw new Error("Please select an account.");
    }

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Please enter a valid payment amount greater than zero.");
    }

    // Validate sufficient funds for asset accounts
    if (selectedDebitAccountDetails?.type === 'ASSET' && 
        amount > selectedDebitAccountDetails.availableForPayment) {
      throw new Error("Insufficient funds in the selected account.");
    }

    return amount;
  }, []);

  return { validatePayment };
};

export default function MakePayment() {
  const router = useRouter();
  const { supplierId: initialSupplierId, purchaseId: initialPurchaseId } = router.query;
  const { showToast } = useToast();
  const { validatePayment } = usePaymentValidation();

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const {
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
  } = usePaymentFormLogic(initialSupplierId, initialPurchaseId, setGlobalError);

  // Show global errors as toast
  if (globalError) {
    showToast(globalError, 'error');
    setGlobalError(null);
  }

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);

    try {
      // Validate form data
      const amount = validatePayment(formData, selectedDebitAccountDetails);
      const currentSupplierId = getSupplierIdFromAccount(formData.debitAccountId);

      // Submit payment
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          supplierId: currentSupplierId,
          purchaseId: formData.purchaseId,
          amount: amount,
          debitAccountId: parseInt(formData.debitAccountId),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to record payment");
      }

      // Show success message and redirect
      showToast("Payment recorded successfully!");
      
      setTimeout(() => {
        if (currentSupplierId) {
          router.push(`/suppliers/${currentSupplierId}`);
        } else {
          router.push(`/transactions/`);
        }
      }, 2000);

    } catch (error) {
      console.error("Error recording payment:", error);
      setGlobalError("Error recording payment: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [formData, selectedDebitAccountDetails, getSupplierIdFromAccount, validatePayment, showToast, router]);

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

        {/* Show loading state during initialization */}
        {!initializationComplete ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <PaymentForm
                formData={formData}
                setFormData={setFormData}
                debitAccounts={debitAccounts}
                purchases={purchases}
                selectedDebitAccountDetails={selectedDebitAccountDetails}
                selectedPurchaseBalance={selectedPurchaseBalance}
                accountsLoading={accountsLoading}
                purchasesLoading={purchasesLoading}
                getSupplierIdFromAccount={getSupplierIdFromAccount}
                handleDebitAccountChange={handleDebitAccountChange}
                handlePurchaseChange={handlePurchaseChange}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                router={router}
              />
            </div>

            {/* Sidebar - Payment Info */}
            <PaymentSidebar
              selectedDebitAccountDetails={selectedDebitAccountDetails}
              selectedPurchaseBalance={selectedPurchaseBalance}
              formData={formData}
              paymentMethods={paymentMethods}
            />
          </div>
        )}
      </div>
    </div>
  );
}