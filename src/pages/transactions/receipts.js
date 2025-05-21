// pages/transactions/receipts.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MakeReceipt() {
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

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data);

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

  const handleCustomerChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, customerId: selectedId }));

    const customer = customers.find(c => c.id === parseInt(selectedId));
    setSelectedCustomerBalance(customer ? customer.balance : 0);
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
        alert('Receipt recorded successfully!');
        router.push(`/customers/${formData.customerId}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record receipt');
      }
    } catch (error) {
      console.error('Error recording receipt:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="receipt-form">
      <h1>Receive Payment from Customer</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerId">Customer</label>
          <select
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleCustomerChange}
            required
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
            <p>Current Balance: <strong>₹{selectedCustomerBalance.toFixed(2)}</strong></p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="amount">Receipt Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Receipt Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
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
          />
        </div>

        <button type="submit" className="btn btn-success">Record Receipt</button>
      </form>
    </div>
  );
}
