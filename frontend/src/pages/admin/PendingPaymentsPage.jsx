import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPaymentVerifyModal from '../../components/AdminPaymentVerifyModal';
import StatusBadge from '../../components/StatusBadge';
import { CreditCard, Clock, CheckCircle2, Eye, Banknote, QrCode } from 'lucide-react';

const PendingPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPending = () => {
    setLoading(true);
    api.get('/payments/pending')
      .then(res => setPayments(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
            <span className="truncate">Pending Payment Verification</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Review submitted eSewa transaction IDs & screenshot proofs</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-200 self-start sm:self-auto shrink-0">
          {payments.length} Pending Submission{payments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="p-3.5 sm:p-4">Ticket ID</th>
                <th className="p-3.5 sm:p-4">Vehicle & Owner</th>
                <th className="p-3.5 sm:p-4">Amount</th>
                <th className="p-3.5 sm:p-4">Method</th>
                <th className="p-3.5 sm:p-4">Reference / Txn ID</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 sm:p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="font-semibold text-slate-600">No pending payments to review!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All submitted payments have been processed.</p>
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-sky-700 whitespace-nowrap">{p.ticketNumber}</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">
                      <div>{p.vehicleNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.ownerName}</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 font-mono text-sm whitespace-nowrap">
                      Rs. {p.amount?.toLocaleString()}
                    </td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border ${
                        p.paymentMethod === 'CASH'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}>
                        {p.paymentMethod === 'CASH' ? <><Banknote className="w-3.5 h-3.5" /> Cash</> : <><QrCode className="w-3.5 h-3.5" /> eSewa</>}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      <span className="bg-slate-50 px-2 py-1 rounded inline-block border border-slate-200">
                        {p.transactionId}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className={`px-3.5 py-1.5 font-bold rounded-lg shadow text-xs inline-flex items-center gap-1 ml-auto cursor-pointer ${
                          p.paymentMethod === 'CASH'
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> {p.paymentMethod === 'CASH' ? 'Confirm Cash & Verify' : 'Inspect Proof & Verify'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPaymentVerifyModal
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSuccess={fetchPending}
      />
    </div>
  );
};

export default PendingPaymentsPage;
