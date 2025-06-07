// pages/transactions/receipts/edit/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useReceiptFormLogic } from "../../../../components/transactions/useReceiptFormLogic";
import { paymentMethods } from "../../../../lib/payments";

import ReceiptForm from "../../../../components/transactions/ReceiptForm";
import ReceiptSidebar from "../../../../components/transactions/ReceiptSidebar";

export default function EditReceipt() {
  const router = useRouter();
  const { id } = router.query;
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [originalReceiptAmount, setOriginalReceiptAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  const {
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
  } = useReceiptFormLogic(null, null, setGlobalError, id);

  useEffect(() => {
    const fetchReceiptData = async () => {
      if (!id || initialDataLoaded) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/receipts/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch receipt with ID ${id}`);
        }
        const { data: receiptData } = await response.json();

        setOriginalReceiptAmount(receiptData.amount);

        setFormData({
          customerId: receiptData.customerId || "",
          saleId: receiptData.saleId || "",
          paymentMethod: receiptData.paymentMethod,
          amount: receiptData.amount,
          reference: receiptData.reference || "",
          notes: receiptData.notes || "",
          date: receiptData.date
            ? new Date(receiptData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          creditAccountId:
            receiptData.transaction?.entries.find(
              (entry) => entry.creditAmount > 0
            )?.accountId || "",
        });
        setInitialDataLoaded(true);
      } catch (err) {
        console.error("Error fetching receipt for edit:", err);
        setGlobalError("Failed to load receipt details: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReceiptData();
    }
  }, [id, setFormData, setGlobalError, initialDataLoaded]);

  useEffect(() => {
    if (globalError) {
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      errorDiv.textContent = globalError;
      document.body.appendChild(errorDiv);
      const timer = setTimeout(() => {
        document.body.removeChild(errorDiv);
        setGlobalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGlobalError(null);

    if (!formData.creditAccountId) {
      setGlobalError("Please select an account.");
      setLoading(false);
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setGlobalError("Please enter a valid receipt amount greater than zero.");
      setLoading(false);
      return;
    }

    // For receipts, we typically don't need to check balance constraints like payments
    // since receipts increase account balances, but you can add validation if needed

    const currentCustomerId = getCustomerIdFromAccount(formData.creditAccountId);

    try {
      const response = await fetch(`/api/receipts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customerId: currentCustomerId,
          saleId: formData.saleId,
          amount: amount,
          creditAccountId: parseInt(formData.creditAccountId),
        }),
      });

      if (response.ok) {
        const successDiv = document.createElement("div");
        successDiv.className =
          "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
        successDiv.textContent = "Receipt updated successfully!";
        document.body.appendChild(successDiv);

        setTimeout(() => {
          document.body.removeChild(successDiv);
          if (currentCustomerId) {
            router.push(`/customers/${currentCustomerId}`);
          } else {
            router.push(`/transactions/`);
          }
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update receipt");
      }
    } catch (error) {
      console.error("Error updating receipt:", error);
      setGlobalError("Error updating receipt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!router.isReady || (loading && !initialDataLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-pink-50">
        <p className="text-xl text-slate-700">Loading receipt details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Edit Receipt
                </h1>
                <p className="text-slate-600">
                  Modify an existing receipt record
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReceiptForm
              formData={formData}
              setFormData={setFormData}
              creditAccounts={creditAccounts}
              sales={sales}
              selectedCreditAccountDetails={selectedCreditAccountDetails}
              selectedSaleBalance={selectedSaleBalance}
              accountsLoading={accountsLoading}
              salesLoading={salesLoading}
              getCustomerIdFromAccount={getCustomerIdFromAccount}
              handleCreditAccountChange={handleCreditAccountChange}
              handleSaleChange={handleSaleChange}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
              router={router}
              isEditing={true}
            />
          </div>

          <ReceiptSidebar
            selectedCreditAccountDetails={selectedCreditAccountDetails}
            selectedSaleBalance={selectedSaleBalance}
            formData={formData}
            paymentMethods={paymentMethods}
            originalReceiptAmount={originalReceiptAmount}
          />
        </div>
      </div>
    </div>
  );
}