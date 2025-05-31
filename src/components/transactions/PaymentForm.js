import { paymentMethods, getReferencePlaceholder, isReferenceRequired } from "../../lib/payments";
import AccountSelection from "./AccountSelection";
import PurchaseSelection from "./PurchaseSelection";
import PaymentMethodSelection from "./PaymentMethodSelection";
import ReferenceInput from "./ReferenceInput";
import PaymentAmountInput from "./PaymentAmountInput";
import PaymentDateInput from "./PaymentDateInput";
import NotesInput from "./NotesInput";
import FormActions from "./FormActions";

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
}) {
  const displaySupplierId = getSupplierIdFromAccount(formData.debitAccountId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AccountSelection
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

        <FormActions
          loading={loading}
          formData={formData}
          selectedDebitAccountDetails={selectedDebitAccountDetails}
        />
      </form>
    </div>
  );
}