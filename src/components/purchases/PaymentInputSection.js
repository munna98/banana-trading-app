// components/purchases/PaymentInputSection.js
import { useRef } from "react";
import PaymentMethodSelection from "../transactions/PaymentMethodSelection";
import {
  paymentMethods,
  getReferencePlaceholder,
  isReferenceRequired,
} from "../../lib/payments";

export default function PaymentInputSection({
  formData,
  setFormData,
  newPayment,
  setNewPayment,
  editingPaymentIndex,
  setEditingPaymentIndex,
  errors,
  setErrors,
  calculateTotalAmount,
  calculateTotalPaidAmount,
}) {
  const paymentAmountRef = useRef(null);

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => {
      const updatedPayment = { ...prev, [name]: value };

      // If method changes, reset reference if the new method doesn't require it
      if (name === "method") {
        const requiresRef = isReferenceRequired(value);
        if (!requiresRef) {
          updatedPayment.reference = "";
        }
      }
      return updatedPayment;
    });
    setErrors((prev) => ({
      ...prev,
      currentPayment: { ...prev.currentPayment, [name]: undefined },
    }));
  };

  const addPaymentToList = () => {
    const currentPaymentErrors = {};
    const paymentAmount = parseFloat(newPayment.amount);
    const totalPurchaseAmount = parseFloat(calculateTotalAmount());
    const totalPaidAmount = parseFloat(calculateTotalPaidAmount());

    if (!newPayment.amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      currentPaymentErrors.amount = "Positive amount required.";
    } else {
      // Calculate remaining amount considering if we're editing an existing payment
      let remainingAmount = totalPurchaseAmount - totalPaidAmount;
      if (editingPaymentIndex !== null) {
        // If editing, add back the current editing payment amount to get accurate remaining
        const editingPayment = formData.payments[editingPaymentIndex];
        remainingAmount += editingPayment.amount;
      }
      
      if (paymentAmount > remainingAmount) {
        currentPaymentErrors.amount = `Payment cannot exceed remaining amount (₹${remainingAmount.toFixed(2)}).`;
      }
    }

    if (
      isReferenceRequired(newPayment.method) &&
      !newPayment.reference.trim()
    ) {
      currentPaymentErrors.reference =
        "Reference is required for this payment method.";
    }

    if (Object.keys(currentPaymentErrors).length > 0) {
      setErrors((prev) => ({ ...prev, currentPayment: currentPaymentErrors }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, currentPayment: undefined }));
    }

    const newPaymentData = {
      amount: paymentAmount,
      method: newPayment.method,
      reference: newPayment.reference,
    };

    if (editingPaymentIndex !== null) {
      const updatedPayments = [...formData.payments];
      updatedPayments[editingPaymentIndex] = newPaymentData;
      setFormData((prev) => ({
        ...prev,
        payments: updatedPayments,
      }));
      setEditingPaymentIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        payments: [...prev.payments, newPaymentData],
      }));
    }
    setNewPayment({
      amount: "",
      method: paymentMethods[0]?.value || "CASH",
      reference: "",
    }); // Reset for next payment
    paymentAmountRef.current?.focus();
  };

  const cancelPaymentEdit = () => {
    setNewPayment({
      amount: "",
      method: paymentMethods[0]?.value || "CASH",
      reference: "",
    });
    setEditingPaymentIndex(null);
    paymentAmountRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-900 flex items-center">
        <svg
          className="w-6 h-6 mr-2 text-green-500"
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
        {editingPaymentIndex !== null ? "Edit Payment" : "Add Payment"}
      </h3>

      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label
              htmlFor="paymentAmount"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 text-lg">₹</span>
              </div>
              <input
                type="number"
                id="paymentAmount"
                name="amount"
                placeholder="0.00"
                value={newPayment.amount}
                onChange={handleNewPaymentChange}
                ref={paymentAmountRef}
                min="0.01"
                step="0.01"
                className={`w-full pl-8 py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white ${
                  errors.currentPayment?.amount
                    ? "border-red-500"
                    : "border-slate-300"
                }`}
              />
            </div>
            {errors.currentPayment?.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPayment.amount}
              </p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <PaymentMethodSelection
              paymentMethods={paymentMethods}
              formData={newPayment}
              handleChange={handleNewPaymentChange}
            />
          </div>

          {/* Reference Input */}
          <div>
            <label
              htmlFor="paymentReference"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Reference{" "}
              {isReferenceRequired(newPayment.method) && (
                <span className="text-red-500">*</span>
              )}
              {!isReferenceRequired(newPayment.method) && (
                <span className="text-slate-500">(Optional)</span>
              )}
            </label>
            <input
              type="text"
              id="paymentReference"
              name="reference"
              placeholder={getReferencePlaceholder(newPayment.method)}
              value={newPayment.reference}
              onChange={handleNewPaymentChange}
              className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white ${
                errors.currentPayment?.reference
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
              required={isReferenceRequired(newPayment.method)}
            />
            {errors.currentPayment?.reference && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPayment.reference}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={addPaymentToList}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    editingPaymentIndex !== null
                      ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      : "M12 4v16m8-8H4"
                  }
                />
              </svg>
              {editingPaymentIndex !== null ? "Update Payment" : "Add Payment"}
            </button>
            {editingPaymentIndex !== null && (
              <button
                type="button"
                onClick={cancelPaymentEdit}
                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200 shadow-md"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}