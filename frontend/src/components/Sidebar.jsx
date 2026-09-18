import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard,
  Users,
  Shield,
  Car,
  FileCheck,
  CreditCard,
  History,
  QrCode,
  BarChart3,
  FileText,
  Search,
  PlusCircle,
  Bell,
  UserCheck,
  Settings,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isOfficer, isOwner, user } = useAuth();
  const { isMobileOpen, closeMobile } = useSidebar();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
      isActive
        ? 'bg-slate-900 text-amber-400 font-bold shadow-md'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-200 uppercase">ADMIN</span>;
    if (isOfficer) return <span className="bg-sky-100 text-sky-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-sky-200 uppercase font-mono">OFFICER</span>;
    return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200 uppercase">VEHICLE OWNER</span>;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 md:min-h-[calc(100vh-4rem)] md:z-auto ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 md:hidden bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs block leading-tight">Traffic Portal</span>
              <span className="text-[10px] text-slate-400 font-mono">{user?.username}</span>
            </div>
          </div>
          <button
            onClick={closeMobile}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Mobile User Role Tag */}
          <div className="md:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">{user?.fullName}</span>
            {getRoleBadge()}
          </div>

          {/* ADMIN Navigation Group */}
          {isAdmin && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 block">
                Admin Workspace
              </span>
              <nav className="space-y-1">
                <NavLink to="/admin" end className={navLinkClass} onClick={closeMobile}>
                  <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Overview Dashboard</span>
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass} onClick={closeMobile}>
                  <Users className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">User Management</span>
                </NavLink>
                <NavLink to="/admin/officers" className={navLinkClass} onClick={closeMobile}>
                  <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Traffic Officers</span>
                </NavLink>
                <NavLink to="/admin/vehicles" className={navLinkClass} onClick={closeMobile}>
                  <Car className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Vehicle Records</span>
                </NavLink>
                <NavLink to="/admin/violation-types" className={navLinkClass} onClick={closeMobile}>
                  <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Violation & Fine Rules</span>
                </NavLink>
                <NavLink to="/admin/pending-payments" className={navLinkClass} onClick={closeMobile}>
                  <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Pending Payments</span>
                </NavLink>
                <NavLink to="/admin/payments" className={navLinkClass} onClick={closeMobile}>
                  <History className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Payment History</span>
                </NavLink>
                <NavLink to="/admin/settings" className={navLinkClass} onClick={closeMobile}>
                  <QrCode className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">App Logo & eSewa QR</span>
                </NavLink>
                <NavLink to="/admin/reports" className={navLinkClass} onClick={closeMobile}>
                  <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">Reports & AI Query</span>
                </NavLink>
                <NavLink to="/admin/audit-logs" className={navLinkClass} onClick={closeMobile}>
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">Security Audit Logs</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* TRAFFIC OFFICER Navigation Group */}
          {isOfficer && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 block">
                Officer Portal
              </span>
              <nav className="space-y-1">
                <NavLink to="/officer" end className={navLinkClass} onClick={closeMobile}>
                  <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Officer Dashboard</span>
                </NavLink>
                <NavLink to="/officer/search-vehicle" className={navLinkClass} onClick={closeMobile}>
                  <Search className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Search Vehicle</span>
                </NavLink>
                <NavLink to="/officer/create-violation" className={navLinkClass} onClick={closeMobile}>
                  <PlusCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">Issue Digital Ticket</span>
                </NavLink>
                <NavLink to="/officer/tickets" className={navLinkClass} onClick={closeMobile}>
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="truncate">Ticket Management</span>
                </NavLink>
                <NavLink to="/officer/pending-payments" className={navLinkClass} onClick={closeMobile}>
                  <CreditCard className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">Verify Pending Payments</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* VEHICLE OWNER Navigation Group */}
          {isOwner && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 block">
                Driver / Owner Portal
              </span>
              <nav className="space-y-1">
                <NavLink to="/owner" end className={navLinkClass} onClick={closeMobile}>
                  <LayoutDashboard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">My Dashboard</span>
                </NavLink>
                <NavLink to="/owner/vehicles" className={navLinkClass} onClick={closeMobile}>
                  <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">My Vehicles</span>
                </NavLink>
                <NavLink to="/owner/violations" className={navLinkClass} onClick={closeMobile}>
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">My Violation Tickets</span>
                </NavLink>
                <NavLink to="/owner/notifications" className={navLinkClass} onClick={closeMobile}>
                  <Bell className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Notifications</span>
                </NavLink>
                <NavLink to="/owner/profile" className={navLinkClass} onClick={closeMobile}>
                  <Settings className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Profile Settings</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
          BCA Final Project &copy; 2026
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
