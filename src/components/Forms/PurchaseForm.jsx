// PURCHASE FORM COMPONENT
// components/Forms/PurchaseForm.jsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PurchaseForm() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    date: new Date().toISOString().split('T')[0],
    paidAmount: 0,
    items: [{ itemId: '', quantity: 1, weightDeduction: 1.5, rate: 0, amount: 0 }]
  });
  
  // Fetch suppliers and items
  useEffect(() => {
    async function fetchData() {
      try {
        const [suppliersRes, itemsRes] = await Promise.all([
          fetch('/api/suppliers').then(res => res.json()),
          fetch('/api/items').then(res => res.json())
        ]);
        
        setSuppliers(suppliersRes);
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
    
    // Recalculate amount based on quantity, weight deduction and rate
    if (name === 'quantity' || name === 'rate' || name === 'weightDeduction') {
      const quantity = newItems[index].quantity;
      const weightDeduction = newItems[index].weightDeduction;
      const rate = newItems[index].rate;
      const adjustedQuantity = Math.max(0, quantity - weightDeduction);
      newItems[index].amount = adjustedQuantity * rate;
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  // Add new item row
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1, weightDeduction: 1.5, rate: 0, amount: 0 }]
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
    const balanceAmount = totalAmount - parseFloat(formData.paidAmount || 0);
    
    const purchaseData = {
      ...formData,
      totalAmount,
      balance: balanceAmount
    };
    
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Show success message
        alert('Purchase added successfully!');
        
        // Navigate to purchase details page for printing
        router.push(`/purchases/${data.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add purchase');
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
      alert('Error adding purchase: ' + error.message);
    }
  };
  
  return (
    <div className="purchase-form">
      <h1>New Purchase</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <div className="form-group">
            <label htmlFor="supplierId">Supplier</label>
            <select
              id="supplierId"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
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
                <th>Quantity (Bunches)</th>
                <th>Weight Deduction (kg)</th>
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
                      name="weightDeduction"
                      min="0"
                      step="0.1"
                      value={item.weightDeduction}
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
              <label htmlFor="paidAmount">Paid Amount:</label>
              <input
                type="number"
                id="paidAmount"
                name="paidAmount"
                min="0"
                step="0.01"
                value={formData.paidAmount}
                onChange={handleChange}
              />
            </div>
            
            <div className="total-row">
              <span>Balance:</span>
              <span>₹{(totalAmount - parseFloat(formData.paidAmount || 0)).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Purchase
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
