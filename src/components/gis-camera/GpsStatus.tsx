import React from 'react';
import { Navigation, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatCoordinates } from './gisUtils';

interface GpsStatusProps {
  isAcquiring: boolean;
  isLocked: boolean;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  altitudeMeters?: number;
  onRefresh?: () => void;
  compact?: boolean;
}

export const GpsStatus: React.FC<GpsStatusProps> = ({
  isAcquiring,
  isLocked,
  latitude,
  longitude,
  accuracyMeters,
  altitudeMeters,
  onRefresh,
  compact = false,
}) => {
  // Accuracy categorization
  const isHighAccuracy = accuracyMeters !== undefined && accuracyMeters <= 15;
  const isModerateAccuracy = accuracyMeters !== undefined && accuracyMeters > 15 && accuracyMeters <= 50;
  const isLowAccuracy = accuracyMeters !== undefined && accuracyMeters > 50;

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full text-[11px] shadow-lg">
        {isAcquiring ? (
          <>
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-amber-300 font-medium">Acquiring GPS…</span>
          </>
        ) : isLocked && latitude && longitude ? (
          <>
            <div className={`w-2 h-2 rounded-full ${isHighAccuracy ? 'bg-emerald-400 animate-pulse' : isModerateAccuracy ? 'bg-amber-400' : 'bg-rose-400'}`} />
            <span className="text-slate-200 font-mono text-[10px]">
              {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E (±{Math.round(accuracyMeters || 5)}m)
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span className="text-rose-300 font-medium">No GPS Fix</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-200">GPS Status:</span>
              {isAcquiring ? (
                <span className="inline-flex items-center text-amber-300 font-bold space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                  Acquiring GPS Signal…
                </span>
              ) : isLocked && latitude && longitude ? (
                <span className="inline-flex items-center text-emerald-400 font-bold space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  GPS Locked ±{Math.round(accuracyMeters || 5)} m
                </span>
              ) : (
                <span className="text-rose-400 font-bold">Signal Searching</span>
              )}
            </div>

            {latitude && longitude && (
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                {formatCoordinates(latitude, longitude)}
                {altitudeMeters ? ` • Alt: ${altitudeMeters}m` : ''}
              </p>
            )}
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            type="button"
            title="Refresh GPS Fix"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAcquiring ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        )}
      </div>

      {/* Low Accuracy Warning (Never silently use poor GPS, guide field officer) */}
      {isLowAccuracy && (
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-rose-950/70 border border-rose-500/40 rounded-lg text-[11px] text-rose-200 animate-fadeIn">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>
            <strong>⚠ Low GPS Accuracy (±{Math.round(accuracyMeters!)}m):</strong> Move outdoors or wait for clearer line-of-sight to satellite constellation.
          </span>
        </div>
      )}
    </div>
  );
};
