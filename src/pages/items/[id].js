// ITEM DETAIL PAGE
// pages/items/[id].js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';
import { prisma } from '../../lib/db';

export default function ItemDetail({ item, transactions }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('purchases');
  
  // Calculate transaction statistics
  const totalPurchased = transactions.purchases.reduce((sum, p) => sum + p.quantity, 0);
  const totalPurchaseCost = transactions.purchases.reduce((sum, p) => sum + p.amount, 0);
  const avgPurchaseRate = totalPurchased > 0 ? totalPurchaseCost / totalPurchased : 0;
  
  const totalSold = transactions.sales.reduce((sum, s) => sum + s.quantity, 0);
  const totalSaleRevenue = transactions.sales.reduce((sum, s) => sum + s.amount, 0);
  const avgSellingRate = totalSold > 0 ? totalSaleRevenue / totalSold : 0;
  
  // Calculate approximate inventory (purchased - sold)
  const approximateInventory = totalPurchased - totalSold;
  
  return (
    <Layout>
      <div className="item-detail">
        <div className="page-header">
          <h1>Item: {item.name}</h1>
          <div className="header-actions">
            <Link href={`/items/${item.id}/edit`}>
              <a className="btn btn-warning">Edit Item</a>
            </Link>
            <Link href={`/purchases/add?itemId=${item.id}`}>
              <a className="btn btn-primary">Purchase</a>
            </Link>
            <Link href={`/sales/add?itemId=${item.id}`}>
              <a className="btn btn-success">Sell</a>
            </Link>
          </div>
        </div>
        
        <div className="info-section">
          <div className="info-card">
            <h3>Basic Information</h3>
            <p><strong>Description:</strong> {item.description || 'No description'}</p>
            <p><strong>Unit:</strong> {item.unit}</p>
            <p><strong>Created:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> {new Date(item.updatedAt).toLocaleDateString()}</p>
          </div>
          
          <div className="info-card">
            <h3>Transaction Summary</h3>
            <p><strong>Total Purchased:</strong> {totalPurchased.toFixed(2)} {item.unit}</p>
            <p><strong>Total Sold:</strong> {totalSold.toFixed(2)} {item.unit}</p>
            <p><strong>Approximate Inventory:</strong> {approximateInventory.toFixed(2)} {item.unit}</p>
            <p><strong>Avg. Purchase Rate:</strong> ₹{avgPurchaseRate.toFixed(2)} per {item.unit}</p>
            <p><strong>Avg. Selling Rate:</strong> ₹{avgSellingRate.toFixed(2)} per {item.unit}</p>
            {avgPurchaseRate > 0 && avgSellingRate > 0 && (
              <p className={avgSellingRate > avgPurchaseRate ? 'text-success' : 'text-danger'}>
                <strong>Avg. Profit Margin:</strong> 
                {((avgSellingRate - avgPurchaseRate) / avgPurchaseRate * 100).toFixed(2)}%
              </p>
            )}
          </div>
        </div>
        
        <div className="transaction-history">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchase History
            </button>
            <button 
              className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              Sales History
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'purchases' && (
              <div className="purchases-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Supplier</th>
                      <th>Quantity</th>
                      <th>Weight Deduction</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.purchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{new Date(purchase.date).toLocaleDateString()}</td>
                        <td>{purchase.supplierName}</td>
                        <td>{purchase.quantity.toFixed(2)} {item.unit}</td>
                        <td>{purchase.weightDeduction.toFixed(2)} {item.unit}</td>
                        <td>₹{purchase.rate.toFixed(2)}</td>
                        <td>₹{purchase.amount.toFixed(2)}</td>
                        <td>
                          <Link href={`/purchases/${purchase.purchaseId}`}>
                            <a className="btn btn-info btn-sm">View Purchase</a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {transactions.purchases.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center">No purchase history found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'sales' && (
              <div className="sales-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Quantity</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.sales.map((sale) => (
                      <tr key={sale.id}>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                        <td>{sale.customerName}</td>
                        <td>{sale.quantity.toFixed(2)} {item.unit}</td>
                        <td>₹{sale.rate.toFixed(2)}</td>
                        <td>₹{sale.amount.toFixed(2)}</td>
                        <td>
                          <Link href={`/sales/${sale.saleId}`}>
                            <a className="btn btn-info btn-sm">View Sale</a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {transactions.sales.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center">No sales history found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;
  
  const item = await prisma.item.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!item) {
    return {
      notFound: true
    };
  }
  
  // Get purchase items
  const purchaseItems = await prisma.purchaseItem.findMany({
    where: { itemId: parseInt(id) },
    include: {
      purchase: {
        include: {
          supplier: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { purchase: { date: 'desc' } }
  });
  
  // Get sale items
  const saleItems = await prisma.saleItem.findMany({
    where: { itemId: parseInt(id) },
    include: {
      sale: {
        include: {
          customer: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { sale: { date: 'desc' } }
  });
  
  // Format purchase and sale data
  const formattedPurchases = purchaseItems.map(pi => ({
    id: pi.id,
    purchaseId: pi.purchaseId,
    supplierName: pi.purchase.supplier.name,
    quantity: pi.quantity,
    weightDeduction: pi.weightDeduction,
    rate: pi.rate,
    amount: pi.amount,
    date: pi.purchase.date
  }));
  
  const formattedSales = saleItems.map(si => ({
    id: si.id,
    saleId: si.saleId,
    customerName: si.sale.customer.name,
    quantity: si.quantity,
    rate: si.rate,
    amount: si.amount,
    date: si.sale.date
  }));
  
  return {
    props: {
      item: JSON.parse(JSON.stringify(item)),
      transactions: {
        purchases: JSON.parse(JSON.stringify(formattedPurchases)),
        sales: JSON.parse(JSON.stringify(formattedSales))
      }
    }
  };
}