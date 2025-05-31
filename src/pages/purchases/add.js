// pages/purchases/add.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ItemListTable from '../../components/purchases/ItemListTable';
import PaymentMethodSelection from '../../components/transactions/PaymentMethodSelection';
import { paymentMethods, getReferencePlaceholder, isReferenceRequired } from '../../lib/payments';
export default function AddPurchase() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    payments: [],
  });
  const [errors, setErrors] = useState({});

  const [newItem, setNewItem] = useState({
    itemId: '',
    quantity: '',
    rate: '',
    numberOfBunches: '',
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: paymentMethods[0]?.value || 'CASH', // Default to the first payment method or 'CASH'
    reference: '',
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);

  // Refs for input fields
  const itemSelectRef = useRef(null);
  const paymentAmountRef = useRef(null);


  // Fetch suppliers and items from your API
  useEffect(() => {
    const fetchSuppliersAndItems = async () => {
      try {
        const supplierRes = await fetch('/api/suppliers');
        const itemRes = await fetch('/api/items');

        if (!supplierRes.ok) throw new Error('Failed to fetch suppliers');
        if (!itemRes.ok) throw new Error('Failed to fetch items');

        const supplierData = await supplierRes.json();
        const itemData = await itemRes.json();

        setSuppliers(supplierData.suppliers || []);
        setItems(itemData.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load suppliers or items. Please try again.');
      }
    };

    fetchSuppliersAndItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));

    if (name === 'itemId') {
      const selectedItem = items.find(i => i.id === parseInt(value));
      if (selectedItem) {
        setNewItem(prev => ({ ...prev, rate: selectedItem.purchaseRate?.toString() || '' }));
      } else {
        setNewItem(prev => ({ ...prev, rate: '' }));
      }
    }
  };

  const handleNewPaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => {
      const updatedPayment = { ...prev, [name]: value };

      // If method changes, reset reference if the new method doesn't require it
      if (name === 'method') {
        const requiresRef = isReferenceRequired(value);
        if (!requiresRef) {
          updatedPayment.reference = '';
        }
      }
      return updatedPayment;
    });
    setErrors(prev => ({ ...prev, currentPayment: { ...prev.currentPayment, [name]: undefined } }));
  };

  const addItemToList = () => {
    const currentItemErrors = {};
    if (!newItem.itemId) currentItemErrors.itemId = 'Select an item.';
    if (!newItem.quantity || isNaN(parseFloat(newItem.quantity)) || parseFloat(newItem.quantity) <= 0) {
      currentItemErrors.quantity = 'Positive quantity required.';
    }
    if (!newItem.rate || isNaN(parseFloat(newItem.rate)) || parseFloat(newItem.rate) < 0) {
      currentItemErrors.rate = 'Non-negative rate required.';
    }
    if (newItem.numberOfBunches !== '' && (isNaN(parseInt(newItem.numberOfBunches)) || parseInt(newItem.numberOfBunches) < 0)) {
      currentItemErrors.numberOfBunches = 'Non-negative number of bunches required.';
    }

    if (Object.keys(currentItemErrors).length > 0) {
      setErrors(prev => ({ ...prev, currentItem: currentItemErrors }));
      return;
    } else {
      setErrors(prev => ({ ...prev, currentItem: undefined }));
    }

    const itemInfo = items.find(i => i.id === parseInt(newItem.itemId));
    if (itemInfo) {
      const quantity = parseFloat(newItem.quantity);
      const rate = parseFloat(newItem.rate);
      const numberOfBunches = parseInt(newItem.numberOfBunches || 0);
      const weightDeduction = numberOfBunches * 1.5; // Calculate weight deduction based on 1.5kg per bunch
      const effectiveQuantity = quantity - weightDeduction;
      const amount = effectiveQuantity * rate;

      const newItemData = {
        itemId: parseInt(newItem.itemId),
        name: itemInfo.name,
        unit: itemInfo.unit,
        quantity: quantity,
        rate: rate,
        numberOfBunches: numberOfBunches,
        weightDeduction: weightDeduction,
        effectiveQuantity: effectiveQuantity,
        amount: amount,
      };

      if (editingIndex !== null) {
        const updatedItems = [...formData.items];
        updatedItems[editingIndex] = newItemData;
        setFormData(prev => ({
          ...prev,
          items: updatedItems
        }));
        setEditingIndex(null);
      } else {
        setFormData(prev => ({
          ...prev,
          items: [...prev.items, newItemData]
        }));
      }

      setNewItem({ itemId: '', quantity: '', rate: '', numberOfBunches: '' });
      itemSelectRef.current?.focus();
    }
  };

  const editItem = (index) => {
    const itemToEdit = formData.items[index];
    setNewItem({
      itemId: itemToEdit.itemId.toString(),
      quantity: itemToEdit.quantity.toString(),
      rate: itemToEdit.rate.toString(),
      numberOfBunches: itemToEdit.numberOfBunches.toString(),
    });
    setEditingIndex(index);
    itemSelectRef.current?.focus();
  };

  const cancelEdit = () => {
    setNewItem({ itemId: '', quantity: '', rate: '', numberOfBunches: '' });
    setEditingIndex(null);
    itemSelectRef.current?.focus();
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    if (editingIndex === index) {
      cancelEdit();
    } else if (editingIndex > index) {
      setEditingIndex(prev => prev - 1);
    }
  };

  const addPaymentToList = () => {
    const currentPaymentErrors = {};
    const paymentAmount = parseFloat(newPayment.amount);
    const totalPurchaseAmount = parseFloat(calculateTotalAmount());
    const totalPaidAmount = parseFloat(calculateTotalPaidAmount());

    if (!newPayment.amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      currentPaymentErrors.amount = 'Positive amount required.';
    } else if (totalPaidAmount + paymentAmount > totalPurchaseAmount && editingPaymentIndex === null) {
      // Only check against total if it's a new payment or the amount exceeds the total after editing
      currentPaymentErrors.amount = `Payment cannot exceed remaining amount (${(totalPurchaseAmount - totalPaidAmount).toFixed(2)}).`;
    }

    if (isReferenceRequired(newPayment.method) && !newPayment.reference.trim()) {
      currentPaymentErrors.reference = 'Reference is required for this payment method.';
    }


    if (Object.keys(currentPaymentErrors).length > 0) {
      setErrors(prev => ({ ...prev, currentPayment: currentPaymentErrors }));
      return;
    } else {
      setErrors(prev => ({ ...prev, currentPayment: undefined }));
    }

    const newPaymentData = {
      amount: paymentAmount,
      method: newPayment.method,
      reference: newPayment.reference,
    };

    if (editingPaymentIndex !== null) {
      const updatedPayments = [...formData.payments];
      updatedPayments[editingPaymentIndex] = newPaymentData;
      setFormData(prev => ({
        ...prev,
        payments: updatedPayments,
      }));
      setEditingPaymentIndex(null);
    } else {
      setFormData(prev => ({
        ...prev,
        payments: [...prev.payments, newPaymentData]
      }));
    }
    setNewPayment({ amount: '', method: paymentMethods[0]?.value || 'CASH', reference: '' }); // Reset for next payment
    paymentAmountRef.current?.focus();
  };

  const editPayment = (index) => {
    const paymentToEdit = formData.payments[index];
    setNewPayment({
      amount: paymentToEdit.amount.toString(),
      method: paymentToEdit.method,
      reference: paymentToEdit.reference || '',
    });
    setEditingPaymentIndex(index);
    paymentAmountRef.current?.focus();
  };

  const cancelPaymentEdit = () => {
    setNewPayment({ amount: '', method: paymentMethods[0]?.value || 'CASH', reference: '' });
    setEditingPaymentIndex(null);
    paymentAmountRef.current?.focus();
  };

  const removePayment = (index) => {
    setFormData(prev => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    }));
    if (editingPaymentIndex === index) {
      cancelPaymentEdit();
    } else if (editingPaymentIndex > index) {
      setEditingPaymentIndex(prev => prev - 1);
    }
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalPaidAmount = () => {
    return formData.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required.';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required.';

    const totalPurchaseAmount = calculateTotalAmount();
    const totalPaidAmount = calculateTotalPaidAmount();

    if (totalPaidAmount > totalPurchaseAmount) {
      newErrors.payments = `Total paid amount (${totalPaidAmount.toFixed(2)}) cannot exceed total purchase amount (${totalPurchaseAmount.toFixed(2)}).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please correct the form errors.');
      return;
    }

    const payload = {
      supplierId: parseInt(formData.supplierId),
      date: formData.date,
      items: formData.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        weightDeduction: item.weightDeduction
      })),
      payments: formData.payments,
    };

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        alert('Purchase created successfully!');
        router.push(`/purchases/${data.data.id}`);
      } else {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        setErrors(errorData.errors || { general: errorData.message || 'Failed to create purchase.' });
        alert('Error: ' + (errorData.message || 'Failed to create purchase.'));
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Purchase</h1>
              <p className="text-slate-600">Enter details to record a new purchase transaction.</p>
            </div>
            <Link
              href="/purchases"
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Purchases
            </Link>
          </div>
        </div>

        {/* Purchase Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="supplierId" className="block text-sm font-medium text-slate-700 mb-2">Supplier <span className="text-red-500">*</span></label>
                <select
                  id="supplierId"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.supplierId ? 'border-red-500' : 'border-slate-300'}`}
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Add/Edit Item Section */}
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{editingIndex !== null ? 'Edit Item' : 'Add Items'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
              <div>
                <label htmlFor="newItemId" className="block text-sm font-medium text-slate-700 mb-2">Item <span className="text-red-500">*</span></label>
                <select
                  id="newItemId"
                  name="itemId"
                  value={newItem.itemId}
                  onChange={handleItemChange}
                  ref={itemSelectRef} // Assign ref here
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.itemId ? 'border-red-500' : 'border-slate-300'}`}
                  required
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                {errors.currentItem?.itemId && <p className="mt-1 text-sm text-red-600">{errors.currentItem.itemId}</p>}
              </div>
              <div>
                <label htmlFor="newQuantity" className="block text-sm font-medium text-slate-700 mb-2">Quantity (Kg) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="newQuantity"
                  name="quantity"
                  placeholder="e.g., 10"
                  value={newItem.quantity}
                  onChange={handleItemChange}
                  min="0.01"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.quantity ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                {errors.currentItem?.quantity && <p className="mt-1 text-sm text-red-600">{errors.currentItem.quantity}</p>}
              </div>
              <div>
                <label htmlFor="newRate" className="block text-sm font-medium text-slate-700 mb-2">Rate (per unit) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="newRate"
                  name="rate"
                  placeholder="e.g., 25.50"
                  value={newItem.rate}
                  onChange={handleItemChange}
                  min="0"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.rate ? 'border-red-500' : 'border-slate-300'}`}
                  required
                />
                {errors.currentItem?.rate && <p className="mt-1 text-sm text-red-600">{errors.currentItem.rate}</p>}
              </div>
              <div>
                <label htmlFor="newNumberOfBunches" className="block text-sm font-medium text-slate-700 mb-2">No. of Bunches</label>
                <input
                  type="number"
                  id="newNumberOfBunches"
                  name="numberOfBunches"
                  placeholder="e.g., 2"
                  value={newItem.numberOfBunches}
                  onChange={handleItemChange}
                  min="0"
                  step="1"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.numberOfBunches ? 'border-red-500' : 'border-slate-300'}`}
                />
                {errors.currentItem?.numberOfBunches && <p className="mt-1 text-sm text-red-600">{errors.currentItem.numberOfBunches}</p>}
              </div>
              <div className="lg:col-span-4 flex gap-4">
                <button
                  type="button"
                  onClick={addItemToList}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingIndex !== null ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                  </svg>
                  {editingIndex !== null ? 'Update Item' : 'Add Item'}
                </button>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200 shadow-md"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
            {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}

            {/* Item List Table */}
            <ItemListTable
              items={formData.items}
              editItem={editItem}
              removeItem={removeItem}
              calculateTotalAmount={calculateTotalAmount}
            />

            {/* Payment Section */}
            <h3 className="text-xl font-semibold text-slate-900 mb-4">{editingPaymentIndex !== null ? 'Edit Payment' : 'Add Payment'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
              <div>
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-slate-700 mb-2">Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="paymentAmount"
                  name="amount"
                  placeholder="e.g., 500.00"
                  value={newPayment.amount}
                  onChange={handleNewPaymentChange}
                  ref={paymentAmountRef} // Assign ref here
                  min="0.01"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentPayment?.amount ? 'border-red-500' : 'border-slate-300'}`}
                />
                {errors.currentPayment?.amount && <p className="mt-1 text-sm text-red-600">{errors.currentPayment.amount}</p>}
              </div>

              {/* Payment Method Selection Component */}
              <div className="md:col-span-2">
                <PaymentMethodSelection
                  paymentMethods={paymentMethods}
                  formData={newPayment} // Pass newPayment as formData
                  handleChange={handleNewPaymentChange}
                />
              </div>

              <div>
                <label htmlFor="paymentReference" className="block text-sm font-medium text-slate-700 mb-2">
                  Reference {isReferenceRequired(newPayment.method) && <span className="text-red-500">*</span>}
                  {!isReferenceRequired(newPayment.method) && <span className="text-slate-500">(Optional)</span>}
                </label>
                <input
                  type="text"
                  id="paymentReference"
                  name="reference"
                  placeholder={getReferencePlaceholder(newPayment.method)}
                  value={newPayment.reference}
                  onChange={handleNewPaymentChange}
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentPayment?.reference ? 'border-red-500' : 'border-slate-300'}`}
                  required={isReferenceRequired(newPayment.method)}
                />
                {errors.currentPayment?.reference && <p className="mt-1 text-sm text-red-600">{errors.currentPayment.reference}</p>}
              </div>

              <div className="md:col-span-3 flex gap-4">
                <button
                  type="button"
                  onClick={addPaymentToList}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingPaymentIndex !== null ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                  </svg>
                  {editingPaymentIndex !== null ? 'Update Payment' : 'Add Payment'}
                </button>
                {editingPaymentIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelPaymentEdit}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200 shadow-md"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Payment List Table */}
            {formData.payments.length > 0 && (
              <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {formData.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">₹{payment.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{payment.method.replace('_', ' ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{payment.reference || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              type="button"
                              onClick={() => editPayment(index)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Payment"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removePayment(index)}
                              className="text-red-600 hover:text-red-900"
                              title="Remove Payment"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Total Paid:</span>
                  <span>₹{calculateTotalPaidAmount().toFixed(2)}</span>
                </div>
                <div className="bg-slate-100 px-6 py-4 flex justify-between items-center text-lg font-bold text-slate-900 border-t border-slate-200">
                  <span>Amount Due:</span>
                  <span className={`${(calculateTotalAmount() - calculateTotalPaidAmount()) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{(calculateTotalAmount() - calculateTotalPaidAmount()).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {errors.payments && <p className="mb-4 text-sm text-red-600">{errors.payments}</p>}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Save Purchase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}