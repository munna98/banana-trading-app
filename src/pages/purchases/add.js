// pages/purchases/add.js - UPDATED VERSION
import { useRouter } from "next/router";
import { useState } from "react"; // Import useState for managing collapsible state
import ItemInputForm from "../../components/purchases/ItemInputForm";
import ItemListTable from "../../components/purchases/ItemListTable";
import PaymentSection from "../../components/purchases/PaymentSection";
import PageHeader from "../../components/purchases/PageHeader";
import PurchaseBasicInfo from "../../components/purchases/PurchaseBasicInfo";
import { usePurchaseForm } from "../../components/hooks/usePurchaseForm";
import { usePurchaseDataFetch } from "../../components/hooks/usePurchaseDataFetch";

export default function AddPurchase() {
  const router = useRouter();
  const { suppliers, items, loading } = usePurchaseDataFetch();
  const {
    formData,
    newItem,
    newPayment,
    editingIndex,
    editingPaymentIndex,
    errors,
    setFormData,
    setNewItem,
    setNewPayment,
    setEditingPaymentIndex,
    setErrors,
    handleInputChange,
    addItemToList,
    editItem,
    cancelEdit,
    removeItem,
    calculateTotalAmount,
    calculateTotalPaidAmount,
    handleSubmit: submitForm,
  } = usePurchaseForm();

  // State to manage the collapsible payment section
  const [isPaymentSectionCollapsed, setIsPaymentSectionCollapsed] = useState(true);

  // Function to toggle the payment section's collapsed state
  const togglePaymentSection = () => {
    setIsPaymentSectionCollapsed(!isPaymentSectionCollapsed);
  };

  const handleSubmit = async (e) => {
    const result = await submitForm(e);
    if (result.success) {
      router.push(`/purchases/${result.data.id}`);
    }
  };

  // FIXED: Create a wrapper function that passes the items array
  const handleAddItem = () => {
    addItemToList(items);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader />
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="relative">
            <div className="p-6 pb-6">
              <PurchaseBasicInfo
                formData={formData}
                handleInputChange={handleInputChange}
                suppliers={suppliers}
                errors={errors}
              />

              <ItemInputForm
                items={items}
                newItem={newItem}
                setNewItem={setNewItem}
                editingIndex={editingIndex}
                errors={errors}
                onAddItem={handleAddItem} // FIXED: Now passes items array
                onCancelEdit={cancelEdit}
              />

              {/* Display form-level errors */}
              {errors.items && (
                <p className="mb-4 text-sm text-red-600">{errors.items}</p>
              )}
              
              {errors.general && (
                <p className="mb-4 text-sm text-red-600">{errors.general}</p>
              )}

              <ItemListTable
                items={formData.items}
                editItem={editItem}
                removeItem={removeItem}
                calculateTotalAmount={calculateTotalAmount}
              />

              <PaymentSection
                formData={formData}
                setFormData={setFormData}
                newPayment={newPayment}
                setNewPayment={setNewPayment}
                editingPaymentIndex={editingPaymentIndex}
                setEditingPaymentIndex={setEditingPaymentIndex}
                errors={errors}
                setErrors={setErrors}
                calculateTotalAmount={calculateTotalAmount}
                calculateTotalPaidAmount={calculateTotalPaidAmount}
                isCollapsed={isPaymentSectionCollapsed}
                onToggleCollapse={togglePaymentSection}
              />
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end sm:items-center">
                <div className="text-sm text-slate-600 sm:mr-4 order-2 sm:order-1">
                  Total: ₹{calculateTotalAmount().toFixed(2)}
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 order-1 sm:order-2"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Save Purchase
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
