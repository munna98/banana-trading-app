// hooks/usePurchaseForm.js
import { useState } from "react";
import { paymentMethods } from "../../lib/payments";

export function usePurchaseForm() {
  const [formData, setFormData] = useState({
    supplierId: "",
    date: new Date().toISOString().split("T")[0],
    items: [],
    payments: [],
  });

  const [errors, setErrors] = useState({});
  const [newItem, setNewItem] = useState({
    itemId: "",
    quantity: "",
    rate: "",
    numberOfBunches: "",
    // Corrected to camelCase: weightDeductionPerUnit
    weightDeductionPerUnit: "1.5", // <--- CORRECTED LINE
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: paymentMethods[0]?.value || "CASH",
    reference: "",
  });

  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateItem = () => {
    const currentItemErrors = {};
    if (!newItem.itemId) currentItemErrors.itemId = "Select an item.";
    if (
      !newItem.quantity ||
      isNaN(parseFloat(newItem.quantity)) ||
      parseFloat(newItem.quantity) <= 0
    ) {
      currentItemErrors.quantity = "Positive quantity required.";
    }
    // Corrected to camelCase: weightDeductionPerUnit
    if (
      !newItem.weightDeductionPerUnit ||
      isNaN(parseFloat(newItem.weightDeductionPerUnit)) ||
      parseFloat(newItem.weightDeductionPerUnit) < 0
    ) {
      currentItemErrors.weightDeductionPerUnit = // <--- CORRECTED LINE
        "Non-negative weight cut is required.";
    }
    if (
      !newItem.rate ||
      isNaN(parseFloat(newItem.rate)) ||
      parseFloat(newItem.rate) < 0
    ) {
      currentItemErrors.rate = "Non-negative rate required.";
    }
    if (
      newItem.numberOfBunches !== "" &&
      (isNaN(parseInt(newItem.numberOfBunches)) ||
        parseInt(newItem.numberOfBunches) < 0)
    ) {
      currentItemErrors.numberOfBunches =
        "Non-negative number of bunches required.";
    }
    return currentItemErrors;
  };

  const addItemToList = (items) => {
    // Add safety check for items array
    if (!Array.isArray(items)) {
      console.error("Items parameter is not an array:", items);
      setErrors((prev) => ({
        ...prev,
        general: "Items data not available. Please refresh the page.",
      }));
      return;
    }
    console.log(items);

    const itemErrors = validateItem();
    if (Object.keys(itemErrors).length > 0) {
      setErrors((prev) => ({ ...prev, currentItem: itemErrors }));
      return;
    }

    setErrors((prev) => ({ ...prev, currentItem: undefined }));

    const itemInfo = items.find((i) => i.id === parseInt(newItem.itemId));
    if (!itemInfo) {
      setErrors((prev) => ({
        ...prev,
        currentItem: { itemId: "Selected item not found." },
      }));
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    // Corrected to camelCase: weightDeductionPerUnit
    const weightDeductionPerUnit = parseFloat(newItem.weightDeductionPerUnit); // <--- CORRECTED LINE
    const rate = parseFloat(newItem.rate);
    const numberOfBunches = parseInt(newItem.numberOfBunches || 0);

    // Calculate totalWeightDeduction and effectiveQuantity here
    const totalWeightDeduction = numberOfBunches * weightDeductionPerUnit; // Use totalWeightDeduction here
    const effectiveQuantity = quantity - totalWeightDeduction; // Use totalWeightDeduction here

    const newItemData = {
      itemId: parseInt(newItem.itemId),
      name: itemInfo.name,
      unit: itemInfo.unit,
      quantity,
      rate,
      numberOfBunches,
      weightDeductionPerUnit, // <--- Add this field to the item data
      totalWeightDeduction, // <--- Add this field to the item data
      effectiveQuantity, // <--- Add this field to the item data
      amount: effectiveQuantity * rate,
    };

    if (editingIndex !== null) {
      const updatedItems = [...formData.items];
      updatedItems[editingIndex] = newItemData;
      setFormData((prev) => ({ ...prev, items: updatedItems }));
      setEditingIndex(null);
    } else {
      setFormData((prev) => ({ ...prev, items: [...prev.items, newItemData] }));
    }

    setNewItem({
      itemId: "",
      quantity: "",
      rate: "",
      numberOfBunches: "",
      // Corrected to camelCase: weightDeductionPerUnit
      weightDeductionPerUnit: "1.5", // <--- CORRECTED LINE for resetting the form
    });
  };

  const editItem = (index) => {
    const item = formData.items[index];
    setNewItem({
      itemId: item.itemId.toString(),
      quantity: item.quantity.toString(),
      // Ensure weightDeductionPerUnit is set when editing, fallback to default if not present
      weightDeductionPerUnit: item.weightDeductionPerUnit?.toString() || "1.5", // <--- CORRECTED LINE
      rate: item.rate.toString(),
      numberOfBunches: item.numberOfBunches.toString(),
    });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setNewItem({
      itemId: "",
      quantity: "",
      rate: "",
      numberOfBunches: "",
      // Corrected to camelCase: weightDeductionPerUnit
      weightDeductionPerUnit: "1.5", // <--- CORRECTED LINE
    });
    setEditingIndex(null);
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) {
      cancelEdit();
    } else if (editingIndex > index) {
      setEditingIndex((prev) => prev - 1);
    }
  };

  const calculateTotalAmount = () =>
    formData.items.reduce((sum, item) => sum + item.amount, 0);
  const calculateTotalPaidAmount = () =>
    formData.payments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // UPDATED: Only validate form-level requirements, not current item input fields
    const newErrors = {};

    // Check if supplier is selected
    if (!formData.supplierId) {
      newErrors.supplierId = "Supplier is required.";
    }

    // Check if at least one item exists in the items table
    if (formData.items.length === 0) {
      newErrors.items = "At least one item is required.";
    }

    // Validate payment amounts
    const totalPurchaseAmount = calculateTotalAmount();
    const totalPaidAmount = calculateTotalPaidAmount();

    if (totalPaidAmount > totalPurchaseAmount) {
      newErrors.payments = `Total paid amount (${totalPaidAmount.toFixed(
        2
      )}) cannot exceed total purchase amount (${totalPurchaseAmount.toFixed(
        2
      )}).`;
    }

    // REMOVED: No validation of current item input fields (newItem)
    // The form can be submitted even if there are values in the input fields
    // as long as there's at least one item in the items table

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please correct the form errors.");
      return { success: false };
    }

    const payload = {
      supplierId: parseInt(formData.supplierId),
      date: formData.date,
      items: formData.items.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        // Ensure all new fields are sent in the payload
        weightDeductionPerUnit: item.weightDeductionPerUnit, // <--- CORRECTED LINE
        totalWeightDeduction: item.totalWeightDeduction, // <--- CORRECTED LINE
        effectiveQuantity: item.effectiveQuantity, // <--- CORRECTED LINE
        numberOfBunches: item.numberOfBunches, // Ensure this is also sent
      })),
      payments: formData.payments,
    };

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Purchase created successfully!");
        return { success: true, data: data.data };
      } else {
        const errorData = await res.json();
        setErrors(
          errorData.errors || {
            general: errorData.message || "Failed to create purchase.",
          }
        );
        alert("Error: " + (errorData.message || "Failed to create purchase."));
        return { success: false };
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("An unexpected error occurred. Please try again.");
      return { success: false };
    }
  };

  return {
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
    handleSubmit,
  };
}