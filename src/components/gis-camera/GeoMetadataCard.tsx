import React from 'react';
import { MapPin, Navigation, Clock, AlertTriangle, ShieldCheck, CloudRain, Compass } from 'lucide-react';
import { GisEvidenceMetadata, GisStampConfig } from '../../types';
import { MapPreview } from './MapPreview';
import { formatCoordinates } from './gisUtils';

interface GeoMetadataCardProps {
  metadata: GisEvidenceMetadata;
  config: GisStampConfig;
  className?: string;
  onMapStyleChange?: (style: 'standard' | 'satellite' | 'terrain') => void;
}

export const GeoMetadataCard: React.FC<GeoMetadataCardProps> = ({
  metadata,
  config,
  className = '',
  onMapStyleChange,
}) => {
  const isDark = config.theme !== 'light';
  const opacity = (config.cardOpacity || 88) / 100;

  // Font size modifiers
  const titleSize = config.fontSize === 'large' ? 'text-sm sm:text-base' : config.fontSize === 'small' ? 'text-xs' : 'text-xs sm:text-sm';
  const bodySize = config.fontSize === 'large' ? 'text-xs' : config.fontSize === 'small' ? 'text-[10px]' : 'text-[11px]';
  const monoSize = config.fontSize === 'large' ? 'text-[11px]' : 'text-[10px]';

  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden p-3 sm:p-4 shadow-2xl backdrop-blur-md ${
        isDark
          ? 'bg-slate-950/90 border-slate-700/80 text-slate-100'
          : 'bg-slate-100/95 border-slate-300 text-slate-900'
      } ${className}`}
      style={{
        backgroundColor: isDark ? `rgba(2, 6, 23, ${opacity})` : `rgba(241, 245, 249, ${opacity})`,
      }}
    >
      {/* Top Hazard Accent Bar */}
      <div
        className={`-mt-3 -mx-3 sm:-mt-4 sm:-mx-4 mb-2.5 h-1 ${
          metadata.severity === 'Critical'
            ? 'bg-red-500'
            : metadata.severity === 'High'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />

      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${config.mapPosition === 'right' ? 'sm:flex-row-reverse' : ''}`}>
        {/* Small Map Thumbnail */}
        {config.showMiniMap && config.mapPosition !== 'none' && (
          <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28">
            <MapPreview
              latitude={metadata.latitude}
              longitude={metadata.longitude}
              roadName={metadata.road}
              locationName={metadata.address}
              style={config.mapStyle}
              onStyleChange={onMapStyleChange}
              interactive={true}
              className="w-full h-full"
            />
          </div>
        )}

        {/* GIS / Hazard Survey Information */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Row 1: Hazard Category & Severity */}
          {(config.showHazardType || config.showSeverity) && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                    metadata.severity === 'Critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : metadata.severity === 'High'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{metadata.hazardType}</span>
                </span>

                <span
                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    metadata.severity === 'Critical'
                      ? 'text-rose-400'
                      : metadata.severity === 'High'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {metadata.severity} — {metadata.severity === 'Critical' ? 'ROAD BLOCKED' : 'ACTIVE RESTRICTION'}
                </span>
              </div>

              {config.showIncidentId && (
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-200 text-slate-700'}`}>
                  {metadata.incidentId}
                </span>
              )}
            </div>
          )}

          {/* Row 2: Location Name, District, State */}
          {config.showLocation && (
            <div className="flex items-start space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h4 className={`font-bold leading-snug truncate ${titleSize} ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {metadata.address || `${metadata.district}, ${metadata.state}`}
                </h4>
              </div>
            </div>
          )}

          {/* Row 3: Road / Highway Lifeline */}
          {config.showRoad && metadata.road && (
            <div className={`flex items-center space-x-1.5 font-semibold text-amber-500 ${bodySize}`}>
              <span className="font-bold">🛣️</span>
              <span className="truncate">{metadata.road}</span>
            </div>
          )}

          {/* Row 4: Coordinates, Altitude, GPS Accuracy */}
          {(config.showCoordinates || config.showAltitude || config.showGpsAccuracy) && (
            <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-mono ${monoSize} ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {config.showCoordinates && (
                <span className="font-semibold text-slate-200">
                  {formatCoordinates(metadata.latitude, metadata.longitude)}
                </span>
              )}

              {config.showAltitude && metadata.altitudeMeters !== undefined && (
                <span className="text-slate-400">
                  Alt: <strong>{metadata.altitudeMeters} m</strong>
                </span>
              )}

              {config.showGpsAccuracy && (
                <span className="inline-flex items-center text-emerald-400 font-medium">
                  GPS Acc: ±{Math.round(metadata.accuracyMeters)} m
                </span>
              )}
            </div>
          )}

          {/* Row 5: Date, Time (IST), Weather, Compass */}
          <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 ${bodySize} ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {config.showDateTime && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{metadata.timestamp}</span>
              </span>
            )}

            {config.showWeather && metadata.weather && (
              <span className="flex items-center space-x-1 text-sky-400">
                <CloudRain className="w-3 h-3" />
                <span>{metadata.weather}</span>
              </span>
            )}

            {config.showCompass && metadata.compassDirection && (
              <span className="flex items-center space-x-1 text-slate-300">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>{metadata.compassDirection}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
