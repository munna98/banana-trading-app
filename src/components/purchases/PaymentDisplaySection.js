// components/purchases/PaymentDisplaySection.js
import React from "react";

export default function PaymentDisplaySection({
  formData,
  setFormData,
  setNewPayment,
  setEditingPaymentIndex,
  editingPaymentIndex,
  calculateTotalAmount,
  calculateTotalPaidAmount,
}) {
  const editPayment = (index) => {
    const paymentToEdit = formData.payments[index];
    setNewPayment({
      amount: paymentToEdit.amount.toString(),
      method: paymentToEdit.method,
      reference: paymentToEdit.reference || "",
    });
    setEditingPaymentIndex(index);
    // Focus on amount input in the other component (if possible, or rely on user interaction)
    // paymentAmountRef.current?.focus(); // This ref is in PaymentInputSection
  };

  const removePayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index),
    }));
    if (editingPaymentIndex === index) {
      // If the removed item was being edited, clear the edit state
      setNewPayment({ amount: "", method: "CASH", reference: "" }); // Default method
      setEditingPaymentIndex(null);
    } else if (editingPaymentIndex > index) {
      // If an item after the removed one was being edited, adjust the index
      setEditingPaymentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-900 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Payment Summary ({formData.payments.length})
      </h3>

      {formData.payments.length > 0 ? (
        <div className="space-y-4">
          {/* Payment Cards */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {formData.payments.map((payment, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-lg font-semibold text-slate-900">
                          ₹{payment.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-slate-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-600">
                          {payment.method.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    {payment.reference && (
                      <div className="mt-2 flex items-center space-x-2">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4L5.5 6M17 4l1.5 2M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"
                          />
                        </svg>
                        <span className="text-sm text-slate-500">
                          {payment.reference}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      type="button"
                      onClick={() => editPayment(index)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Payment"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removePayment(index)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Remove Payment"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
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
                  <span className="font-semibold text-blue-900">
                    Total Paid
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-900">
                  ₹{calculateTotalPaidAmount().toFixed(2)}
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl p-4 border ${
                calculateTotalAmount() - calculateTotalPaidAmount() > 0
                  ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
                  : "bg-gradient-to-r from-green-50 to-green-100 border-green-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-5 h-5 ${
                      calculateTotalAmount() - calculateTotalPaidAmount() > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={`font-semibold ${
                      calculateTotalAmount() - calculateTotalPaidAmount() > 0
                        ? "text-red-900"
                        : "text-green-900"
                    }`}
                  >
                    {calculateTotalAmount() - calculateTotalPaidAmount() > 0
                      ? "Amount Due"
                      : "Fully Paid"}
                  </span>
                </div>
                <span
                  className={`text-xl font-bold ${
                    calculateTotalAmount() - calculateTotalPaidAmount() > 0
                      ? "text-red-900"
                      : "text-green-900"
                  }`}
                >
                  ₹
                  {Math.abs(
                    calculateTotalAmount() - calculateTotalPaidAmount()
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-200">
          <svg
            className="w-12 h-12 text-slate-400 mx-auto mb-4"
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
          <h4 className="text-lg font-medium text-slate-900 mb-2">
            No Payments Added
          </h4>
          <p className="text-slate-600">
            Add your first payment using the form on the left.
          </p>
        </div>
      )}
    </div>
  );
}