import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, MapPin, Navigation, Send, Smartphone } from 'lucide-react';
import { GisEvidenceMetadata } from '../../types';
import { formatCoordinates } from './gisUtils';

interface LocationShareProps {
  metadata: GisEvidenceMetadata;
  onClose: () => void;
}

export const LocationShare: React.FC<LocationShareProps> = ({
  metadata,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const googleMapsUrl = `https://www.google.com/maps?q=${metadata.latitude},${metadata.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${metadata.latitude}&mlon=${metadata.longitude}#map=16/${metadata.latitude}/${metadata.longitude}`;

  const formattedCoordinates = `${metadata.latitude.toFixed(6)}, ${metadata.longitude.toFixed(6)}`;

  const dispatchSummary = `🚨 NER LANDSLIDE INCIDENT REPORT 🚨
ID: ${metadata.incidentId}
Hazard: ${metadata.hazardType} (${metadata.severity.toUpperCase()})
Location: ${metadata.address || `${metadata.district}, ${metadata.state}`}
Road Lifeline: ${metadata.road || 'N/A'}
Coordinates: ${metadata.latitude.toFixed(6)}° N, ${metadata.longitude.toFixed(6)}° E
GPS Accuracy: ±${Math.round(metadata.accuracyMeters)}m
Altitude: ${metadata.altitudeMeters || 0}m
Timestamp: ${metadata.timestamp}
Google Maps: ${googleMapsUrl}
OpenStreetMap: ${osmUrl}`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (e) {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Landslide GIS Evidence - ${metadata.incidentId}`,
          text: dispatchSummary,
          url: googleMapsUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard(dispatchSummary, 'summary');
    }
  };

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Share GIS Location & Evidence</h3>
              <p className="text-[10px] text-slate-400">Dispatch GPS coordinates to SDRF, PWD, or Police Control Room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Summary Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-xs">
                  {metadata.address || `${metadata.district}, ${metadata.state}`}
                </h4>
                {metadata.road && (
                  <p className="text-[11px] text-amber-400 font-medium">{metadata.road}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-300">
              <div>
                <span className="text-slate-500 block text-[9px]">COORDINATES</span>
                <span className="font-bold text-slate-200">{formattedCoordinates}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">GPS ACCURACY</span>
                <span className="font-bold text-emerald-400">±{Math.round(metadata.accuracyMeters)} meters</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2">
            {/* Native Mobile Share if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Share via WhatsApp / Emergency SMS</span>
              </button>
            )}

            {/* Copy Coordinates */}
            <button
              type="button"
              onClick={() => copyToClipboard(formattedCoordinates, 'coords')}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Decimal Coordinates ({formattedCoordinates})</span>
              </span>
              {copiedType === 'coords' ? (
                <span className="text-emerald-400 flex items-center space-x-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Copy Full Dispatch Report */}
            <button
              type="button"
              onClick={() => copyToClipboard(dispatchSummary, 'summary')}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition-colors"
            >
              <span className="flex items-center space-x-2">
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Full Incident Dispatch Report</span>
              </span>
              {copiedType === 'summary' ? (
                <span className="text-emerald-400 flex items-center space-x-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>

          {/* External Map Navigation Links */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Open in Navigation App
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-slate-300 hover:text-slate-100 transition-colors"
              >
                <span className="font-semibold text-[11px]">Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>

              <a
                href={osmUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-slate-300 hover:text-slate-100 transition-colors"
              >
                <span className="font-semibold text-[11px]">OpenStreetMap</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
