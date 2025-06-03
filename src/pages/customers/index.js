// pages/customers/index.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/customers/PageHeader';
import SearchBar from '../../components/customers/SearchBar';
import CustomersTable from '../../components/customers/CustomersTable';
import SummaryCards from '../../components/customers/SummaryCards';
import DeleteCustomerModal from '../../components/customers/DeleteCustomerModal';

export default function CustomersList({ customers }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [customersData, setCustomersData] = useState(customers);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCustomers = customersData.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (customer) => {
    setDeleteModal({ show: true, item: customer });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.item) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${deleteModal.item.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setCustomersData(prev => prev.filter(customer => customer.id !== deleteModal.item.id));
        setDeleteModal({ show: false, item: null });
        alert('Customer deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the customer');
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
        <CustomersTable customers={filteredCustomers} onDeleteClick={handleDeleteClick} />
        <SummaryCards customers={customersData} />
      </div>

      <DeleteCustomerModal
        isOpen={deleteModal.show}
        customer={deleteModal.item}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}

export async function getServerSideProps() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          select: {
            totalAmount: true,
          },
        },
        receipts: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const customersWithTotals = customers.map(customer => {
      const totalSales = customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalReceived = customer.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        totalSales,
        totalReceived,
      };
    });

    return {
      props: {
        customers: customersWithTotals,
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      props: {
        customers: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}