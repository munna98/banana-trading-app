// CUSTOMER FORM COMPONENT
// components/Forms/CustomerForm.jsx

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CustomerForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing ? `/api/customers/${initialData.id}` : '/api/customers';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.push('/customers');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save customer');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer: ' + error.message);
    }
  };
  
  return (
    <div className="customer-form">
      <h1>{isEditing ? 'Edit Customer' : 'Add New Customer'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.push('/customers')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}