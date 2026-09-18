import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import AdminPaymentVerifyModal from '../../components/AdminPaymentVerifyModal';
import StatusBadge from '../../components/StatusBadge';
import { Shield, Users, CreditCard, Clock, FileText, CheckCircle2, AlertCircle, QrCode, Sparkles, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/ai/analytics-summary').catch(() => ({ data: null })),
      api.get('/payments/pending').catch(() => ({ data: [] }))
    ]).then(([analyticsRes, pendingRes]) => {
      setAnalytics(analyticsRes.data);
      setPendingPayments(pendingRes.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 shrink-0" />
            <span className="truncate">System Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Central Traffic Violation Record & Payment Verification Portal</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <Link
            to="/admin/pending-payments"
            className="w-full sm:w-auto px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
          >
            <Clock className="w-4 h-4 shrink-0" /> Verify Pending ({pendingPayments.length})
          </Link>
          <Link
            to="/admin/settings"
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4 shrink-0" /> eSewa QR
          </Link>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Violations</span>
            <FileText className="w-5 h-5 text-sky-600 shrink-0" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{analytics?.totalViolations || 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Recorded Tickets</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase">Pending Verification</span>
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">{pendingPayments.length || analytics?.pendingPayments || 0}</span>
          <span className="text-[10px] text-amber-700 block mt-1">Awaiting Verification</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase">Paid Tickets</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">{analytics?.paidTickets || 0}</span>
          <span className="text-[10px] text-emerald-700 block mt-1">Total: Rs. {analytics?.totalPaidAmount?.toLocaleString() || 0}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase">Unpaid Fines</span>
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-900">{analytics?.unpaidTickets || 0}</span>
          <span className="text-[10px] text-rose-700 block mt-1">Outstanding: Rs. {analytics?.totalUnpaidAmount?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Immediate Pending Payments Action Table */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="bg-amber-50 px-4 sm:px-6 py-3.5 border-b border-amber-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
              <h2 className="text-xs sm:text-sm font-bold text-amber-950 truncate">Pending Payments Requiring Verification ({pendingPayments.length})</h2>
            </div>
            <Link to="/admin/pending-payments" className="text-xs text-amber-800 hover:underline font-bold shrink-0">
              View All Pending &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Vehicle & Owner</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingPayments.slice(0, 5).map(p => (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="p-3 font-mono font-bold text-sky-700 whitespace-nowrap">{p.ticketNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{p.vehicleNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.ownerName}</span>
                    </td>
                    <td className="p-3 font-bold text-emerald-700 font-mono whitespace-nowrap">
                      Rs. {p.amount?.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block my-1 whitespace-nowrap">
                      {p.transactionId}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow text-xs inline-flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Real-Data Analytics Summary Box */}
      {analytics?.aiSummaryText && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-6 rounded-2xl shadow-lg border border-indigo-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm mb-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>AI Real-Data Analytics Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans break-words">
            {analytics.aiSummaryText}
          </p>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/pending-payments" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm transition-all group">
          <CreditCard className="w-7 h-7 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">Review Pending Payments</h3>
          <p className="text-xs text-slate-500 mt-1 break-words">Inspect uploaded eSewa payment proof screenshots and transaction IDs.</p>
        </Link>

        <Link to="/admin/officers" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-sm transition-all group">
          <Users className="w-7 h-7 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">Manage Traffic Officers</h3>
          <p className="text-xs text-slate-500 mt-1 break-words">Create accounts and manage active status of traffic officers.</p>
        </Link>

        <Link to="/admin/settings" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 shadow-sm transition-all group">
          <QrCode className="w-7 h-7 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-sm text-slate-900">App Logo & eSewa QR</h3>
          <p className="text-xs text-slate-500 mt-1 break-words">Upload Web App Logo or update official eSewa QR payment image.</p>
        </Link>
      </div>

      <AdminPaymentVerifyModal
        payment={selectedPayment}
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminDashboard;
