import React, { useState } from 'react';
import api, { getFileUrl } from '../services/api';
import { X, CheckCircle2, XCircle, AlertCircle, Eye, ExternalLink, ImageOff, Banknote, QrCode } from 'lucide-react';

const AdminPaymentVerifyModal = ({ payment, isOpen, onClose, onSuccess }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !payment) return null;

  const isCash = payment.paymentMethod === 'CASH';
  const proofUrl = payment.paymentProofPath ? getFileUrl(payment.paymentProofPath) : null;

  const handleVerify = async (approve) => {
    if (!approve && !rejectionReason.trim()) {
      setError('Please provide a reason for rejecting the payment.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto min-w-0 border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          {isCash ? (
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {isCash ? 'Verify Cash Payment Handover' : 'Verify eSewa Payment Proof'}
            </h3>
            <span className="text-xs text-slate-500">
              {isCash ? 'Confirm on-spot cash collection from vehicle owner' : 'Review eSewa screenshot and transaction ID'}
            </span>
          </div>
        </div>

        {error && (
          <div className="my-3 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="break-words font-semibold">{error}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200 space-y-2 text-xs my-4">
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">Ticket ID:</span>
            <span className="font-bold text-slate-900 font-mono break-all">{payment.ticketNumber}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">Payment Method:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1 ${
              isCash ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {isCash ? <><Banknote className="w-3.5 h-3.5" /> Cash Handover</> : <><QrCode className="w-3.5 h-3.5" /> eSewa Online QR</>}
            </span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">Vehicle Number:</span>
            <span className="font-semibold text-slate-800">{payment.vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-medium">Vehicle Owner:</span>
            <span className="font-semibold text-slate-800">{payment.ownerName}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-2 gap-2">
            <span className="text-slate-700 font-bold uppercase">Fine Amount:</span>
            <span className="font-extrabold text-emerald-700 text-base font-mono">Rs. {payment.amount?.toLocaleString()}</span>
          </div>
          {payment.transactionId && (
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500 font-medium">{isCash ? 'Reference Code:' : 'Submitted Txn ID:'}</span>
              <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 font-mono text-xs break-all">
                {payment.transactionId}
              </span>
            </div>
          )}
          {payment.notes && (
            <div className="border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-medium block mb-0.5">Notes / Handover Details:</span>
              <span className="text-slate-800 bg-white p-2 rounded-lg border border-slate-200 block text-xs">
                {payment.notes}
              </span>
            </div>
          )}
        </div>

        {/* Cash Notice or Proof Screenshot View */}
        {isCash ? (
          <div className="mb-5 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Banknote className="w-4 h-4 text-amber-600" />
              <span>Cash Collection Confirmation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Confirming this payment certifies that you or an on-duty officer have received the exact amount of <strong className="text-emerald-800 font-mono">Rs. {payment.amount?.toLocaleString()}</strong> in cash from {payment.ownerName}.
            </p>
          </div>
        ) : (
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Payment Proof Screenshot</label>
              {proofUrl && (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
                >
                  Open full image <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="border border-slate-200 rounded-2xl p-2 bg-slate-950 text-center min-h-[160px] flex items-center justify-center">
              {proofUrl && !imageError ? (
                <img
                  src={proofUrl}
                  alt="Payment Screenshot Proof"
                  className="max-h-60 sm:max-h-72 w-auto object-contain mx-auto rounded-xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="p-6 text-slate-400 text-xs space-y-1">
                  <ImageOff className="w-8 h-8 mx-auto text-slate-500 mb-1" />
                  <p className="font-semibold">Unable to display image preview</p>
                  <p className="text-[10px] text-slate-500">File path: {payment.paymentProofPath}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showRejectForm ? (
          <div className="space-y-3 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 sm:p-4">
            <label className="block text-xs font-bold text-rose-800 uppercase">Rejection Reason *</label>
            <textarea
              rows="3"
              placeholder="e.g. Transaction ID does not match receipt / Invalid screenshot image"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify(false)}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="px-4 py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors order-2 sm:order-1"
            >
              <XCircle className="w-4 h-4" /> Reject Payment
            </button>
            <div className="flex gap-2 justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVerify(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
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
