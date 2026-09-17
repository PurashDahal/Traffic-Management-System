import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Shield, Search } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/audit-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = logs.filter(l =>
    l.username?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-700" /> System Security Audit Logs
          </h1>
          <p className="text-xs text-slate-500">Tamper-evident audit trail of administrative, officer, and user actions</p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase font-mono">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Performed By</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity Details</th>
              <th className="p-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 font-sans">No audit log entries found.</td>
              </tr>
            ) : (
              filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-500 text-[11px]">
                    {new Date(l.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">@{l.username}</td>
                  <td className="p-4 font-bold text-sky-700">
                    <span className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-sans text-xs max-w-md">{l.details}</td>
                  <td className="p-4 text-slate-400 text-[11px]">{l.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
