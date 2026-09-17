import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Car, Search, Plus, CheckCircle2, AlertCircle, User } from 'lucide-react';

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Motorcycle',
    model: '',
    bluebookNumber: '',
    ownerId: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchVehicles = () => {
    api.get('/vehicles')
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchUsers = () => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim()) return;

    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const payload = {
        ...formData,
        ownerId: formData.ownerId ? parseInt(formData.ownerId) : null
      };
      await api.post('/vehicles', payload);
      setMsg(`Vehicle ${formData.vehicleNumber.toUpperCase()} registered successfully!`);
      setFormData({
        vehicleNumber: '',
        vehicleType: 'Motorcycle',
        model: '',
        bluebookNumber: '',
        ownerId: ''
      });
      setShowAddModal(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehicles.filter(v =>
    v.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
    v.vehicleType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-sky-600" /> Vehicle Database
          </h1>
          <p className="text-xs text-slate-500">Centralized vehicle registration & ownership index</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vehicle number or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none w-64"
            />
          </div>

          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showAddModal && (
        <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-md">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-3">Register New Vehicle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
              <input
                type="text"
                name="vehicleNumber"
                required
                placeholder="e.g. BA-1-PA-1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
              >
                <option value="Motorcycle">Motorcycle / Scooter</option>
                <option value="Car">Light Motor Vehicle (Car / SUV / Jeep)</option>
                <option value="Bus">Bus / Microbus</option>
                <option value="Truck">Truck / Heavy Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Make / Model</label>
              <input
                type="text"
                name="model"
                placeholder="e.g. Pulsar 220 / Hyundai i20"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Bluebook Number</label>
              <input
                type="text"
                name="bluebookNumber"
                placeholder="e.g. BB-987654"
                value={formData.bluebookNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Assign Registered Owner (Optional)</label>
              <select
                name="ownerId"
                value={formData.ownerId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-semibold"
              >
                <option value="">Current User / Default Admin</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} (@{u.username}) - {u.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow"
              >
                {submitting ? 'Registering...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-4">Vehicle Number</th>
              <th className="p-4">Vehicle Type</th>
              <th className="p-4">Registered Owner</th>
              <th className="p-4">Model</th>
              <th className="p-4">Bluebook No</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">No vehicle records found.</td>
              </tr>
            ) : (
              filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-bold text-slate-900 text-sm">{v.vehicleNumber}</td>
                  <td className="p-4 font-semibold text-slate-700">{v.vehicleType}</td>
                  <td className="p-4 font-semibold text-slate-900">
                    <div>{v.ownerName}</div>
                    <span className="text-[10px] text-slate-400 font-normal">@{v.ownerUsername} | Ph: {v.ownerPhone || 'N/A'}</span>
                  </td>
                  <td className="p-4 text-slate-600">{v.model || '-'}</td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{v.bluebookNumber || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleManagementPage;
