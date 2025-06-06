// components/transactions/ReceiptSidebar.js
import ReceiptAccountBalanceCard from "./ReceiptAccountBalanceCard"; // Changed import
import SaleBalanceCard from "./SaleBalanceCard"; // Changed import
import ReceiptSummaryCard from "./ReceiptSummaryCard"; // Changed import

export default function ReceiptSidebar({
  selectedCreditAccountDetails,
  selectedSaleBalance,
  formData,
  paymentMethods,
  originalReceiptAmount, 
}) {
  return (
    <div className="space-y-6 lg:col-span-1">
      {selectedCreditAccountDetails && (
        <ReceiptAccountBalanceCard
          selectedCreditAccountDetails={selectedCreditAccountDetails}
        />
      )}

      {selectedSaleBalance > 0 && (
        <SaleBalanceCard selectedSaleBalance={selectedSaleBalance} />
      )}

      {formData.amount && formData.creditAccountId && selectedCreditAccountDetails && (
        <ReceiptSummaryCard
          formData={formData}
          selectedCreditAccountDetails={selectedCreditAccountDetails}
          paymentMethods={paymentMethods}
          originalReceiptAmount={originalReceiptAmount} // <--- Pass it down
        />
      )}
    </div>
  );
}