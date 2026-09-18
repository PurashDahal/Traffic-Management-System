import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemSettingsProvider } from './context/SystemSettingsContext';
import { SidebarProvider } from './context/SidebarContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import OfficerManagementPage from './pages/admin/OfficerManagementPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import ViolationTypesConfigPage from './pages/admin/ViolationTypesConfigPage';
import PendingPaymentsPage from './pages/admin/PendingPaymentsPage';
import PaymentHistoryPage from './pages/admin/PaymentHistoryPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ReportsAnalyticsPage from './pages/admin/ReportsAnalyticsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import VehicleSearchPage from './pages/officer/VehicleSearchPage';
import CreateViolationPage from './pages/officer/CreateViolationPage';
import TicketManagementPage from './pages/officer/TicketManagementPage';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import MyVehiclesPage from './pages/owner/MyVehiclesPage';
import MyViolationsPage from './pages/owner/MyViolationsPage';
import NotificationsPage from './pages/owner/NotificationsPage';
import OwnerProfilePage from './pages/owner/OwnerProfilePage';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading Traffic Portal...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'TRAFFIC_OFFICER') return <Navigate to="/officer" replace />;
    return <Navigate to="/owner" replace />;
  }
  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)] relative w-full overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TRAFFIC_OFFICER') return <Navigate to="/officer" replace />;
  return <Navigate to="/owner" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif] text-slate-800 antialiased">
      <Navbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/officers" element={<ProtectedRoute allowedRoles={['ADMIN']}><OfficerManagementPage /></ProtectedRoute>} />
        <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={['ADMIN']}><VehicleManagementPage /></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['ADMIN']}><TicketManagementPage /></ProtectedRoute>} />
        <Route path="/admin/violation-types" element={<ProtectedRoute allowedRoles={['ADMIN']}><ViolationTypesConfigPage /></ProtectedRoute>} />
        <Route path="/admin/pending-payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><PendingPaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><PaymentHistoryPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogsPage /></ProtectedRoute>} />

        {/* OFFICER ROUTES */}
        <Route path="/officer" element={<ProtectedRoute allowedRoles={['TRAFFIC_OFFICER', 'ADMIN']}><OfficerDashboard /></ProtectedRoute>} />
        <Route path="/officer/search-vehicle" element={<ProtectedRoute allowedRoles={['TRAFFIC_OFFICER', 'ADMIN']}><VehicleSearchPage /></ProtectedRoute>} />
        <Route path="/officer/create-violation" element={<ProtectedRoute allowedRoles={['TRAFFIC_OFFICER', 'ADMIN']}><CreateViolationPage /></ProtectedRoute>} />
        <Route path="/officer/tickets" element={<ProtectedRoute allowedRoles={['TRAFFIC_OFFICER', 'ADMIN']}><TicketManagementPage /></ProtectedRoute>} />
        <Route path="/officer/pending-payments" element={<ProtectedRoute allowedRoles={['TRAFFIC_OFFICER', 'ADMIN']}><PendingPaymentsPage /></ProtectedRoute>} />

        {/* OWNER ROUTES */}
        <Route path="/owner" element={<ProtectedRoute allowedRoles={['VEHICLE_OWNER', 'ADMIN']}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/vehicles" element={<ProtectedRoute allowedRoles={['VEHICLE_OWNER', 'ADMIN']}><MyVehiclesPage /></ProtectedRoute>} />
        <Route path="/owner/violations" element={<ProtectedRoute allowedRoles={['VEHICLE_OWNER', 'ADMIN']}><MyViolationsPage /></ProtectedRoute>} />
        <Route path="/owner/notifications" element={<ProtectedRoute allowedRoles={['VEHICLE_OWNER', 'ADMIN']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/owner/profile" element={<ProtectedRoute allowedRoles={['VEHICLE_OWNER', 'ADMIN']}><OwnerProfilePage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SystemSettingsProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </SystemSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
