// pages/items/add.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AddItem() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: 'Kg',
    purchaseRate: '',
    salesRate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    if (formData.purchaseRate && isNaN(parseFloat(formData.purchaseRate))) {
      newErrors.purchaseRate = 'Purchase rate must be a valid number';
    }
    
    if (formData.salesRate && isNaN(parseFloat(formData.salesRate))) {
      newErrors.salesRate = 'Sales rate must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/items/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          purchaseRate: formData.purchaseRate ? parseFloat(formData.purchaseRate) : 0,
          salesRate: formData.salesRate ? parseFloat(formData.salesRate) : 0,
        }),
      });

      if (response.ok) {
        alert('Item added successfully!');
        router.push('/items');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to add item'}`);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('An error occurred while adding the item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Item</h1>
              <p className="text-slate-600">Create a new inventory item for tracking</p>
            </div>
            <Link
              href="/items"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Items
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                      errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                    }`}
                    placeholder="Enter item name (e.g., Cavendish Banana)"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white resize-none"
                    placeholder="Enter item description (optional)"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-semibold text-slate-700 mb-2">
                    Unit of Measurement
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                  >
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Bunch">Bunch</option>
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                {/* Purchase and Sales Rates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="purchaseRate" className="block text-sm font-semibold text-slate-700 mb-2">
                      Purchase Rate (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="purchaseRate"
                        name="purchaseRate"
                        value={formData.purchaseRate}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                          errors.purchaseRate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.purchaseRate && (
                      <p className="mt-1 text-sm text-red-600">{errors.purchaseRate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="salesRate" className="block text-sm font-semibold text-slate-700 mb-2">
                      Sales Rate (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="salesRate"
                        name="salesRate"
                        value={formData.salesRate}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                          errors.salesRate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.salesRate && (
                      <p className="mt-1 text-sm text-red-600">{errors.salesRate}</p>
                    )}
                  </div>
                </div>

                {/* Profit Margin Display */}
                {formData.purchaseRate && formData.salesRate && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Estimated Profit Margin:</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        ((parseFloat(formData.salesRate) - parseFloat(formData.purchaseRate)) / parseFloat(formData.purchaseRate) * 100) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(formData.purchaseRate) > 0 
                          ? `${(((parseFloat(formData.salesRate) - parseFloat(formData.purchaseRate)) / parseFloat(formData.purchaseRate)) * 100).toFixed(1)}%`
                          : '0.0%'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Item...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Item
                      </>
                    )}
                  </button>
                  <Link
                    href="/items"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-all duration-200"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-yellow-900">About Item Units</h3>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                For banana inventory, typically use <strong>Kg</strong> for weight-based tracking.
                For bunch-based tracking, you can use <strong>Dozen</strong> or <strong>Bunch</strong>.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-900">Banana Varieties</h3>
              </div>
              <p className="text-sm text-green-800 mb-3">
                Create separate items for different banana varieties:
              </p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Cavendish</li>
                <li>• Robusta</li>
                <li>• Red Banana</li>
                <li>• Nendran</li>
                <li>• Poovan</li>
              </ul>
              <p className="text-xs text-green-600 mt-3">
                This helps track inventory and sales by variety.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Pricing Tips</h3>
              </div>
              <p className="text-sm text-blue-800">
                Set your purchase rate based on wholesale costs and sales rate based on market prices.
                Keep track of profit margins to ensure profitability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}