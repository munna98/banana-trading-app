// components/purchases/PaymentSection.js
import PaymentInputSection from "./PaymentInputSection";
import PaymentDisplaySection from "./PaymentDisplaySection";
import { paymentMethods } from "../../lib/payments"; // Optional, keep if needed

export default function PaymentSection({
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
  isCollapsed,
  onToggleCollapse,
}) {
  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      {/* Toggle Header */}
      <div className="flex justify-between items-center cursor-pointer mb-4" onClick={onToggleCollapse}>
        <h2 className="text-lg font-semibold text-slate-700">Payment Details</h2>
        <button
          type="button"
          className="text-purple-600 hover:underline text-sm"
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {/* Conditionally Render Payment Sections */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PaymentInputSection
            formData={formData}
            setFormData={setFormData}
            newPayment={newPayment}
            setNewPayment={setNewPayment}
            editingPaymentIndex={editingPaymentIndex}
            setEditingPaymentIndex={setEditingPaymentIndex}
            errors={errors}
            setErrors={setErrors}
            calculateTotalAmount={calculateTotalAmount}
            calculateTotalPaidAmount={calculateTotalPaidAmount}
          />

          <PaymentDisplaySection
            formData={formData}
            setFormData={setFormData}
            setNewPayment={setNewPayment}
            setEditingPaymentIndex={setEditingPaymentIndex}
            editingPaymentIndex={editingPaymentIndex}
            calculateTotalAmount={calculateTotalAmount}
            calculateTotalPaidAmount={calculateTotalPaidAmount}
          />
        </div>
      )}
    </div>
  );
}
