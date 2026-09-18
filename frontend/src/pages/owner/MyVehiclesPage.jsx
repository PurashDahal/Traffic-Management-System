import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Car, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

const MyVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'Motorcycle',
    model: '',
    bluebookNumber: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchVehicles = () => {
    api.get('/vehicles/my')
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchVehicles();
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
      await api.post('/vehicles', formData);
      setMsg(`Vehicle ${formData.vehicleNumber.toUpperCase()} registered successfully!`);
      setFormData({
        vehicleNumber: '',
        vehicleType: 'Motorcycle',
        model: '',
        bluebookNumber: ''
      });
      setShowAddForm(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span className="truncate">My Vehicles</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Register and manage your personal vehicles</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Register New Vehicle
        </button>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="break-words">{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 sm:p-6 shadow-md">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-3">Register Vehicle</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Number *</label>
              <input
                type="text"
                name="vehicleNumber"
                required
                placeholder="e.g. BA 12 PA 3456"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Type *</label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
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
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow"
              >
                {submitting ? 'Registering...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-slate-400 text-xs text-center">
            No registered vehicles yet. Click <strong>Register New Vehicle</strong> above to add your vehicle.
          </div>
        ) : (
          vehicles.map(v => (
            <div key={v.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider block">Registered Vehicle</span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono break-words">{v.vehicleNumber}</h3>
              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div>Type: <strong className="text-slate-800">{v.vehicleType}</strong></div>
                <div>Model: <strong className="text-slate-800">{v.model || '-'}</strong></div>
                <div>Bluebook: <strong className="text-slate-800 font-mono">{v.bluebookNumber || '-'}</strong></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyVehiclesPage;
