

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useReceiptFormLogic } from "../../components/transactions/useReceiptFormLogic"; // Changed import
import { paymentMethods } from "../../lib/payments"; // Assuming paymentMethods is general enough, or you'll create a receipt-specific one

import ReceiptForm from "../../components/transactions/ReceiptForm"; // Changed import
import ReceiptSidebar from "../../components/transactions/ReceiptSidebar"; // Changed import

export default function ReceivePayment() { // Changed function name
  const router = useRouter();
  const { customerId: initialCustomerId, saleId: initialSaleId } = router.query; // Changed query params

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null); // For errors not tied to specific fields

  const {
    formData,
    setFormData,
    creditAccounts, // Changed from debitAccounts
    sales, // Changed from purchases
    selectedCreditAccountDetails, // Changed from selectedDebitAccountDetails
    selectedSaleBalance, // Changed from selectedPurchaseBalance
    accountsLoading,
    salesLoading, // Changed from purchasesLoading
    getCustomerIdFromAccount, // Changed from getSupplierIdFromAccount
    handleCreditAccountChange, // Changed from handleDebitAccountChange
    handleSaleChange, // Changed from handlePurchaseChange
    handleChange,
  } = useReceiptFormLogic(initialCustomerId, initialSaleId, setGlobalError); // Changed initial props

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
    if (!formData.creditAccountId) { // Changed field
      setGlobalError("Please select an account to receive into."); // Updated message
      setLoading(false);
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setGlobalError("Please enter a valid receipt amount greater than zero."); // Updated message
      setLoading(false);
      return;
    }

    const currentCustomerId = getCustomerIdFromAccount(formData.creditAccountId); // Changed function and field

    try {
      const response = await fetch("/api/receipts", { // Changed API endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customerId: currentCustomerId, // Changed field
          saleId: formData.saleId, // Changed field
          amount: amount, // Use parsed amount
          creditAccountId: parseInt(formData.creditAccountId), // Changed field
        }),
      });

      if (response.ok) {
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent = "Receipt recorded successfully!"; // Updated message
        document.body.appendChild(successDiv);

        setTimeout(() => {
          document.body.removeChild(successDiv);
          if (currentCustomerId) { // Changed variable
            router.push(`/customers/${currentCustomerId}`); // Changed path
          } else {
            router.push(`/transactions/`); // General transactions page
          }
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to record receipt"); // Updated message
      }
    } catch (error) {
      console.error("Error recording receipt:", error); // Updated message
      setGlobalError("Error recording receipt: " + error.message); // Updated message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50"> {/* Changed gradient color */}
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
                  Record Receipt {/* Changed title */}
                </h1>
                <p className="text-slate-600">Record an incoming payment into an account</p> {/* Changed description */}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <ReceiptForm // Changed component
              formData={formData}
              setFormData={setFormData}
              creditAccounts={creditAccounts} // Changed prop
              sales={sales} // Changed prop
              selectedCreditAccountDetails={selectedCreditAccountDetails} // Changed prop
              selectedSaleBalance={selectedSaleBalance} // Changed prop
              accountsLoading={accountsLoading}
              salesLoading={salesLoading} // Changed prop
              getCustomerIdFromAccount={getCustomerIdFromAccount} // Changed prop
              handleCreditAccountChange={handleCreditAccountChange} // Changed prop
              handleSaleChange={handleSaleChange} // Changed prop
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              router={router} // Pass router for the Cancel button
            />
          </div>

          {/* Sidebar - Receipt Info */}
          <ReceiptSidebar // Changed component
            selectedCreditAccountDetails={selectedCreditAccountDetails} // Changed prop
            selectedSaleBalance={selectedSaleBalance} // Changed prop
            formData={formData}
            paymentMethods={paymentMethods}
          />
        </div>
      </div>
    </div>
  );
}