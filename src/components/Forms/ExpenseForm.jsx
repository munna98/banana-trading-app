// EXPENSE FORM COMPONENT
// components/Forms/ExpenseForm.jsx

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ExpenseForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Common expense categories for a banana trading business
  const expenseCategories = [
    'Transportation',
    'Storage',
    'Packaging',
    'Labor',
    'Rent',
    'Utilities',
    'Equipment',
    'Maintenance',
    'Office Supplies',
    'Marketing',
    'Legal/Accounting',
    'Insurance',
    'Taxes',
    'Vehicle',
    'Other'
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        // Show success message
        alert('Expense added successfully!');
        
        // Navigate back to expenses list
        router.push('/expenses');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense: ' + error.message);
    }
  };
  
  return (
    <div className="expense-form">
      <h1>Add New Expense</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {expenseCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
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
            rows="3"
            placeholder="Enter details about this expense"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => router.push('/expenses')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}