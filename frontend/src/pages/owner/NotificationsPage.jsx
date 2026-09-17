import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, []);

  const markRead = (id) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-emerald-600" /> Notifications Inbox
        </h1>
        <p className="text-xs text-slate-500">In-app alerts for newly issued tickets, payment status, and verification updates</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No notifications yet.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-4 transition-colors cursor-pointer flex justify-between items-start gap-4 ${
                !n.isRead ? 'bg-sky-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                  {!n.isRead && (
                    <span className="bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 font-mono block pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
