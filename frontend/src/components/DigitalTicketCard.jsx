import React from 'react';
import StatusBadge from './StatusBadge';
import { Shield, MapPin, Calendar, Clock, User, Car, FileText, QrCode, Trash2 } from 'lucide-react';

const DigitalTicketCard = ({ ticket, onPayClick, onDeleteClick }) => {
  if (!ticket) return null;

  const formattedDate = new Date(ticket.violationTime || ticket.issuedAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(ticket.violationTime || ticket.issuedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden font-mono min-w-0">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 text-center border-b-4 border-amber-500">
        <div className="inline-flex items-center gap-2 mb-1 text-amber-400 font-sans">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-bold tracking-wider text-xs sm:text-sm">TRAFFIC POLICE NEPAL</span>
        </div>
        <h2 className="text-base sm:text-xl font-bold tracking-wide break-words">DIGITAL TRAFFIC VIOLATION TICKET</h2>
        <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-sans">Official Electronic Enforcement Record</p>
      </div>

      {/* Ticket Body */}
      <div className="p-4 sm:p-6 space-y-4 text-slate-800 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-200 gap-1">
          <span className="text-slate-500 font-sans text-xs uppercase font-semibold">Ticket ID</span>
          <span className="font-bold text-sm sm:text-base text-sky-700 break-all font-mono">{ticket.ticketNumber}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-sans text-xs uppercase flex items-center gap-1 mb-1 font-semibold">
              <Car className="w-3.5 h-3.5 text-sky-600" /> Vehicle Number
            </span>
            <span className="font-bold text-slate-900 break-words">{ticket.vehicleNumber}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-sans text-xs uppercase flex items-center gap-1 mb-1 font-semibold">
              <User className="w-3.5 h-3.5 text-sky-600" /> Vehicle Owner
            </span>
            <span className="font-semibold text-slate-900 break-words">{ticket.ownerName}</span>
          </div>
        </div>

        <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
            <span className="text-slate-500 font-sans text-xs">Violation Category:</span>
            <span className="font-bold text-rose-600 font-sans break-words">{ticket.categoryName}</span>
          </div>
          {ticket.description && (
            <div>
              <span className="text-slate-500 font-sans text-xs block mb-0.5">Description:</span>
              <p className="bg-amber-50 text-amber-900 p-2.5 rounded-lg text-xs leading-relaxed font-sans border border-amber-200 break-words">
                {ticket.description}
              </p>
            </div>
          )}
          {ticket.officerNotes && (
            <div>
              <span className="text-slate-500 font-sans text-xs block mb-0.5">Officer Notes:</span>
              <p className="bg-slate-100 text-slate-800 p-2.5 rounded-lg text-xs font-sans break-words">
                {ticket.officerNotes}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">{ticket.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <Clock className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
            <User className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="truncate">By: {ticket.officerName || ticket.officerUsername}</span>
          </div>
        </div>

        {/* Evidence Photos if any */}
        {ticket.evidenceFilePaths && ticket.evidenceFilePaths.length > 0 && (
          <div className="pt-2">
            <span className="text-slate-500 font-sans text-xs block mb-1.5">Evidence Image:</span>
            <div className="grid grid-cols-1 gap-2">
              {ticket.evidenceFilePaths.map((path, idx) => (
                <img
                  key={idx}
                  src={`/api/files/${path}`}
                  alt="Violation Evidence"
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* Fine & Status Section */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
          <div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-sans uppercase block">Fine Amount</span>
            <span className="text-lg sm:text-xl font-bold text-amber-400">Rs. {ticket.fineAmount?.toLocaleString()}</span>
          </div>
          <div className="sm:text-right font-sans">
            <span className="text-[10px] sm:text-xs text-slate-400 block mb-1 uppercase">Payment Status</span>
            <StatusBadge status={ticket.paymentStatus} />
          </div>
        </div>

        {/* Actions & QR Verification */}
        <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-slate-400 font-sans border-t border-slate-200">
          <div className="flex items-center gap-1 min-w-0">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 shrink-0" />
            <span className="truncate font-mono text-[11px]">Code: {ticket.ticketNumber}</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end">
            {onDeleteClick && (
              <button
                onClick={() => onDeleteClick(ticket)}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl font-semibold shadow transition-all flex items-center justify-center gap-1 text-xs"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
            {onPayClick && (ticket.paymentStatus === 'UNPAID' || ticket.paymentStatus === 'REJECTED') && (
              <button
                onClick={() => onPayClick(ticket)}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow transition-all text-xs text-center"
              >
                Pay via eSewa QR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketCard;
