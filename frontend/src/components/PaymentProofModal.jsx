import React, { useState, useRef } from 'react';
import { useSystemSettings } from '../context/SystemSettingsContext';
import api from '../services/api';
import { X, QrCode, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, Camera, Trash2, Smartphone, ShieldCheck, Banknote, ShieldAlert, Check } from 'lucide-react';

const PaymentProofModal = ({ ticket, isOpen, onClose, onSuccess }) => {
  const { getEsewaQrUrl } = useSystemSettings();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [paymentMethod, setPaymentMethod] = useState('ESEWA'); // 'ESEWA' or 'CASH'
  const [transactionId, setTransactionId] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleRemoveProof = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProofFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleEsewaSubmit = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Please enter your eSewa Transaction ID.');
      return;
    }
    if (!proofFile) {
      setError('Please attach the payment receipt screenshot or photo proof.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify({
        ticketId: ticket.id,
        paymentMethod: 'ESEWA',
        transactionId: transactionId.trim()
      })], { type: 'application/json' }));
      formData.append('proof', proofFile);

      await api.post('/payments/submit', formData);

      setSuccessMsg('eSewa payment proof submitted! Traffic Admin will verify shortly.');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Payment submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit payment proof. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/payments/cash-submit', {
        ticketId: ticket.id,
        notes: cashNotes.trim() || 'Cash handed over to on-duty traffic officer'
      });

      setSuccessMsg('Cash payment request recorded! Traffic Officer will confirm payment on receipt.');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Cash payment submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit cash payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative max-h-[94vh] overflow-y-auto min-w-0 border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>Traffic Fine Payment & Clearance</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose your preferred payment method: Online via eSewa or Cash to Traffic Officer
          </p>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('ESEWA');
              setError('');
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'ESEWA'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Pay via eSewa QR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentMethod('CASH');
              setError('');
            }}
            className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'CASH'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Banknote className="w-4 h-4 shrink-0" />
            <span>Pay by Cash</span>
          </button>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Payment Submitted Successfully!</span>
              <span className="text-[11px] text-emerald-700">{successMsg}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-rose-50 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="break-words font-semibold">{error}</span>
          </div>
        )}

        {/* Ticket Summary Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Ticket ID:</span>
            <span className="font-mono font-bold text-sky-700">{ticket.ticketNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Vehicle:</span>
            <span className="font-bold text-slate-900">{ticket.vehicleNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Violation:</span>
            <span className="font-semibold text-rose-600">{ticket.categoryName}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-2">
            <span className="text-slate-700 font-bold uppercase">Fine Amount to Pay:</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono">
              Rs. {ticket.fineAmount?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* METHOD 1: eSewa QR Flow */}
        {paymentMethod === 'ESEWA' && (
          <div className="space-y-4">
            {/* Scan Official eSewa QR Code */}
            <div className="bg-gradient-to-b from-emerald-50 to-teal-50/50 border-2 border-emerald-300 rounded-2xl p-4 text-center shadow-sm">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official eSewa Merchant QR
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-emerald-200 my-1">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Official eSewa Payment QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center bg-slate-50 rounded-lg p-3 text-slate-600">
                    <div className="w-36 h-36 bg-slate-900 text-white rounded-xl p-2 flex flex-col items-center justify-center relative shadow">
                      <QrCode className="w-20 h-20 text-emerald-400 mb-1" />
                      <span className="text-[9px] font-mono text-amber-300 font-bold tracking-tight">ESEWA POLICE QR</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 mt-2 block">Scan via eSewa App</span>
                  </div>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <p className="text-xs font-bold text-emerald-950">
                  Pay Exact Amount: <span className="text-emerald-700 font-mono font-extrabold">Rs. {ticket.fineAmount?.toLocaleString()}</span>
                </p>
                <p className="text-[11px] text-emerald-800 font-medium">
                  Merchant: <strong>Traffic Police Fine Enforcement</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Remarks/Ref: <span className="font-mono font-semibold">{ticket.ticketNumber}</span>
                </p>
              </div>
            </div>

            {/* Submit eSewa Proof Form */}
            <form onSubmit={handleEsewaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                  1. eSewa Transaction ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN123456789 or 26AXXXX"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                  2. Upload Payment Screenshot / Receipt *
                </label>

                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> Select Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" /> Take Receipt Photo
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="border border-emerald-200 rounded-2xl p-3 bg-emerald-50/50 text-center space-y-2">
                    <img
                      src={previewUrl}
                      alt="Payment Proof Preview"
                      className="max-h-48 sm:max-h-56 object-contain mx-auto rounded-xl border border-emerald-200 shadow-sm"
                    />
                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-xs">{proofFile?.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50/70"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-emerald-700 block">No receipt screenshot attached</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Click buttons above or tap here to upload PNG, JPG up to 10MB</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || success}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 order-1 sm:order-2 cursor-pointer"
                >
                  {submitting ? 'Submitting eSewa Proof...' : 'Submit eSewa Payment Proof'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* METHOD 2: Pay by Cash Flow */}
        {paymentMethod === 'CASH' && (
          <form onSubmit={handleCashSubmit} className="space-y-4 text-xs">
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Pay by Cash to Traffic Officer</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    You can pay the exact fine amount of <strong className="text-emerald-700 font-mono text-xs">Rs. {ticket.fineAmount?.toLocaleString()}</strong> in cash directly to an on-duty Traffic Police officer at the checkpoint or nearest traffic station.
                  </p>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1 text-[11px] text-slate-700">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>How Cash Confirmation Works:</span>
                </div>
                <ol className="list-decimal list-inside pl-1 space-y-1 text-slate-600">
                  <li>Click <strong>Submit Cash Payment Handover</strong> below.</li>
                  <li>Hand over <strong>Rs. {ticket.fineAmount?.toLocaleString()}</strong> to the Traffic Officer on spot.</li>
                  <li>The Officer will tap <strong>Confirm Cash Received</strong> on their terminal, immediately marking your ticket as <strong>PAID</strong>.</li>
                </ol>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase mb-1">
                Handover Location / Officer Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Handing cash to Officer at Kalanki Chowk"
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || success}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 order-1 sm:order-2 cursor-pointer"
              >
                <Banknote className="w-4 h-4" />
                {submitting ? 'Recording Cash Handover...' : 'Submit Cash Payment Handover'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentProofModal;

