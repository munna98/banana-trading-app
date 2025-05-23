// CUSTOMER ADD PAGE
// pages/customers/add.js

import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import CustomerForm from '../../components/Forms/CustomerForm';
import Link from 'next/link';

export default function AddCustomer() {
  const router = useRouter();
  
  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Add New Customer</h1>
          <div className="header-actions">
            <Link href="/customers">
              <a className="btn btn-secondary">Back to Customers</a>
            </Link>
          </div>
        </div>
        
        <div className="form-container">
          <CustomerForm />
        </div>
      </div>
    </Layout>
  );
}