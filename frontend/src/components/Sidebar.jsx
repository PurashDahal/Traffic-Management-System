import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { isAdmin, isOfficer, isOwner } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-xs transition-all ${
      isActive
        ? 'bg-slate-900 text-amber-400 font-bold shadow-md'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* ADMIN Navigation Group */}
        {isAdmin && (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-2 block">
              Admin Workspace
            </span>
            <nav className="space-y-1">
              <NavLink to="/admin" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
                <span>Overview Dashboard</span>
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-4 h-4 text-sky-600" />
                <span>User Management</span>
              </NavLink>
              <NavLink to="/admin/officers" className={navLinkClass}>
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>Traffic Officers</span>
              </NavLink>
              <NavLink to="/admin/vehicles" className={navLinkClass}>
                <Car className="w-4 h-4 text-sky-600" />
                <span>Vehicle Records</span>
              </NavLink>
              <NavLink to="/admin/violation-types" className={navLinkClass}>
                <FileCheck className="w-4 h-4 text-sky-600" />
                <span>Violation & Fine Rules</span>
              </NavLink>
              <NavLink to="/admin/pending-payments" className={navLinkClass}>
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Pending Payments</span>
              </NavLink>
              <NavLink to="/admin/payments" className={navLinkClass}>
                <History className="w-4 h-4 text-sky-600" />
                <span>Payment History</span>
              </NavLink>
              <NavLink to="/admin/settings" className={navLinkClass}>
                <QrCode className="w-4 h-4 text-sky-600" />
                <span>App Logo & eSewa QR</span>
              </NavLink>
              <NavLink to="/admin/reports" className={navLinkClass}>
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Reports & AI Query</span>
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navLinkClass}>
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Security Audit Logs</span>
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
              <NavLink to="/officer" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
                <span>Officer Dashboard</span>
              </NavLink>
              <NavLink to="/officer/search-vehicle" className={navLinkClass}>
                <Search className="w-4 h-4 text-sky-600" />
                <span>Search Vehicle</span>
              </NavLink>
              <NavLink to="/officer/create-violation" className={navLinkClass}>
                <PlusCircle className="w-4 h-4 text-rose-600" />
                <span>Issue Digital Ticket</span>
              </NavLink>
              <NavLink to="/officer/tickets" className={navLinkClass}>
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Ticket Management</span>
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
              <NavLink to="/owner" end className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>My Dashboard</span>
              </NavLink>
              <NavLink to="/owner/vehicles" className={navLinkClass}>
                <Car className="w-4 h-4 text-emerald-600" />
                <span>My Vehicles</span>
              </NavLink>
              <NavLink to="/owner/violations" className={navLinkClass}>
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>My Violation Tickets</span>
              </NavLink>
              <NavLink to="/owner/notifications" className={navLinkClass}>
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/owner/profile" className={navLinkClass}>
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>Profile Settings</span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
        BCA Final Project &copy; 2026
      </div>
    </aside>
  );
};

export default Sidebar;
