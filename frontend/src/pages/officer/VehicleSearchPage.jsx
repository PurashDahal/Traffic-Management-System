import React, { useState } from 'react';
import api from '../../services/api';
import DigitalTicketCard from '../../components/DigitalTicketCard';
import { Search, Car, User, Phone, FileText, AlertCircle, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VehicleSearchPage = () => {
  const [query, setQuery] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setVehicle(null);
    setTickets([]);

    try {
      const vRes = await api.get(`/vehicles/search?number=${encodeURIComponent(query.trim())}`);
      setVehicle(vRes.data);

      const tRes = await api.get('/tickets');
      const vTickets = tRes.data.filter(t => t.vehicleNumber?.toUpperCase() === vRes.data.vehicleNumber?.toUpperCase());
      setTickets(vTickets);
    } catch (err) {
      setError(err.response?.data?.message || 'Vehicle not found in database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Search className="w-6 h-6 text-sky-600" /> Vehicle & Owner Lookup
        </h1>
        <p className="text-xs text-slate-500">Search vehicle number to view bluebook records and violation history</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="e.g. BA 12 PA 3456"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" /> {loading ? 'Searching...' : 'Search Record'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200 max-w-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle Info Result */}
      {vehicle && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-sky-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Registered Vehicle</span>
              <h2 className="text-2xl font-extrabold text-slate-900 font-mono">{vehicle.vehicleNumber}</h2>
              <div className="flex gap-4 text-xs text-slate-600 pt-1">
                <span>Type: <strong className="text-slate-800">{vehicle.vehicleType}</strong></span>
                <span>Model: <strong className="text-slate-800">{vehicle.model || '-'}</strong></span>
                <span>Bluebook: <strong className="text-slate-800 font-mono">{vehicle.bluebookNumber || '-'}</strong></span>
              </div>
              <div className="text-xs text-slate-600 pt-1">
                Owner: <strong className="text-slate-900">{vehicle.ownerName}</strong> (@{vehicle.ownerUsername}) | Contact: <strong>{vehicle.ownerPhone || 'N/A'}</strong>
              </div>
            </div>

            <button
              onClick={() => navigate('/officer/create-violation', { state: { vehicleNumber: vehicle.vehicleNumber } })}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Issue Ticket for {vehicle.vehicleNumber}
            </button>
          </div>

          {/* Past Violation History */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" /> Violation History ({tickets.length} Recorded)
            </h3>

            {tickets.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-slate-400 text-xs text-center">
                No past traffic violations recorded for this vehicle.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map(t => (
                  <DigitalTicketCard key={t.id} ticket={t} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearchPage;
