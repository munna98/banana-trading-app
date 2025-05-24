// SALES ADD PAGE
// pages/sales/add.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { prisma } from '../../lib/db';

export default function AddSale({ customers, items }) {
  const router = useRouter();
  
  // Form state
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substr(0, 10));
  const [saleItems, setSaleItems] = useState([{
    itemId: '',
    quantity: '',
    rate: '',
    amount: 0
  }]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [notes, setNotes] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  
  // Effect to calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [saleItems, receivedAmount]);
  
  // Calculate totals based on items
  const calculateTotals = () => {
    const total = saleItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
    
    setTotalAmount(total);
    setBalance(total - (parseFloat(receivedAmount) || 0));
  };
  
  // Update item in the saleItems array
  const updateItem = (index, field, value) => {
    const updatedItems = [...saleItems];
    updatedItems[index][field] = value;
    
    // Recalculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].amount = (quantity * rate).toFixed(2);
    }
    
    setSaleItems(updatedItems);
  };
  
  // Add a new item row
  const addItemRow = () => {
    setSaleItems([
      ...saleItems,
      { itemId: '', quantity: '', rate: '', amount: 0 }
    ]);
  };
  
  // Remove an item row
  const removeItemRow = (index) => {
    if (saleItems.length > 1) {
      const updatedItems = saleItems.filter((_, i) => i !== index);
      setSaleItems(updatedItems);
    }
  };
  
  // Handle quick add customer
  const handleAddCustomer = async () => {
    try {
      // Validate
      if (!newCustomer.name.trim()) {
        alert('Customer name is required');
        return;
      }
      
      // In a real app, you'd make an API call here
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add customer');
      }
      
      const customer = await response.json();
      
      // Add to customers list and select it
      customers.push(customer);
      setCustomerId(customer.id.toString());
      
      // Close modal and reset form
      setShowAddCustomer(false);
      setNewCustomer({ name: '', phone: '', address: '' });
      
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Error adding customer: ' + error.message);
    }
  };
  
  // Handle sale submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!customerId) {
      alert('Please select a customer');
      return;
    }
    
    if (saleItems.some(item => !item.itemId || !item.quantity || !item.rate)) {
      alert('Please complete all item details');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const saleData = {
        customerId: parseInt(customerId),
        date,
        totalAmount: parseFloat(totalAmount),
        receivedAmount: parseFloat(receivedAmount) || 0,
        balance: parseFloat(balance),
        notes,
        items: saleItems.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount)
        }))
      };
      
      // Make API request to create sale
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sale');
      }
      
      const createdSale = await response.json();
      
      // Redirect to sale detail page
      router.push(`/sales/${createdSale.id}`);
      
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error creating sale: ' + error.message);
      setIsSubmitting(false);
    }
  };
  
  return (
      <div className="add-sale-page">
        <div className="page-header">
          <h1>Add New Sale</h1>
          <Button 
            className="btn-secondary"
            onClick={() => router.push('/sales')}
          >
            Back to Sales
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <div className="sale-header">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="customer">Customer</label>
                  <div className="customer-select-container">
                    <select
                      id="customer"
                      className="form-control"
                      value={customerId}
                      onChange={e => setCustomerId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <Button 
                      type="button"
                      className="btn-sm btn-outline"
                      onClick={() => setShowAddCustomer(true)}
                    >
                      + Add New
                    </Button>
                  </div>
                </div>
                
                <div className="form-group col-md-6">
                  <label htmlFor="date">Sale Date</label>
                  <input
                    type="date"
                    id="date"
                    className="form-control"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="sale-items">
              <h3>Sale Items</h3>
              
              <div className="items-header">
                <div className="item-col item-name">Item</div>
                <div className="item-col item-quantity">Quantity</div>
                <div className="item-col item-rate">Rate</div>
                <div className="item-col item-amount">Amount</div>
                <div className="item-col item-actions">Actions</div>
              </div>
              
              {saleItems.map((item, index) => (
                <div className="item-row" key={index}>
                  <div className="item-col item-name">
                    <select
                      value={item.itemId}
                      onChange={e => updateItem(index, 'itemId', e.target.value)}
                      required
                    >
                      <option value="">-- Select Item --</option>
                      {items.map(itemOption => (
                        <option key={itemOption.id} value={itemOption.id}>
                          {itemOption.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="item-col item-quantity">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="item-col item-rate">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={e => updateItem(index, 'rate', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="item-col item-amount">
                    <input
                      type="number"
                      value={item.amount}
                      readOnly
                    />
                  </div>
                  
                  <div className="item-col item-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItemRow(index)}
                      disabled={saleItems.length === 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="add-item-row">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={addItemRow}
                >
                  + Add Another Item
                </button>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="sale-summary">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="form-control"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Additional notes about this sale"
                  ></textarea>
                </div>
                
                <div className="form-group col-md-6">
                  <div className="sale-totals">
                    <div className="total-row">
                      <label>Total Amount:</label>
                      <div className="amount">₹ {totalAmount.toFixed(2)}</div>
                    </div>
                    
                    <div className="total-row">
                      <label htmlFor="received-amount">Received Amount:</label>
                      <input
                        type="number"
                        id="received-amount"
                        min="0"
                        step="0.01"
                        className="form-control"
                        value={receivedAmount}
                        onChange={e => setReceivedAmount(e.target.value)}
                      />
                    </div>
                    
                    <div className="total-row">
                      <label>Balance:</label>
                      <div className="amount balance">₹ {balance.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="form-actions">
            <Button
              type="submit"
              className="btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Sale'}
            </Button>
            <Button
              type="button"
              className="btn-secondary"
              onClick={() => router.push('/sales')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
        
        {/* Add Customer Modal */}
        <Modal
          show={showAddCustomer}
          title="Add New Customer"
          onClose={() => setShowAddCustomer(false)}
        >
          <div className="form-group">
            <label htmlFor="customer-name">Name</label>
            <input
              type="text"
              id="customer-name"
              className="form-control"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customer-phone">Phone</label>
            <input
              type="tel"
              id="customer-phone"
              className="form-control"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customer-address">Address</label>
            <textarea
              id="customer-address"
              className="form-control"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              rows="2"
            ></textarea>
          </div>
          
          <div className="modal-actions">
            <Button
              type="button"
              className="btn-primary"
              onClick={handleAddCustomer}
            >
              Add Customer
            </Button>
            <Button
              type="button"
              className="btn-secondary"
              onClick={() => setShowAddCustomer(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal>
        
        <style jsx>{`
          .sale-header {
            margin-bottom: 1rem;
          }
          
          .customer-select-container {
            display: flex;
            gap: 0.5rem;
          }
          
          .items-header, .item-row {
            display: flex;
            margin-bottom: 0.5rem;
            align-items: center;
          }
          
          .items-header {
            font-weight: bold;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
          }
          
          .item-col {
            padding: 0 0.5rem;
          }
          
          .item-name { width: 35%; }
          .item-quantity { width: 20%; }
          .item-rate { width: 20%; }
          .item-amount { width: 15%; }
          .item-actions { width: 10%; text-align: center; }
          
          .item-row input, .item-row select {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          
          .add-item-row {
            margin-top: 1rem;
          }
          
          .sale-totals {
            padding: 1rem;
            background-color: #f9f9f9;
            border-radius: 4px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            align-items: center;
          }
          
          .total-row:last-child {
            margin-bottom: 0;
            padding-top: 0.5rem;
            border-top: 1px solid #ddd;
            font-weight: bold;
          }
          
          .amount {
            font-weight: bold;
          }
          
          .balance {
            color: #d32f2f;
          }
          
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1.5rem;
          }
        `}</style>
      </div>
  );
}

export async function getServerSideProps() {
  // Fetch customers and items from the database
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });
  
  const items = await prisma.item.findMany({
    orderBy: { name: 'asc' }
  });
  
  // Convert dates to serializable format
  const serializedCustomers = JSON.parse(JSON.stringify(customers));
  const serializedItems = JSON.parse(JSON.stringify(items));
  
  return {
    props: {
      customers: serializedCustomers,
      items: serializedItems
    }
  };
}