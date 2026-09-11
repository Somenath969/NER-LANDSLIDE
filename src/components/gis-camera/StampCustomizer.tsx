import React from 'react';
import { X, Sliders, CheckSquare, Square, RotateCcw, Sparkles } from 'lucide-react';
import { GisStampConfig } from '../../types';
import { DEFAULT_STAMP_CONFIG } from './gisUtils';

interface StampCustomizerProps {
  config: GisStampConfig;
  onChange: (config: GisStampConfig) => void;
  onClose: () => void;
}

export const StampCustomizer: React.FC<StampCustomizerProps> = ({
  config,
  onChange,
  onClose,
}) => {
  const toggleKey = (key: keyof GisStampConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  const handleResetDefaults = () => {
    onChange({ ...DEFAULT_STAMP_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">GIS Stamp Configuration</h3>
              <p className="text-[10px] text-slate-400">Customize on-image geospatial survey metadata burned into evidence</p>
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Default Template Notice */}
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-300">NDMA / GSI Standard Field Stamp Template</span>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Checklist of stamp fields */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">Display Stamp Fields</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'showLocation', label: 'Geographic Location' },
                { key: 'showCoordinates', label: 'Lat / Long Coordinates' },
                { key: 'showDateTime', label: 'Date & Exact Time (IST)' },
                { key: 'showAltitude', label: 'Altitude / Elevation' },
                { key: 'showGpsAccuracy', label: 'GPS Accuracy (±m)' },
                { key: 'showMiniMap', label: 'Mini Map Thumbnail' },
                { key: 'showRoad', label: 'Road / Highway Lifeline' },
                { key: 'showHazardType', label: 'Hazard Category' },
                { key: 'showSeverity', label: 'Severity Level' },
                { key: 'showIncidentId', label: 'Unique Incident ID' },
                { key: 'showWeather', label: 'Weather Telemetry' },
                { key: 'showCompass', label: 'Compass Heading' },
              ].map(({ key, label }) => {
                const isChecked = !!config[key as keyof GisStampConfig];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleKey(key as keyof GisStampConfig)}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition-colors ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                    <span className="text-[11px] font-medium truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Map Placement & Style */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Map Position</label>
              <select
                value={config.mapPosition}
                onChange={(e) => onChange({ ...config, mapPosition: e.target.value as any })}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
              >
                <option value="left">Left Side</option>
                <option value="right">Right Side</option>
                <option value="none">Disabled (No Map)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Map Layer Style</label>
              <select
                value={config.mapStyle}
                onChange={(e) => onChange({ ...config, mapStyle: e.target.value as any })}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
              >
                <option value="terrain">Topographic Terrain</option>
                <option value="satellite">Satellite Imagery</option>
                <option value="standard">Standard Vector Grid</option>
              </select>
            </div>
          </div>

          {/* Typography & Card Appearance */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Font Size</label>
              <select
                value={config.fontSize}
                onChange={(e) => onChange({ ...config, fontSize: e.target.value as any })}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
              >
                <option value="small">Compact (Small)</option>
                <option value="medium">Standard (Medium)</option>
                <option value="large">High Visibility (Large)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Card Theme</label>
              <select
                value={config.theme}
                onChange={(e) => onChange({ ...config, theme: e.target.value as any })}
                className="w-full bg-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
              >
                <option value="dark">Emergency Dark Navy</option>
                <option value="light">Survey Light Slate</option>
              </select>
            </div>
          </div>

          {/* Card Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300">Banner Background Opacity</label>
              <span className="font-mono text-amber-400 font-bold">{config.cardOpacity}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={config.cardOpacity}
              onChange={(e) => onChange({ ...config, cardOpacity: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>Semi-Transparent (40%)</span>
              <span>Solid Contrast (100%)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
          >
            Apply Stamp Settings
          </button>
        </div>
      </div>
    </div>
  );
};
