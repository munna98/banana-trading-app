// RECEIVE PAYMENT PAGE
// pages/transactions/receipts.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function ReceivePayment() {
  const router = useRouter();
  const { customerId } = router.query;
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedCustomerBalance, setSelectedCustomerBalance] = useState(0);
  
  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
        
        // If customerId is in query params, set the selected customer
        if (customerId && data.length > 0) {
          const customer = data.find(c => c.id === parseInt(customerId));
          if (customer) {
            setFormData(prev => ({ ...prev, customerId: customer.id }));
            setSelectedCustomerBalance(customer.balance);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    }
    
    fetchCustomers();
  }, [customerId]);
  
  // Update selected customer balance when customer changes
  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, customerId: selectedId }));
    
    if (selectedId) {
      const customer = customers.find(c => c.id === parseInt(selectedId));
      setSelectedCustomerBalance(customer ? customer.balance : 0);
    } else {
      setSelectedCustomerBalance(0);
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
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Show success message with better UX
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.textContent = 'Payment received successfully!';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
          document.body.removeChild(successDiv);
          router.push(`/customers/${formData.customerId}`);
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment receipt');
      }
    } catch (error) {
      console.error('Error recording payment receipt:', error);
      alert('Error recording payment receipt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const selectedCustomer = customers.find(c => c.id === parseInt(formData.customerId));
  
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
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Receive Payment</h1>
                <p className="text-slate-600">Record a payment received from your customer</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Receipt Form</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Select Customer *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <select
                      id="customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors duration-200 bg-slate-50 focus:bg-white text-slate-900"
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} (Balance: ₹{customer.balance.toFixed(2)})
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
                  {selectedCustomerBalance > 0 && formData.amount && (
                    <p className="mt-2 text-sm text-slate-600">
                      New balance will be: <span className="font-semibold">₹{(selectedCustomerBalance - parseFloat(formData.amount || 0)).toFixed(2)}</span>
                    </p>
                  )}
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
                      placeholder="Add any additional notes about this payment receipt..."
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
                    disabled={loading || !formData.customerId || !formData.amount}
                    className="flex-1 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-green-500"
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
                        Record Receipt
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Customer Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Current Balance Card */}
            {formData.customerId && (
              <div className={`bg-gradient-to-br rounded-2xl p-6 border ${
                selectedCustomerBalance > 0 
                  ? 'from-red-50 to-red-100 border-red-200' 
                  : 'from-green-50 to-green-100 border-green-200'
              }`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedCustomerBalance > 0 ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-sm font-medium ${
                      selectedCustomerBalance > 0 ? 'text-red-900' : 'text-green-900'
                    }`}>
                      Current Balance
                    </h3>
                    <p className={`text-2xl font-bold ${
                      selectedCustomerBalance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ₹{selectedCustomerBalance.toFixed(2)}
                    </p>
                    {selectedCustomerBalance === 0 && (
                      <p className="text-xs text-green-700 mt-1">No outstanding balance</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Preview */}
            {formData.amount && formData.customerId && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Preview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Receiving Amount:</span>
                    <span className="font-semibold text-blue-900">₹{parseFloat(formData.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Balance:</span>
                    <span className="font-semibold text-blue-900">₹{selectedCustomerBalance.toFixed(2)}</span>
                  </div>
                  <hr className="border-blue-200" />
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">New Balance:</span>
                    <span className="font-bold text-blue-900">
                      ₹{(selectedCustomerBalance - parseFloat(formData.amount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {formData.customerId && selectedCustomer && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">🚀 Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/customers/${formData.customerId}`}
                    className="block w-full px-4 py-3 bg-white text-purple-600 font-medium text-center rounded-xl hover:bg-purple-50 transition-colors duration-200 border border-purple-200"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Customer Details
                  </Link>
                  <Link
                    href={`/sales/add?customerId=${formData.customerId}`}
                    className="block w-full px-4 py-3 bg-purple-500 text-white font-medium text-center rounded-xl hover:bg-purple-600 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Sale
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-900 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-3 text-sm text-amber-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3"></span>
                  Verify payment amount before recording
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3"></span>
                  Include payment method in notes
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3"></span>
                  Receipt will reduce customer's outstanding balance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}