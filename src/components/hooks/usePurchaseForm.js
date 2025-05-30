// hooks/usePurchaseForm.js - Extract form logic
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
    itemId: "", quantity: "", rate: "", numberOfBunches: "",
  });
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [newPayment, setNewPayment] = useState({
    amount: "", method: paymentMethods[0]?.value || "CASH", reference: "",
  });
  
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateItem = () => {
    const currentItemErrors = {};
    if (!newItem.itemId) currentItemErrors.itemId = "Select an item.";
    if (!newItem.quantity || isNaN(parseFloat(newItem.quantity)) || parseFloat(newItem.quantity) <= 0) {
      currentItemErrors.quantity = "Positive quantity required.";
    }
    if (!newItem.rate || isNaN(parseFloat(newItem.rate)) || parseFloat(newItem.rate) < 0) {
      currentItemErrors.rate = "Non-negative rate required.";
    }
    if (newItem.numberOfBunches !== "" && (isNaN(parseInt(newItem.numberOfBunches)) || parseInt(newItem.numberOfBunches) < 0)) {
      currentItemErrors.numberOfBunches = "Non-negative number of bunches required.";
    }
    return currentItemErrors;
  };

  const addItemToList = (items) => {
    // Add safety check for items array
    if (!Array.isArray(items)) {
      console.error("Items parameter is not an array:", items);
      setErrors(prev => ({ ...prev, general: "Items data not available. Please refresh the page." }));
      return;
    }
    console.log(items);
    
    const itemErrors = validateItem();
    if (Object.keys(itemErrors).length > 0) {
      setErrors(prev => ({ ...prev, currentItem: itemErrors }));
      return;
    }
    
    setErrors(prev => ({ ...prev, currentItem: undefined }));
    
    const itemInfo = items.find(i => i.id === parseInt(newItem.itemId));
    if (!itemInfo) {
      setErrors(prev => ({ ...prev, currentItem: { itemId: "Selected item not found." } }));
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    const rate = parseFloat(newItem.rate);
    const numberOfBunches = parseInt(newItem.numberOfBunches || 0);
    const weightDeduction = numberOfBunches * 1.5;
    const effectiveQuantity = quantity - weightDeduction;

    const newItemData = {
      itemId: parseInt(newItem.itemId), name: itemInfo.name, unit: itemInfo.unit,
      quantity, rate, numberOfBunches, weightDeduction, effectiveQuantity,
      amount: effectiveQuantity * rate,
    };

    if (editingIndex !== null) {
      const updatedItems = [...formData.items];
      updatedItems[editingIndex] = newItemData;
      setFormData(prev => ({ ...prev, items: updatedItems }));
      setEditingIndex(null);
    } else {
      setFormData(prev => ({ ...prev, items: [...prev.items, newItemData] }));
    }

    setNewItem({ itemId: "", quantity: "", rate: "", numberOfBunches: "" });
  };

  const editItem = (index) => {
    const item = formData.items[index];
    setNewItem({
      itemId: item.itemId.toString(),
      quantity: item.quantity.toString(),
      rate: item.rate.toString(),
      numberOfBunches: item.numberOfBunches.toString(),
    });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setNewItem({ itemId: "", quantity: "", rate: "", numberOfBunches: "" });
    setEditingIndex(null);
  };

  const removeItem = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    if (editingIndex === index) {
      cancelEdit();
    } else if (editingIndex > index) {
      setEditingIndex(prev => prev - 1);
    }
  };

  const calculateTotalAmount = () => formData.items.reduce((sum, item) => sum + item.amount, 0);
  const calculateTotalPaidAmount = () => formData.payments.reduce((sum, payment) => sum + payment.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = "Supplier is required.";
    if (formData.items.length === 0) newErrors.items = "At least one item is required.";

    const totalPurchaseAmount = calculateTotalAmount();
    const totalPaidAmount = calculateTotalPaidAmount();

    if (totalPaidAmount > totalPurchaseAmount) {
      newErrors.payments = `Total paid amount (${totalPaidAmount.toFixed(2)}) cannot exceed total purchase amount (${totalPurchaseAmount.toFixed(2)}).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please correct the form errors.");
      return { success: false };
    }

    const payload = {
      supplierId: parseInt(formData.supplierId),
      date: formData.date,
      items: formData.items.map(item => ({
        itemId: item.itemId, quantity: item.quantity, rate: item.rate, weightDeduction: item.weightDeduction,
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
        setErrors(errorData.errors || { general: errorData.message || "Failed to create purchase." });
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
    formData, newItem, newPayment, editingIndex, editingPaymentIndex, errors,
    setFormData, setNewItem, setNewPayment, setEditingPaymentIndex, setErrors,
    handleInputChange, addItemToList, editItem, cancelEdit, removeItem,
    calculateTotalAmount, calculateTotalPaidAmount, handleSubmit,
  };
}