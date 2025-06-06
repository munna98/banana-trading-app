// components/purchases/ItemInputForm.js
import { useRef, useEffect } from "react";

export default function ItemInputForm({
  items,
  newItem,
  setNewItem,
  editingIndex,
  setEditingIndex,
  errors,
  onAddItem,
  onCancelEdit,
}) {
  const itemSelectRef = useRef(null);

  // Focus on item select when component mounts or editing changes
  useEffect(() => {
    if (itemSelectRef.current) {
      itemSelectRef.current.focus();
    }
  }, [editingIndex]);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));

    if (name === "itemId") {
      const selectedItem = items.find((i) => i.id === parseInt(value));
      if (selectedItem) {
        setNewItem((prev) => ({
          ...prev,
          rate: selectedItem.purchaseRate?.toString() || "",
        }));
      } else {
        setNewItem((prev) => ({ ...prev, rate: "" }));
      }
    }
  };

  // Calculate effective quantity for display
  const calculateEffectiveQuantity = () => {
    const quantity = parseFloat(newItem.quantity) || 0;
    const numberOfBunches = parseInt(newItem.numberOfBunches) || 0;
    const weightDeductionPerUnit = parseFloat(newItem.weightdeductionperunit) || 0;
    const totalWeightDeduction = numberOfBunches * weightDeductionPerUnit;
    return Math.max(0, quantity - totalWeightDeduction);
  };

  const calculateAmount = () => {
    const effectiveQuantity = calculateEffectiveQuantity();
    const rate = parseFloat(newItem.rate) || 0;
    return effectiveQuantity * rate;
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 mb-6">
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        {editingIndex !== null ? "Edit Item" : "Add Items"}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4 items-end">
        {/* Item Selection */}
        <div className="lg:col-span-2">
          <label
            htmlFor="newItemId"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Item <span className="text-red-500">*</span>
          </label>
          <select
            id="newItemId"
            name="itemId"
            value={newItem.itemId}
            onChange={handleItemChange}
            ref={itemSelectRef}
            className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white focus:bg-white ${
              errors.currentItem?.itemId
                ? "border-red-500"
                : "border-slate-300"
            }`}
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {errors.currentItem?.itemId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentItem.itemId}
            </p>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="newQuantity"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Qty (Kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="newQuantity"
            name="quantity"
            placeholder="e.g., 10"
            value={newItem.quantity}
            onChange={handleItemChange}
            min="0.01"
            step="0.01"
            className={`w-full py-2 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white focus:bg-white ${
              errors.currentItem?.quantity
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />
          {errors.currentItem?.quantity && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentItem.quantity}
            </p>
          )}
        </div>

        {/* Number of Bunches Input */}
        <div>
          <label
            htmlFor="newNumberOfBunches"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Bunches
          </label>
          <input
            type="number"
            id="newNumberOfBunches"
            name="numberOfBunches"
            placeholder="e.g., 2"
            value={newItem.numberOfBunches}
            onChange={handleItemChange}
            min="0"
            step="1"
            className={`w-full py-2 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white focus:bg-white ${
              errors.currentItem?.numberOfBunches
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />
          {errors.currentItem?.numberOfBunches && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentItem.numberOfBunches}
            </p>
          )}
        </div>

        {/* Weight Deduction Input */}
        <div>
          <label
            htmlFor="newWeightDeductionPerUnit"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Weight Cut (per bunch) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="newWeightDeductionPerUnit"
            name="weightdeductionperunit"
            placeholder="e.g., 1.5"
            value={newItem.weightdeductionperunit}
            onChange={handleItemChange}
            min="0"
            step="0.01"
            className={`w-full py-2 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white focus:bg-white ${
              errors.currentItem?.weightdeductionperunit
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />
          {errors.currentItem?.weightdeductionperunit && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentItem.weightdeductionperunit}
            </p>
          )}
        </div>

        {/* Rate Input */}
        <div>
          <label
            htmlFor="newRate"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Rate (per Kg) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="newRate"
            name="rate"
            placeholder="e.g., 25.50"
            value={newItem.rate}
            onChange={handleItemChange}
            min="0"
            step="0.01"
            className={`w-full py-2 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-white focus:bg-white ${
              errors.currentItem?.rate
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />
          {errors.currentItem?.rate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.currentItem.rate}
            </p>
          )}
        </div>

        {/* Add Item Button - Inline on Desktop */}
        <div className="lg:flex lg:items-end">
          <button
            type="button"
            onClick={onAddItem}
            className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  editingIndex !== null
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M12 4v16m8-8H4"
                }
              />
            </svg>
            <span className="lg:hidden">{editingIndex !== null ? "Update Item" : "Add Item"}</span>
            <span className="hidden lg:inline">{editingIndex !== null ? "Update" : "Add"}</span>
          </button>
        </div>
      </div>

      {/* Preview Calculation Display */}
      {(newItem.quantity || newItem.numberOfBunches || newItem.rate) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Calculation:</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Gross Qty:</span>
              <p className="font-semibold text-blue-900">{newItem.quantity || 0} Kg</p>
            </div>
            <div>
              <span className="text-blue-700">Total Weight Cut:</span>
              <p className="font-semibold text-blue-900">
                {((parseInt(newItem.numberOfBunches) || 0) * (parseFloat(newItem.weightdeductionperunit) || 0)).toFixed(2)} Kg
              </p>
            </div>
            <div>
              <span className="text-blue-700">Effective Qty:</span>
              <p className="font-semibold text-blue-900">{calculateEffectiveQuantity().toFixed(2)} Kg</p>
            </div>
            <div>
              <span className="text-blue-700">Amount:</span>
              <p className="font-semibold text-blue-900">₹{calculateAmount().toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Edit Button - Only shown when editing */}
      {editingIndex !== null && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none" 
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel Edit
          </button>
        </div>
      )}
    </div>
  );
}