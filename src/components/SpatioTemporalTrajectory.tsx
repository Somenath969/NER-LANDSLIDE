import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { LocationData, RiskTrajectoryPoint, RiskLevel } from '../types';

interface SpatioTemporalTrajectoryProps {
  locations: LocationData[];
  selectedLocation: LocationData;
  onSelectLocation?: (loc: LocationData) => void;
}

export const SpatioTemporalTrajectory: React.FC<SpatioTemporalTrajectoryProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  // Default trajectory points if not present
  const defaultTrajectory: RiskTrajectoryPoint[] = [
    { time: '08:00', timestamp: '2026-08-29T08:00:00Z', riskScore: 31, riskLevel: 'MODERATE', rainfallHourlyMm: 3.2, soilMoisturePercent: 54, groundMovementMm: 1.8, statusNote: 'Normal monsoon baseline' },
    { time: '10:00', timestamp: '2026-08-29T10:00:00Z', riskScore: 43, riskLevel: 'MODERATE', rainfallHourlyMm: 8.5, soilMoisturePercent: 62, groundMovementMm: 3.4, statusNote: 'Precipitation accelerating' },
    { time: '12:00', timestamp: '2026-08-29T12:00:00Z', riskScore: 57, riskLevel: 'HIGH', rainfallHourlyMm: 14.8, soilMoisturePercent: 73, groundMovementMm: 6.9, statusNote: 'Pore pressure surge detected' },
    { time: '14:00', timestamp: '2026-08-29T14:00:00Z', riskScore: 69, riskLevel: 'HIGH', rainfallHourlyMm: 18.2, soilMoisturePercent: 81, groundMovementMm: 10.5, statusNote: 'Subsurface tilt rates doubling' },
    { time: '16:00', timestamp: '2026-08-29T16:00:00Z', riskScore: 82, riskLevel: 'CRITICAL', rainfallHourlyMm: 22.0, soilMoisturePercent: 86, groundMovementMm: 14.8, statusNote: '⚠️ Rapidly escalating risk detected' },
  ];

  const trajectory = selectedLocation.trajectory || defaultTrajectory;
  const [activeStepIndex, setActiveStepIndex] = useState<number>(trajectory.length - 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeModelTab, setActiveModelTab] = useState<'TRAJECTORY' | 'SPATIO_TEMPORAL_FEATURES' | 'LSTM_ARCHITECTURE'>('TRAJECTORY');

  const currentPoint = trajectory[activeStepIndex] || trajectory[trajectory.length - 1];

  // Play animation through hourly progression
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= trajectory.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, trajectory.length]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100 max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 max-w-full">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Spatio-Temporal AI & Risk Trajectory Engine
                <span className="text-xs bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
                  Location × Time Dynamics
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Learns how risk evolves over time instead of static heatmaps. Flags rapidly escalating slope trajectories.
              </p>
            </div>
          </div>
        </div>

        {/* Road/Location Selector & View Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto max-w-full min-w-0">
          <div className="w-full sm:w-64 md:w-80 max-w-full min-w-0">
            <select
              value={selectedLocation.id}
              onChange={(e) => {
                const found = locations.find((l) => l.id === e.target.value);
                if (found && onSelectLocation) {
                  onSelectLocation(found);
                }
              }}
              className="w-full max-w-full bg-slate-850 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-cyan-500 font-medium truncate block shadow-sm"
              title="Select Road Corridor / Slope Location"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">
                  {loc.name} ({loc.district}, {loc.state})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-slate-850 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-thin max-w-full min-w-0">
            <button
              onClick={() => setActiveModelTab('TRAJECTORY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeModelTab === 'TRAJECTORY'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Trajectory
            </button>
            <button
              onClick={() => setActiveModelTab('SPATIO_TEMPORAL_FEATURES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeModelTab === 'SPATIO_TEMPORAL_FEATURES'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spatial vs Temporal
            </button>
            <button
              onClick={() => setActiveModelTab('LSTM_ARCHITECTURE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeModelTab === 'LSTM_ARCHITECTURE'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LSTM / Transformer
            </button>
          </div>
        </div>
      </div>

      {activeModelTab === 'TRAJECTORY' && (
        <div className="space-y-6">
          {/* Risk Trajectory Banner Alert */}
          <div className="p-4 bg-rose-950/60 border border-rose-600/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-rose-600/30 text-rose-400 rounded-xl animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                  Dynamic Alert Notification
                </span>
                <p className="text-sm font-bold text-slate-100">
                  ⚠ Rapidly escalating risk detected in {selectedLocation.name}
                </p>
                <p className="text-xs text-rose-200/80">
                  Risk score jumped from {trajectory[0].riskScore} ({trajectory[0].riskLevel}) at {trajectory[0].time} to {trajectory[trajectory.length - 1].riskScore} ({trajectory[trajectory.length - 1].riskLevel}) at {trajectory[trajectory.length - 1].time} (+{(trajectory[trajectory.length - 1].riskScore - trajectory[0].riskScore)} pts in 8h).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Timeline' : 'Replay Escalation'}</span>
              </button>
              <button
                onClick={() => {
                  setActiveStepIndex(0);
                  setIsPlaying(false);
                }}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                title="Reset to 08:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hourly Timeline Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {trajectory.map((point, idx) => {
              const isSelected = idx === activeStepIndex;
              const isCritical = point.riskLevel === 'CRITICAL';
              const isHigh = point.riskLevel === 'HIGH';

              return (
                <button
                  key={point.time}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-xl ring-2 ring-cyan-500/30'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-slate-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {point.time}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border-yellow-800'
                      }`}
                    >
                      {point.riskLevel}
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold font-['Outfit'] text-slate-100 mb-2">
                    {point.riskScore}
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                    <div className="flex justify-between">
                      <span>Rain:</span>
                      <strong className="text-slate-200">{point.rainfallHourlyMm} mm/h</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Soil Sat:</span>
                      <strong className="text-slate-200">{point.soilMoisturePercent}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Creep:</span>
                      <strong className="text-slate-200">{point.groundMovementMm} mm/d</strong>
                    </div>
                  </div>

                  {/* Progress Bar inside card */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${point.riskScore}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Time Step Detail Callout */}
          <div className="bg-slate-850 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-800 font-bold">
                  Time Step: {currentPoint.time}
                </span>
                <span className="text-sm font-bold text-slate-100">{currentPoint.statusNote}</span>
              </div>
              <span className="text-xs text-slate-400">
                Risk Velocity (dRisk/dt): <strong className="text-rose-400 font-mono">+6.4 pts/hr</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Instantaneous Precipitation</span>
                <strong className="text-cyan-300 text-sm font-mono">{currentPoint.rainfallHourlyMm} mm/h</strong>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Volumetric Soil Moisture</span>
                <strong className="text-amber-300 text-sm font-mono">{currentPoint.soilMoisturePercent}% Saturation</strong>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">InSAR / Tilt Creep Velocity</span>
                <strong className="text-purple-300 text-sm font-mono">{currentPoint.groundMovementMm} mm/day</strong>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Response Protocol Triggered</span>
                <strong className="text-rose-400 text-sm font-bold">
                  {currentPoint.riskScore >= 75 ? 'Level 3 Evac Alert' : currentPoint.riskScore >= 50 ? 'Pre-Warning' : 'Routine Poll'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModelTab === 'SPATIO_TEMPORAL_FEATURES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spatial Features */}
          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm text-slate-100">Spatial Features (Static Topo & Geo)</h4>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Slope Gradient (°)', value: `${selectedLocation.slopeDeg}°`, desc: 'Cartosat 10m DEM high slope incline' },
                { label: 'Elevation (m)', value: `${selectedLocation.elevationM} m`, desc: 'Altitude above mean sea level' },
                { label: 'Geology / Lithology', value: selectedLocation.geology, desc: 'Weathered friable rock formation' },
                { label: 'Curvature & Aspect', value: `${selectedLocation.curvature} / ${selectedLocation.aspect}`, desc: 'Concentrates subterranean water flow' },
                { label: 'Distance to Road (m)', value: `${selectedLocation.distanceToRoadM} m`, desc: 'Anthropogenic cut-slope toe proximity' },
                { label: 'Vegetation Index (NDVI)', value: `${selectedLocation.vegetationNDVI}`, desc: 'Sentinel-2 canopy root cohesion' },
              ].map((f) => (
                <div key={f.label} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-200 block">{f.label}</strong>
                    <span className="text-[10px] text-slate-400">{f.desc}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">{f.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Temporal Features */}
          <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h4 className="font-bold text-sm text-slate-100">Temporal Features (Dynamic Time-Series)</h4>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Rainfall Last 1 Hour', value: `${selectedLocation.rainfall1h} mm`, desc: 'Burst intensity trigger' },
                { label: 'Rainfall Last 6 Hours', value: `${selectedLocation.rainfall6h} mm`, desc: 'Short-term saturation rate' },
                { label: 'Rainfall Last 24 Hours', value: `${selectedLocation.rainfall24h} mm`, desc: 'Primary threshold benchmark' },
                { label: 'Rainfall Last 72 Hours (Antecedent)', value: `${selectedLocation.rainfall72h} mm`, desc: 'Deep soil moisture buildup' },
                { label: 'Soil Moisture Trend', value: `${selectedLocation.soilMoisturePercent}% (Rising +4%/hr)`, desc: 'Capacitance probe telemetry' },
                { label: 'Ground Movement Trend', value: `${selectedLocation.groundMovementMmDay} mm/day (Accelerating)`, desc: 'InSAR & borehole tilt rate' },
                { label: 'IMD Forecast Next 24 Hours', value: `${selectedLocation.rainfallForecast24h} mm`, desc: 'Numerical Weather Prediction (NWP)' },
              ].map((f) => (
                <div key={f.label} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-200 block">{f.label}</strong>
                    <span className="text-[10px] text-slate-400">{f.desc}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModelTab === 'LSTM_ARCHITECTURE' && (
        <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h4 className="font-bold text-sm text-slate-100">
              Spatio-Temporal Pipeline: XGBoost Baseline ➔ LSTM / Temporal Transformer Scalability
            </h4>
          </div>

          <p className="text-slate-300 leading-relaxed">
            The SIH prototype implements Gradient Boosted Decision Trees (XGBoost) with rich temporal feature engineering (rolling windows for 1h, 6h, 24h, 72h antecedent rainfall and acceleration derivatives). The scalable production roadmap incorporates a Spatial Graph Convolutional Network (GCN) coupled with a Bidirectional LSTM / Temporal Transformer for multi-step horizon forecasting.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <strong className="text-slate-200 block">Spatial Graph Encoder</strong>
              <span className="text-[10px] text-slate-400">DEM Slope + Lithology + Road Cuts</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <strong className="text-slate-200 block">Temporal Attention / LSTM</strong>
              <span className="text-[10px] text-slate-400">72-Hour Sequential Precipitation</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <strong className="text-slate-200 block">Cross-Attention Fusion</strong>
              <span className="text-[10px] text-slate-400">Pore Pressure × Slope Velocity</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <strong className="text-slate-200 block">Trajectory Predictor</strong>
              <span className="text-[10px] text-slate-400">6h, 12h, 24h Risk Trajectory</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
