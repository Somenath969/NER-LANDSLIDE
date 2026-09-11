import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sliders,
  Check,
  Share2,
  Download,
  Eye,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Clock,
  Compass,
  FileCheck2,
} from 'lucide-react';
import { GisEvidenceMetadata, GisStampConfig } from '../../types';
import { GeoMetadataCard } from './GeoMetadataCard';
import { StampCustomizer } from './StampCustomizer';
import { LocationShare } from './LocationShare';
import { renderGisStampOnCanvas, formatCoordinates } from './gisUtils';

interface PhotoEvidencePreviewProps {
  originalPhotoUrl: string;
  initialStampedPhotoUrl: string;
  metadata: GisEvidenceMetadata;
  stampConfig: GisStampConfig;
  onUpdateStampConfig: (config: GisStampConfig) => void;
  onRetake: () => void;
  onUsePhoto: (stampedPhotoUrl: string, originalPhotoUrl: string, metadata: GisEvidenceMetadata) => void;
  onClose: () => void;
}

export const PhotoEvidencePreview: React.FC<PhotoEvidencePreviewProps> = ({
  originalPhotoUrl,
  initialStampedPhotoUrl,
  metadata,
  stampConfig,
  onUpdateStampConfig,
  onRetake,
  onUsePhoto,
  onClose,
}) => {
  const [stampedUrl, setStampedUrl] = useState<string>(initialStampedPhotoUrl);
  const [viewMode, setViewMode] = useState<'stamped' | 'original'>('stamped');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReRendering, setIsReRendering] = useState(false);

  // When stampConfig or metadata changes, re-burn canvas stamp
  useEffect(() => {
    let isMounted = true;
    const reRender = async () => {
      setIsReRendering(true);
      try {
        const updated = await renderGisStampOnCanvas(originalPhotoUrl, metadata, stampConfig);
        if (isMounted) {
          setStampedUrl(updated);
        }
      } catch (e) {
        // Fallback
      } finally {
        if (isMounted) setIsReRendering(false);
      }
    };
    reRender();
    return () => {
      isMounted = false;
    };
  }, [stampConfig, metadata, originalPhotoUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = viewMode === 'stamped' ? stampedUrl : originalPhotoUrl;
    link.download = `${metadata.incidentId}-${viewMode === 'stamped' ? 'GIS-STAMPED' : 'ORIGINAL'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmUse = () => {
    onUsePhoto(stampedUrl, originalPhotoUrl, metadata);
  };

  return (
    <div className="fixed inset-0 z-[780] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-100">
                  GIS Evidence Captured
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                  GPS RECORDED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Verified incident location & photographic survey stamp ready for dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('stamped')}
                className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                  viewMode === 'stamped'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stamped
              </button>
              <button
                type="button"
                onClick={() => setViewMode('original')}
                className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                  viewMode === 'original'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw
              </button>
            </div>
          </div>
        </div>

        {/* Content Body with Image & Stamp Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main Visual Image Canvas Preview */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
            <img
              src={viewMode === 'stamped' ? stampedUrl : originalPhotoUrl}
              alt="Captured GIS Evidence"
              className="w-full max-h-[52vh] object-contain mx-auto transition-all"
            />

            {isReRendering && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                <span className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-bold text-xs flex items-center space-x-1.5">
                  <span>Re-rendering GIS Stamp…</span>
                </span>
              </div>
            )}

            {/* Quick action bar overlay on top right */}
            <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 z-20">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="p-2 bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md text-emerald-400 rounded-xl border border-slate-700 shadow-lg text-xs flex items-center space-x-1"
                title="Share GIS Location"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Share</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 bg-slate-900/90 hover:bg-slate-850 backdrop-blur-md text-slate-200 rounded-xl border border-slate-700 shadow-lg text-xs"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Structured Metadata Readout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Incident ID</span>
              <span className="font-mono font-bold text-slate-200 truncate block">{metadata.incidentId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">GPS Coordinates</span>
              <span className="font-mono font-bold text-amber-400 truncate block">
                {metadata.latitude.toFixed(4)}°N, {metadata.longitude.toFixed(4)}°E
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Accuracy & Alt</span>
              <span className="font-medium text-emerald-400 truncate block">
                ±{Math.round(metadata.accuracyMeters)}m • {metadata.altitudeMeters || 0}m Alt
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase font-mono">Captured Time</span>
              <span className="font-medium text-slate-300 truncate block">{metadata.timestamp}</span>
            </div>
          </div>

          {/* Low Accuracy Warning notice if accuracy is poor */}
          {metadata.accuracyMeters > 50 && (
            <div className="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl flex items-center space-x-2 text-[11px] text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Note:</strong> GPS precision is recorded at ±{Math.round(metadata.accuracyMeters)}m. Coordinates are attached as recorded.
              </span>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onRetake}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Stamp</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="hidden sm:flex px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs items-center space-x-1.5 border border-slate-700"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share Location</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmUse}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Use Photo & Attach</span>
            </button>
          </div>
        </div>

        {/* Modals for Customizer and Share */}
        {isCustomizerOpen && (
          <StampCustomizer
            config={stampConfig}
            onChange={onUpdateStampConfig}
            onClose={() => setIsCustomizerOpen(false)}
          />
        )}

        {isShareOpen && (
          <LocationShare
            metadata={metadata}
            onClose={() => setIsShareOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
