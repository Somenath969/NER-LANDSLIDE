import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CloudRain,
  Mountain,
  Compass,
  Layers,
  Activity,
  Users,
  AlertTriangle,
  Sparkles,
  Zap,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { LocationData, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface LocationInspectorModalProps {
  location: LocationData | null;
  onClose: () => void;
  onSimulateSurge: (locId: string, additionalRainMm: number) => void;
  currentLang: LanguageCode;
}

export const LocationInspectorModal: React.FC<LocationInspectorModalProps> = ({
  location,
  onClose,
  onSimulateSurge,
  currentLang,
}) => {
  const [sliderRain, setSliderRain] = useState(50);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!location) return null;
  const t = translations[currentLang] || translations.en;

  const handleApplySurge = (rainAmount: number) => {
    setIsSimulating(true);
    onSimulateSurge(location.id, rainAmount);
    setTimeout(() => setIsSimulating(false), 400);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MODERATE':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div
              className={`p-2.5 rounded-xl border ${getRiskColor(
                location.riskLevel
              )} flex items-center justify-center`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-100">{location.name}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskColor(
                    location.riskLevel
                  )}`}
                >
                  {location.riskLevel} RISK ({location.riskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {location.district}, {location.state} • Elevation: {location.elevationM}m MSL • Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metric Score Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 flex items-center">
                <CloudRain className="w-3.5 h-3.5 mr-1 text-blue-400" />
                24h Rainfall
              </span>
              <p className="text-lg font-extrabold text-blue-400 mt-1">
                {location.rainfall24h.toFixed(1)} <span className="text-xs font-normal text-slate-300">mm</span>
              </p>
              <span className="text-[10px] text-slate-400">72h: {location.rainfall72h.toFixed(1)} mm</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 flex items-center">
                <Activity className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                Soil Moisture
              </span>
              <p className="text-lg font-extrabold text-cyan-400 mt-1">
                {location.soilMoisturePercent.toFixed(0)}% <span className="text-xs font-normal text-slate-300">vol</span>
              </p>
              <span className="text-[10px] text-slate-400">Pore saturation</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 flex items-center">
                <Mountain className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Slope Angle
              </span>
              <p className="text-lg font-extrabold text-amber-400 mt-1">
                {location.slopeDeg}° <span className="text-xs font-normal text-slate-300">steep</span>
              </p>
              <span className="text-[10px] text-slate-400">{location.curvature} / {location.aspect}</span>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-[11px] text-slate-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1 text-rose-400" />
                Ground Creep
              </span>
              <p className="text-lg font-extrabold text-rose-400 mt-1">
                {location.groundMovementMmDay.toFixed(1)} <span className="text-xs font-normal text-slate-300">mm/day</span>
              </p>
              <span className="text-[10px] text-slate-400">InSAR Telemetry</span>
            </div>
          </div>

          {/* Explainable AI & Factor Weight Attribution */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center uppercase tracking-wider">
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-400" />
                AI Factor Attribution & SHAP Weights
              </h4>
              <span className="text-[11px] text-slate-400">XGBoost ML v2.4</span>
            </div>

            <div className="space-y-2.5">
              {location.majorFactors.map((fact, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">{fact.factor}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {fact.weightPercent}% weight • {fact.description}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fact.level === 'CRITICAL'
                          ? 'bg-red-500'
                          : fact.level === 'HIGH'
                          ? 'bg-orange-500'
                          : fact.level === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fact.weightPercent * 2.5}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* AI Explanation Box */}
            <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-amber-400 mb-1">🤖 AI Landslide Diagnostic:</p>
              <p>{location.aiExplanation}</p>
            </div>
          </div>

          {/* Recommended Operational Action Protocol */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-700/80">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
              Standard Operating Protocol (NDMA/ASDMA)
            </h4>
            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-700 leading-relaxed">
              {location.recommendedAction}
            </p>
          </div>

          {/* Vulnerable Communities & Infrastructure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-xs font-bold text-slate-300 flex items-center mb-2">
                <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Vulnerable Settlements ({location.populationAtRisk.toLocaleString()} residents)
              </span>
              <ul className="space-y-1 text-xs text-slate-400">
                {location.vulnerableVillages.map((v, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-xs font-bold text-slate-300 flex items-center mb-2">
                <Building className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                Lifeline Infrastructure at Risk
              </span>
              <ul className="space-y-1 text-xs text-slate-400">
                {location.nearbyInfrastructure.map((inf, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Simulation Sandpit (Surge Simulator) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-xl border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center uppercase tracking-wider">
                <Zap className="w-4 h-4 mr-1.5 text-amber-400" />
                Interactive Weather Spike Simulation
              </h4>
              <span className="text-[11px] text-amber-400 font-mono">Real-Time Risk Re-calculation</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Simulate an incoming heavy cloudburst/monsoon spell on this specific slope to test automated AI threshold triggers.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleApplySurge(40)}
                disabled={isSimulating}
                className="bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 transition-all active:scale-95 flex items-center space-x-1"
              >
                <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                <span>+40mm Heavy Rain</span>
              </button>

              <button
                onClick={() => handleApplySurge(85)}
                disabled={isSimulating}
                className="bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs px-3 py-1.5 rounded-lg border border-amber-500/40 transition-all active:scale-95 flex items-center space-x-1"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>+85mm Torrential Monsoon</span>
              </button>

              <button
                onClick={() => handleApplySurge(130)}
                disabled={isSimulating}
                className="bg-red-950/60 hover:bg-red-900 text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-500/40 transition-all active:scale-95 flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                <span>+130mm Cloudburst Surge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Last telemetry synced: {new Date(location.lastUpdated).toLocaleTimeString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
