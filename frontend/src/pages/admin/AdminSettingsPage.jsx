import React, { useState } from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import api from '../../services/api';
import { QrCode, Upload, Trash2, CheckCircle2, AlertCircle, Image as ImageIcon, Check } from 'lucide-react';

const AdminSettingsPage = () => {
  const { fetchSettings, getLogoUrl, getEsewaQrUrl, settings, lastUpdated } = useSystemSettings();
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const currentLogoUrl = getLogoUrl();
  const currentQrUrl = getEsewaQrUrl();

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
      setMsg('');
    }
  };

  const handleQrSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
      setError('');
      setMsg('');
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    setUploadingLogo(true);
    setMsg('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      const res = await api.post('/admin/settings/logo', formData);
      setMsg(res.data?.message || 'Web Application Logo updated successfully!');
      setLogoFile(null);
      setLogoPreview(null);
      await fetchSettings();
    } catch (err) {
      console.error('Logo upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload logo image.');
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
      const res = await api.post('/admin/settings/esewa-qr', formData);
      setMsg(res.data?.message || 'Official eSewa Payment QR image uploaded successfully!');
      setQrFile(null);
      setQrPreview(null);
      await fetchSettings();
    } catch (err) {
      console.error('QR upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload eSewa QR code image.');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleRemoveQr = async () => {
    if (!window.confirm('Are you sure you want to remove the official eSewa QR code image?')) return;
    try {
      await api.delete('/admin/settings/esewa-qr');
      setMsg('Official eSewa QR code removed successfully.');
      setQrFile(null);
      setQrPreview(null);
      await fetchSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove QR.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 shrink-0" />
          <span className="truncate">Branding & eSewa QR Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage public Web App branding and official eSewa QR payment image for fine collection</p>
      </div>

      {msg && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="break-words font-semibold">{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-800 p-3.5 sm:p-4 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="break-words font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Official eSewa QR Payment Code Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 min-w-0">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Official eSewa Payment QR</span>
            </h3>
            {currentQrUrl && (
              <button
                type="button"
                onClick={handleRemoveQr}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 shrink-0 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove QR
              </button>
            )}
          </div>

          {/* QR Display / Preview Box */}
          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            {qrPreview ? (
              <div className="space-y-2">
                <img src={qrPreview} alt="Selected eSewa QR Preview" className="w-44 h-44 sm:w-52 sm:h-52 object-contain mx-auto bg-white p-2 rounded-xl border border-amber-300 shadow-md ring-2 ring-amber-400" />
                <span className="text-[11px] text-amber-700 font-bold block">Selected Preview (Not saved yet - click Save below)</span>
              </div>
            ) : currentQrUrl ? (
              <div className="space-y-2">
                <img
                  src={currentQrUrl}
                  alt="Active Official eSewa QR"
                  className="w-44 h-44 sm:w-52 sm:h-52 object-contain mx-auto bg-white p-2 rounded-xl border border-emerald-200 shadow-md"
                  onError={(e) => {
                    console.warn('QR image failed to load:', currentQrUrl);
                  }}
                />
                <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active Official eSewa QR Code
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">Path: {settings.ESEWA_QR_PATH}</span>
              </div>
            ) : (
              <div className="py-8 text-slate-400 text-xs">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-semibold text-slate-600">No custom official eSewa QR uploaded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload your official traffic fine collection eSewa QR image below.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleQrUpload} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Upload / Replace eSewa QR Image
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required
                onChange={handleQrSelect}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingQr || !qrFile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" /> {uploadingQr ? 'Uploading & Saving...' : 'Save Official eSewa QR Code'}
            </button>
          </form>
        </div>

        {/* 2. Web App Logo Upload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4 min-w-0">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-600 shrink-0" />
              <span>Web Application Logo</span>
            </h3>
          </div>

          <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
            {logoPreview ? (
              <div className="space-y-2">
                <img src={logoPreview} alt="Selected Logo Preview" className="h-16 w-auto mx-auto object-contain bg-white p-2 rounded-lg border border-amber-300 shadow-sm" />
                <span className="text-[11px] text-amber-700 font-bold block">Selected Logo Preview (Click Save below)</span>
              </div>
            ) : currentLogoUrl ? (
              <div className="space-y-2">
                <img src={currentLogoUrl} alt="Active Web App Logo" className="h-16 w-auto mx-auto object-contain bg-white p-2 rounded-lg border shadow-sm" />
                <span className="text-[11px] text-sky-700 font-bold block">Active Web Application Logo</span>
              </div>
            ) : (
              <div className="py-8 text-slate-400 text-xs">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>Default Traffic Shield icon active.</p>
              </div>
            )}
          </div>

          <form onSubmit={handleLogoUpload} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">Upload Custom Web App Logo</label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                required
                onChange={handleLogoSelect}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingLogo || !logoFile}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" /> {uploadingLogo ? 'Uploading & Saving...' : 'Save Web Application Logo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
