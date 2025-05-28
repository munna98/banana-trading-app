import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function EditAccount() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    parentId: '',
    description: '',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  // Account types with descriptions
  const accountTypes = [
    { value: 'ASSET', label: 'Asset', description: 'Resources owned by the business (Cash, Inventory, Equipment)' },
    { value: 'LIABILITY', label: 'Liability', description: 'Debts and obligations (Loans, Accounts Payable)' },
    { value: 'EQUITY', label: 'Equity', description: 'Owner\'s stake in the business (Capital, Retained Earnings)' },
    { value: 'INCOME', label: 'Income', description: 'Revenue and earnings (Sales, Service Income)' },
    { value: 'EXPENSE', label: 'Expense', description: 'Costs of doing business (Rent, Utilities, Salaries)' }
  ];

  // Load account data
  useEffect(() => {
    if (!id) return;

    const loadAccount = async () => {
      try {
        setLoadingAccount(true);
        setError(null);

        const response = await fetch(`/api/accounts/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load account');
        }

        if (data.success && data.data) {
          const accountData = {
            code: data.data.code || '',
            name: data.data.name || '',
            type: data.data.type || '',
            parentId: data.data.parentId || '',
            description: data.data.description || '',
            isActive: data.data.isActive !== false
          };

          setOriginalData(accountData);
          setFormData(accountData);
        } else {
          throw new Error('Account not found');
        }
      } catch (error) {
        console.error('Error loading account:', error);
        setError(error.message);
      } finally {
        setLoadingAccount(false);
      }
    };

    loadAccount();
  }, [id]);

  // Load all accounts for parent selection
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const response = await fetch('/api/accounts');
        const data = await response.json();

        if (response.ok && data.success) {
          setAccounts(data.data || []);
        }
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear specific field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.code.trim()) {
      errors.code = 'Account code is required';
    } else if (accounts.some(acc => acc.code === formData.code.trim() && acc.id !== id)) {
      errors.code = 'Account code already exists';
    }

    if (!formData.name.trim()) {
      errors.name = 'Account name is required';
    }

    if (!formData.type) {
      errors.type = 'Account type is required';
    }

    // Prevent setting parent to self or descendant
    if (formData.parentId === id) {
      errors.parentId = 'Account cannot be its own parent';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/accounts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.trim(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          parentId: formData.parentId || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update account');
      }

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/accounts');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to update account');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/accounts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      if (data.success) {
        router.push('/accounts');
      } else {
        throw new Error(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.message);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Filter potential parent accounts
  const getAvailableParentAccounts = () => {
    if (!formData.type) return [];

    return accounts.filter(account =>
      account.type === formData.type &&
      account.isActive &&
      account.id !== id // Exclude self
    );
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData) return false;

    return Object.keys(formData).some(key =>
      formData[key] !== originalData[key]
    );
  };

  if (loadingAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center text-slate-500 mb-4">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading account...
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Updated!</h2>
            <p className="text-slate-600 mb-6">The account has been successfully updated. Redirecting to accounts list...</p>
            <div className="flex justify-center">
              <Link
                href="/accounts"
                className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-colors duration-200"
              >
                View Accounts
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Account</h1>
              <p className="text-slate-600">Update account information and settings</p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/accounts"
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Accounts
              </Link>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error updating account</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                    formErrors.type ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                  }`}
                required
                disabled={loading || deleting}
              >
                <option value="">Select account type...</option>
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {formData.type && (
                <p className="mt-2 text-sm text-slate-600">
                  {accountTypes.find(t => t.value === formData.type)?.description}
                </p>
              )}
              {formErrors.type && (
                <p className="mt-2 text-sm text-red-600">{formErrors.type}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                  Account Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., 1001"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                      formErrors.code ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                    }`}
                  required
                  disabled={loading || deleting}
                />
                <p className="mt-2 text-sm text-slate-600">
                  Unique identifier for this account
                </p>
                {formErrors.code && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.code}</p>
                )}
              </div>

              {/* Account Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Cash in Bank"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ${
                      formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'
                    }`}
                  required
                  disabled={loading || deleting}
                />
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
            </div>

            {/* Parent Account */}
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 mb-2">
                Parent Account
              </label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                disabled={loadingAccounts || !formData.type || loading || deleting}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">No parent account (Top level)</option>
                {getAvailableParentAccounts().map(account => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
              {formErrors.parentId && <p className="mt-2 text-sm text-red-600">{formErrors.parentId}</p>}
              <p className="mt-2 text-sm text-slate-600">
                Optional: Select a parent account to create a sub-account
              </p>
              {loadingAccounts && <p className="mt-2 text-sm text-slate-500">Loading parent accounts...</p>}
              {!loadingAccounts && getAvailableParentAccounts().length === 0 && formData.type && (
                <p className="mt-2 text-sm text-slate-500">No available parent accounts of type "{formData.type}".</p>
              )}
              {!formData.type && !loadingAccounts && (
                <p className="mt-2 text-sm text-slate-500">Select an Account Type first to see available parent accounts.</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Optional description of this account..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-slate-50 focus:bg-white"
                disabled={loading || deleting}
              ></textarea>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                disabled={loading || deleting}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-slate-900">
                Account is active
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={loading || deleting || !hasChanges()}
                className={`flex-1 inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold ${
                  loading || deleting || !hasChanges()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                } transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Delete Account</h2>
              <p className="text-slate-600 mb-4">Are you sure you want to delete this account? This action cannot be undone.</p>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}