import React, { useState } from 'react';
import {
  X,
  Play,
  RotateCw,
  Zap,
  Sparkles,
  ShieldAlert,
  MapPin,
  Bell,
  Truck,
  Layers,
  Sliders,
  CheckCircle2,
  ArrowDown,
  CloudRain,
  Activity,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { LocationData, DisasterAlert, RoadStatus, LanguageCode } from '../types';
import { calculateLandslideRisk } from '../services/riskEngine';
import { translations } from '../locales/translations';

interface HazardPipelineSimulatorModalProps {
  locations: LocationData[];
  roads: RoadStatus[];
  onClose: () => void;
  onApplyPipelineResult: (
    locationId: string,
    updatedLocation: LocationData,
    generatedAlert?: DisasterAlert,
    affectedRoad?: RoadStatus
  ) => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateToMap?: () => void;
  currentLang: LanguageCode;
}

export const HazardPipelineSimulatorModal: React.FC<HazardPipelineSimulatorModalProps> = ({
  locations,
  roads,
  onClose,
  onApplyPipelineResult,
  onNavigateTab,
  onNavigateToMap,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  const handleNavigate = (tab: string = 'gis_map') => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab(tab);
    } else if (typeof onNavigateToMap === 'function') {
      onNavigateToMap();
    }
  };

  // Selected Target Location for simulation
  const [selectedLocId, setSelectedLocId] = useState<string>(
    locations[0]?.id || 'loc-assam-dima-hasao'
  );
  const activeLocation = locations.find((l) => l.id === selectedLocId) || locations[0];

  // Interactive Parameter Sliders
  const [rainfall24h, setRainfall24h] = useState<number>(activeLocation?.rainfall24h || 184);
  const [soilMoisture, setSoilMoisture] = useState<number>(activeLocation?.soilMoisturePercent || 86);
  const [slopeDeg, setSlopeDeg] = useState<number>(activeLocation?.slopeDeg || 38);
  const [groundMovement, setGroundMovement] = useState<number>(
    activeLocation?.groundMovementMmDay || 14.8
  );
  const [geology, setGeology] = useState<string>(activeLocation?.geology || 'Disang Group Shale');

  // Execution State & Step Tracker
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Live Real-Time Calculation Output
  const prediction = calculateLandslideRisk({
    rainfall24h,
    rainfall72h: rainfall24h * 1.6,
    soilMoisturePercent: soilMoisture,
    slopeDeg,
    elevationM: activeLocation?.elevationM || 800,
    groundMovementMmDay: groundMovement,
    historicalLandslidesCount: activeLocation?.historicalLandslidesCount || 25,
    distanceToRoadM: activeLocation?.distanceToRoadM || 15,
    vegetationNDVI: activeLocation?.vegetationNDVI || 0.42,
    geology,
  });

  // Preset Scenarios
  const applyPreset = (preset: 'CLOUDBURST' | 'MONSOON_HEAVY' | 'MODERATE' | 'DRY_SAFE') => {
    if (preset === 'CLOUDBURST') {
      setRainfall24h(220);
      setSoilMoisture(92);
      setSlopeDeg(42);
      setGroundMovement(18.5);
    } else if (preset === 'MONSOON_HEAVY') {
      setRainfall24h(145);
      setSoilMoisture(80);
      setSlopeDeg(36);
      setGroundMovement(9.2);
    } else if (preset === 'MODERATE') {
      setRainfall24h(65);
      setSoilMoisture(58);
      setSlopeDeg(28);
      setGroundMovement(3.5);
    } else if (preset === 'DRY_SAFE') {
      setRainfall24h(12);
      setSoilMoisture(32);
      setSlopeDeg(20);
      setGroundMovement(0.8);
    }
  };

  // Step-by-Step Pipeline Runner
  const handleRunPipeline = async () => {
    setIsExecuting(true);
    setActiveStep(1);
    setExecutionLog(['1. Ingesting multi-source inputs: Rainfall, Soil Saturation, Slope Angle...']);

    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(2);
    setExecutionLog((prev) => [
      ...prev,
      '2. Executing XGBoost Geotechnical Landslide Susceptibility Matrix...',
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(3);
    setExecutionLog((prev) => [
      ...prev,
      `3. Inferred Risk Score: ${prediction.riskScore}/100 [Level: ${prediction.riskLevel}]`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(4);
    setExecutionLog((prev) => [
      ...prev,
      `4. Plotting dynamic hazard buffer & risk polygon on GIS Interactive Map...`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(5);
    const alertWillTrigger = prediction.riskScore >= 76;
    setExecutionLog((prev) => [
      ...prev,
      alertWillTrigger
        ? '5. Threshold Breach (Score ≥ 76%): Generating CAP Emergency Red Alert broadcast...'
        : '5. Risk within safe threshold: Standby monitoring mode maintained.',
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(6);
    setExecutionLog((prev) => [
      ...prev,
      '6. Dispatched instant notification to State/District Emergency Command & Updated Road Lifelines.',
    ]);

    // Prepare updated location data
    const updatedLocation: LocationData = {
      ...activeLocation,
      rainfall24h,
      rainfall72h: Number((rainfall24h * 1.6).toFixed(1)),
      soilMoisturePercent: soilMoisture,
      slopeDeg,
      groundMovementMmDay: groundMovement,
      riskScore: prediction.riskScore,
      riskProbability: prediction.riskProbability,
      riskLevel: prediction.riskLevel,
      majorFactors: prediction.majorFactors,
      aiExplanation: prediction.aiExplanation,
      recommendedAction: prediction.recommendedAction,
      lastUpdated: new Date().toISOString(),
    };

    // Prepare Disaster Alert if Critical
    let generatedAlert: DisasterAlert | undefined = undefined;
    if (prediction.riskScore >= 76) {
      generatedAlert = {
        id: `alert-ner-sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        alertCode: `CAP-RED-${activeLocation.state.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        title: `CRITICAL RED ALERT: Imminent Landslide Warning for ${activeLocation.district}`,
        message: `${prediction.aiExplanation} Recommended: ${prediction.recommendedAction}`,
        riskLevel: 'CRITICAL',
        state: activeLocation.state,
        district: activeLocation.district,
        locationName: activeLocation.name,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'ACTIVE',
        channels: ['CAP India Broadcast', 'SMS Broadcast', 'Police Radio', 'Mobile App'],
        affectedPopulation: activeLocation.populationAtRisk,
        triggeredBy: `AI Risk Engine (Score: ${prediction.riskScore}%, Rain: ${rainfall24h}mm, Moisture: ${soilMoisture}%)`,
      };
    }

    // Match affected road if nearby
    let affectedRoad: RoadStatus | undefined = undefined;
    const matchingRoad = roads.find(
      (r) => r.district === activeLocation.district || r.state === activeLocation.state
    );
    if (matchingRoad && prediction.riskScore >= 76) {
      affectedRoad = {
        ...matchingRoad,
        status: 'FULLY_BLOCKED',
        clearanceETA: '12-18 Hours (Heavy machinery on site)',
        alternateRouteDescription: `Precautionary road closure due to ${prediction.riskScore}% landslide hazard. Divert all traffic via ${matchingRoad.alternateRouteName}.`,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Apply into global application state
    onApplyPipelineResult(activeLocation.id, updatedLocation, generatedAlert, affectedRoad);

    setIsExecuting(false);
    setHasExecuted(true);
  };

  return (
    <div className="fixed inset-0 z-[850] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-100 text-sm sm:text-base font-['Outfit']">
                  Interactive End-to-End Hazard Pipeline Simulator
                </h3>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-cyan-500/30">
                  Live Execution Matrix
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Demonstrating the full operational pipeline: Input Telemetry → ML Model → Risk Score → GIS Map → Alert Broadcast → Authority Response
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Target Location Selector & Preset Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-xs font-bold text-slate-300 whitespace-nowrap flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Target Vulnerability Zone:</span>
              </label>
              <select
                value={selectedLocId}
                onChange={(e) => {
                  const loc = locations.find((l) => l.id === e.target.value);
                  setSelectedLocId(e.target.value);
                  if (loc) {
                    setRainfall24h(loc.rainfall24h);
                    setSoilMoisture(loc.soilMoisturePercent);
                    setSlopeDeg(loc.slopeDeg);
                    setGroundMovement(loc.groundMovementMmDay);
                    setGeology(loc.geology);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-cyan-400 cursor-pointer font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.district}, {loc.state}) — Current Risk: {loc.riskScore}%
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
              <button
                onClick={() => applyPreset('CLOUDBURST')}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95 flex items-center space-x-1"
              >
                <span>⚡ Cloudburst (220mm)</span>
              </button>
              <button
                onClick={() => applyPreset('MONSOON_HEAVY')}
                className="bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
              >
                <span>🌧️ Heavy Rain (145mm)</span>
              </button>
              <button
                onClick={() => applyPreset('MODERATE')}
                className="bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 text-blue-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
              >
                <span>🌦️ Moderate (65mm)</span>
              </button>
              <button
                onClick={() => applyPreset('DRY_SAFE')}
                className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
              >
                <span>☀️ Dry (12mm)</span>
              </button>
            </div>
          </div>

          {/* Interactive Sliders & Real-Time Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            {/* Slider 1: 24h Rainfall */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24h Rainfall:</span>
                </span>
                <span className="text-cyan-300 font-mono font-extrabold text-sm">
                  {rainfall24h} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                value={rainfall24h}
                onChange={(e) => setRainfall24h(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 mm</span>
                <span>Critical &gt;120mm</span>
                <span>350 mm</span>
              </div>
            </div>

            {/* Slider 2: Soil Moisture */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Soil Moisture:</span>
                </span>
                <span className="text-blue-300 font-mono font-extrabold text-sm">
                  {soilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="98"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>20%</span>
                <span>Saturation &gt;75%</span>
                <span>98%</span>
              </div>
            </div>

            {/* Slider 3: Slope Angle */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <Compass className="w-3.5 h-3.5 text-orange-400" />
                  <span>Slope Angle:</span>
                </span>
                <span className="text-orange-300 font-mono font-extrabold text-sm">
                  {slopeDeg}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="55"
                value={slopeDeg}
                onChange={(e) => setSlopeDeg(Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10°</span>
                <span>Steep &gt;35°</span>
                <span>55°</span>
              </div>
            </div>

            {/* Slider 4: Ground Creep */}
            <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ground Creep:</span>
                </span>
                <span className="text-rose-300 font-mono font-extrabold text-sm">
                  {groundMovement} mm/d
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={groundMovement}
                onChange={(e) => setGroundMovement(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 mm</span>
                <span>InSAR &gt;8mm</span>
                <span>25 mm</span>
              </div>
            </div>
          </div>

          {/* VISUAL PIPELINE FLOW SCHEMATIC (Step-by-Step) */}
          <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center space-x-1.5 font-['Outfit']">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>End-to-End Operational Pipeline Logic</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-Time State Synchronization Active
              </span>
            </div>

            {/* Step Pipeline Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Step 1: Input Sensor Data */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 1
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-400">Step 1</span>
                  {activeStep >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">Multi-Sensor Input</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  Rain: {rainfall24h}mm | Soil: {soilMoisture}% | Slope: {slopeDeg}°
                </p>
              </div>

              {/* Step 2: ML Model Inference */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 2
                    ? 'bg-purple-950/50 border-purple-400 shadow-md ring-1 ring-purple-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-purple-400">Step 2</span>
                  {activeStep >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">AI/ML XGBoost Core</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  Weighted SHAP Matrix + Spatial Geological Graph
                </p>
              </div>

              {/* Step 3: Risk Score & Level */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 3
                    ? prediction.riskScore >= 76
                      ? 'bg-red-950/60 border-red-400 shadow-md ring-1 ring-red-400/30'
                      : 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-red-400">Step 3</span>
                  {activeStep >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">Risk Score Calculated</h5>
                <p className="text-[11px] font-mono font-black text-slate-100 mt-1">
                  {prediction.riskScore}% — {prediction.riskLevel}
                </p>
              </div>

              {/* Step 4: Dynamic GIS Map Plot */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 4
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-md ring-1 ring-emerald-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400">Step 4</span>
                  {activeStep >= 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">GIS Map Dynamic Plot</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  Radius Buffer + Live Iso-Hazard Contour Pulse
                </p>
              </div>

              {/* Step 5: CAP Red Alert Generated */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 5
                    ? prediction.riskScore >= 76
                      ? 'bg-red-950/70 border-red-400 shadow-md ring-1 ring-red-400/40 animate-pulse'
                      : 'bg-blue-950/50 border-blue-400 shadow-md'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400">Step 5</span>
                  {activeStep >= 5 && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">CAP Protocol Broadcast</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  {prediction.riskScore >= 76 ? '🚨 RED ALERT BROADCAST' : 'Standby Vigilance'}
                </p>
              </div>

              {/* Step 6: Authority Response & Roads */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  activeStep >= 6
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-md ring-1 ring-cyan-400/30'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-cyan-400">Step 6</span>
                  {activeStep >= 6 && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <h5 className="text-xs font-bold text-slate-200 mt-1">Authority Notified</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  SEOC/DEOC Alerted & Highway Detour Triggered
                </p>
              </div>
            </div>

            {/* Live Pipeline Execution Logs */}
            {executionLog.length > 0 && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                {executionLog.map((log, i) => (
                  <div key={i} className="text-slate-300 flex items-start space-x-2">
                    <span className="text-cyan-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Geotechnical Diagnostic Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Inferred Landslide Score</span>
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-black text-slate-100 font-mono">
                  {prediction.riskScore}%
                </span>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full border ${
                    prediction.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : prediction.riskLevel === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                      : prediction.riskLevel === 'MODERATE'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {prediction.riskLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Landslide Probability: {(prediction.riskProbability * 100).toFixed(0)}%
              </p>
            </div>

            <div className="lg:col-span-2 space-y-1.5 text-xs text-slate-300 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>AI Geotechnical Diagnostic Analysis:</span>
              </div>
              <p className="leading-relaxed">{prediction.aiExplanation}</p>
              <div className="text-emerald-300 font-semibold pt-1">
                <span className="text-slate-400 font-normal">Standard Operating Procedure: </span>
                {prediction.recommendedAction}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            {hasExecuted ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pipeline Executed! Global state and GIS map successfully synchronized.</span>
              </span>
            ) : (
              <span>Click Execute to compute model inference and propagate across all screens.</span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Close
            </button>

            {hasExecuted && (
              <button
                onClick={() => {
                  handleNavigate('gis_map');
                  onClose();
                }}
                className="px-4 py-2 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-bold rounded-xl border border-cyan-500/50 transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View on GIS Map</span>
              </button>
            )}

            <button
              onClick={handleRunPipeline}
              disabled={isExecuting}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Computing Inference Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute End-to-End Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
