import React from 'react';
import { ShieldAlert, Navigation, Camera, RefreshCw, AlertCircle, MapPin } from 'lucide-react';

interface LocationPermissionProps {
  cameraPermissionDenied: boolean;
  locationPermissionDenied: boolean;
  onRequestPermissions: () => void;
  onUseFallbackLocation?: () => void;
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  cameraPermissionDenied,
  locationPermissionDenied,
  onRequestPermissions,
  onUseFallbackLocation,
}) => {
  return (
    <div className="p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 max-w-md mx-auto text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-bold text-base text-slate-100">
          Hardware Permissions Required
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The GIS Camera attaches verified geospatial coordinates, elevation, and timestamp evidence directly to hazard incident photos for Emergency Operations Centers (EOC).
        </p>
      </div>

      <div className="space-y-2 text-left text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
        <div className="flex items-start space-x-2.5">
          <div className={`p-1.5 rounded-lg shrink-0 ${cameraPermissionDenied ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>Camera Sensor</span>
              {cameraPermissionDenied ? (
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">Blocked / Denied</span>
              ) : (
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded">Prompting</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Captures on-site visual evidence of slope failure and highway blockage.</p>
          </div>
        </div>

        <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-800/80">
          <div className={`p-1.5 rounded-lg shrink-0 ${locationPermissionDenied ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <span>GPS Geolocation</span>
              {locationPermissionDenied ? (
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded">Blocked / Denied</span>
              ) : (
                <span className="text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded">Prompting</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Records sub-meter GPS accuracy, elevation, and lifeline highway corridor.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onRequestPermissions}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Grant Sensor Permissions & Retry</span>
        </button>

        {onUseFallbackLocation && (
          <button
            type="button"
            onClick={onUseFallbackLocation}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-slate-700"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Use NER Haflong Highway Sector Preset</span>
          </button>
        )}
      </div>

      <p className="text-[10px] text-slate-500">
        If permissions are persistently blocked, click the padlock / site settings icon in your browser address bar to allow Camera and Location.
      </p>
    </div>
  );
};
