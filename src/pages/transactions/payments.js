import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePaymentFormLogic } from "../../components/transactions/usePaymentFormLogic";
import { paymentMethods } from "../../lib/payments"; // Keep this for passing to PaymentSummaryCard

import PaymentForm from "../../components/transactions/PaymentForm";
import PaymentSidebar from "../../components/transactions/PaymentSidebar";

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
    selectedDebitAccountDetails,
    selectedPurchaseBalance,
    accountsLoading,
    purchasesLoading,
    getSupplierIdFromAccount,
    handleDebitAccountChange,
    handlePurchaseChange,
    handleChange,
  } = usePaymentFormLogic(initialSupplierId, initialPurchaseId, setGlobalError);

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

    // Payment restriction logic (moved from original handleSubmit to maintain existing logic)
    if (selectedDebitAccountDetails) {
      if (selectedDebitAccountDetails.type === 'ASSET' && amount > selectedDebitAccountDetails.availableForPayment) {
        setGlobalError("Insufficient funds in the selected account.");
        setLoading(false);
        return;
      }
    }

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
              router={router} // Pass router for the Cancel button
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
      </div>
    </div>
  );
}