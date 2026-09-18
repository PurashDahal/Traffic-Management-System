import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, Trash2 } from 'lucide-react';

const TicketManagementPage = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
    if (!window.confirm(`Are you sure you want to DELETE ticket ${ticket.ticketNumber}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(ticket.id);
    try {
      await api.delete(`/tickets/${ticket.id}`);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete ticket');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = tickets.filter(t =>
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span className="truncate">Digital Tickets Index</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">View issued tickets, evidence, fine status, and officer notes</p>
        </div>

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
