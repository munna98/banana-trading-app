// components/purchase/PaymentModal.js
import { useState } from 'react';

export default function PaymentModal({ 
  purchase, 
  onClose, 
  onSubmit, 
  formatCurrency 
}) {
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(paymentData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Record Payment</h3>
          <p className="text-sm text-slate-600">Add a payment for this purchase</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              max={purchase.balance}
              value={paymentData.amount}
              onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.00"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Maximum: {formatCurrency(purchase.balance)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={paymentData.date}
              onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reference</label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Transaction ID, Check number, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}