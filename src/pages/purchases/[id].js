// pages/purchases/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { prisma } from '../../lib/db';

// Import all the components
import PurchaseHeader from '../../components/purchases/veiw/PurchaseHeader';
import PurchaseInfo from '../../components/purchases/veiw/PurchaseInfo';
import FinancialSummary from '../../components/purchases/veiw/FinancialSummary';
import PurchaseItems from '../../components/purchases/veiw/PurchaseItems';
import PaymentHistory from '../../components/purchases/veiw/PaymentHistory';
import PaymentModal from '../../components/purchases/veiw/PaymentModal';

// Import the print utility
import { printThermalInvoice } from '../../utils/thermal80mmInvoice';

export default function PurchaseDetail({ purchase }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Handle case when purchase is not found
  if (!purchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Purchase Not Found</h1>
          <p className="text-slate-600 mb-6">The requested purchase could not be found.</p>
          <Link
            href="/purchases"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Purchases
          </Link>
        </div>
      </div>
    );
  }

  // Handle payment submission
  const handlePayment = async (paymentData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseId: purchase.id,
          supplierId: purchase.supplierId,
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          reference: paymentData.reference || null,
          notes: paymentData.notes || null,
          date: paymentData.date,
          debitAccountId: purchase.supplier.payableAccountId || 1 // Adjust based on your account structure
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment');
      }

      alert('Payment recorded successfully');
      setShowPaymentModal(false);
      router.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error recording payment: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle purchase deletion
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this purchase? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${purchase.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase');
      }

      alert('Purchase deleted successfully');
      router.push('/purchases');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting purchase: ' + error.message);
    }
  };

  // Handle invoice printing
  const handlePrintInvoice = () => {
    // You can customize business info here or fetch from database/settings
    const businessInfo = {
      name: 'BANANA TRADING BUSINESS',
      address: 'Your Business Address\nCity, State - PIN',
      phone: '+91-XXXXXXXXXX',
      email: 'business@example.com',
      gst: 'GST No: XXXXXXXXXXXXXXXXX'
    };

    printThermalInvoice(purchase, businessInfo);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    const numericAmount = typeof amount === 'number' ? amount : 0;
    return `₹${numericAmount.toFixed(2)}`;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Component */}
        <PurchaseHeader 
          purchase={purchase}
          onPayment={() => setShowPaymentModal(true)}
          onDelete={handleDelete}
          onPrintInvoice={handlePrintInvoice}
        />

        {/* Purchase Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Purchase Info Component */}
          <PurchaseInfo 
            purchase={purchase}
            formatDate={formatDate}
          />

          {/* Financial Summary Component */}
          <FinancialSummary 
            purchase={purchase}
            formatCurrency={formatCurrency}
          />
        </div>

        {/* Purchase Items and Payment History Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Items Component */}
          <PurchaseItems 
            items={purchase.items}
            formatCurrency={formatCurrency}
          />

          {/* Payment History Component */}
          <PaymentHistory 
            payments={purchase.payments}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>
      </div>

      {/* Payment Modal Component */}
      {showPaymentModal && (
        <PaymentModal
          purchase={purchase}
          isLoading={isLoading}
          onSubmit={handlePayment}
          onClose={() => setShowPaymentModal(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: parseInt(id) },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: {
          orderBy: { date: 'desc' },
        },
        transaction: {
          include: {
            entries: {
              include: {
                account: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      return {
        props: { purchase: null },
      };
    }

    return {
      props: {
        purchase: JSON.parse(JSON.stringify(purchase)),
      },
    };
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return {
      props: { purchase: null },
    };
  }
}