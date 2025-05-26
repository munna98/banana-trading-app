// pages/items/index.js (Main component - much cleaner now!)
import { useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/items/PageHeader';
import SearchBar from '../../components/items/SearchBar';
import ItemsTable from '../../components/items/ItemsTable';
import SummaryCards from '../../components/items/SummaryCards';
import DeleteModal from '../../components/items/DeleteModal';

export default function ItemsList({ items }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState(items);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredItems = itemsData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/items/${deleteModal.item.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setItemsData(prev => prev.filter(item => item.id !== deleteModal.item.id));
        setDeleteModal({ show: false, item: null });
        alert('Item deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, item: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader />
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <ItemsTable items={filteredItems} onDeleteClick={handleDeleteClick} />
        <SummaryCards items={itemsData} />
      </div>

      <DeleteModal
        isOpen={deleteModal.show}
        item={deleteModal.item}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

// Keep the same getServerSideProps function
export async function getServerSideProps() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const items = await prisma.item.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const serializedItems = items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      props: {
        items: serializedItems,
      },
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    return {
      props: {
        items: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}