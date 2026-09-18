import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Plus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const OfficerManagementPage = () => {
  const [officers, setOfficers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    citizenshipNo: '',
    drivingLicenseNo: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOfficers = () => {
    api.get('/users/officers')
      .then(res => setOfficers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.post('/users/officers', formData);
      setSuccessMsg(`Traffic Officer @${formData.username} created successfully.`);
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        citizenshipNo: '',
        drivingLicenseNo: ''
      });
      setShowAddForm(false);
      fetchOfficers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create officer account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
            <span className="truncate">Traffic Officer Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Create & manage authorized traffic officer accounts</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Traffic Officer
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="break-words">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {/* Add Officer Modal/Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-sky-200 p-4 sm:p-6 shadow-md space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wide">Register New Traffic Officer</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Officer Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Username / Badge ID *</label>
              <input
                type="text"
                name="username"
                required
                placeholder="officer_01"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Official Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="officer@traffic.gov.np"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Password *</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="98XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Police ID / Badge No</label>
              <input
                type="text"
                name="citizenshipNo"
                placeholder="OFF-2026-001"
                value={formData.citizenshipNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
              >
                {submitting ? 'Creating...' : 'Save Traffic Officer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="p-3.5 sm:p-4">Badge / Username</th>
                <th className="p-3.5 sm:p-4">Officer Name</th>
                <th className="p-3.5 sm:p-4">Contact</th>
                <th className="p-3.5 sm:p-4">Police ID</th>
                <th className="p-3.5 sm:p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No traffic officers registered yet.</td>
                </tr>
              ) : (
                officers.map(off => (
                  <tr key={off.id} className="hover:bg-slate-50">
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-sky-700 whitespace-nowrap">@{off.username}</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900">{off.fullName}</td>
                    <td className="p-3.5 sm:p-4 text-slate-600">
                      <div>{off.email}</div>
                      <div className="text-[10px] text-slate-400">{off.phone || 'N/A'}</div>
                    </td>
                    <td className="p-3.5 sm:p-4 text-slate-600 font-mono whitespace-nowrap">{off.citizenshipNo || '-'}</td>
                    <td className="p-3.5 sm:p-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE OFFICER
                      </span>
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

export default OfficerManagementPage;
