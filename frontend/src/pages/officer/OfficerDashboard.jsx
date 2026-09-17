import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Shield, Search, PlusCircle, FileText, Car, Sparkles, CheckCircle2 } from 'lucide-react';

const OfficerDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalIssued = tickets.length;
  const unpaidCount = tickets.filter(t => t.paymentStatus === 'UNPAID').length;
  const paidCount = tickets.filter(t => t.paymentStatus === 'PAID').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Shield className="w-7 h-7 text-sky-400" /> Traffic Officer Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Digital Violation Recording & AI Assist Enforcement</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/officer/create-violation"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Issue Digital Ticket
          </Link>
          <Link
            to="/officer/search-vehicle"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Search className="w-4 h-4" /> Search Vehicle
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Tickets Issued</span>
          <span className="text-3xl font-extrabold text-slate-900 block mt-1">{totalIssued}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
          <span className="text-xs font-bold text-rose-800 uppercase">Unpaid Fines</span>
          <span className="text-3xl font-extrabold text-rose-900 block mt-1">{unpaidCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <span className="text-xs font-bold text-emerald-800 uppercase">Verified Paid</span>
          <span className="text-3xl font-extrabold text-emerald-900 block mt-1">{paidCount}</span>
        </div>
      </div>

      {/* AI Assistant Banner */}
      <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-sky-800/50 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
            <Sparkles className="w-5 h-5" />
            <span>AI Enforcement Assist Ready</span>
          </div>
          <p className="text-xs text-slate-300">
            Automated violation classification, evidence photo analysis, and description generator active when creating new tickets.
          </p>
        </div>
        <Link
          to="/officer/create-violation"
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow shrink-0"
        >
          Issue Ticket with AI
        </Link>
      </div>
    </div>
  );
};

export default OfficerDashboard;
