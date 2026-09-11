import React, { useState } from 'react';
import {
  Mountain,
  Truck,
  Users,
  Activity,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Info,
  Droplets,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LocationData, DigitalTwinProfile } from '../types';

interface DigitalTwinExplorerProps {
  locations: LocationData[];
  selectedLocation: LocationData;
  onSelectLocation?: (loc: LocationData) => void;
}

export const DigitalTwinExplorer: React.FC<DigitalTwinExplorerProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const twin: DigitalTwinProfile = selectedLocation.digitalTwin || {
    id: 'dt-default',
    locationId: selectedLocation.id,
    slopeHeightM: 160,
    slopeAngleDeg: selectedLocation.slopeDeg || 38,
    waterTableDepthM: 2.1,
    shearStrengthKPa: 32.0,
    poreWaterPressureKPa: 155.0,
    factorOfSafety: 0.89,
    stabilityStatus: 'FAILURE_IMMINENT',
    cohesionKPa: 14.0,
    frictionAngleDeg: 26,
    estimatedDebrisVolumeM3: 38000,
    atRiskVillageCount: selectedLocation.vulnerableVillages?.length || 4,
    atRiskPopulation: selectedLocation.populationAtRisk || 12000,
    roadIntersectLengthM: 1600,
    activeSensorsCount: 6,
    recommendedIntervention: 'Immediate heavy machinery earth berm reinforcement & road closure',
    simulationStep: 4,
  };

  // Interactive Digital Twin Sliders
  const [waterTableRise, setWaterTableRise] = useState<number>(1.2); // meters rise
  const [toeExcavation, setToeExcavation] = useState<boolean>(true);
  const [reinforcementInstalled, setReinforcementInstalled] = useState<boolean>(false);

  // Dynamic Factor of Safety (FOS) calculation
  // FOS = (c' + (sigma - u)*tan(phi)) / tau
  const baseFOS = 1.35;
  const waterPenalty = (waterTableRise - 0.5) * 0.32;
  const toePenalty = toeExcavation ? 0.22 : 0;
  const reinforcementBonus = reinforcementInstalled ? 0.45 : 0;

  const currentFOS = Math.max(0.65, Number((baseFOS - waterPenalty - toePenalty + reinforcementBonus).toFixed(2)));
  const isImminent = currentFOS < 1.0;
  const isMarginal = currentFOS >= 1.0 && currentFOS < 1.3;
  const isStable = currentFOS >= 1.3;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Digital Twin of Vulnerable Slope Infrastructure
                <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800">
                  Decision-Capable Twin
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous virtual representation of Mountain + Road + Village + Sensors + Rainfall + Soil with real-time Factor of Safety (FOS).
              </p>
            </div>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="w-full sm:w-64 md:w-80 max-w-full min-w-0">
          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const found = locations.find((l) => l.id === e.target.value);
              if (found && onSelectLocation) {
                onSelectLocation(found);
              }
            }}
            className="w-full max-w-full bg-slate-850 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 font-medium truncate block shadow-sm"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">
                {loc.name} ({loc.district}, {loc.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6 Structural Pillars of the Digital Twin */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-center">
        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <Mountain className="w-4 h-4 text-emerald-400 mx-auto" />
          <strong className="block text-slate-200">Mountain / Slope</strong>
          <span className="text-[10px] text-slate-400">{twin.slopeAngleDeg}° | {twin.slopeHeightM}m</span>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <Truck className="w-4 h-4 text-amber-400 mx-auto" />
          <strong className="block text-slate-200">Road Corridor</strong>
          <span className="text-[10px] text-slate-400">{twin.roadIntersectLengthM}m Highway</span>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <Users className="w-4 h-4 text-blue-400 mx-auto" />
          <strong className="block text-slate-200">Downslope Village</strong>
          <span className="text-[10px] text-slate-400">{twin.atRiskPopulation.toLocaleString()} Citizens</span>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <Activity className="w-4 h-4 text-cyan-400 mx-auto" />
          <strong className="block text-slate-200">IoT In-Situ Sensors</strong>
          <span className="text-[10px] text-slate-400">{twin.activeSensorsCount} Telemetry Nodes</span>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <Droplets className="w-4 h-4 text-indigo-400 mx-auto" />
          <strong className="block text-slate-200">Pore Pressure</strong>
          <span className="text-[10px] text-slate-400">{twin.poreWaterPressureKPa} kPa</span>
        </div>

        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
          <ShieldAlert className="w-4 h-4 text-rose-400 mx-auto" />
          <strong className="block text-slate-200">Debris Threat</strong>
          <span className="text-[10px] text-slate-400">{twin.estimatedDebrisVolumeM3.toLocaleString()} m³</span>
        </div>
      </div>

      {/* Interactive Geotechnical Cross-Section Diagram & Decision Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Cross-Section Visualization */}
        <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Geotechnical Cross-Section (Digital Twin Slice)
            </span>
            <span className="font-mono text-cyan-400 text-[11px]">Dynamic Slip Surface Simulation</span>
          </div>

          {/* SVG Canvas for Slope & Shear Plane */}
          <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <svg viewBox="0 0 500 240" className="w-full h-full">
              {/* Bedrock Polygon */}
              <polygon
                points="0,240 500,240 500,160 360,140 180,80 0,60"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Colluvium / Friable Soil Overburden */}
              <polygon
                points="0,60 180,80 360,140 500,160 500,130 380,90 220,30 0,15"
                fill={isImminent ? '#7f1d1d' : isMarginal ? '#78350f' : '#064e3b'}
                fillOpacity="0.45"
                stroke={isImminent ? '#ef4444' : isMarginal ? '#f59e0b' : '#10b981'}
                strokeWidth="2"
              />

              {/* Simulated Phreatic Water Table Line */}
              <path
                d={`M 0,${90 - waterTableRise * 15} Q 200,${120 - waterTableRise * 18} 500,${180 - waterTableRise * 10}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="6,4"
              />
              <text x="20" y={80 - waterTableRise * 15} fill="#38bdf8" fontSize="10" fontWeight="bold">
                Water Table Level (+{waterTableRise}m)
              </text>

              {/* Critical Shear Slip Plane Arc */}
              <path
                d="M 120,40 Q 260,130 420,155"
                fill="none"
                stroke={isImminent ? '#ff0000' : '#f97316'}
                strokeWidth={isImminent ? '4' : '2.5'}
                strokeDasharray={isImminent ? 'none' : '4,4'}
              />
              <text x="280" y="115" fill={isImminent ? '#ff4d4d' : '#fb923c'} fontSize="10" fontWeight="bold">
                {isImminent ? '⚠ ACTIVE SHEAR PLANE (FAILURE)' : 'Potential Shear Plane'}
              </text>

              {/* Highway Lifeline Marker */}
              <rect x="360" y="130" width="30" height="10" fill="#facc15" rx="2" />
              <text x="345" y="122" fill="#fef08a" fontSize="9" fontWeight="bold">
                NH Highway Lifeline
              </text>

              {/* Downslope Village Habitation */}
              <rect x="420" y="180" width="40" height="20" fill="#3b82f6" rx="3" fillOpacity="0.8" />
              <text x="415" y="172" fill="#93c5fd" fontSize="9" fontWeight="bold">
                Village Settlement
              </text>

              {/* Tiltmeter Sensor Node Marker */}
              <circle cx="210" cy="50" r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
              <text x="220" y="48" fill="#d8b4fe" fontSize="9" fontWeight="bold">
                IoT Tilt Node #04
              </text>

              {/* Piezometer Sensor */}
              <line x1="260" y1="70" x2="260" y2="135" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="260" cy="135" r="4" fill="#0284c7" />
              <text x="270" y="145" fill="#7dd3fc" fontSize="9">
                Piezometer ({twin.poreWaterPressureKPa} kPa)
              </text>

              {/* Reinforcement Soil Nails if active */}
              {reinforcementInstalled && (
                <>
                  <line x1="160" y1="45" x2="210" y2="90" stroke="#10b981" strokeWidth="3" />
                  <line x1="200" y1="60" x2="250" y2="105" stroke="#10b981" strokeWidth="3" />
                  <line x1="240" y1="75" x2="290" y2="120" stroke="#10b981" strokeWidth="3" />
                  <text x="140" y="35" fill="#34d399" fontSize="9" fontWeight="bold">
                    ✓ Soil Nailing & Concrete Berm Active
                  </text>
                </>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Lithology: <strong className="text-slate-200">{selectedLocation.geology}</strong></span>
            <span>Cohesion c&apos;: <strong className="text-slate-200">{twin.cohesionKPa} kPa</strong></span>
            <span>Friction Angle φ: <strong className="text-slate-200">{twin.frictionAngleDeg}°</strong></span>
          </div>
        </div>

        {/* Right: Factor of Safety & Decision-Making Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          {/* Factor of Safety Card */}
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Slope Stability (Factor of Safety)
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  isImminent
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : isMarginal
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                {isImminent ? 'FAILURE IMMINENT (FOS < 1.0)' : isMarginal ? 'MARGINAL STABILITY' : 'SAFE / STABLE'}
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-extrabold font-['Outfit'] text-slate-100">{currentFOS}</span>
              <span className="text-xs text-slate-400 font-mono">(Critical Threshold = 1.00)</span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isImminent ? 'bg-red-500' : isMarginal ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (currentFOS / 1.5) * 100)}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Geotechnical Limit Equilibrium Formula: FOS = [c&apos; + (&sigma;_n - u) &times; tan(&phi;&apos;)] / &tau;. As rainfall raises pore water pressure (u), effective normal stress drops, driving FOS below unity.
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
              Twin Stress Parameters:
            </div>

            {/* Water Table Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Monsoon Water Table Rise:</span>
                <span className="font-mono text-cyan-400 font-bold">+{waterTableRise.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="3.0"
                step="0.1"
                value={waterTableRise}
                onChange={(e) => setWaterTableRise(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Toe Excavation Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300">Highway Toe Excavation:</span>
              <button
                onClick={() => setToeExcavation(!toeExcavation)}
                className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                  toeExcavation
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {toeExcavation ? 'Excavated (-0.22 FOS)' : 'Intact Toe'}
              </button>
            </div>

            {/* Soil Nailing Intervention Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-300">Engineered Mitigation Berm:</span>
              <button
                onClick={() => setReinforcementInstalled(!reinforcementInstalled)}
                className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                  reinforcementInstalled
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {reinforcementInstalled ? 'Reinforced (+0.45 FOS)' : 'None'}
              </button>
            </div>
          </div>

          {/* Twin Decision Protocol Output */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Digital Twin Decision Protocol:
            </span>
            <p className="text-slate-200 font-semibold">
              {isImminent
                ? '🔴 RED PROTOCOL: Pre-emptive evacuation of lower 4 villages, deploy heavy earthmovers at KM 142 bypass, suspend railway freight.'
                : isMarginal
                ? '🟠 AMBER PROTOCOL: Hourly piezometer polling, install horizontal siphon drains, restrict heavy commercial vehicles.'
                : '🟢 GREEN PROTOCOL: Routine IoT telemetry polling, scheduled drainage cleaning.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
