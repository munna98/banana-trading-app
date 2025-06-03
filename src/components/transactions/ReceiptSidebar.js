import ReceiptAccountBalanceCard from "./ReceiptAccountBalanceCard"; // Changed import
import SaleBalanceCard from "./SaleBalanceCard"; // Changed import
import ReceiptSummaryCard from "./ReceiptSummaryCard"; // Changed import

export default function ReceiptSidebar({ selectedCreditAccountDetails, selectedSaleBalance, formData, paymentMethods }) {
  return (
    <div className="space-y-6 lg:col-span-1">
      {selectedCreditAccountDetails && ( // Changed prop
        <ReceiptAccountBalanceCard selectedCreditAccountDetails={selectedCreditAccountDetails} /> // Changed component and prop
      )}

      {selectedSaleBalance > 0 && ( // Changed prop
        <SaleBalanceCard selectedSaleBalance={selectedSaleBalance} /> // Changed component and prop
      )}

      {formData.amount && formData.creditAccountId && selectedCreditAccountDetails && ( // Changed props for conditions
        <ReceiptSummaryCard
          formData={formData}
          selectedCreditAccountDetails={selectedCreditAccountDetails} // Changed prop
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
}