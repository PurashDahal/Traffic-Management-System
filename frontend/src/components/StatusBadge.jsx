import React from 'react';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'UNPAID':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" />
          UNPAID
        </span>
      );
    case 'PENDING_VERIFICATION':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5" />
          PENDING VERIFICATION
        </span>
      );
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          PAID
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <XCircle className="w-3.5 h-3.5" />
          REJECTED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

export default StatusBadge;
