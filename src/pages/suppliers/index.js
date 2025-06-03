// pages/suppliers/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/suppliers/PageHeader';
import SearchBar from '../../components/suppliers/SearchBar';
import SuppliersTable from '../../components/suppliers/SuppliersTable';
import SummaryCards from '../../components/suppliers/SummaryCards';
import DeleteSupplierModal from '../../components/suppliers/DeleteSupplierModal'; // <--- UPDATED IMPORT PATH AND COMPONENT NAME

export default function SuppliersList({ suppliers }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliersData, setSuppliersData] = useState(suppliers);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null }); // 'item' here refers to the supplier object
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredSuppliers = suppliersData.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.address && supplier.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (supplier) => {
    setDeleteModal({ show: true, item: supplier });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/suppliers/${deleteModal.item.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuppliersData(prev => prev.filter(supplier => supplier.id !== deleteModal.item.id));
        setDeleteModal({ show: false, item: null });
        alert('Supplier deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the supplier');
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
        <SuppliersTable suppliers={filteredSuppliers} onDeleteClick={handleDeleteClick} />
        <SummaryCards suppliers={suppliersData} />
      </div>

      <DeleteSupplierModal // <--- USING THE NEW COMPONENT
        isOpen={deleteModal.show}
        supplier={deleteModal.item} // <--- PASSING THE SUPPLIER OBJECT AS 'supplier' PROP
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
    const suppliers = await prisma.supplier.findMany({
      include: {
        purchases: {
          select: {
            totalAmount: true,
          },
        },
        payments: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const suppliersWithTotals = suppliers.map(supplier => {
      const totalPurchases = supplier.purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
      const totalPaid = supplier.payments.reduce((sum, payment) => sum + payment.amount, 0);

      return {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        address: supplier.address,
        createdAt: supplier.createdAt.toISOString(), // Serialize Date objects
        updatedAt: supplier.updatedAt.toISOString(), // Serialize Date objects
        totalPurchases,
        totalPaid,
      };
    });

    return {
      props: {
        suppliers: suppliersWithTotals,
      },
    };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return {
      props: {
        suppliers: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}