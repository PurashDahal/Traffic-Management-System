import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import { FileText, Search } from 'lucide-react';

const TicketManagementPage = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = tickets.filter(t =>
    t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" /> Digital Tickets Index
          </h1>
          <p className="text-xs text-slate-500">View issued tickets, evidence, fine status, and officer notes</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ticket ID, vehicle, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none w-64"
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
          <DigitalTicketCard ticket={selectedTicket} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              No digital tickets found matching search.
            </div>
          ) : (
            filtered.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sky-700 text-sm">{t.ticketNumber}</span>
                  <span className="font-bold text-emerald-700 text-sm">Rs. {t.fineAmount?.toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">{t.vehicleNumber}</span>
                  <span className="text-[11px] text-slate-500 block">Owner: {t.ownerName}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 font-semibold">
                  {t.categoryName}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>{new Date(t.issuedAt).toLocaleDateString()}</span>
                  <span className="font-bold text-sky-600">View Ticket Details &rarr;</span>
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
