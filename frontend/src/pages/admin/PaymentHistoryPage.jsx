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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-sky-600" /> System Payment Log
          </h1>
          <p className="text-xs text-slate-500">Historical record of all verified and rejected eSewa fine payments</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket, txn ID, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Vehicle & Owner</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Status</th>
              <th className="p-4">Verified By</th>
              <th className="p-4">Verified Time</th>
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
                  <td className="p-4 font-mono font-bold text-sky-700">{p.ticketNumber}</td>
                  <td className="p-4 font-semibold text-slate-900">
                    <div>{p.vehicleNumber}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{p.ownerName}</span>
                  </td>
                  <td className="p-4 font-bold text-emerald-700 font-mono text-sm">
                    Rs. {p.amount?.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-slate-800 font-bold">{p.transactionId}</td>
                  <td className="p-4">
                    <StatusBadge status={p.status} />
                    {p.rejectionReason && (
                      <span className="block text-[10px] text-rose-600 mt-0.5">Reason: {p.rejectionReason}</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{p.verifiedByName || '-'}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">
                    {p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
