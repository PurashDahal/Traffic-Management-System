import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Shield, Search, PlusCircle, FileText, Car, Sparkles, CheckCircle2 } from 'lucide-react';

const OfficerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tickets').catch(() => ({ data: [] })),
      api.get('/payments/pending').catch(() => ({ data: [] }))
    ]).then(([ticketsRes, pendingRes]) => {
      setTickets(ticketsRes.data || []);
      setPendingCount((pendingRes.data || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const totalIssued = tickets.length;
  const unpaidCount = tickets.filter(t => t.paymentStatus === 'UNPAID').length;
  const paidCount = tickets.filter(t => t.paymentStatus === 'PAID').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-sky-400 shrink-0" />
            <span className="truncate">Traffic Officer Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Digital Violation Recording & Payment Verification</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <Link
            to="/officer/pending-payments"
            className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Confirm Payments ({pendingCount})
          </Link>
          <Link
            to="/officer/create-violation"
            className="w-full sm:w-auto px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4 shrink-0" /> Issue Ticket
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Issued</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 block mt-1">{totalIssued}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/40">
          <span className="text-xs font-bold text-amber-800 uppercase">Pending Confirmation</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 block mt-1">{pendingCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
          <span className="text-xs font-bold text-rose-800 uppercase">Unpaid Fines</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 block mt-1">{unpaidCount}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <span className="text-xs font-bold text-emerald-800 uppercase">Verified Paid</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 block mt-1">{paidCount}</span>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-sky-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm mb-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>AI Enforcement Assist Ready</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed break-words">
            Automated violation classification, evidence photo analysis, and description generator active when creating new tickets.
          </p>
        </div>
        <Link
          to="/officer/create-violation"
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow shrink-0 text-center"
        >
          Issue Ticket with AI
        </Link>
      </div>
    </div>
  );
};

export default OfficerDashboard;
