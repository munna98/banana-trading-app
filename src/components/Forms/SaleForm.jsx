// SALE FORM COMPONENT
// components/Forms/SaleForm.jsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SaleForm() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    receivedAmount: 0,
    items: [{ itemId: '', quantity: 1, rate: 0, amount: 0 }]
  });
  
  // Fetch customers and items
  useEffect(() => {
    async function fetchData() {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          fetch('/api/customers').then(res => res.json()),
          fetch('/api/items').then(res => res.json())
        ]);
        
        setCustomers(customersRes);
        setItems(itemsRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    fetchData();
  }, []);
  
  // Calculate total amount
  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle item changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    
    // Update the specified field
    newItems[index] = { ...newItems[index], [name]: parseFloat(value) || 0 };
    
    // Recalculate amount based on quantity and rate
    if (name === 'quantity' || name === 'rate') {
      const quantity = newItems[index].quantity;
      const rate = newItems[index].rate;
      newItems[index].amount = quantity * rate;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  // Add new item row
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };
  
  // Remove item row
  const removeItemRow = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Calculate balance
    const balanceAmount = totalAmount - parseFloat(formData.receivedAmount || 0);
    
    const saleData = {
      ...formData,
      totalAmount,
      balance: balanceAmount
    };
    
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Show success message
        alert('Sale added successfully!');
        
        // Navigate to sale details page for printing
        router.push(`/sales/${data.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add sale');
      }
    } catch (error) {
      console.error('Error adding sale:', error);
      alert('Error adding sale: ' + error.message);
    }
  };
  
  return (
    <div className="sale-form">
      <h1>New Sale</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-group">
            <label htmlFor="customerId">Customer</label>
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
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
        </div>
        
        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <select
                      name="itemId"
                      value={item.itemId}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="rate"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="amount"
                      value={item.amount.toFixed(2)}
                      readOnly
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeItemRow(index)}
                      disabled={formData.items.length === 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button type="button" className="btn btn-secondary" onClick={addItemRow}>
            Add Item
          </button>
        </div>
        
        <div className="form-footer">
          <div className="totals">
            <div className="total-row">
              <span>Total Amount:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="total-row">
              <label htmlFor="receivedAmount">Received Amount:</label>
              <input
                type="number"
                id="receivedAmount"
                name="receivedAmount"
                min="0"
                step="0.01"
                value={formData.receivedAmount}
                onChange={handleChange}
              />
            </div>
            
            <div className="total-row">
              <span>Balance:</span>
              <span>₹{(totalAmount - parseFloat(formData.receivedAmount || 0)).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Sale
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}