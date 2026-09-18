import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, UserCheck, UserX, Shield, Search } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleActive = (id) => {
    api.patch(`/users/${id}/toggle-active`).then(() => fetchUsers());
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span className="truncate">User Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Enable, disable, or review system user accounts</p>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="p-3.5 sm:p-4">User</th>
                <th className="p-3.5 sm:p-4">Role</th>
                <th className="p-3.5 sm:p-4">Contact</th>
                <th className="p-3.5 sm:p-4">Documents</th>
                <th className="p-3.5 sm:p-4">Status</th>
                <th className="p-3.5 sm:p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">
                      <div>{u.fullName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                    </td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'TRAFFIC_OFFICER' ? 'bg-sky-100 text-sky-800 font-mono' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600 text-[11px] whitespace-nowrap">
                      <div>Cit: {u.citizenshipNo || '-'}</div>
                      <div>DL: {u.drivingLicenseNo || '-'}</div>
                    </td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      {u.active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 sm:p-4 text-right whitespace-nowrap">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => toggleActive(u.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                            u.active
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {u.active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
