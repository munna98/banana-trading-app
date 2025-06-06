// components/transactions/ReceiptForm.js
import {
  paymentMethods, // Assuming these are generalized or you'll create a receipt-specific lib
  getReferencePlaceholder,
  isReferenceRequired,
} from "../../lib/payments";
import ReceiptAccountSelection from "./ReceiptAccountSelection"; // Changed import
import SaleSelection from "./SaleSelection"; // Changed import
import PaymentMethodSelection from "./PaymentMethodSelection"; // Reused, as method selection is similar
import ReferenceInput from "./ReferenceInput"; // Reused, as reference input is similar
import ReceiptAmountInput from "./ReceiptAmountInput"; // Changed import
import ReceiptDateInput from "./ReceiptDateInput"; // Changed import
import NotesInput from "./NotesInput"; // Reused
import ReceiptFormActions from "./ReceiptFormActions"; // Reused, with props adjusted

export default function ReceiptForm({
  formData,
  setFormData,
  creditAccounts, // Changed from debitAccounts
  sales, // Changed from purchases
  selectedCreditAccountDetails, // Changed from selectedDebitAccountDetails
  selectedSaleBalance, // Changed from selectedPurchaseBalance
  accountsLoading,
  salesLoading, // Changed from purchasesLoading
  getCustomerIdFromAccount, // Changed from getSupplierIdFromAccount
  handleCreditAccountChange, // Changed from handleDebitAccountChange
  handleSaleChange, // Changed from handlePurchaseChange
  handleChange,
  handleSubmit,
  loading,
  router, // <--- Add router prop here
  isEditing = false, // <--- Accept isEditing prop with a default of false
}) {
  const displayCustomerId = getCustomerIdFromAccount(formData.creditAccountId); // Changed from getSupplierIdFromAccount and debitAccountId

  // Console logs updated for clarity in receipt context
  console.log(formData.creditAccountId, "id");
  console.log(displayCustomerId, "id");
  console.log(sales, "sales"); // Changed from purchases

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ReceiptAccountSelection // Changed component
          creditAccounts={creditAccounts} // Changed prop
          formData={formData}
          handleChange={handleCreditAccountChange} // Changed handler
          loading={accountsLoading}
        />

        {displayCustomerId && ( // Changed variable
          <SaleSelection // Changed component
            sales={sales} // Changed prop
            formData={formData}
            handleChange={handleSaleChange} // Changed handler
            loading={salesLoading} // Changed prop
          />
        )}

        <PaymentMethodSelection // This component can be reused
          paymentMethods={paymentMethods}
          formData={formData}
          handleChange={handleChange}
        />

        {isReferenceRequired(formData.paymentMethod) && ( // Reused helper and component
          <ReferenceInput
            paymentMethod={formData.paymentMethod}
            formData={formData}
            handleChange={handleChange}
            getReferencePlaceholder={getReferencePlaceholder}
          />
        )}

        <ReceiptAmountInput // Changed component
          formData={formData}
          handleChange={handleChange}
          selectedSaleBalance={selectedSaleBalance} // Changed prop
          setFormData={setFormData}
        />

        <ReceiptDateInput formData={formData} handleChange={handleChange} />{" "}
        {/* Changed component */}
        <NotesInput formData={formData} handleChange={handleChange} />{" "}
        {/* Reused component */}
        <ReceiptFormActions // Reused component, but check its internal logic if it relies heavily on "debit" context
          loading={loading}
          formData={formData}
          selectedCreditAccountDetails={selectedCreditAccountDetails} // Changed prop
          router={router} // <--- Pass router here
          isEditing={isEditing} // <--- Pass isEditing here
        />
      </form>
    </div>
  );
}