import React, { useState } from 'react';
import { useSystemSettings } from '../context/SystemSettingsContext';
import api from '../services/api';
import { X, QrCode, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentProofModal = ({ ticket, isOpen, onClose, onSuccess }) => {
  const { getEsewaQrUrl } = useSystemSettings();
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const qrUrl = getEsewaQrUrl();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Please enter the eSewa Transaction ID.');
      return;
    }
    if (!proofFile) {
      setError('Please upload the payment proof screenshot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify({
        ticketId: ticket.id,
        transactionId: transactionId.trim()
      })], { type: 'application/json' }));
      formData.append('proof', proofFile);

      await api.post('/payments/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto min-w-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">eSewa Fine Payment</h3>
        <p className="text-xs text-slate-500 mb-4 break-words">
          Ticket ID: <span className="font-semibold text-slate-800 break-all">{ticket.ticketNumber}</span> | Fine: <span className="font-bold text-emerald-600">Rs. {ticket.fineAmount}</span>
        </p>

        {error && (
          <div className="mb-4 bg-rose-50 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        {/* Step 1: Scan QR Code */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-center mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">
            <QrCode className="w-4 h-4 shrink-0" /> Scan Official eSewa QR Code
          </div>
          {qrUrl ? (
            <div className="bg-white p-2 sm:p-3 rounded-lg inline-block shadow border border-emerald-100">
              <img src={qrUrl} alt="Official eSewa Payment QR" className="w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto" />
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-100 rounded-lg text-slate-500 text-xs">
              <p>Official eSewa QR image has not been configured by Administrator yet.</p>
              <p className="mt-1 font-semibold text-slate-700">Please make payment of Rs. {ticket.fineAmount} and attach proof below.</p>
            </div>
          )}
          <p className="text-xs text-emerald-700 mt-2 font-medium">Scan using your eSewa App & pay Rs. {ticket.fineAmount}</p>
        </div>

        {/* Step 2: Submit Proof Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">eSewa Transaction ID *</label>
            <input
              type="text"
              placeholder="e.g. TXN123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Upload Payment Screenshot / Receipt *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition-colors cursor-pointer relative bg-slate-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div>
                  <img src={previewUrl} alt="Payment Proof Preview" className="h-32 object-contain mx-auto rounded-lg mb-2" />
                  <span className="text-xs text-emerald-600 font-semibold block truncate max-w-xs mx-auto">{proofFile?.name}</span>
                </div>
              ) : (
                <div className="text-slate-500">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-emerald-600">Click to upload screenshot</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG, JPEG, WEBP up to 10MB</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 order-1 sm:order-2"
            >
              {submitting ? 'Submitting...' : 'Submit Payment for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentProofModal;
