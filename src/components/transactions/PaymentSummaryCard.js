// components/transactions/PaymentSummaryCard.js
export default function PaymentSummaryCard({
  formData,
  selectedDebitAccountDetails,
  paymentMethods,
  originalPaymentAmount = 0, // <--- Accept originalPaymentAmount prop, with default 0 for new payments
}) {
  // Calculate the amount of the current form input
  const currentAmount = parseFloat(formData.amount || 0);

  // Determine if we are in an edit scenario by checking if originalPaymentAmount is provided and non-zero.
  // Note: For a truly robust solution, you might explicitly pass an `isEditing` prop.
  const isEditing = originalPaymentAmount > 0;

  let newAccountBalance;

  if (isEditing) {
    // For editing:
    // 1. Add back the original payment amount to the current balance to get the balance *before* the original payment.
    // 2. Subtract the new (edited) payment amount.
    newAccountBalance =
      selectedDebitAccountDetails.accountingBalance +
      originalPaymentAmount -
      currentAmount;
  } else {
    // For new payments (or if originalPaymentAmount is 0):
    // Simply subtract the current payment amount from the current balance.
    newAccountBalance =
      selectedDebitAccountDetails.accountingBalance - currentAmount;
  }

  return (
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
            {paymentMethods.find((m) => m.value === formData.paymentMethod)?.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Amount:</span>
          <span className="font-semibold text-blue-900">
            ₹{currentAmount.toFixed(2)}
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
          <span className="text-blue-700 font-medium">New Account Balance:</span>
          <span className="font-bold text-blue-900">
            ₹{newAccountBalance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}