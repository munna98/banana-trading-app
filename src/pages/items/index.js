// pages/items/index.js

import { useState } from 'react';
import { prisma } from '../../lib/db';
import Link from 'next/link';

export default function ItemsList({ items }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="items-list">
      <div className="page-header">
        <h1>Items</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/items/add">
            <a className="btn btn-primary">Add New Item</a>
          </Link>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Total Purchased</th>
              <th>Total Sold</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.description || '-'}</td>
                <td>{item.unit}</td>
                <td>{item.totalPurchased?.toFixed(2) || '0.00'}</td>
                <td>{item.totalSold?.toFixed(2) || '0.00'}</td>
                <td>
                  <div className="action-buttons">
                    <Link href={`/items/${item.id}`}>
                      <a className="btn btn-info btn-sm">View</a>
                    </Link>
                    <Link href={`/items/${item.id}/edit`}>
                      <a className="btn btn-warning btn-sm">Edit</a>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">No items found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const items = await prisma.item.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      PurchaseItem: true,
      SaleItem: true,
    }
  });

  const itemWithTotals = items.map((item) => {
    const totalPurchased = item.PurchaseItem.reduce((sum, pi) => sum + pi.quantity, 0);
    const totalSold = item.SaleItem.reduce((sum, si) => sum + si.quantity, 0);

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      unit: item.unit,
      totalPurchased,
      totalSold,
    };
  });

  return {
    props: {
      items: itemWithTotals
    }
  };
}
