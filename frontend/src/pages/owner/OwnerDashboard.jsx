import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import PaymentProofModal from '../../components/PaymentProofModal';
import { useAuth } from '../../context/AuthContext';
import { Car, FileText, AlertCircle, Clock, CheckCircle2, QrCode } from 'lucide-react';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketForPay, setSelectedTicketForPay] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/vehicles/my'),
      api.get('/tickets/my')
    ]).then(([vRes, tRes]) => {
      setVehicles(vRes.data);
      setTickets(tRes.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unpaidTickets = tickets.filter(t => t.paymentStatus === 'UNPAID' || t.paymentStatus === 'REJECTED');
  const pendingTickets = tickets.filter(t => t.paymentStatus === 'PENDING_VERIFICATION');
  const paidTickets = tickets.filter(t => t.paymentStatus === 'PAID');

  const totalUnpaidFine = unpaidTickets.reduce((sum, t) => sum + (t.fineAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Car className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0" />
            <span className="truncate">Welcome, {user?.fullName}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Vehicle Owner Portal | Track Traffic Tickets & eSewa Payments</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">My Vehicles</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block mt-1">{vehicles.length}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
          <span className="text-xs font-bold text-rose-800 uppercase">Unpaid Tickets</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 block mt-1">{unpaidTickets.length}</span>
          <span className="text-[10px] text-rose-700 block mt-1 font-semibold">Total: Rs. {totalUnpaidFine.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/40">
          <span className="text-xs font-bold text-amber-800 uppercase">Pending Verification</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 block mt-1">{pendingTickets.length}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <span className="text-xs font-bold text-emerald-800 uppercase">Paid & Cleared</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 block mt-1">{paidTickets.length}</span>
        </div>
      </div>

      {/* Actionable Unpaid Tickets Section */}
      {unpaidTickets.length > 0 && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-rose-900">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="break-words">You have {unpaidTickets.length} unpaid fine(s). Pay via eSewa QR or Cash handover to traffic police.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unpaidTickets.map(ticket => (
              <DigitalTicketCard
                key={ticket.id}
                ticket={ticket}
                onPayClick={(t) => setSelectedTicketForPay(t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Tickets Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0" /> All Violation Tickets ({tickets.length})
        </h3>

        {tickets.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-400 text-xs text-center">
            No violation tickets recorded for your vehicles!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(t => (
              <DigitalTicketCard
                key={t.id}
                ticket={t}
                onPayClick={(tk) => setSelectedTicketForPay(tk)}
              />
            ))}
          </div>
        )}
      </div>

      <PaymentProofModal
        ticket={selectedTicketForPay}
        isOpen={!!selectedTicketForPay}
        onClose={() => setSelectedTicketForPay(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default OwnerDashboard;
