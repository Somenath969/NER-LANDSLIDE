import React, { useState } from 'react';
import { Layers, MapPin, Compass } from 'lucide-react';

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  roadName?: string;
  locationName?: string;
  style?: 'standard' | 'satellite' | 'terrain';
  onStyleChange?: (style: 'standard' | 'satellite' | 'terrain') => void;
  interactive?: boolean;
  className?: string;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  latitude,
  longitude,
  roadName,
  locationName,
  style = 'terrain',
  onStyleChange,
  interactive = false,
  className = '',
}) => {
  const [currentStyle, setCurrentStyle] = useState<'standard' | 'satellite' | 'terrain'>(style);

  const handleStyleToggle = (newStyle: 'standard' | 'satellite' | 'terrain') => {
    setCurrentStyle(newStyle);
    if (onStyleChange) onStyleChange(newStyle);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-md ${className}`}>
      {/* Visual Map Rendering based on style */}
      <div className="w-full h-full relative flex items-center justify-center">
        {currentStyle === 'satellite' ? (
          // Satellite Style
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950">
            {/* Mountain / forest contour textures */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-emerald-800/20 blur-xl" />
          </div>
        ) : currentStyle === 'terrain' ? (
          // Terrain Topography Style
          <div className="absolute inset-0 bg-slate-950">
            {/* Topo contour rings */}
            <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#475569" strokeWidth="1" />
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#334155" strokeWidth="1" />
              <path d="M 0 60 Q 60 40 120 70 T 240 50" fill="none" stroke="#334155" strokeWidth="1.5" />
            </svg>
          </div>
        ) : (
          // Standard Clean Vector Style
          <div className="absolute inset-0 bg-slate-900">
            {/* Grid */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>
        )}

        {/* Road line trace */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Highway trace */}
          <path
            d="M 10 90 Q 60 70 100 50 T 190 20"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 10 90 Q 60 70 100 50 T 190 20"
            fill="none"
            stroke="#FEF3C7"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>

        {/* Center Hazard Marker Pin */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-rose-500/30 animate-ping absolute -inset-1" />
            <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Compass N Arrow */}
        <div className="absolute top-1.5 right-1.5 z-20 flex items-center space-x-0.5 px-1 py-0.5 bg-slate-900/90 rounded text-[9px] font-mono text-slate-300 border border-slate-700">
          <Compass className="w-2.5 h-2.5 text-amber-400" />
          <span>N</span>
        </div>

        {/* GIS LOCATION Badge */}
        <div className="absolute bottom-1 left-1 right-1 z-20 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded px-1.5 py-0.5 flex items-center justify-between">
          <span className="text-[8.5px] font-bold text-amber-400 uppercase tracking-wider font-mono">
            GIS LOCATION
          </span>
          <span className="text-[8px] text-slate-400 font-mono">
            {latitude.toFixed(3)}°, {longitude.toFixed(3)}°
          </span>
        </div>
      </div>

      {/* Layer selector (when interactive) */}
      {interactive && (
        <div className="absolute top-1.5 left-1.5 z-20 flex bg-slate-900/90 rounded-md p-0.5 border border-slate-700/80 text-[9px]">
          <button
            type="button"
            onClick={() => handleStyleToggle('terrain')}
            className={`px-1.5 py-0.5 rounded ${currentStyle === 'terrain' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Terrain
          </button>
          <button
            type="button"
            onClick={() => handleStyleToggle('satellite')}
            className={`px-1.5 py-0.5 rounded ${currentStyle === 'satellite' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => handleStyleToggle('standard')}
            className={`px-1.5 py-0.5 rounded ${currentStyle === 'standard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Standard
          </button>
        </div>
      )}
    </div>
  );
};
