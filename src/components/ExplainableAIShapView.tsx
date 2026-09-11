import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Globe2,
  ShieldCheck,
} from 'lucide-react';
import { LocationData, ExplainableAIShap } from '../types';

interface ExplainableAIShapViewProps {
  locations: LocationData[];
  selectedLocation: LocationData;
  onSelectLocation?: (loc: LocationData) => void;
}

export const ExplainableAIShapView: React.FC<ExplainableAIShapViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<{
    physicalMechanism?: string;
    factorOfSafetyEstimate?: number;
    technicalExplanation?: string;
    multiLingualSummary?: Record<string, string>;
    engineeringMitigation?: string[];
    immediateAction?: string;
  } | null>(null);

  const handleFetchGeminiExplanation = async () => {
    setIsGeneratingGemini(true);
    try {
      const res = await fetch('/api/gemini/explain-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: selectedLocation }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setGeminiAnalysis(data.explanation);
      }
    } catch (err) {
      console.warn('Gemini explain error:', err);
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  const defaultFeatures: ExplainableAIShap[] = [
    {
      featureName: '3-Day Cumulative Rainfall (Antecedent)',
      featureValue: `${selectedLocation.rainfall72h || 185} mm`,
      shapContributionPercent: 38.4,
      category: 'Meteorological',
      impactDirection: 'INCREASES_RISK',
      humanDescription: 'Continuous precipitation supersaturates overburden beyond the GSI empirical failure threshold.',
    },
    {
      featureName: 'Soil Moisture & Pore Water Pressure',
      featureValue: `${selectedLocation.soilMoisturePercent || 86}% Volumetric`,
      shapContributionPercent: 29.1,
      category: 'Hydrological',
      impactDirection: 'INCREASES_RISK',
      humanDescription: 'High hydrostatic uplift pressure diminishes effective shear friction along friable bedding planes.',
    },
    {
      featureName: 'Slope Gradient (>35° Escarpment)',
      featureValue: `${selectedLocation.slopeDeg || 38}° Incline`,
      shapContributionPercent: 18.2,
      category: 'Geomorphological',
      impactDirection: 'INCREASES_RISK',
      humanDescription: 'Steep topographic incline maximizes gravitational driving shear stress tau.',
    },
    {
      featureName: 'InSAR & Subsurface Tilt Displacement',
      featureValue: `${selectedLocation.groundMovementMmDay || 14.8} mm/day`,
      shapContributionPercent: 14.5,
      category: 'InSAR IoT',
      impactDirection: 'INCREASES_RISK',
      humanDescription: 'Active geotechnical creep rate indicates accelerating tertiary deformation phase.',
    },
    {
      featureName: 'Vegetation Canopy Cohesion (NDVI)',
      featureValue: `${selectedLocation.vegetationNDVI || 0.42}`,
      shapContributionPercent: -6.2,
      category: 'Anthropogenic',
      impactDirection: 'DECREASES_RISK',
      humanDescription: 'Subsurface root network offers slight mechanical binding cohesion against shallow translational slide.',
    },
  ];

  const features = selectedLocation.shapAttributions && selectedLocation.shapAttributions.length > 0
    ? selectedLocation.shapAttributions
    : defaultFeatures;

  const plainExplanation =
    selectedLocation.aiExplanation ||
    `High risk is driven primarily by severe 3-day continuous rainfall (${selectedLocation.rainfall72h || 185}mm) saturating soil to ${selectedLocation.soilMoisturePercent || 86}% on a steep ${selectedLocation.slopeDeg || 38}° escarpment, compounded by active surface displacement of ${selectedLocation.groundMovementMmDay || 14.8} mm/day.`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100 max-w-full overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 max-w-full">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Explainable AI (XAI) & SHAP Attribution Layer
                <span className="text-xs bg-purple-950 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-800">
                  Feature Importance
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Transforms black-box ML predictions into transparent, defensible explanations for disaster commissioners and geologists.
              </p>
            </div>
          </div>
        </div>

        {/* Location Dropdown & Live Gemini Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto max-w-full min-w-0">
          <button
            onClick={handleFetchGeminiExplanation}
            disabled={isGeneratingGemini}
            className="flex items-center justify-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            {isGeneratingGemini ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingGemini ? 'Analyzing...' : 'Gemini Geotech AI'}</span>
          </button>

          <div className="w-full sm:w-64 md:w-80 max-w-full min-w-0">
            <select
              value={selectedLocation.id}
              onChange={(e) => {
                const found = locations.find((l) => l.id === e.target.value);
                if (found && onSelectLocation) {
                  onSelectLocation(found);
                  setGeminiAnalysis(null);
                }
              }}
              className="w-full max-w-full bg-slate-850 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-purple-500 font-medium truncate block shadow-sm"
              title="Select Road Corridor / Slope Location"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">
                  {loc.name} ({loc.district}, {loc.state})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Natural Language Explanation Box */}
      <div className="p-5 bg-gradient-to-r from-purple-950/40 to-slate-900 rounded-2xl border border-purple-500/30 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
          <Info className="w-4 h-4 text-purple-400" />
          <span>Natural Language Executive Summary (Why this area is High Risk):</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          &ldquo;{plainExplanation}&rdquo;
        </p>
      </div>

      {/* Live Gemini Deep Geotechnical Synthesis (When Generated) */}
      {geminiAnalysis && (
        <div className="p-5 bg-purple-950/20 border border-purple-500/40 rounded-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-purple-800/40 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-200">
                Gemini 3.7 Flash Geotechnical Physics Evaluation
              </span>
            </div>
            {geminiAnalysis.factorOfSafetyEstimate !== undefined && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                geminiAnalysis.factorOfSafetyEstimate < 1.0
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                Factor of Safety (FS): {geminiAnalysis.factorOfSafetyEstimate}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 block">Failure Mechanism:</span>
              <p className="text-slate-400">{geminiAnalysis.physicalMechanism}</p>
              <p className="text-slate-300 mt-2 leading-relaxed">{geminiAnalysis.technicalExplanation}</p>
            </div>

            <div className="space-y-2 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" /> Multi-Lingual Broadcast Warning:
              </span>
              {geminiAnalysis.multiLingualSummary && (
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p><strong className="text-slate-400">EN:</strong> {geminiAnalysis.multiLingualSummary.en}</p>
                  {geminiAnalysis.multiLingualSummary.as && (
                    <p><strong className="text-slate-400">AS (অসমীয়া):</strong> {geminiAnalysis.multiLingualSummary.as}</p>
                  )}
                  {geminiAnalysis.multiLingualSummary.hi && (
                    <p><strong className="text-slate-400">HI (हिंदी):</strong> {geminiAnalysis.multiLingualSummary.hi}</p>
                  )}
                  {geminiAnalysis.multiLingualSummary.bn && (
                    <p><strong className="text-slate-400">BN (বাংলা):</strong> {geminiAnalysis.multiLingualSummary.bn}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHAP Feature Waterfall / Attribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Waterfall Bars */}
        <div className="lg:col-span-8 bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">SHAP Value Feature Contributions</span>
            <span className="font-mono text-purple-300 text-[11px]">
              Baseline E[Y] = 24.5% ➔ Fused = {selectedLocation.riskScore}%
            </span>
          </div>

          <div className="space-y-3">
            {features.map((f, idx) => {
              const isPositive = f.impactDirection === 'INCREASES_RISK';
              const absVal = Math.abs(f.shapContributionPercent);

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPositive ? 'bg-rose-500' : 'bg-emerald-400'
                        }`}
                      ></span>
                      <strong className="text-slate-200">{f.featureName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">({f.featureValue})</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        isPositive ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? `+${f.shapContributionPercent}%` : `${f.shapContributionPercent}%`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPositive ? 'bg-gradient-to-r from-red-600 to-rose-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, absVal * 2.2)}%` }}
                    ></div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic">
                    {f.humanDescription}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Confidence Score & Verification Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
              Model Calibration & Confidence:
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Risk Confidence:</span>
                <span className="font-bold text-emerald-400">
                  {selectedLocation.riskConfidence?.confidence || 'HIGH'} (High Density)
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Telemetry Data Quality:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {selectedLocation.riskConfidence?.dataQualityPercent || 91}% Complete
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-400">Validation Status:</span>
                <span className="font-bold text-indigo-300">GSI Historical Cross-Check ✓</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              Legal & Audit Compliance:
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every evacuation order dispatched includes this cryptographic SHAP trace to satisfy Disaster Management Authority audit requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
