import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle, Smartphone, Upload } from 'lucide-react';

const CameraCaptureModal = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [error, setError] = useState('');
  const [isHttpInsecure, setIsHttpInsecure] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);

  useEffect(() => {
    if (isOpen && !capturedPreview) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedPreview]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
  };

  const startCamera = async (mode) => {
    stopCamera();
    setError('');
    setIsHttpInsecure(false);

    // Check if mediaDevices is supported (blocked on insecure HTTP on mobile phones)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isSecure = window.isSecureContext;
      setIsHttpInsecure(!isSecure);
      setError(
        !isSecure
          ? 'Live camera stream requires HTTPS or localhost. Tap "Open Phone Camera" below to snap directly using your device camera.'
          : 'Camera access is not supported on this browser. Tap "Open Phone Camera" below to take a photo.'
      );
      return;
    }

    try {
      let stream = null;

      // Attempt 1: Advanced constraints with facingMode ideal
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err1) {
        console.warn('Attempt 1 ideal constraints failed, falling back to simple facingMode:', err1);
        // Attempt 2: Simple facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode }
          });
        } catch (err2) {
          console.warn('Attempt 2 failed, falling back to generic video: true:', err2);
          // Attempt 3: Basic generic video constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log('Video play interrupted:', e));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera permissions in browser settings or use the native phone camera button below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device found. Tap "Open Phone Camera" below.');
      } else {
        setError('Unable to access live camera stream. Tap "Open Phone Camera" below to capture directly.');
      }
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `violation_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const preview = URL.createObjectURL(file);
        setCapturedFile(file);
        setCapturedPreview(preview);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleNativeCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setCapturedFile(file);
      setCapturedPreview(preview);
      setError('');
      stopCamera();
    }
  };

  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedFile(null);
    setCapturedPreview(null);
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (capturedFile && capturedPreview) {
      onCapture(capturedFile, capturedPreview);
      onClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl relative border border-slate-800 text-white space-y-4 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-sm">Capture Violation Photo</h3>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Native Camera Input for 100% Mobile Compatibility */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraCapture}
          className="hidden"
        />

        {error && (
          <div className="bg-rose-950/80 text-rose-200 p-3 rounded-xl text-xs space-y-2 border border-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>

            {/* Quick Native Camera Trigger when live stream is blocked/unavailable */}
            {!capturedPreview && (
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow text-xs mt-1"
              >
                <Smartphone className="w-4 h-4" /> Open Phone Camera App
              </button>
            )}
          </div>
        )}

        {/* Live Video / Captured Image Preview */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {capturedPreview ? (
            <img src={capturedPreview} alt="Captured Violation" className="w-full h-full object-contain" />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!error && (
                <button
                  onClick={toggleCamera}
                  className="absolute top-3 right-3 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full backdrop-blur transition-all shadow"
                  title="Switch Camera (Front / Back)"
                  aria-label="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Action Controls & Alternative Native Camera Trigger */}
        {!capturedPreview && !error && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1.5 underline transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" /> Or launch native device camera directly
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 gap-2">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" /> Use Photo
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { stopCamera(); onClose(); }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              {!error ? (
                <button
                  type="button"
                  onClick={handleSnap}
                  className="px-5 sm:px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" /> Snap Photo Now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Snap with Phone Camera
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
