import React from 'react';
import StatusBadge from './StatusBadge';
import { Shield, MapPin, Calendar, Clock, User, Car, FileText, QrCode } from 'lucide-react';

const DigitalTicketCard = ({ ticket, onPayClick }) => {
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
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden font-mono">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 text-center border-b-4 border-amber-500">
        <div className="inline-flex items-center gap-2 mb-1 text-amber-400 font-sans">
          <Shield className="w-6 h-6" />
          <span className="font-bold tracking-wider text-sm">TRAFFIC POLICE NEPAL</span>
        </div>
        <h2 className="text-xl font-bold tracking-wide">DIGITAL TRAFFIC VIOLATION TICKET</h2>
        <p className="text-xs text-slate-400 mt-1 font-sans">Official Electronic Enforcement Record</p>
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-4 text-slate-800 text-sm">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-slate-500 font-sans text-xs uppercase font-semibold">Ticket ID</span>
          <span className="font-bold text-base text-sky-700">{ticket.ticketNumber}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-xs uppercase flex items-center gap-1 mb-1">
              <Car className="w-3.5 h-3.5" /> Vehicle Number
            </span>
            <span className="font-bold text-slate-900">{ticket.vehicleNumber}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-xs uppercase flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5" /> Vehicle Owner
            </span>
            <span className="font-semibold text-slate-900">{ticket.ownerName}</span>
          </div>
        </div>

        <div className="border-t border-b border-dashed border-slate-300 py-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-sans text-xs">Violation Category:</span>
            <span className="font-bold text-rose-600 font-sans">{ticket.categoryName}</span>
          </div>
          {ticket.description && (
            <div>
              <span className="text-slate-500 font-sans text-xs block mb-0.5">Description:</span>
              <p className="bg-amber-50 text-amber-900 p-2.5 rounded text-xs leading-relaxed font-sans border border-amber-200">
                {ticket.description}
              </p>
            </div>
          )}
          {ticket.officerNotes && (
            <div>
              <span className="text-slate-500 font-sans text-xs block mb-0.5">Officer Notes:</span>
              <p className="bg-slate-100 text-slate-800 p-2 rounded text-xs font-sans">
                {ticket.officerNotes}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>{ticket.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <User className="w-4 h-4 text-sky-600" />
            <span>Issued by: {ticket.officerName || ticket.officerUsername}</span>
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
                  className="w-full h-44 object-cover rounded-lg border border-slate-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* Fine & Status Section */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between mt-4">
          <div>
            <span className="text-xs text-slate-400 font-sans uppercase block">Fine Amount</span>
            <span className="text-xl font-bold text-amber-400">Rs. {ticket.fineAmount?.toLocaleString()}</span>
          </div>
          <div className="text-right font-sans">
            <span className="text-xs text-slate-400 block mb-1 uppercase">Payment Status</span>
            <StatusBadge status={ticket.paymentStatus} />
          </div>
        </div>

        {/* QR Ticket Verification Code mockup */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 font-sans border-t border-slate-200">
          <div className="flex items-center gap-1">
            <QrCode className="w-5 h-5 text-slate-500" />
            <span>Ticket Verification Code: {ticket.ticketNumber}</span>
          </div>
          {onPayClick && (ticket.paymentStatus === 'UNPAID' || ticket.paymentStatus === 'REJECTED') && (
            <button
              onClick={() => onPayClick(ticket)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all"
            >
              Pay via eSewa QR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalTicketCard;
