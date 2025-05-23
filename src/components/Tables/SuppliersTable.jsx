// src/components/Tables/SuppliersTable.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const SuppliersTable = ({ suppliers, onDelete, onMakePayment }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, supplier: null });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, supplier: null });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const router = useRouter();

  const handleDelete = async (supplier) => {
    setDeleteModal({ isOpen: true, supplier });
  };

  const confirmDelete = async () => {
    if (deleteModal.supplier) {
      await onDelete(deleteModal.supplier.id);
      setDeleteModal({ isOpen: false, supplier: null });
    }
  };

  const handleEdit = (supplier) => {
    router.push(`/suppliers/${supplier.id}`);
  };

  const handlePayment = (supplier) => {
    setPaymentModal({ isOpen: true, supplier });
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const submitPayment = async () => {
    if (paymentModal.supplier && paymentAmount) {
      await onMakePayment({
        supplierId: paymentModal.supplier.id,
        amount: parseFloat(paymentAmount),
        notes: paymentNotes
      });
      setPaymentModal({ isOpen: false, supplier: null });
      setPaymentAmount('');
      setPaymentNotes('');
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
    if (balance > 0) return 'text-red-600 bg-red-100';
    if (balance < 0) return 'text-green-600 bg-green-100';
    return 'text-gray-600 bg-gray-100';
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No suppliers found</p>
        <Button 
          onClick={() => router.push('/suppliers/add')}
          className="mt-4"
        >
          Add First Supplier
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
                Supplier
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
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {supplier.name}
                  </div>
                  {supplier.address && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {supplier.address}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {supplier.phone || 'No phone'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBalanceColor(supplier.balance)}`}>
                    {formatCurrency(supplier.balance)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(supplier.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(supplier)}
                  >
                    View
                  </Button>
                  {supplier.balance > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePayment(supplier)}
                    >
                      Pay
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(supplier)}
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
        onClose={() => setDeleteModal({ isOpen: false, supplier: null })}
        title="Delete Supplier"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{deleteModal.supplier?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, supplier: null })}
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

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, supplier: null })}
        title="Make Payment"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Making payment to: <span className="font-medium">{paymentModal.supplier?.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Current balance: <span className="font-medium text-red-600">{formatCurrency(paymentModal.supplier?.balance || 0)}</span>
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Payment notes..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setPaymentModal({ isOpen: false, supplier: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitPayment}
              disabled={!paymentAmount}
            >
              Make Payment
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SuppliersTable;