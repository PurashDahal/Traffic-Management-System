import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { History, Search } from 'lucide-react';

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/payments')
      .then(res => setPayments(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = payments.filter(p =>
    p.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.transactionId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span className="truncate">System Payment Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Historical record of all verified and rejected eSewa fine payments</p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket, txn ID, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="p-3.5 sm:p-4">Ticket ID</th>
                <th className="p-3.5 sm:p-4">Vehicle & Owner</th>
                <th className="p-3.5 sm:p-4">Amount</th>
                <th className="p-3.5 sm:p-4">Transaction ID</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4">Verified By</th>
                <th className="p-3.5 sm:p-4">Verified Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-sky-700 whitespace-nowrap">{p.ticketNumber}</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">
                      <div>{p.vehicleNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.ownerName}</span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-bold text-emerald-700 font-mono text-sm whitespace-nowrap">
                      Rs. {p.amount?.toLocaleString()}
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-800 font-bold whitespace-nowrap">{p.transactionId}</td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                      {p.rejectionReason && (
                        <span className="block text-[10px] text-rose-600 mt-0.5 break-words max-w-xs">Reason: {p.rejectionReason}</span>
                      )}
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600 whitespace-nowrap">{p.verifiedByName || '-'}</td>
                    <td className="p-3.5 sm:p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
