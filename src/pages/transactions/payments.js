// // MAKE PAYMENT PAGE
// // pages/transactions/payments.js

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';

// export default function MakePayment() {
//   const router = useRouter();
//   const { supplierId } = router.query;
  
//   const [suppliers, setSuppliers] = useState([]);
//   const [formData, setFormData] = useState({
//     supplierId: supplierId || '',
//     amount: '',
//     notes: '',
//     date: new Date().toISOString().split('T')[0]
//   });
//   const [selectedSupplierBalance, setSelectedSupplierBalance] = useState(0);
  
//   // Fetch suppliers
//   useEffect(() => {
//     async function fetchSuppliers() {
//       try {
//         const response = await fetch('/api/suppliers');
//         const data = await response.json();
//         setSuppliers(data);
        
//         // If supplierId is in query params, set the selected supplier
//         if (supplierId && data.length > 0) {
//           const supplier = data.find(s => s.id === parseInt(supplierId));
//           if (supplier) {
//             setFormData(prev => ({ ...prev, supplierId: supplier.id }));
//             setSelectedSupplierBalance(supplier.balance);
//           }
//         }
//       } catch (error) {
//         console.error('Error fetching suppliers:', error);
//       }
//     }
    
//     fetchSuppliers();
//   }, [supplierId]);
  
//   // Update selected supplier balance when supplier changes
//   const handleSupplierChange = (e) => {
//     const selectedId = e.target.value;
//     setFormData(prev => ({ ...prev, supplierId: selectedId }));
    
//     if (selectedId) {
//       const supplier = suppliers.find(s => s.id === parseInt(selectedId));
//       setSelectedSupplierBalance(supplier ? supplier.balance : 0);
//     } else {
//       setSelectedSupplierBalance(0);
//     }
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await fetch('/api/payments', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
      
//       if (response.ok) {
//         alert('Payment recorded successfully!');
//         router.push(`/suppliers/${formData.supplierId}`);
//       } else {
//         const error = await response.json();
//         throw new Error(error.message || 'Failed to record payment');
//       }
//     } catch (error) {
//       console.error('Error recording payment:', error);
//       alert('Error recording payment: ' + error.message);
//     }
//   };
  
//   return (
//     <div className="payment-form">
//       <h1>Make Payment to Supplier</h1>
      
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="supplierId">Supplier</label>
//           <select
//             id="supplierId"
//             name="supplierId"
//             value={formData.supplierId}
//             onChange={handleSupplierChange}
//             required
//           >
//             <option value="">Select Supplier</option>
//             {suppliers.map(supplier => (
//               <option key={supplier.id} value={supplier.id}>
//                 {supplier.name} (Balance: ₹{supplier.balance.toFixed(2)})
//               </option>
//             ))}
//           </select>
//         </div>
        
//         {formData.supplierId && (
//           <div className="balance-info">
//             <p>Current Balance: <strong>₹{selectedSupplierBalance.toFixed(2)}</strong></p>
//           </div>
//         )}
        
//         <div className="form-group">
//           <label htmlFor="amount">Payment Amount</label>
//           <input
//             type="number"
//             id="amount"
//             name="amount"
//             min="0.01"
//             step="0.01"
//             value={formData.amount}
//             onChange={handleChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="date">Payment Date</label>
//           <input
//             type="date"
//             id="date"
//             name="date"
//             value={formData.date}
//             onChange={handleChange}
//             required
//           />
//         </div>
        
//         <div className="form-group">
//           <label htmlFor="notes">Notes</label>
//           <textarea
//             id="notes"
//             name="notes"
//             value={formData.notes}
//             onChange={handleChange}
//             rows="3"
//           ></textarea>
//         </div>
        
//         <div className="form-actions">
//           <button 
//             type="button" 
//             className="btn btn-secondary" 
//             onClick={() => router.back()}
//           >
//             Cancel
//           </button>
//           <button type="submit" className="btn btn-primary">
//             Record Payment
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


// MAKE PAYMENT PAGE
// pages/transactions/payments.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout/Layout'; // Import Layout component

export default function MakePayment() {
  const router = useRouter();
  const { supplierId } = router.query;
  
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: supplierId || '',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedSupplierBalance, setSelectedSupplierBalance] = useState(0);
  
  // Fetch suppliers
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const response = await fetch('/api/suppliers');
        const data = await response.json();
        setSuppliers(data);
        
        // If supplierId is in query params, set the selected supplier
        if (supplierId && data.length > 0) {
          const supplier = data.find(s => s.id === parseInt(supplierId));
          if (supplier) {
            setFormData(prev => ({ ...prev, supplierId: supplier.id }));
            setSelectedSupplierBalance(supplier.balance);
          }
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    }
    
    fetchSuppliers();
  }, [supplierId]);
  
  // Update selected supplier balance when supplier changes
  const handleSupplierChange = (e) => {
    const selectedId = e.target.value;
    setFormData(prev => ({ ...prev, supplierId: selectedId }));
    
    if (selectedId) {
      const supplier = suppliers.find(s => s.id === parseInt(selectedId));
      setSelectedSupplierBalance(supplier ? supplier.balance : 0);
    } else {
      setSelectedSupplierBalance(0);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Payment recorded successfully!');
        router.push(`/suppliers/${formData.supplierId}`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Error recording payment: ' + error.message);
    }
  };
  
  return (
    <Layout> {/* Wrapped content with Layout component */}
      <div className="payment-form">
        <h1>Make Payment to Supplier</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="supplierId">Supplier</label>
            <select
              id="supplierId"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleSupplierChange}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} (Balance: ₹{supplier.balance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          
          {formData.supplierId && (
            <div className="balance-info">
              <p>Current Balance: <strong>₹{selectedSupplierBalance.toFixed(2)}</strong></p>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="amount">Payment Amount</label>
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
            <label htmlFor="date">Payment Date</label>
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
            <button type="submit" className="btn btn-primary">
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}