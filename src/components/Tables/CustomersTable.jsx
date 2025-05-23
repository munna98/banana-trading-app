// src/components/Tables/CustomersTable.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const CustomersTable = ({ customers, onDelete, onReceivePayment }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, customer: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, customer: null });
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const router = useRouter();

  const handleDelete = async (customer) => {
    setDeleteModal({ isOpen: true, customer });
  };

  const confirmDelete = async () => {
    if (deleteModal.customer) {
      await onDelete(deleteModal.customer.id);
      setDeleteModal({ isOpen: false, customer: null });
    }
  };

  const handleEdit = (customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handleReceipt = (customer) => {
    setReceiptModal({ isOpen: true, customer });
    setReceiptAmount('');
    setReceiptNotes('');
  };

  const submitReceipt = async () => {
    if (receiptModal.customer && receiptAmount) {
      await onReceivePayment({
        customerId: receiptModal.customer.id,
        amount: parseFloat(receiptAmount),
        notes: receiptNotes
      });
      setReceiptModal({ isOpen: false, customer: null });
      setReceiptAmount('');
      setReceiptNotes('');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600 bg-green-100';
    if (balance < 0) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No customers found</p>
        <Button 
          onClick={() => router.push('/customers/add')}
          className="mt-4"
        >
          Add First Customer
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </div>
                  {customer.address && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {customer.address}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {customer.phone || 'No phone'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBalanceColor(customer.balance)}`}>
                    {formatCurrency(customer.balance)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                  >
                    View
                  </Button>
                  {customer.balance > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReceipt(customer)}
                    >
                      Receive
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(customer)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, customer: null })}
        title="Delete Customer"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{deleteModal.customer?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, customer: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, customer: null })}
        title="Receive Payment"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Receiving payment from: <span className="font-medium">{receiptModal.customer?.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Current balance: <span className="font-medium text-green-600">{formatCurrency(receiptModal.customer?.balance || 0)}</span>
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={receiptAmount}
              onChange={(e) => setReceiptAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Receipt notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setReceiptModal({ isOpen: false, customer: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitReceipt}
              disabled={!receiptAmount}
            >
              Receive Payment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CustomersTable;