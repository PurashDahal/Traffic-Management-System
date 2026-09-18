import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemSettings } from '../context/SystemSettingsContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../services/api';
import { Shield, Bell, LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAdmin, isOfficer } = useAuth();
  const { getLogoUrl, settings } = useSystemSettings();
  const { isMobileOpen, toggleMobile } = useSidebar();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const logoUrl = getLogoUrl();

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    });
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-200 uppercase">ADMIN</span>;
    if (isOfficer) return <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-sky-200 uppercase font-mono">OFFICER</span>;
    return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200 uppercase">VEHICLE OWNER</span>;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left Side: Mobile Hamburger Button & Brand Logo/Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {user && (
            <button
              onClick={toggleMobile}
              className="md:hidden p-2 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
              aria-label="Toggle navigation drawer"
            >
              {isMobileOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt="App Logo" className="h-8 sm:h-10 w-auto object-contain rounded shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-md shrink-0">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-base text-slate-900 tracking-tight block truncate">
                {settings.SYSTEM_NAME || 'AI Digital Traffic System'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wider block uppercase truncate">
                Nepal Digital Enforcement
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Notifications & User profile */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          
          {/* Notifications dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto top-16 sm:top-auto sm:right-0 mt-2 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-[80vh] sm:max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-slate-100 font-bold text-xs text-slate-700 flex justify-between items-center">
                    <span>Notifications ({notifications.length})</span>
                    <span className="text-[10px] text-slate-400">In-App Alerts</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications yet</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`p-3 text-xs border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-sky-50/60' : ''}`}
                      >
                        <div className="font-semibold text-slate-800 flex justify-between mb-0.5">
                          <span className="truncate pr-2">{n.title}</span>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>}
                        </div>
                        <p className="text-slate-600 leading-snug break-words">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* User profile & logout */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-4">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs text-slate-900 block truncate max-w-[140px]">{user.fullName}</span>
                {getRoleBadge()}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 font-semibold text-xs"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
