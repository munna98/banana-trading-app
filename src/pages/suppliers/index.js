// SUPPLIER LIST PAGE
// pages/suppliers/index.js

import { useState } from 'react';
import { prisma } from '../../lib/db';
import Link from 'next/link';

export default function SuppliersList({ suppliers }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="suppliers-list">
      <div className="page-header">
        <h1>Suppliers</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/suppliers/add">
            <a className="btn btn-primary">Add New Supplier</a>
          </Link>
        </div>
      </div>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.id}</td>
                <td>{supplier.name}</td>
                <td>{supplier.phone || '-'}</td>
                <td>{supplier.address || '-'}</td>
                <td className={supplier.balance > 0 ? 'text-danger' : 'text-success'}>
                  ₹{supplier.balance.toFixed(2)}
                </td>
                <td>
                  <div className="action-buttons">
                    <Link href={`/suppliers/${supplier.id}`}>
                      <a className="btn btn-info btn-sm">View</a>
                    </Link>
                    <Link href={`/suppliers/${supplier.id}/edit`}>
                      <a className="btn btn-warning btn-sm">Edit</a>
                    </Link>
                    <Link href={`/transactions/payments?supplierId=${supplier.id}`}>
                      <a className="btn btn-success btn-sm">Pay</a>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  
  return {
    props: {
      suppliers: JSON.parse(JSON.stringify(suppliers))
    }
  };
}