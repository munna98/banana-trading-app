// CUSTOMER LIST PAGE
// pages/customers/index.js

import { useState } from 'react';
import { prisma } from '../../lib/db';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';

export default function CustomersList({ customers }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Layout>
      <div className="customers-list">
        <div className="page-header">
          <h1>Customers</h1>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/customers/add">
              <a className="btn btn-primary">Add New Customer</a>
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.address || '-'}</td>
                  <td className={customer.balance > 0 ? 'text-danger' : 'text-success'}>
                    ₹{customer.balance.toFixed(2)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link href={`/customers/${customer.id}`}>
                        <a className="btn btn-info btn-sm">View</a>
                      </Link>
                      <Link href={`/customers/${customer.id}/edit`}>
                        <a className="btn btn-warning btn-sm">Edit</a>
                      </Link>
                      <Link href={`/transactions/receipts?customerId=${customer.id}`}>
                        <a className="btn btn-success btn-sm">Receive</a>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  
  return {
    props: {
      customers: JSON.parse(JSON.stringify(customers))
    }
  };
}