// ADD ITEM PAGE
// pages/items/add.js

import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout/Layout';
import ItemForm from '../../components/Forms/ItemForm';

export default function AddItem() {
  const router = useRouter();
  
  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Add New Item</h1>
          <div className="header-actions">
            <Link href="/items">
              <a className="btn btn-secondary">Back to Items</a>
            </Link>
          </div>
        </div>
        
        <div className="form-container">
          <ItemForm 
            initialData={{
              name: '',
              description: '',
              unit: 'Kg'
            }}
            onSuccess={() => {
              alert('Item added successfully!');
              router.push('/items');
            }}
          />
        </div>
        
        <div className="help-section">
          <h3>Help</h3>
          <div className="help-card">
            <h4>About Item Units</h4>
            <p>
              For banana inventory, typically use <strong>Kg</strong> as the unit for weight-based tracking.
              For bunch-based tracking, you can use <strong>Dozen</strong> or <strong>Bunch</strong>.
            </p>
            <h4>Item Types</h4>
            <p>
              You may want to create separate items for different banana varieties such as:
            </p>
            <ul>
              <li>Cavendish</li>
              <li>Robusta</li>
              <li>Red Banana</li>
              <li>Nendran</li>
              <li>Poovan</li>
            </ul>
            <p>This helps track inventory and sales by variety.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}