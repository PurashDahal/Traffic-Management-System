import React, { useState } from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import api from '../../services/api';
import { QrCode, Upload, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';

const AdminSettingsPage = () => {
  const { fetchSettings, getLogoUrl, getEsewaQrUrl } = useSystemSettings();
  
  const [logoFile, setLogoFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const logoUrl = getLogoUrl();
  const qrUrl = getEsewaQrUrl();

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    setUploadingLogo(true);
    setMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      await api.post('/admin/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('Web App Logo updated successfully!');
      setLogoFile(null);
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleQrUpload = async (e) => {
    e.preventDefault();
    if (!qrFile) return;

    setUploadingQr(true);
    setMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', qrFile);
      await api.post('/admin/settings/esewa-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg('Official eSewa Payment QR image updated successfully!');
      setQrFile(null);
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload eSewa QR.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleRemoveQr = async () => {
    if (!window.confirm('Are you sure you want to remove the official eSewa QR code image?')) return;
    try {
      await api.delete('/admin/settings/esewa-qr');
      setMsg('Official eSewa QR code removed.');
      fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove QR.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-sky-600" /> App Logo & eSewa QR Configuration
        </h1>
        <p className="text-xs text-slate-500">Manage public Web App branding and official eSewa QR payment image</p>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Official eSewa QR Payment Code Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" /> Official eSewa Payment QR
            </h3>
            {qrUrl && (
              <button
                onClick={handleRemoveQr}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove QR
              </button>
            )}
          </div>

          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            {qrUrl ? (
              <div className="space-y-2">
                <img src={qrUrl} alt="Current eSewa QR" className="w-48 h-48 object-contain mx-auto bg-white p-2 rounded-lg border shadow-sm" />
                <span className="text-[10px] text-emerald-700 font-bold block">Active Official eSewa QR Code</span>
              </div>
            ) : (
              <div className="py-8 text-slate-400 text-xs">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No official eSewa QR uploaded yet.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleQrUpload} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase">Upload / Replace eSewa QR Image</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setQrFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            <button
              type="submit"
              disabled={uploadingQr || !qrFile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {uploadingQr ? 'Uploading...' : 'Save Official eSewa QR Code'}
            </button>
          </form>
        </div>

        {/* 2. Web App Logo Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-600" /> Web Application Logo
            </h3>
          </div>

          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            {logoUrl ? (
              <div className="space-y-2">
                <img src={logoUrl} alt="Current Web App Logo" className="h-16 w-auto mx-auto object-contain bg-white p-2 rounded border" />
                <span className="text-[10px] text-sky-700 font-bold block">Active Web Application Logo</span>
              </div>
            ) : (
              <div className="py-8 text-slate-400 text-xs">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>Default Traffic Shield icon active.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleLogoUpload} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase">Upload Custom Web App Logo</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setLogoFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            <button
              type="submit"
              disabled={uploadingLogo || !logoFile}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> {uploadingLogo ? 'Uploading...' : 'Save Web Application Logo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
