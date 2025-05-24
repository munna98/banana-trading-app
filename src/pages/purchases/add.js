// pages/purchases/add.js

import { useState, useEffect, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddPurchase() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    paidAmount: '',
  });
  const [errors, setErrors] = useState({});

  const [newItem, setNewItem] = useState({
    itemId: '',
    quantity: '',
    rate: '', // This will be pre-filled from selected item, but editable
    weightDeduction: '1.5',
  });

  // Refs for input fields to handle "Enter" key navigation
  const supplierRef = useRef(null);
  const dateRef = useRef(null);
  const itemSelectRef = useRef(null);
  const quantityRef = useRef(null);
  const rateRef = useRef(null);
  const weightDeductionRef = useRef(null);
  const addItemButtonRef = useRef(null);
  const paidAmountRef = useRef(null);
  const submitButtonRef = useRef(null);

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

        setSuppliers(supplierData.data || []);
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

    // If item is selected, pre-fill the rate
    if (name === 'itemId') {
      const selectedItem = items.find(i => i.id === parseInt(value));
      if (selectedItem) {
        setNewItem(prev => ({ ...prev, rate: selectedItem.rate?.toString() || '' })); // Assuming item has a 'rate' property
      } else {
        setNewItem(prev => ({ ...prev, rate: '' }));
      }
    }
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
    if (newItem.weightDeduction !== '' && (isNaN(parseFloat(newItem.weightDeduction)) || parseFloat(newItem.weightDeduction) < 0)) {
      currentItemErrors.weightDeduction = 'Non-negative weight deduction required.';
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
      const weightDeduction = parseFloat(newItem.weightDeduction || 0);
      const effectiveQuantity = quantity - weightDeduction;
      const amount = effectiveQuantity * rate;

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, {
          itemId: parseInt(newItem.itemId),
          name: itemInfo.name,
          unit: itemInfo.unit,
          quantity: quantity,
          rate: rate,
          weightDeduction: weightDeduction,
          effectiveQuantity: effectiveQuantity, // Store effective quantity for display
          amount: amount,
        }]
      }));
      setNewItem({ itemId: '', quantity: '', rate: '', weightDeduction: '1.5' }); // Reset for next item
      itemSelectRef.current?.focus(); // Focus on item selection after adding
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
  };

  // Handle "Enter" key press for navigation
  const handleKeyDown = (e, nextFieldRef) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if it's the last input
      nextFieldRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required.';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required.';
    if (formData.paidAmount && (isNaN(parseFloat(formData.paidAmount)) || parseFloat(formData.paidAmount) < 0)) {
      newErrors.paidAmount = 'Paid amount must be a non-negative number.';
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
      paidAmount: parseFloat(formData.paidAmount) || 0,
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
                  onKeyDown={(e) => handleKeyDown(e, dateRef)}
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.supplierId ? 'border-red-500' : 'border-slate-300'}`}
                  required
                  ref={supplierRef}
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
                  onKeyDown={(e) => handleKeyDown(e, itemSelectRef)}
                  className="w-full py-3 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  required
                  ref={dateRef}
                />
              </div>
            </div>

            {/* Add Item Section */}
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Add Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 items-end">
              <div>
                <label htmlFor="newItemId" className="block text-sm font-medium text-slate-700 mb-2">Item <span className="text-red-500">*</span></label>
                <select
                  id="newItemId"
                  name="itemId"
                  value={newItem.itemId}
                  onChange={handleItemChange}
                  onKeyDown={(e) => handleKeyDown(e, quantityRef)}
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.itemId ? 'border-red-500' : 'border-slate-300'}`}
                  required
                  ref={itemSelectRef}
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
                  onKeyDown={(e) => handleKeyDown(e, rateRef)}
                  min="0.01"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.quantity ? 'border-red-500' : 'border-slate-300'}`}
                  required
                  ref={quantityRef}
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
                  onKeyDown={(e) => handleKeyDown(e, weightDeductionRef)}
                  min="0"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.rate ? 'border-red-500' : 'border-slate-300'}`}
                  required
                  ref={rateRef}
                />
                {errors.currentItem?.rate && <p className="mt-1 text-sm text-red-600">{errors.currentItem.rate}</p>}
              </div>
              <div>
                <label htmlFor="newWeightDeduction" className="block text-sm font-medium text-slate-700 mb-2">Weight Deduction (Kg)</label>
                <input
                  type="number"
                  id="newWeightDeduction"
                  name="weightDeduction"
                  placeholder="e.g., 1.5"
                  value={newItem.weightDeduction}
                  onChange={handleItemChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItemToList(); // Add item on Enter
                      // No need to focus on next element here, addItemToList will handle focusing on itemSelectRef
                    }
                  }}
                  min="0"
                  step="0.01"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.currentItem?.weightDeduction ? 'border-red-500' : 'border-slate-300'}`}
                  ref={weightDeductionRef}
                />
                {errors.currentItem?.weightDeduction && <p className="mt-1 text-sm text-red-600">{errors.currentItem.weightDeduction}</p>}
              </div>
              <div className="lg:col-span-4">
                <button
                  type="button"
                  onClick={addItemToList}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md"
                  ref={addItemButtonRef}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
            </div>
            {errors.items && <p className="mb-4 text-sm text-red-600">{errors.items}</p>}

            {/* Item List Table */}
            {formData.items.length > 0 && (
              <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Wt. Deduction</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Net Weight</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.quantity} {item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{item.weightDeduction} {item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold">{item.effectiveQuantity.toFixed(2)} {item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">₹{item.rate.toFixed(2)}/{item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">₹{item.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center text-lg font-bold text-slate-900">
                  <span>Grand Total:</span>
                  <span>₹{calculateTotalAmount()}</span>
                </div>
              </div>
            )}

            {/* Paid Amount */}
            <div className="mb-6">
              <label htmlFor="paidAmount" className="block text-sm font-medium text-slate-700 mb-2">Paid Amount</label>
              <input
                type="number"
                id="paidAmount"
                name="paidAmount"
                placeholder="e.g., 500.00"
                value={formData.paidAmount}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, submitButtonRef)}
                min="0"
                step="0.01"
                className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${errors.paidAmount ? 'border-red-500' : 'border-slate-300'}`}
                ref={paidAmountRef}
              />
              {errors.paidAmount && <p className="mt-1 text-sm text-red-600">{errors.paidAmount}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                ref={submitButtonRef}
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