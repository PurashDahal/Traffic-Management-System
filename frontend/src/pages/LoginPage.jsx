import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { getLogoUrl, settings } = useSystemSettings();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logoUrl = getLogoUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'TRAFFIC_OFFICER') {
        navigate('/officer');
      } else {
        navigate('/owner');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-5 sm:p-8 border border-slate-200">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt="App Logo" className="h-14 sm:h-16 w-auto mx-auto mb-3 object-contain" />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 break-words">
            {settings.SYSTEM_NAME || 'AI Digital Traffic System'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Digital Traffic Enforcement & Payment Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username / Badge ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter your username or badge ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-4 sm:pt-5">
          Vehicle Owner without an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
