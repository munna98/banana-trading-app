// ITEM FORM COMPONENT
// components/Forms/ItemForm.jsx

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ItemForm({ initialData = null }) {
  const router = useRouter();
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    unit: initialData?.unit || 'Kg',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing ? `/api/items/${initialData.id}` : '/api/items';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.push('/items');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + error.message);
    }
  };
  
  return (
    <div className="item-form">
      <h1>{isEditing ? 'Edit Item' : 'Add New Item'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter banana variety name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter optional details about this banana variety"
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="unit">Unit</label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
          >
            <option value="Kg">Kilogram (Kg)</option>
            <option value="Bunch">Bunch</option>
            <option value="Dozen">Dozen</option>
            <option value="Box">Box</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.push('/items')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
}