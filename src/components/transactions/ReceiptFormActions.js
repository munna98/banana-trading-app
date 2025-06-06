export default function ReceiptFormActions({
  loading,
  formData,
  selectedCreditAccountDetails, // Changed from selectedDebitAccountDetails
  router,
  isEditing = false, // <--- Accept isEditing prop with a default of false
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <button
        type="button"
        onClick={() => router.back()} // Assuming router is passed down or useRouter is imported
        className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 focus:ring-2 focus:ring-slate-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={
          loading ||
          !formData.creditAccountId || // Changed from debitAccountId
          parseFloat(formData.amount) <= 0 ||
          // You might need a similar balance check for credit accounts here
          // For receipts, you typically receive money, so a balance check
          // might be less common unless it's related to a credit limit or similar.
          // Example (adjust as per your business logic for receipts):
          // (selectedCreditAccountDetails?.type === 'LIABILITY' && parseFloat(formData.amount) > selectedCreditAccountDetails.someCreditLimitField)
          false // Placeholder, add your receipt-specific validation if needed
        }
        className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-green-500"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </div>
        ) : (
          <>
            <svg
              className="w-5 h-5 mr-2 inline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {isEditing ? "Update Receipt" : "Record Receipt"}{" "}
          </>
        )}
      </button>
    </div>
  );
}