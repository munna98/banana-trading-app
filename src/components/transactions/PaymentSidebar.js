import AccountBalanceCard from "./AccountBalanceCard";
import PurchaseBalanceCard from "./PurchaseBalanceCard";
import PaymentSummaryCard from "./PaymentSummaryCard";

export default function PaymentSidebar({ selectedDebitAccountDetails, selectedPurchaseBalance, formData, paymentMethods }) {
  return (
    <div className="space-y-6 lg:col-span-1">
      {selectedDebitAccountDetails && (
        <AccountBalanceCard selectedDebitAccountDetails={selectedDebitAccountDetails} />
      )}

      {selectedPurchaseBalance > 0 && (
        <PurchaseBalanceCard selectedPurchaseBalance={selectedPurchaseBalance} />
      )}

      {formData.amount && formData.debitAccountId && selectedDebitAccountDetails && (
        <PaymentSummaryCard
          formData={formData}
          selectedDebitAccountDetails={selectedDebitAccountDetails}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}