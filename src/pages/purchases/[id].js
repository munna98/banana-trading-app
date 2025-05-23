// PURCHASE DETAILS AND INVOICE PRINTING
// pages/purchases/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { prisma } from '../../lib/db';

export default function PurchaseDetails({ purchase }) {
  const router = useRouter();
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Handle invoice printing
  const handlePrint = async () => {
    if (!window.electron) {
      alert('Printing is only available in desktop app');
      return;
    }
    
    setIsPrinting(true);
    
    try {
      // Format invoice data for the printer
      const invoiceData = {
        id: purchase.id,
        date: purchase.date,
        type: 'purchase',
        supplier: purchase.supplier,
        totalAmount: purchase.totalAmount,
        paidAmount: purchase.paidAmount,
        balance: purchase.balance,
        items: purchase.items.map(item => ({
          name: item.item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }))
      };
      
      // Send to printer
      const result = await window.electron.printInvoice(invoiceData);
      
      if (result.success) {
        alert('Invoice printed successfully!');
      } else {
        throw new Error(result.error || 'Printing failed');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Error printing invoice: ' + error.message);
    } finally {
      setIsPrinting(false);
    }
  };
  
  // Format date for display
  const formattedDate = new Date(purchase.date).toLocaleDateString();
  
  return (
    <div className="purchase-details">
      <h1>Purchase Invoice #{purchase.id}</h1>
      
      <div className="invoice-container">
        <div className="invoice-header">
          <div className="invoice-title">
            <h2>BANANA TRADING CO.</h2>
            <p>Purchase Invoice</p>
          </div>
          
          <div className="invoice-info">
            <p><strong>Invoice #:</strong> {purchase.id}</p>
            <p><strong>Date:</strong> {formattedDate}</p>
            <p><strong>Supplier:</strong> {purchase.supplier.name}</p>
          </div>
        </div>
        
        <div className="invoice-body">
          <div className="invoice-footer">
            <div className="invoice-actions">
              <button 
                className="btn btn-primary" 
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? 'Printing...' : 'Print Invoice'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => router.push('/purchases')}
              >
                Back to Purchases
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  const purchase = await prisma.purchase.findUnique({
    where: { id: parseInt(id) },
    include: {
      supplier: true,
      items: {
        include: {
          item: true
        }
      }
    }
  });
  
  if (!purchase) {
    return {
      notFound: true
    };
  }
  
  // Convert dates to strings to make them serializable
  const serializedPurchase = JSON.parse(JSON.stringify(purchase));
  
  return {
    props: {
      purchase: serializedPurchase
    }
  };
}