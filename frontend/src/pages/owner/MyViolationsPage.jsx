import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import PaymentProofModal from '../../components/PaymentProofModal';
import { FileText, Filter } from 'lucide-react';

const MyViolationsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selectedTicketForPay, setSelectedTicketForPay] = useState(null);

  const fetchTickets = () => {
    api.get('/tickets/my')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filtered = tickets.filter(t => {
    if (filter === 'ALL') return true;
    return t.paymentStatus === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" /> My Violation Tickets
          </h1>
          <p className="text-xs text-slate-500">View digital violation tickets issued against your registered vehicles</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
          {['ALL', 'UNPAID', 'PENDING_VERIFICATION', 'PAID', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white p-8 rounded-2xl border border-slate-200 text-slate-400 text-xs text-center">
            No violation tickets found under category ({filter}).
          </div>
        ) : (
          filtered.map(t => (
            <DigitalTicketCard
              key={t.id}
              ticket={t}
              onPayClick={(tk) => setSelectedTicketForPay(tk)}
            />
          ))
        )}
      </div>

      <PaymentProofModal
        ticket={selectedTicketForPay}
        isOpen={!!selectedTicketForPay}
        onClose={() => setSelectedTicketForPay(null)}
        onSuccess={fetchTickets}
      />
    </div>
  );
};

export default MyViolationsPage;
