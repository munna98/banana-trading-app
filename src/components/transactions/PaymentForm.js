// components/transactions/PaymentForm.js
import {
  paymentMethods,
  getReferencePlaceholder,
  isReferenceRequired,
} from "../../lib/payments";
import PaymentAccountSelection from "./PaymentAccountSelection";
import PurchaseSelection from "./PurchaseSelection";
import PaymentMethodSelection from "./PaymentMethodSelection";
import ReferenceInput from "./ReferenceInput";
import PaymentAmountInput from "./PaymentAmountInput";
import PaymentDateInput from "./PaymentDateInput";
import NotesInput from "./NotesInput";
import PaymentFormActions from "./PaymentFormActions";

export default function PaymentForm({
  formData,
  setFormData,
  debitAccounts,
  purchases,
  selectedDebitAccountDetails,
  selectedPurchaseBalance,
  accountsLoading,
  purchasesLoading,
  getSupplierIdFromAccount,
  handleDebitAccountChange,
  handlePurchaseChange,
  handleChange,
  handleSubmit,
  loading,
  router, // Make sure router is passed down if PaymentFormActions needs it.
  isEditing = false, // <--- Accept isEditing prop with a default of false
}) {
  const displaySupplierId = getSupplierIdFromAccount(formData.debitAccountId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentAccountSelection
          debitAccounts={debitAccounts}
          formData={formData}
          handleChange={handleDebitAccountChange}
          loading={accountsLoading}
        />

        {displaySupplierId && (
          <PurchaseSelection
            purchases={purchases}
            formData={formData}
            handleChange={handlePurchaseChange}
            loading={purchasesLoading}
          />
        )}

        <PaymentMethodSelection
          paymentMethods={paymentMethods}
          formData={formData}
          handleChange={handleChange}
        />

        {isReferenceRequired(formData.paymentMethod) && (
          <ReferenceInput
            paymentMethod={formData.paymentMethod}
            formData={formData}
            handleChange={handleChange}
            getReferencePlaceholder={getReferencePlaceholder}
          />
        )}

        <PaymentAmountInput
          formData={formData}
          handleChange={handleChange}
          selectedPurchaseBalance={selectedPurchaseBalance}
          setFormData={setFormData}
        />

        <PaymentDateInput formData={formData} handleChange={handleChange} />

        <NotesInput formData={formData} handleChange={handleChange} />

        <PaymentFormActions
          loading={loading}
          formData={formData}
          selectedDebitAccountDetails={selectedDebitAccountDetails}
          router={router}
          isEditing={isEditing} 
        />
      </form>
    </div>
  );
}