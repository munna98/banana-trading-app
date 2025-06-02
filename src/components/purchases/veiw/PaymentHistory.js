// components/purchase/PaymentHistory.js

export default function PaymentHistory({ payments, formatCurrency, formatDate }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
        <p className="text-slate-600">All payments made for this purchase</p>
      </div>
      {payments && payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900">{formatDate(payment.date)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {payment.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-slate-900">{payment.reference || '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{payment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No payments recorded</h3>
          <p className="mt-1 text-sm text-slate-500">No payments have been made for this purchase yet.</p>
        </div>
      )}
    </div>
  );
}