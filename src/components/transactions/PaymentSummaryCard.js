export default function PaymentSummaryCard({ formData, selectedDebitAccountDetails, paymentMethods }) {
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
            {
              paymentMethods.find(
                (m) => m.value === formData.paymentMethod
              )?.label
            }
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-700">Amount:</span>
          <span className="font-semibold text-blue-900">
            ₹{parseFloat(formData.amount || 0).toFixed(2)}
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
          <span className="text-blue-700 font-medium">
            New Account Balance:
          </span>
          <span className="font-bold text-blue-900">
            ₹
            {(
              selectedDebitAccountDetails.accountingBalance -
              parseFloat(formData.amount || 0)
            ).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}