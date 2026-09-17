import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Phone, CreditCard, FileCheck, ArrowRight, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    citizenshipNo: '',
    drivingLicenseNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
        
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Vehicle Owner Registration</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Create account to view tickets & submit payments</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Username *</label>
              <input
                type="text"
                name="username"
                required
                placeholder="john_doe"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Citizenship No</label>
              <input
                type="text"
                name="citizenshipNo"
                placeholder="12-34-5678"
                value={formData.citizenshipNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Driving License No</label>
              <input
                type="text"
                name="drivingLicenseNo"
                placeholder="DL-987654"
                value={formData.drivingLicenseNo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Vehicle Owner Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-3">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
