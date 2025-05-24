// pages/customers/[id]/edit.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditCustomer() {
  const router = useRouter();
  const { id } = router.query; // Get the customer ID from the URL

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true); // New state for initial data loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to fetch customer data when the component mounts or ID changes
  useEffect(() => {
    if (!id) return; // Don't fetch if ID is not available yet

    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/customers/${id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setFormData({
            name: data.customer.name || '',
            phone: data.customer.phone || '',
            address: data.customer.address || '',
          });
        } else {
          throw new Error(data.message || 'Failed to fetch customer data');
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        setErrors({ fetch: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]); // Re-run when the ID changes

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/customers/${id}`, { // Use PUT for updates
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/customers'); // Redirect to customers list on success
      } else {
        throw new Error(data.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-700">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Customer</h1>
              <p className="text-slate-600">Update customer information and contact details</p>
            </div>
            <Link
              href="/customers"
              className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Customers
            </Link>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display for submit or fetch */}
            {(errors.submit || errors.fetch) && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{errors.submit || errors.fetch}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                        errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Enter customer name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-4 6a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v7z" />
                    </svg>
                  </div>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white ${
                        errors.phone ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-slate-50 focus:bg-white resize-none"
                      placeholder="Enter customer address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200">
              <Link
                href="/customers"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors duration-200 order-2 sm:order-1"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Customer...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Customer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mt-6">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for Editing Customers</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Customer name is required.</li>
                <li>• Ensure all fields are accurate before saving.</li>
                <li>• Changes will be immediately reflected in the customer list.</li>
                <li>• Customer balances will automatically adjust with updated transactions.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}