import React, { useRef } from 'react';
import {
  Grid,
  Zap,
  ZapOff,
  SwitchCamera,
  Upload,
  Camera,
  Navigation,
  Compass,
  Clock,
  RotateCw,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { formatCoordinates, getCompassDirection } from './gisUtils';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  showGrid: boolean;
  onToggleGrid: () => void;
  hasFlash: boolean;
  flashOn: boolean;
  onToggleFlash: () => void;
  onSwitchCamera: () => void;
  isCapturing: boolean;
  isLiveStreamReady: boolean;
  cameraPermissionDenied: boolean;
  cameraUnavailable: boolean;
  onRequestCameraPermission: () => void;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  altitudeMeters: number | null;
  timestamp: string;
  heading?: number;
  resolvedAddress?: string;
  resolvedRoad?: string;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  showGrid,
  onToggleGrid,
  hasFlash,
  flashOn,
  onToggleFlash,
  onSwitchCamera,
  isCapturing,
  isLiveStreamReady,
  cameraPermissionDenied,
  cameraUnavailable,
  onRequestCameraPermission,
  onUploadFile,
  latitude,
  longitude,
  accuracyMeters,
  altitudeMeters,
  timestamp,
  heading,
  resolvedAddress,
  resolvedRoad,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[460px] bg-black flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 select-none shadow-2xl">
      {/* Live Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLiveStreamReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Screen flash animation effect when photo is snapped */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
      )}

      {/* Camera Loading State */}
      {!isLiveStreamReady && !cameraPermissionDenied && !cameraUnavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-slate-300 p-6 space-y-3 z-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin flex items-center justify-center">
              <Camera className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-sm text-slate-100">
              Initializing Live Camera Stream...
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Requesting rear environment sensor with high-precision geolocation tracking
            </p>
          </div>
        </div>
      )}

      {/* Camera Permission Denied or Unavailable State */}
      {(cameraPermissionDenied || cameraUnavailable) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-200 z-30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            {cameraPermissionDenied ? (
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            ) : (
              <Camera className="w-7 h-7 text-amber-400" />
            )}
          </div>

          <div className="space-y-1.5 max-w-sm">
            <h4 className="font-bold text-base text-slate-100">
              {cameraPermissionDenied
                ? 'Camera Access Permission Required'
                : 'Camera Stream Unavailable'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {cameraPermissionDenied
                ? 'Please allow camera access in your browser to capture real-time on-site GIS hazard evidence.'
                : 'No active video capture device detected on this device. You can upload an image from your files or take a photo with your device camera.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">
            {cameraPermissionDenied && (
              <button
                type="button"
                onClick={onRequestCameraPermission}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Grant Permission & Retry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Photo from Files</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Tactical HUD Overlays (Rendered when stream is ready) */}
      {isLiveStreamReady && (
        <>
          {/* Rule-of-Thirds Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div className="border-r border-b border-white/20" />
              <div />
            </div>
          )}

          {/* Center Tactical Crosshair / Focus Reticle */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="relative w-28 h-28 border border-amber-400/30 rounded-2xl flex items-center justify-center">
              {/* Corner tick marks */}
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400" />

              {/* Center dot & cross lines */}
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              <div className="absolute w-8 h-[1px] bg-amber-400/60" />
              <div className="absolute h-8 w-[1px] bg-amber-400/60" />
            </div>
          </div>

          {/* Top-Left Live GIS HUD Banner */}
          <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1.5 max-w-[70%] sm:max-w-[60%] pointer-events-none">
            {/* GPS Pill */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/80 text-[11px] font-mono text-slate-100 shadow-lg">
              <span className={`w-2 h-2 rounded-full shrink-0 ${latitude !== null ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
              <span className="font-bold text-amber-300">
                {latitude !== null && longitude !== null
                  ? `📍 GPS: ${formatCoordinates(latitude, longitude)}`
                  : '📍 GPS: Acquiring Satellite Fix...'}
              </span>
            </div>

            {/* Accuracy, Elevation & Time Pill */}
            <div className="inline-flex flex-wrap items-center gap-1 text-[10px] font-mono text-slate-200">
              <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800 text-emerald-400 font-semibold">
                {accuracyMeters !== null
                  ? `±${accuracyMeters.toFixed(1)} m accuracy`
                  : '±-- m'}
              </span>

              <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800 text-cyan-300 font-semibold">
                {altitudeMeters !== null ? `Alt: ${altitudeMeters} m` : 'Alt: N/A'}
              </span>

              <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800 text-slate-300 font-semibold flex items-center space-x-1">
                <Clock className="w-2.5 h-2.5 text-amber-400" />
                <span>{timestamp}</span>
              </span>

              {heading !== undefined && (
                <span className="px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded-md border border-slate-800 text-purple-300 font-semibold flex items-center space-x-1">
                  <Compass className="w-2.5 h-2.5" />
                  <span>{getCompassDirection(heading)}</span>
                </span>
              )}
            </div>

            {/* Location / Highway Breadcrumb */}
            {(resolvedRoad || resolvedAddress) && (
              <div className="px-2.5 py-1 bg-slate-950/85 backdrop-blur-md rounded-lg border border-slate-800 text-[10px] text-slate-300 truncate max-w-full">
                <span className="text-amber-400 font-semibold">
                  {resolvedRoad || resolvedAddress}
                </span>
              </div>
            )}
          </div>

          {/* Top-Right Survey HUD Controls */}
          <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
            {/* Flash Toggle */}
            <button
              type="button"
              onClick={onToggleFlash}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
                flashOn
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700/80'
              }`}
              title="Toggle Flash / Torch"
            >
              {flashOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
            </button>

            {/* Grid Toggle */}
            <button
              type="button"
              onClick={onToggleGrid}
              className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
                showGrid
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700/80'
              }`}
              title="Toggle Rule-of-Thirds Grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Switch Front/Back Camera */}
            <button
              type="button"
              onClick={onSwitchCamera}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/80 shadow-lg transition-all active:rotate-180"
              title="Switch Front/Rear Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Hidden file input for manual file upload fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onUploadFile}
        className="hidden"
      />
    </div>
  );
};
