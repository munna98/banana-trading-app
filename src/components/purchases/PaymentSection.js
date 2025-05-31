// components/purchases/PaymentSection.js
import PaymentInputSection from "./PaymentInputSection";
import PaymentDisplaySection from "./PaymentDisplaySection";
import { paymentMethods } from "../../lib/payments"; // You might still need this for initial state

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
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Input Section */}
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

      {/* Payment Display Section */}
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
  );
}