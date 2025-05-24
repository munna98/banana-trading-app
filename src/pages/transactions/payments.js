// MAKE PAYMENT PAGE
// pages/transactions/payments.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function MakePayment() {
  const router = useRouter();
  const { supplierId } = router.query;
  
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: supplierId || '',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedSupplierBalance, setSelectedSupplierBalance] = useState(0);
  
  // Fetch suppliers
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const response = await fetch('/api/suppliers');
        const data = await response.json();
        setSuppliers(data);
        
        // If supplierId is in query params, set the selected supplier
        if (supplierId && data.length > 0) {
          const supplier = data.find(s => s.id === parseInt(supplierId));
          if (supplier) {
            setFormData(prev => ({ ...prev, supplierId: supplier.id }));
            setSelectedSupplierBalance(supplier.balance);
          }
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    }
    
    fetchSuppliers();
  }, [supplierId]);
  
  // Update selected supplier balance when supplier changes
  const handleSupplierChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, supplierId: selectedId }));
    
    if (selectedId) {
      const supplier = suppliers.find(s => s.id === parseInt(selectedId));
      setSelectedSupplierBalance(supplier ? supplier.balance : 0);
    } else {
      setSelectedSupplierBalance(0);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Show success message with better UX
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Payment recorded successfully!';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          document.body.removeChild(successDiv);
          router.push(`/suppliers/${formData.supplierId}`);
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/transactions"
                className="inline-flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Make Payment</h1>
                <p className="text-slate-600">Record a payment to your supplier</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Payment Form</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Supplier Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Supplier *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <select
                      id="supplierId"
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleSupplierChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    >
                      <option value="">Choose a supplier...</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} (Balance: ₹{supplier.balance.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium">₹</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      min="0.01"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Add any additional notes about this payment..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900 resize-none"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 focus:ring-2 focus:ring-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    // disabled={loading}
                    disabled={loading || !formData.supplierId || !formData.amount}
                    className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Supplier Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Current Balance Card */}
            {formData.supplierId && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-red-900">Current Balance</h3>
                    <p className="text-2xl font-bold text-red-600">₹{selectedSupplierBalance.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Preview */}
            {formData.amount && formData.supplierId && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Payment Preview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-700">Payment Amount:</span>
                    <span className="font-semibold text-green-900">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Current Balance:</span>
                    <span className="font-semibold text-green-900">₹{selectedSupplierBalance.toFixed(2)}</span>
                  </div>
                  <hr className="border-green-200" />
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">New Balance:</span>
                    <span className="font-bold text-green-900">
                      ₹{(selectedSupplierBalance - parseFloat(formData.amount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-3 text-sm text-purple-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  Double-check the payment amount before submitting
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  Add notes for better record keeping
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3"></span>
                  Payment will update supplier's balance immediately
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}