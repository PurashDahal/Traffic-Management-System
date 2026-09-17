import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Shield, Users, CreditCard, Clock, FileText, CheckCircle2, AlertCircle, QrCode, Sparkles } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ai/analytics-summary')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            System Administration Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Central Traffic Violation Record & Payment Verification Portal</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/pending-payments"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" /> Verify Pending Payments
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> eSewa QR Settings
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Violations</span>
            <FileText className="w-5 h-5 text-sky-600" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{analytics?.totalViolations || 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Recorded Tickets</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase">Pending Verification</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-3xl font-extrabold text-amber-900">{analytics?.pendingPayments || 0}</span>
          <span className="text-[10px] text-amber-700 block mt-1">Awaiting Admin Verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase">Paid Tickets</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-3xl font-extrabold text-emerald-900">{analytics?.paidTickets || 0}</span>
          <span className="text-[10px] text-emerald-700 block mt-1">Total Revenue: Rs. {analytics?.totalPaidAmount?.toLocaleString() || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase">Unpaid Fines</span>
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <span className="text-3xl font-extrabold text-rose-900">{analytics?.unpaidTickets || 0}</span>
          <span className="text-[10px] text-rose-700 block mt-1">Outstanding: Rs. {analytics?.totalUnpaidAmount?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* AI Real-Data Analytics Summary Box */}
      {analytics?.aiSummaryText && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
            <Sparkles className="w-5 h-5" />
            <span>AI Real-Data Analytics Summary (PostgreSQL Synchronized)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {analytics.aiSummaryText}
          </p>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/admin/pending-payments" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm transition-all group">
          <CreditCard className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">Review Pending Payments</h3>
          <p className="text-xs text-slate-500 mt-1">Inspect uploaded eSewa payment proof screenshots and transaction IDs.</p>
        </Link>

        <Link to="/admin/officers" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-sm transition-all group">
          <Users className="w-8 h-8 text-sky-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">Manage Traffic Officers</h3>
          <p className="text-xs text-slate-500 mt-1">Create accounts and manage active status of traffic officers.</p>
        </Link>

        <Link to="/admin/settings" className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-sm transition-all group">
          <QrCode className="w-8 h-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">App Logo & eSewa QR</h3>
          <p className="text-xs text-slate-500 mt-1">Upload Web App Logo or update the official eSewa QR payment image.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
