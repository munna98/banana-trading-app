// SUPPLIER ADD PAGE
// pages/suppliers/add.js

import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';
import SupplierForm from '../../components/Forms/SupplierForm';
import Link from 'next/link';

export default function AddSupplier() {
  const router = useRouter();
  
  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Add New Supplier</h1>
          <div className="header-actions">
            <Link href="/suppliers">
              <a className="btn btn-secondary">Back to Suppliers</a>
            </Link>
          </div>
        </div>
        
        <div className="form-container">
          <SupplierForm />
        </div>
      </div>
    </Layout>
  );
}