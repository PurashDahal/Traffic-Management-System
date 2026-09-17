import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SystemSettingsContext = createContext();

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    APP_LOGO_PATH: null,
    ESEWA_QR_PATH: null,
    SYSTEM_NAME: 'AI Digital Traffic System'
  });

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/public');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load system settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getLogoUrl = () => {
    if (settings.APP_LOGO_PATH) {
      return `/api/files/${settings.APP_LOGO_PATH}`;
    }
    return null;
  };

  const getEsewaQrUrl = () => {
    if (settings.ESEWA_QR_PATH) {
      return `/api/files/${settings.ESEWA_QR_PATH}`;
    }
    return null;
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, fetchSettings, getLogoUrl, getEsewaQrUrl }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
