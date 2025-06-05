// pages/transactions/payments/edit/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { usePaymentFormLogic } from "../../../../components/transactions/usePaymentFormLogic";
import { paymentMethods } from "../../../../lib/payments";

import PaymentForm from "../../../../components/transactions/PaymentForm";
import PaymentSidebar from "../../../../components/transactions/PaymentSidebar";

export default function EditPayment() {
  const router = useRouter();
  const { id } = router.query; // Get the payment ID from the URL
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null); // For errors not tied to specific fields

  // Pass the payment ID to the usePaymentFormLogic hook
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
  } = usePaymentFormLogic(null, null, setGlobalError, id); // Pass 'id' as the last argument

  // Fetch existing payment data on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!id || initialDataLoaded) return; // Don't fetch if no ID or already loaded

      try {
        setLoading(true);
        const response = await fetch(`/api/payments/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch payment with ID ${id}`);
        }
        const { data: paymentData } = await response.json();

        // Initialize formData with fetched data
        setFormData({
          supplierId: paymentData.supplierId || '',
          purchaseId: paymentData.purchaseId || '',
          paymentMethod: paymentData.paymentMethod,
          amount: paymentData.amount,
          reference: paymentData.reference || '',
          notes: paymentData.notes || '',
          date: paymentData.date ? new Date(paymentData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          debitAccountId: paymentData.transaction?.entries.find(entry => entry.debitAmount > 0)?.accountId || '',
        });
        setInitialDataLoaded(true); // Mark data as loaded
      } catch (err) {
        console.error("Error fetching payment for edit:", err);
        setGlobalError("Failed to load payment details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) { // Only fetch if ID is available
        fetchPaymentData();
    }
  }, [id, setFormData, setGlobalError, initialDataLoaded]);


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
    // NOTE: For edits, you might need more complex logic here, as the balance check should consider the original amount vs. new amount.
    // For simplicity, this example re-applies the same check.
    if (selectedDebitAccountDetails) {
      // You'd need to fetch the original payment amount and adjust the 'availableForPayment' for this check
      // For now, it performs a simple check on the current available balance.
      // A more robust solution might involve sending the original amount to the backend
      // and having the backend handle the balance check taking the delta into account.
      if (selectedDebitAccountDetails.type === 'ASSET' && amount > selectedDebitAccountDetails.availableForPayment) {
        setGlobalError("Insufficient funds in the selected account.");
        setLoading(false);
        return;
      }
    }

    const currentSupplierId = getSupplierIdFromAccount(formData.debitAccountId);

    try {
      // Use PUT request for updating
      const response = await fetch(`/api/payments/${id}`, {
        method: "PUT", // <--- Changed method to PUT
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
        successDiv.textContent = "Payment updated successfully!"; // <--- Updated message
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
        throw new Error(error.message || "Failed to update payment"); // <--- Updated message
      }
    } catch (error) {
      console.error("Error updating payment:", error); // <--- Updated message
      setGlobalError("Error updating payment: " + error.message); // <--- Updated message
    } finally {
      setLoading(false);
    }
  };

  if (!router.isReady || loading && !initialDataLoaded) { // Show loading until router is ready and initial data is loaded
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-pink-50">
            <p className="text-xl text-slate-700">Loading payment details...</p>
        </div>
    );
  }

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
                  Edit Payment
                </h1>
                <p className="text-slate-600">Modify an existing payment record</p>
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
      </div>
    </div>
  );
}