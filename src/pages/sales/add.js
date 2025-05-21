// pages/sales/add.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AddSale() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const [newItem, setNewItem] = useState({
    itemId: '',
    quantity: '',
    rate: ''
  });

  useEffect(() => {
    async function fetchData() {
      const res1 = await fetch('/api/customers');
      const res2 = await fetch('/api/items');
      const customersData = await res1.json();
      const itemsData = await res2.json();
      setCustomers(customersData);
      setItems(itemsData);
    }
    fetchData();
  }, []);

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const addItemToList = () => {
    const itemInfo = items.find(i => i.id === parseInt(newItem.itemId));
    if (itemInfo && newItem.quantity && newItem.rate) {
      const quantity = parseFloat(newItem.quantity);
      const rate = parseFloat(newItem.rate);
      const amount = quantity * rate;
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem, quantity, rate, amount, name: itemInfo.name }]
      }));
      setNewItem({ itemId: '', quantity: '', rate: '' });
    }
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      customerId: parseInt(formData.customerId),
      date: formData.date,
      items: formData.items.map(item => ({
        itemId: parseInt(item.itemId),
        quantity: item.quantity,
        rate: item.rate
      }))
    };

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/sales/${data.id}`);
    } else {
      const error = await res.json();
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="add-sale">
      <h1>New Sale</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Customer:</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
            required
          >
            <option value="">Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <hr />

        <h3>Add Item</h3>
        <div>
          <select name="itemId" value={newItem.itemId} onChange={handleItemChange} required>
            <option value="">Select Item</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={handleItemChange}
            min="0.01"
            step="0.01"
            required
          />
          <input
            type="number"
            name="rate"
            placeholder="Rate"
            value={newItem.rate}
            onChange={handleItemChange}
            min="0.01"
            step="0.01"
            required
          />
          <button type="button" onClick={addItemToList}>Add</button>
        </div>

        <ul>
          {formData.items.map((item, i) => (
            <li key={i}>
              {item.name} – Qty: {item.quantity}, Rate: ₹{item.rate}, Amount: ₹{item.amount.toFixed(2)} 
              <button onClick={() => removeItem(i)}>Remove</button>
            </li>
          ))}
        </ul>

        <hr />
        <button type="submit">Save Sale</button>
      </form>
    </div>
  );
}
