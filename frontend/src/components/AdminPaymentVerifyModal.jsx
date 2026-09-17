import React, { useState } from 'react';
import api from '../services/api';
import { X, CheckCircle2, XCircle, AlertCircle, Eye, ExternalLink } from 'lucide-react';

const AdminPaymentVerifyModal = ({ payment, isOpen, onClose, onSuccess }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !payment) return null;

  const handleVerify = async (approve) => {
    if (!approve && !rejectionReason.trim()) {
      setError('Please provide a reason for rejecting the payment proof.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.put(`/payments/${payment.id}/verify`, {
        approve,
        rejectionReason: approve ? null : rejectionReason.trim()
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Verify Payment Proof</h3>
        <p className="text-xs text-slate-500 mb-4">Review submitted transaction details before approving.</p>

        {error && (
          <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Ticket ID:</span>
            <span className="font-bold text-slate-900">{payment.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle Number:</span>
            <span className="font-semibold text-slate-800">{payment.vehicleNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle Owner:</span>
            <span className="font-semibold text-slate-800">{payment.ownerName}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Fine Amount:</span>
            <span className="font-bold text-emerald-600 text-sm">Rs. {payment.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Submitted Txn ID:</span>
            <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono text-sm">
              {payment.transactionId}
            </span>
          </div>
        </div>

        {/* Proof Screenshot View */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">Payment Proof Screenshot</label>
            <a
              href={`/api/files/${payment.paymentProofPath}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-medium"
            >
              Open full image <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="border border-slate-200 rounded-xl p-2 bg-slate-900 text-center">
            <img
              src={`/api/files/${payment.paymentProofPath}`}
              alt="Payment Screenshot Proof"
              className="max-h-64 object-contain mx-auto rounded"
            />
          </div>
        </div>

        {showRejectForm ? (
          <div className="space-y-3 bg-rose-50 border border-rose-200 rounded-xl p-4">
            <label className="block text-xs font-semibold text-rose-800 uppercase">Rejection Reason *</label>
            <textarea
              rows="3"
              placeholder="e.g. Transaction ID does not match receipt / Invalid screenshot image"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify(false)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" /> Reject Payment
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify(true)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify & Mark PAID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentVerifyModal;
