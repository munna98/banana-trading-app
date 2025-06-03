// components/transactions/ReceiptSummaryCard.js

export default function ReceiptSummaryCard({ formData, selectedCreditAccountDetails, paymentMethods }) {
  // Ensure selectedCreditAccountDetails exists before trying to access its properties
  if (!selectedCreditAccountDetails) {
    return null; // Or render a loading state/placeholder if appropriate
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200"> {/* Changed colors to indigo */}
      <h3 className="text-lg font-semibold text-indigo-900 mb-4">
        Receipt Summary {/* Changed title */}
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-indigo-700">Receiving into:</span> {/* Changed label */}
          <span className="font-semibold text-indigo-900">
            {selectedCreditAccountDetails.accountName} {/* Changed prop name */}
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
            ₹{parseFloat(formData.amount || 0).toFixed(2)}
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
            ₹
            {(
              selectedCreditAccountDetails.accountingBalance + // Changed from subtraction to addition
              parseFloat(formData.amount || 0)
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}