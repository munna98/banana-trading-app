// components/transactions/PaymentSidebar.js
import PaymentAccountBalanceCard from "./PaymentAccountBalanceCard";
import PurchaseBalanceCard from "./PurchaseBalanceCard";
import PaymentSummaryCard from "./PaymentSummaryCard";

export default function PaymentSidebar({
  selectedDebitAccountDetails,
  selectedPurchaseBalance,
  formData,
  paymentMethods,
  originalPaymentAmount, // <--- Accept originalPaymentAmount prop
}) {
  return (
    <div className="space-y-6 lg:col-span-1">
      {selectedDebitAccountDetails && (
        <PaymentAccountBalanceCard
          selectedDebitAccountDetails={selectedDebitAccountDetails}
        />
      )}

      {selectedPurchaseBalance > 0 && (
        <PurchaseBalanceCard selectedPurchaseBalance={selectedPurchaseBalance} />
      )}

      {formData.amount && formData.debitAccountId && selectedDebitAccountDetails && (
        <PaymentSummaryCard
          formData={formData}
          selectedDebitAccountDetails={selectedDebitAccountDetails}
          paymentMethods={paymentMethods}
          originalPaymentAmount={originalPaymentAmount} // <--- Pass it down
        />
      )}
    </div>
  );
}