import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileCheck, Plus, Edit2, Check, AlertCircle } from 'lucide-react';

const ViolationTypesConfigPage = () => {
  const [types, setTypes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFine, setEditFine] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFine, setNewFine] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchTypes = () => {
    api.get('/violation-types/all')
      .then(res => setTypes(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleUpdateFine = async (t) => {
    try {
      await api.put(`/violation-types/${t.id}`, {
        ...t,
        defaultFineAmount: parseFloat(editFine)
      });
      setMsg(`Updated fine amount for ${t.categoryName} to Rs. ${editFine}`);
      setEditingId(null);
      fetchTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update fine.');
    }
  };

  const handleAddType = async (e) => {
    e.preventDefault();
    try {
      await api.post('/violation-types', {
        categoryName: newCategory.trim(),
        description: newDesc.trim(),
        defaultFineAmount: parseFloat(newFine),
        active: true
      });
      setMsg(`Added new violation type: ${newCategory}`);
      setNewCategory('');
      setNewDesc('');
      setNewFine('');
      setShowAddForm(false);
      fetchTypes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add violation type.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-sky-600" /> Violation Types & Fine Rules
          </h1>
          <p className="text-xs text-slate-500">Configure traffic violation categories and fine amounts</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Violation Category
        </button>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <Check className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-md">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-3">Add New Violation Category</h3>
          <form onSubmit={handleAddType} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Reckless Driving"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Default Fine Amount (Rs.) *</label>
              <input
                type="number"
                required
                placeholder="1000"
                value={newFine}
                onChange={(e) => setNewFine(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 uppercase mb-1">Standard Description</label>
              <input
                type="text"
                placeholder="Standard description of the violation..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
            <tr>
              <th className="p-4">Violation Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Default Fine Amount</th>
              <th className="p-4 text-right">Configure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {types.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-900">{t.categoryName}</td>
                <td className="p-4 text-slate-600 max-w-xs">{t.description || '-'}</td>
                <td className="p-4 font-bold text-emerald-700 font-mono text-sm">
                  {editingId === t.id ? (
                    <input
                      type="number"
                      value={editFine}
                      onChange={(e) => setEditFine(e.target.value)}
                      className="w-28 px-2 py-1 border border-emerald-400 rounded focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    `Rs. ${t.defaultFineAmount?.toLocaleString()}`
                  )}
                </td>
                <td className="p-4 text-right">
                  {editingId === t.id ? (
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleUpdateFine(t)}
                        className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px] shadow"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(t.id); setEditFine(t.defaultFineAmount); }}
                      className="px-2.5 py-1 text-sky-700 bg-sky-50 hover:bg-sky-100 font-bold rounded border border-sky-200 text-[11px] flex items-center gap-1 ml-auto"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit Fine
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationTypesConfigPage;
