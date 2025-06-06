// components/transactions/ReceiptSummaryCard.js

export default function ReceiptSummaryCard({
  formData,
  selectedCreditAccountDetails,
  paymentMethods,
  originalReceiptAmount = 0, // <--- Accept originalReceiptAmount prop, with default 0 for new receipts
}) {
  // Ensure selectedCreditAccountDetails exists before trying to access its properties
  if (!selectedCreditAccountDetails) {
    return null; // Or render a loading state/placeholder if appropriate
  }

  // Calculate the amount of the current form input
  const currentAmount = parseFloat(formData.amount || 0);

  // Determine if we are in an edit scenario by checking if originalReceiptAmount is provided and non-zero.
  // Note: For a truly robust solution, you might explicitly pass an `isEditing` prop from the parent.
  // However, this check is often sufficient for simple cases.
  const isEditing = originalReceiptAmount > 0;

  let newAccountBalance;

  if (isEditing) {
    // For editing a receipt:
    // 1. Subtract the original receipt amount from the current balance to get the balance *before* the original receipt.
    // 2. Add the new (edited) receipt amount.
    // Receipts increase account balance.
    newAccountBalance =
      selectedCreditAccountDetails.accountingBalance -
      originalReceiptAmount +
      currentAmount;
  } else {
    // For new receipts (or if originalReceiptAmount is 0):
    // Simply add the current receipt amount to the current balance.
    newAccountBalance =
      selectedCreditAccountDetails.accountingBalance + currentAmount;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
      {" "}
      {/* Changed colors to indigo */}
      <h3 className="text-lg font-semibold text-indigo-900 mb-4">
        Receipt Summary {/* Changed title */}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-indigo-700">Receiving into:</span>{" "}
          {/* Changed label */}
          <span className="font-semibold text-indigo-900">
            {selectedCreditAccountDetails.accountName}{" "}
            {/* Changed prop name */}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-700">Payment Method:</span>
          <span className="font-semibold text-indigo-900">
            {
              paymentMethods.find(
                (m) => m.value === formData.paymentMethod
              )?.label
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-indigo-700">Amount:</span>
          <span className="font-semibold text-indigo-900">
            ₹{currentAmount.toFixed(2)}
          </span>
        </div>
        {formData.reference && (
          <div className="flex justify-between">
            <span className="text-indigo-700">Reference:</span>
            <span className="font-semibold text-indigo-900">
              {formData.reference}
            </span>
          </div>
        )}
        <hr className="border-indigo-200" />
        <div className="flex justify-between">
          <span className="text-indigo-700 font-medium">
            New Account Balance:
          </span>
          <span className="font-bold text-indigo-900">
            ₹{newAccountBalance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}