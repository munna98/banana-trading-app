// src/components/Tables/ItemsTable.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const ItemsTable = ({ items, onDelete, onEdit }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const router = useRouter();

  const handleDelete = async (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const confirmDelete = async () => {
    if (deleteModal.item) {
      await onDelete(deleteModal.item.id);
      setDeleteModal({ isOpen: false, item: null });
    }
  };

  const handleEdit = (item) => {
    router.push(`/items/${item.id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items found</p>
        <Button 
          onClick={() => router.push('/items/add')}
          className="mt-4"
        >
          Add First Item
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
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {item.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item)}
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
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        title="Delete Item"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{deleteModal.item?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, item: null })}
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
    </>
  );
};

export default ItemsTable;