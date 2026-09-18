import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getFileUrl } from '../services/api';

const SystemSettingsContext = createContext();

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    APP_LOGO_PATH: null,
    ESEWA_QR_PATH: null,
    SYSTEM_NAME: 'AI Digital Traffic System'
  });
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/public');
      setSettings(res.data || {});
      setLastUpdated(Date.now());
      return res.data;
    } catch (err) {
      console.error('Failed to load system settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getLogoUrl = () => {
    if (settings.APP_LOGO_PATH) {
      const rawUrl = getFileUrl(settings.APP_LOGO_PATH);
      return rawUrl ? `${rawUrl}?v=${lastUpdated}` : '/logo/logo.png';
    }
    return '/logo/logo.png';
  };

  const getEsewaQrUrl = () => {
    if (settings.ESEWA_QR_PATH) {
      const rawUrl = getFileUrl(settings.ESEWA_QR_PATH);
      return rawUrl ? `${rawUrl}?v=${lastUpdated}` : null;
    }
    return null;
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, fetchSettings, getLogoUrl, getEsewaQrUrl, lastUpdated }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
