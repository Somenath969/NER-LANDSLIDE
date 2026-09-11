import React, { useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Play,
  Layers,
  ShieldAlert,
  Radio,
  Cpu,
  Truck,
  Camera,
  Activity,
  Workflow,
  MapPin,
  Flame,
} from 'lucide-react';
import { LanguageCode } from '../types';

interface HackathonDemoTourProps {
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  setCurrentLang: (lang: LanguageCode) => void;
  onSelectSampleLocation: () => void;
  onSimulateSurgeDemo: () => void;
}

export const HackathonDemoTour: React.FC<HackathonDemoTourProps> = ({
  onClose,
  setActiveTab,
  setCurrentLang,
  onSelectSampleLocation,
  onSimulateSurgeDemo,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '1. Public Safety Portal & Warnings',
      tab: 'public_portal',
      description:
        'Citizens and travelers across the 8 North Eastern states can instantly view active Red/Orange alerts, check their district risk rating, and access 24x7 SEOC emergency helplines.',
      actionLabel: 'Explore Public Portal',
      action: () => setActiveTab('public_portal'),
    },
    {
      title: '2. Multilingual Accessibility',
      tab: 'public_portal',
      description:
        'To ensure critical alerts reach local tribal and vernacular communities, the entire system supports English, Hindi, Assamese (অসমীয়া), Bengali (বাংলা), Mizo (Duhlian), and Manipuri (মৈতৈলোন্).',
      actionLabel: 'Preview Assamese (অসমীয়া)',
      action: () => {
        setCurrentLang('as');
        setTimeout(() => setCurrentLang('en'), 3500);
      },
    },
    {
      title: '3. Interactive GIS Landslide Risk Map',
      tab: 'gis_map',
      description:
        'High-resolution GIS map powered by Leaflet. Displays real-time risk zones with dynamic pulsing hazard nodes, road blockage overlays, IoT sensor badges, and terrain topography.',
      actionLabel: 'Open GIS Map',
      action: () => setActiveTab('gis_map'),
    },
    {
      title: '4. Location Geotechnical Inspector',
      tab: 'gis_map',
      description:
        'Clicking any slope opens the deep geomechanics panel: 24h/72h rainfall, pore water saturation %, slope inclination, elevation, curvature, and Disang shale lithology.',
      actionLabel: 'Inspect Haflong (NH-27) Slope',
      action: () => {
        setActiveTab('gis_map');
        onSelectSampleLocation();
      },
    },
    {
      title: '5. Explainable AI & SHAP Factor Weights',
      tab: 'gis_map',
      description:
        'No black boxes: the XGBoost model outputs mathematical SHAP factor weights (Rainfall 35%, Soil Saturation 28%, Slope Angle 20%) alongside human-readable geotechnical diagnostics.',
      actionLabel: 'View Factor Weights',
      action: () => {
        setActiveTab('gis_map');
        onSelectSampleLocation();
      },
    },
    {
      title: '6. Live Cloudburst Weather Surge Simulator',
      tab: 'gis_map',
      description:
        'Test automated risk re-calculation by injecting simulated monsoon spells (+40mm, +85mm, or +130mm cloudburst) directly into the geotechnical formula in real time.',
      actionLabel: 'Simulate +85mm Rain Spike',
      action: () => {
        onSimulateSurgeDemo();
      },
    },
    {
      title: '7. Disaster Management Command Dashboard',
      tab: 'authority_dashboard',
      description:
        'Operational dashboard for ASDMA, NDRF, and District Magistrates with live KPI counters, population exposure analytics, Recharts scatter/pie visualizers, and threat meters.',
      actionLabel: 'Open Command Dashboard',
      action: () => setActiveTab('authority_dashboard'),
    },
    {
      title: '8. Multi-Agency Emergency Response Priorities',
      tab: 'authority_dashboard',
      description:
        'Automated triage ranking (Priority 1 to 4) synthesizing risk scores, population density, and hospital access to direct NDRF rescue battalions and PWD wheel loaders.',
      actionLabel: 'Review Tactical Priorities',
      action: () => setActiveTab('authority_dashboard'),
    },
    {
      title: '9. CAP India Emergency Alert Broadcast Center',
      tab: 'authority_dashboard',
      description:
        'Authorized officials can compose and broadcast Common Alerting Protocol (CAP) messages across SMS, police radio networks, mobile push, and the web portal.',
      actionLabel: 'Inspect Broadcast Center',
      action: () => setActiveTab('authority_dashboard'),
    },
    {
      title: '10. Strategic Highway Lifeline Monitoring',
      tab: 'roads',
      description:
        'Tracks critical mountain corridors including NH-27 (Assam), NH-10 (Sikkim), NH-29 (Nagaland/Manipur), and NH-13 (Arunachal) with clearance ETAs and alternate detours.',
      actionLabel: 'View Highway Corridors',
      action: () => setActiveTab('roads'),
    },
    {
      title: '11. IoT Sensor Telemetry & Anomaly Mesh',
      tab: 'sensors',
      description:
        'Monitors piezometer pore pressure (kPa), InSAR radar displacement (mm/day), and rain gauges with 6h trend graphs and an interactive packet injector sandbox.',
      actionLabel: 'Open IoT Sensor Mesh',
      action: () => setActiveTab('sensors'),
    },
    {
      title: '12. Field Officer Offline-Ready Mobile PWA',
      tab: 'field_pwa',
      description:
        'Engineered for remote hill conditions with offline local caching, GPS coordinate acquisition, and automatic synchronization when network connectivity restores.',
      actionLabel: 'Open Field Officer Console',
      action: () => setActiveTab('field_pwa'),
    },
    {
      title: '13. Computer Vision Reconnaissance AI',
      tab: 'field_pwa',
      description:
        'Field photos analyzed by Gemini Vision AI to detect exposed scarps, tension fractures, highway blockages, and estimate displaced debris volume (e.g. 1,800 m³).',
      actionLabel: 'Test Vision AI Recon',
      action: () => setActiveTab('field_pwa'),
    },
    {
      title: '14. AI/ML Susceptibility Laboratory & Validation',
      tab: 'models',
      description:
        'Full validation telemetry: 92.8% Accuracy, 94.1% Recall, 0.963 ROC-AUC, confusion matrix on 10,960 test samples, and an interactive prediction sandbox.',
      actionLabel: 'Inspect ML Laboratory',
      action: () => setActiveTab('models'),
    },
    {
      title: '15. Enterprise Security & Audit Governance',
      tab: 'admin_audit',
      description:
        'Complete role-based access control, cryptographic verification tokens, system operational health telemetry, and immutable audit logs.',
      actionLabel: 'View Audit & Governance',
      action: () => setActiveTab('admin_audit'),
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      setActiveTab(steps[nextIdx].tab);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      setActiveTab(steps[prevIdx].tab);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[900] w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-6">
      {/* Top Header */}
      <div className="px-5 py-3 bg-gradient-to-r from-amber-500/20 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
            ✨
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-amber-300 font-['Outfit']">
              System Overview (Step {currentStep + 1} of {steps.length})
            </h4>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1">
        <div
          className="bg-amber-400 h-1 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
          <span>{current.title}</span>
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed">{current.description}</p>

        {/* Action Trigger */}
        <button
          onClick={current.action}
          className="w-full py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
        >
          <Play className="w-3 h-3 text-amber-400" />
          <span>{current.actionLabel}</span>
        </button>

        {/* Footer Navigation */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 font-semibold ${
              currentStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-[11px] text-slate-500 font-mono">
            {currentStep + 1} / {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold flex items-center space-x-1 shadow-md shadow-amber-500/20"
          >
            <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
