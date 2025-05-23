// RECEIVE PAYMENT PAGE
// pages/transactions/receipts.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout';

export default function ReceivePayment() {
  const router = useRouter();
  const { customerId } = router.query;
  
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customerId: customerId || '',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedCustomerBalance, setSelectedCustomerBalance] = useState(0);
  
  // Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);
        
        // If customerId is in query params, set the selected customer
        if (customerId && data.length > 0) {
          const customer = data.find(c => c.id === parseInt(customerId));
          if (customer) {
            setFormData(prev => ({ ...prev, customerId: customer.id }));
            setSelectedCustomerBalance(customer.balance);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    }
    
    fetchCustomers();
  }, [customerId]);
  
  // Update selected customer balance when customer changes
  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, customerId: selectedId }));
    
    if (selectedId) {
      const customer = customers.find(c => c.id === parseInt(selectedId));
      setSelectedCustomerBalance(customer ? customer.balance : 0);
    } else {
      setSelectedCustomerBalance(0);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Payment received successfully!');
        router.push(`/customers/${formData.customerId}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment receipt');
      }
    } catch (error) {
      console.error('Error recording payment receipt:', error);
      alert('Error recording payment receipt: ' + error.message);
    }
  };
  
  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Receive Payment from Customer</h1>
          <div className="header-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>
        </div>
        
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customerId">Customer</label>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleCustomerChange}
                required
                className="form-control"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} (Balance: ₹{customer.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            
            {formData.customerId && (
              <div className="balance-info">
                <p className={selectedCustomerBalance > 0 ? 'text-danger' : 'text-success'}>
                  Current Balance: <strong>₹{selectedCustomerBalance.toFixed(2)}</strong>
                  {selectedCustomerBalance === 0 && ' (No outstanding balance)'}
                </p>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="amount">Payment Amount</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">₹</span>
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              {selectedCustomerBalance > 0 && formData.amount && (
                <small className="form-text text-muted">
                  New balance will be: ₹{(selectedCustomerBalance - parseFloat(formData.amount || 0)).toFixed(2)}
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Payment Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="form-control"
                placeholder="Optional payment details"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={!formData.customerId || !formData.amount}
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
        
        {formData.customerId && customers.length > 0 && (
          <div className="quick-actions mt-4">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link href={`/customers/${formData.customerId}`}>
                <a className="btn btn-info">View Customer Details</a>
              </Link>
              <Link href={`/sales/add?customerId=${formData.customerId}`}>
                <a className="btn btn-primary">Create New Sale</a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}