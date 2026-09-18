import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, Trash2 } from 'lucide-react';

const TicketManagementPage = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const { isAdmin } = useAuth();

  const fetchTickets = () => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleDeleteTicket = async (ticket) => {
    if (!window.confirm(`Are you sure you want to DELETE ticket ${ticket.ticketNumber}?\n\nThis will permanently remove the ticket, violation details, and associated records from all accounts (Traffic Police, Vehicle Owner, and Admin).`)) {
      return;
    }

    setDeletingId(ticket.id);
    setActionMsg('');
    setActionError('');

    try {
      await api.delete(`/tickets/${ticket.id}`);
      setSelectedTicket(null);
      setActionMsg(`Ticket ${ticket.ticketNumber} has been successfully deleted from the system.`);
      fetchTickets();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete ticket.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCollectCash = async (ticket) => {
    if (!window.confirm(`Confirm direct cash collection of Rs. ${ticket.fineAmount?.toLocaleString()} for ticket ${ticket.ticketNumber}?\n\nThis will mark the ticket as PAID and record cash collected on-spot.`)) {
      return;
    }

    setActionMsg('');
    setActionError('');

    try {
      await api.post(`/payments/cash-collect/${ticket.id}`);
      setActionMsg(`Cash payment of Rs. ${ticket.fineAmount?.toLocaleString()} for ticket ${ticket.ticketNumber} collected and confirmed.`);
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to collect cash payment.');
    }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.categoryName?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'ALL' || t.paymentStatus === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span className="truncate">{isAdmin ? 'Traffic Violation Tickets Management' : 'Digital Tickets Index'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin 
              ? 'View all issued tickets, inspect violation details, or delete accidental ticket records'
              : 'View issued tickets, evidence, fine status, and officer notes'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticket, vehicle, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center justify-between border border-emerald-200">
          <span className="font-semibold">{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold ml-2">&times;</button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl text-xs flex items-center justify-between border border-rose-200">
          <span className="font-semibold">{actionError}</span>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="overflow-x-auto pb-1 max-w-full">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold whitespace-nowrap w-max">
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

      {selectedTicket ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTicket(null)}
            className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
          >
            &larr; Back to Ticket List
          </button>
          <DigitalTicketCard
            ticket={selectedTicket}
            onDeleteClick={isAdmin ? handleDeleteTicket : null}
            onCollectCashClick={handleCollectCash}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No digital tickets found matching search.
            </div>
          ) : (
            filtered.map(t => (
              <div
                key={t.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-sm transition-all space-y-3 relative group"
              >
                <div
                  onClick={() => setSelectedTicket(t)}
                  className="cursor-pointer space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono font-bold text-sky-700 text-xs sm:text-sm break-all">{t.ticketNumber}</span>
                    <span className="font-bold text-emerald-700 text-xs sm:text-sm whitespace-nowrap">Rs. {t.fineAmount?.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block truncate">{t.vehicleNumber}</span>
                    <span className="text-[11px] text-slate-500 block truncate">Owner: {t.ownerName}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs text-slate-700 font-semibold gap-2">
                    <span className="truncate">{t.categoryName}</span>
                    <div className="shrink-0"><StatusBadge status={t.paymentStatus} /></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono gap-2">
                  <span>{new Date(t.issuedAt).toLocaleDateString()}</span>
                  <div className="flex gap-2 items-center shrink-0">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTicket(t);
                        }}
                        disabled={deletingId === t.id}
                        className="text-rose-600 hover:text-rose-800 font-sans font-bold flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                        title="Delete accidental ticket"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="font-bold text-sky-600 hover:underline font-sans"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TicketManagementPage;
