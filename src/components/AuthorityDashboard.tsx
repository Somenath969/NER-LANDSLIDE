import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Truck,
  Activity,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  CloudRain,
  MapPin,
  Clock,
  ArrowUpRight,
  Gauge,
  Route,
  Compass,
  Layers,
  Thermometer,
  Wind,
  WifiOff,
  Languages,
  CheckCircle2,
  PhoneCall,
  Package,
  Satellite,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Camera,
  ZoomIn,
  Eye,
  X,
  Filter,
  Check,
  Info,
  ExternalLink,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  LocationData,
  DisasterAlert,
  EmergencyPriorityItem,
  SensorData,
  RoadStatus,
  LanguageCode,
  IncidentReport,
} from '../types';
import { translations } from '../locales/translations';
import { AutomatedEarlyWarningSystem } from './AutomatedEarlyWarningSystem';
import { IMDWeatherRadarView } from './IMDWeatherRadarView';
import { SensorTelemetryView } from './SensorTelemetryView';
import { initialIncidents } from '../data/nerData';

interface AuthorityDashboardProps {
  locations: LocationData[];
  alerts: DisasterAlert[];
  priorities: EmergencyPriorityItem[];
  sensors: SensorData[];
  roads: RoadStatus[];
  incidents?: IncidentReport[];
  onUpdateIncidentStatus?: (incidentId: string, status: IncidentReport['status']) => void;
  onSelectLocation: (loc: LocationData) => void;
  onCreateAlert: (alertData: Partial<DisasterAlert>) => void;
  onSimulateSurgeAll: (rainMm: number) => void;
  onSimulateSurge?: (locationId: string, surgeMm: number) => void;
  onUpdateSensorReading?: (sensorCode: string, value: number, unit: string) => void;
  onOpenPipelineSimulator?: () => void;
  currentLang: LanguageCode;
  initialSection?: DashboardSection;
}

type DashboardSection =
  | 'unified_command'
  | 'automated_early_warning'
  | 'imd_weather_radar'
  | 'iot_sensors'
  | 'risk_severity'
  | 'road_connectivity'
  | 'emergency_priorities';

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  locations,
  alerts,
  priorities,
  sensors,
  roads,
  incidents,
  onUpdateIncidentStatus,
  onSelectLocation,
  onCreateAlert,
  onSimulateSurgeAll,
  onSimulateSurge,
  onUpdateSensorReading,
  onOpenPipelineSimulator,
  currentLang,
  initialSection,
}) => {
  const t = translations[currentLang] || translations.en;
  const [activeSection, setActiveSection] = useState<DashboardSection>(initialSection || 'unified_command');

  // Ground-truth Incidents State (Field Officer & Citizen Reports)
  const [incidentList, setIncidentList] = useState<IncidentReport[]>(
    incidents && incidents.length > 0 ? incidents : initialIncidents
  );
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<IncidentReport | null>(null);
  const [reportSourceFilter, setReportSourceFilter] = useState<'all' | 'field_officer' | 'citizen'>('all');
  const [reportSeverityFilter, setReportSeverityFilter] = useState<string>('all');
  const [expandedPriorityReports, setExpandedPriorityReports] = useState<Record<string, boolean>>({});
  const [selectedPhotoSourceForPrio, setSelectedPhotoSourceForPrio] = useState<Record<string, 'field_officer' | 'citizen'>>({});

  useEffect(() => {
    if (incidents && incidents.length > 0) {
      setIncidentList(incidents);
    }
  }, [incidents]);

  const handleStatusChange = (incidentId: string, newStatus: IncidentReport['status']) => {
    setIncidentList((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
    if (onUpdateIncidentStatus) {
      onUpdateIncidentStatus(incidentId, newStatus);
    }
  };

  // Top sub-views navigation scroll ref & controls
  const tabsNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = () => {
    if (tabsNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsNavRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
    }
  };

  useEffect(() => {
    checkTabsScroll();
    const navEl = tabsNavRef.current;
    if (navEl) {
      navEl.addEventListener('scroll', checkTabsScroll, { passive: true });
    }
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      if (navEl) navEl.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, []);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsNavRef.current) {
      const amount = 240;
      tabsNavRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
      setTimeout(checkTabsScroll, 300);
    }
  };

  const handleTabsWheel = (e: React.WheelEvent) => {
    if (tabsNavRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      tabsNavRef.current.scrollLeft += e.deltaY;
    }
  };

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState('');
  const [newAlertMessage, setNewAlertMessage] = useState('');
  const [newAlertLevel, setNewAlertLevel] = useState<'CRITICAL' | 'HIGH' | 'MODERATE'>('CRITICAL');
  const [newAlertDistrict, setNewAlertDistrict] = useState('Dima Hasao');
  const [newAlertState, setNewAlertState] = useState('Assam');
  const [dispatchedPrios, setDispatchedPrios] = useState<string[]>([]);
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);

  // Gemini Executive Situation Briefing State
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [geminiBriefing, setGeminiBriefing] = useState<{
    headline?: string;
    operationalStatus?: string;
    keyHighlights?: string[];
    meteorologicalAnalysis?: string;
    tacticalDirectives?: string[];
    publicAdvisorySnippet?: string;
  } | null>(null);

  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch('/api/gemini/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations, filterState: 'ALL' }),
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setGeminiBriefing(data.briefing);
      }
    } catch (err) {
      console.warn('Gemini briefing error:', err);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  // Compute Summary KPIs
  const criticalLocations = locations.filter((l) => l.riskLevel === 'CRITICAL');
  const highLocations = locations.filter((l) => l.riskLevel === 'HIGH');
  const moderateLocations = locations.filter((l) => l.riskLevel === 'MODERATE');
  const lowLocations = locations.filter((l) => l.riskLevel === 'LOW');

  const totalPopAtRisk = locations.reduce(
    (sum, l) => sum + (l.riskScore >= 50 ? l.populationAtRisk : 0),
    0
  );
  const blockedRoads = roads.filter((r) => r.status === 'FULLY_BLOCKED');
  const partialRoads = roads.filter((r) => r.status === 'PARTIALLY_BLOCKED');
  const clearRoads = roads.filter((r) => r.status === 'OPEN');

  const criticalSensorsCount = sensors.filter(
    (s) => s.status === 'CRITICAL' || s.status === 'WARNING'
  ).length;

  // Chart Data: Risk by District
  const districtRiskData = locations.map((loc) => ({
    name: loc.district.split(' ')[0],
    riskScore: loc.riskScore,
    rainfall24h: loc.rainfall24h,
    soilMoisture: loc.soilMoisture,
    population: Math.round(loc.populationAtRisk / 1000),
    riskLevel: loc.riskLevel,
  }));

  // Chart Data: Risk Level Distribution Pie
  const riskPieData = [
    { name: 'Critical (76-100)', value: criticalLocations.length, color: '#ef4444' },
    { name: 'High (51-75)', value: highLocations.length, color: '#f97316' },
    { name: 'Moderate (26-50)', value: moderateLocations.length, color: '#eab308' },
    { name: 'Low (0-25)', value: lowLocations.length, color: '#10b981' },
  ];

  // Weather-Linked Forecasts: 24h Rainfall vs Threshold Probability Curve
  const weatherRiskForecastData = [
    { hour: '00:00', actualRain: 12, predictedRain: 15, riskProbability: 18, soilSat: 62 },
    { hour: '04:00', actualRain: 25, predictedRain: 28, riskProbability: 32, soilSat: 68 },
    { hour: '08:00', actualRain: 48, predictedRain: 52, riskProbability: 58, soilSat: 79 },
    { hour: '12:00', actualRain: 78, predictedRain: 84, riskProbability: 82, soilSat: 88 },
    { hour: '16:00 (Surge)', actualRain: 110, predictedRain: 125, riskProbability: 94, soilSat: 96 },
    { hour: '20:00', actualRain: 95, predictedRain: 105, riskProbability: 89, soilSat: 94 },
    { hour: '24:00 (Proj)', actualRain: 60, predictedRain: 70, riskProbability: 71, soilSat: 89 },
  ];

  // Road Lifeline Stats for Pie
  const roadPieData = [
    { name: 'Fully Blocked', value: blockedRoads.length, color: '#ef4444' },
    { name: 'Partially Blocked', value: partialRoads.length, color: '#f97316' },
    { name: 'Clear Lifeline', value: clearRoads.length, color: '#10b981' },
  ];

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle || !newAlertMessage) return;

    onCreateAlert({
      title: newAlertTitle,
      message: newAlertMessage,
      riskLevel: newAlertLevel,
      state: newAlertState,
      district: newAlertDistrict,
      locationName: `${newAlertDistrict} Hazard Zone`,
      affectedPopulation: 14500,
      triggeredBy: 'National Disaster Authority (NDMA) CAP Broadcast Center',
      channels: ['CAP India Gateway', 'SMS / Cell Broadcast', 'Police Radio', 'NER PWA Mesh'],
    });

    setNewAlertTitle('');
    setNewAlertMessage('');
    setShowBroadcastModal(false);
  };

  const handleDispatchPriority = (prioId: string) => {
    setDispatchedPrios((prev) => [...prev, prioId]);
  };

  const handleTriggerSimAll = (rainMm: number) => {
    setIsSimulatingAll(true);
    onSimulateSurgeAll(rainMm);
    setTimeout(() => setIsSimulatingAll(false), 500);
  };

  const renderIncidentCard = (inc: IncidentReport) => {
    const isOfficer =
      inc.reporterRole.toLowerCase().includes('officer') ||
      inc.reporterRole.toLowerCase().includes('pwd');
    const isCrit = inc.severity.toLowerCase() === 'critical';
    const isHigh = inc.severity.toLowerCase() === 'high';

    return (
      <div
        key={inc.id}
        className={`p-4 rounded-xl border transition-all ${
          isCrit
            ? 'bg-slate-850/90 border-red-900/60 shadow-lg shadow-red-950/20'
            : isHigh
            ? 'bg-slate-850/90 border-amber-900/50'
            : 'bg-slate-850/90 border-slate-800'
        }`}
      >
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {isOfficer ? (
              <span className="px-2.5 py-1 rounded-lg bg-blue-950/90 border border-blue-600/80 text-blue-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Field Geotechnical Officer Report (Official Intel)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Citizen Incident Report (Crowdsourced Ground Evidence)
              </span>
            )}

            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider ${
                isCrit
                  ? 'bg-red-600 text-white'
                  : isHigh
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-yellow-500 text-slate-950'
              }`}
            >
              {inc.severity}
            </span>

            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {inc.hazardType}
            </span>

            <span className="text-xs text-slate-400 font-mono">ID: {inc.id}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                inc.status === 'Verified'
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  : inc.status === 'In Response'
                  ? 'bg-red-950 border border-red-800 text-red-300 animate-pulse'
                  : 'bg-amber-950 border border-amber-800 text-amber-300'
              }`}
            >
              Status: {inc.status}
            </span>
            <span className="text-xs text-slate-400 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              {new Date(inc.reportedAt).toLocaleDateString()} {new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-3 space-y-1">
          <h4 className="text-sm font-bold text-slate-100 leading-snug">
            {inc.title}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {inc.description}
          </p>
        </div>

        {/* Main 2-Column Section: Sent Photo + AI Vision Feedback */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Column 1: Sent Photo with Stamped Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                Sent Field Photo Evidence
              </span>
              <button
                onClick={() => setSelectedPhotoModal(inc)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <ZoomIn className="w-3 h-3" />
                <span>Inspect Full Res</span>
              </button>
            </div>

            <div
              onClick={() => setSelectedPhotoModal(inc)}
              className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group cursor-pointer aspect-video shadow-inner max-h-60"
            >
              {inc.photoUrl ? (
                <img
                  src={inc.photoUrl}
                  alt={inc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <Camera className="w-8 h-8 opacity-60" />
                  <span className="text-xs font-semibold">No direct image payload</span>
                </div>
              )}

              {/* Hover Zoom Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                <ZoomIn className="w-6 h-6 text-amber-400" />
                <span>Click to View Full-Size Image & GIS Watermark</span>
              </div>

              {/* Watermark GPS Stamp */}
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-sm border border-slate-700/80 text-[10px] text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-mono">
                <span className="flex items-center text-amber-300">
                  <MapPin className="w-3 h-3 mr-1 text-red-400" />
                  GPS: {inc.lat.toFixed(4)}°N, {inc.lng.toFixed(4)}°E
                </span>
                <span className="text-slate-400">
                  {isOfficer ? 'Official PWD/Field Unit' : 'Verified Citizen Device'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: AI Feedback & Vision Diagnostics (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-amber-300 tracking-tight">
                    AI Vision Diagnostic Feedback & Risk Assessment
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Confidence:</span>
                  <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {Math.round((inc.aiAssessment?.confidenceScore || 0.92) * 100)}%
                  </span>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-cyan-400 h-full rounded-full"
                  style={{
                    width: `${Math.round((inc.aiAssessment?.confidenceScore || 0.92) * 100)}%`,
                  }}
                />
              </div>

              {/* AI Explanation Text */}
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-amber-300">Geotechnical Analysis: </strong>
                {inc.aiAssessment?.explanation || 'Image visual features match steep unreinforced colluvial slopes with ongoing scarp deformation and loose boulder movement.'}
              </p>

              {/* Metrics & Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Estimated Slope</span>
                  <strong className="text-slate-100 font-bold">
                    {inc.aiAssessment?.slopeAngleEstimate || 38}° Incline
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Debris Volume</span>
                  <strong className="text-slate-100 font-bold truncate">
                    {inc.aiAssessment?.debrisVolumeEstimate || '1,800 m³'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/90 border border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block">Suggested Action</span>
                  <strong className="text-amber-300 font-bold">
                    {inc.aiAssessment?.suggestedSeverity || 'Critical'} Priority
                  </strong>
                </div>
              </div>

              {/* Detected Hazard Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">Detected Visual Hazard Features:</span>
                <div className="flex flex-wrap gap-1.5">
                  {inc.aiAssessment?.detectedHazards.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-amber-200 border border-amber-500/30 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification status note */}
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
              <span className="flex items-center gap-1 text-slate-300">
                {inc.aiAssessment?.humanVerificationRequired ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Flagged for Geotechnical Validation</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Corroborated by Satellite & Telemetry</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Model: Gemini 2.5 Pro Vision
              </span>
            </div>
          </div>
        </div>

        {/* Location, Reporter Info, and Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-300">
            <span className="flex items-center text-slate-300">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
              <strong>{inc.locationName}</strong>, {inc.district} ({inc.state})
            </span>
            <span>•</span>
            <span className="text-slate-400">
              Reported by: <strong className="text-slate-200">{inc.reportedBy}</strong> ({inc.reporterPhone || 'Official Channel'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const match = locations.find(
                  (l) =>
                    l.district.toLowerCase() === inc.district.toLowerCase() ||
                    l.state.toLowerCase() === inc.state.toLowerCase()
                );
                if (match) onSelectLocation(match);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Locate on Map</span>
            </button>

            {inc.status !== 'Verified' && (
              <button
                onClick={() => handleStatusChange(inc.id, 'Verified')}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-800 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Verify Report</span>
              </button>
            )}

            {inc.status !== 'In Response' && (
              <button
                onClick={() => handleStatusChange(inc.id, 'In Response')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md shadow-red-600/20 transition-all flex items-center gap-1"
              >
                <Truck className="w-3 h-3" />
                <span>Dispatch NDRF / SDRF</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Section Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            <h2 className="text-xl font-black text-slate-100 tracking-tight font-['Outfit']">
              Bhuraksha NER Early Warning & Operational Command
            </h2>
            <span className="bg-red-500/20 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-red-500/30">
              Live Monitoring
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Database: Auto-Save Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial analytics, risk severity indexes, lifeline corridor connectivity, and weather-linked forecasts.
          </p>
        </div>
      </div>

      {/* KPI Cards Row (Moved Above Top Navbar so Section Content appears directly beneath Navbar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Hazard Zones */}
        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Slopes</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {criticalLocations.length} <span className="text-xs font-normal text-slate-400">Zones (&gt;75/100)</span>
          </p>
          <p className="text-[11px] text-red-300 mt-1 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            {highLocations.length} additional slopes at High risk
          </p>
        </div>

        {/* Population at Risk */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Population Exposure</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {totalPopAtRisk.toLocaleString()} <span className="text-xs font-normal text-slate-400">Citizens</span>
          </p>
          <p className="text-[11px] text-amber-300 mt-1">Across high-vulnerability hill hamlets</p>
        </div>

        {/* Highway Lifelines Blocked */}
        <div className="bg-slate-900 border border-orange-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Lifelines Disrupted</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {blockedRoads.length + partialRoads.length}{' '}
            <span className="text-xs font-normal text-slate-400">Corridors ({blockedRoads.length} Blocked)</span>
          </p>
          <p className="text-[11px] text-orange-300 mt-1">Active clearance operations ongoing</p>
        </div>

        {/* Sensor Network Health */}
        <div
          onClick={() => setActiveSection('iot_sensors')}
          className="bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 p-4 rounded-2xl shadow-lg relative overflow-hidden cursor-pointer transition-all hover:bg-slate-850 group"
          title="Click to inspect IoT Sensors Telemetry Mesh"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
              IoT Telemetry Mesh
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100 mt-2">
            {sensors.length} <span className="text-xs font-normal text-slate-400">Sensors</span>
          </p>
          <p className="text-[11px] text-emerald-300 mt-1 flex items-center justify-between">
            <span>{criticalSensorsCount} threshold alerts active</span>
            <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">View Mesh →</span>
          </p>
        </div>
      </div>

      {/* Dashboard Sub-Views Navigation Tabs with Smooth Horizontal Scrolling & Controls */}
      <div className="relative group/tabs border-b border-slate-800 pb-2">
        {/* Left Scroll Chevron Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 shadow-xl flex items-center justify-center backdrop-blur transition-all active:scale-90"
            title="Scroll navigation left"
            aria-label="Scroll navigation left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Left Gradient Fade Mask */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-10 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10" />
        )}

        {/* Scrollable Tabs Bar */}
        <div
          ref={tabsNavRef}
          onScroll={checkTabsScroll}
          onWheel={handleTabsWheel}
          className="flex items-center space-x-2 overflow-x-auto scroll-smooth scrollbar-thin px-1 py-1 text-xs font-semibold select-none"
        >
          <button
            onClick={() => setActiveSection('unified_command')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'unified_command'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Unified Overview</span>
          </button>

          <button
            onClick={() => setActiveSection('automated_early_warning')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'automated_early_warning'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Automated SMS/App Warning</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </button>

          <button
            onClick={() => setActiveSection('imd_weather_radar')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'imd_weather_radar'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>IMD Weather HUB</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              OGD Live
            </span>
          </button>

          <button
            onClick={() => setActiveSection('iot_sensors')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'iot_sensors'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>IoT Sensors Telemetry Mesh</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {sensors.length} Nodes
            </span>
          </button>

          <button
            onClick={() => setActiveSection('risk_severity')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'risk_severity'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.riskSeverityLevels}</span>
          </button>

          <button
            onClick={() => setActiveSection('road_connectivity')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'road_connectivity'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{t.roadConnectivityStatus}</span>
          </button>

          <button
            onClick={() => setActiveSection('emergency_priorities')}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
              activeSection === 'emergency_priorities'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>{t.emergencyPrioritisation}</span>
          </button>
        </div>

        {/* Right Gradient Fade Mask */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10" />
        )}

        {/* Right Scroll Chevron Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 shadow-xl flex items-center justify-center backdrop-blur transition-all active:scale-90"
            title="Scroll navigation right"
            aria-label="Scroll navigation right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* VIEW: AUTOMATED SMS / APP-BASED EARLY WARNING SYSTEM */}
      {activeSection === 'automated_early_warning' && (
        <AutomatedEarlyWarningSystem
          locations={locations}
          alerts={alerts}
          currentLang={currentLang}
          onCreateAlert={onCreateAlert}
          onSelectLocation={onSelectLocation}
        />
      )}

      {/* VIEW: IMD WEATHER & DOPPLER RADAR (DWR) HUB */}
      {activeSection === 'imd_weather_radar' && (
        <IMDWeatherRadarView
          currentLang={currentLang}
          onSimulateSurgeFromRadar={(locationId, surgeMm) => {
            if (onSimulateSurge) {
              onSimulateSurge(locationId, surgeMm);
            } else {
              onSimulateSurgeAll(surgeMm);
            }
          }}
        />
      )}

      {/* VIEW: IOT SENSORS TELEMETRY MESH */}
      {activeSection === 'iot_sensors' && (
        <SensorTelemetryView
          sensors={sensors}
          onUpdateSensorReading={onUpdateSensorReading || ((code, val) => console.log('Sensor updated', code, val))}
          onOpenPipelineSimulator={onOpenPipelineSimulator}
          currentLang={currentLang}
        />
      )}

      {/* VIEW 1: UNIFIED COMMAND OVERVIEW */}
      {activeSection === 'unified_command' && (
        <div className="space-y-6">
          {/* Gemini AI Executive Situation Briefing Card */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/30 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    Executive Disaster Situation Briefing
                    <span className="text-[10px] bg-purple-900/80 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700 font-mono">
                      Gemini 3.7 Flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time situational intelligence synthesized across all 8 NER states, weather feeds, and IoT sensors.
                  </p>
                </div>
              </div>

              <button
                onClick={handleGenerateBriefing}
                disabled={isGeneratingBriefing}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-purple-900/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isGeneratingBriefing ? (
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isGeneratingBriefing ? 'Synthesizing...' : geminiBriefing ? 'Refresh AI Briefing' : 'Generate AI Briefing'}</span>
              </button>
            </div>

            {geminiBriefing ? (
              <div className="space-y-3.5 animate-fadeIn text-xs">
                <div className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-500/30 flex items-start gap-3">
                  <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 text-sm block mb-1">
                      {geminiBriefing.headline}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {geminiBriefing.meteorologicalAnalysis}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider">
                      Key Regional Risk Highlights:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {geminiBriefing.keyHighlights?.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">•</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-300 block text-[11px] uppercase tracking-wider">
                      Immediate Tactical Directives:
                    </span>
                    <ul className="space-y-1.5 text-slate-300 text-xs">
                      {geminiBriefing.tacticalDirectives?.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5 font-bold">{i + 1}.</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {geminiBriefing.publicAdvisorySnippet && (
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span><strong>Broadcast Snippet:</strong> &ldquo;{geminiBriefing.publicAdvisorySnippet}&rdquo;</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <span>Click &ldquo;Generate AI Briefing&rdquo; to query Gemini 3.7 Flash for an executive summary of current hazards across NER hill corridors.</span>
              </div>
            )}
          </div>

          {/* Automated SMS / App Early Warning Sentinel Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] tracking-wide uppercase">
                    Automated SMS / App-based Early Warning Sentinel
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    ARMED & ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Autonomous 24/7 scanning of rain gauges, IoT piezometers, and ML risk scores. Instant cell broadcast & multi-lingual SMS delivery.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('automated_early_warning')}
              className="self-start sm:self-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Manage Warning Sentinel</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* IMD Doppler Weather Radar & OGD Met Feeds Banner */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Satellite className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] tracking-wide uppercase">
                    IMD Weather & Doppler Radar (DWR) Telemetry Hub
                  </h4>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                    LIVE RADAR & OGD
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time Cherrapunji, Mohanbari & Agartala S-Band / X-Band Doppler reflectivity (MAXZ / PPIZ), cloud top heights, and AWS rain telemetry.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('imd_weather_radar')}
              className="self-start sm:self-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 flex items-center space-x-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Launch Doppler Radar Hub</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* IoT Sensor Telemetry Mesh & Hardware Hub Banner */}
          <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/40 border border-teal-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
                <Layers className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-100 font-['Outfit'] tracking-wide uppercase">
                    IoT Sensor Telemetry Mesh & Ground Hardware Hub
                  </h4>
                  <span className="bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded border border-teal-500/30">
                    {sensors.length} ACTIVE SENSORS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subsurface vibrating wire piezometers, biaxial MEMS tiltmeters, automated rain gauges, and soil moisture probes across Assam, Sikkim & Mizoram.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('iot_sensors')}
              className="self-start sm:self-auto px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <span>Inspect IoT Telemetry</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Emergency Response Action Priorities (Multi-Agency Matrix) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Top Emergency Response Action Priorities
                  </h3>
                  <p className="text-xs text-slate-400">
                    Auto-ranked by AI risk score, population density, and lifeline connectivity state
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('emergency_priorities')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center"
              >
                View Full Triage Matrix <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {priorities.slice(0, 3).map((item) => {
                const isDispatched = dispatchedPrios.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                          {item.priorityTitle}
                        </span>
                        <span className="text-sm font-bold text-slate-100">{item.locationName}</span>
                        <span className="text-xs text-slate-400">
                          ({item.district}, {item.state})
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-amber-400">Diagnostic Factor:</strong> {item.reasoning}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        <span className="text-blue-300">
                          👥 <strong>{item.populationAffected.toLocaleString()}</strong> residents
                        </span>
                        <span>•</span>
                        <span className="text-orange-300">
                          🛣️ <strong>{item.roadConnectivityState}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          🏥 Hospital: <strong>{item.hospitalAccessible ? 'Accessible' : 'Cut Off'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const match = locations.find((l) => l.name.includes(item.locationName.split(' ')[0]));
                          if (match) onSelectLocation(match);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        View Slope
                      </button>

                      <button
                        onClick={() => handleDispatchPriority(item.id)}
                        disabled={isDispatched}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                          isDispatched
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
                        }`}
                      >
                        {isDispatched ? '✓ Units Dispatched' : 'Dispatch NDRF/PWD'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Rainfall vs Risk by District */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  24h Rainfall vs Landslide Risk Score
                </h3>
                <span className="text-[11px] text-slate-400">By District</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtRiskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="riskScore" name="Risk Score (0-100)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rainfall24h" name="24h Rain (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Risk Level Distribution & Telemetry */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Landslide Hazard Distribution
                </h3>
                <span className="text-[11px] text-slate-400">Active NER Slopes</span>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RISK SEVERITY LEVELS DASHBOARD */}
      {activeSection === 'risk_severity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <ShieldAlert className="w-5 h-5 mr-2 text-red-400" />
                  Risk Severity Levels & Slope Vulnerability Index
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Categorized by geotechnical slope angle, soil saturation, and historical landslide recurrence
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 font-bold border border-red-800">
                  Critical: {criticalLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 font-bold border border-orange-800">
                  High: {highLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-yellow-950 text-yellow-300 font-bold border border-yellow-800">
                  Moderate: {moderateLocations.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Low: {lowLocations.length}
                </span>
              </div>
            </div>

            {/* Severity Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Critical Severity Card */}
              <div className="bg-red-950/30 border border-red-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-400 uppercase tracking-wider">
                    CRITICAL HAZARD (76-100)
                  </span>
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                </div>
                <p className="text-2xl font-extrabold text-red-200">{criticalLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Immediate mass movement imminent. Soil saturation &gt;85%, slope &gt;45°. Evacuate toe settlement zones.
                </p>
                <div className="pt-2 border-t border-red-900/40 space-y-1">
                  {criticalLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/60 text-red-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name} ({loc.district})</span>
                      <span className="font-mono font-bold text-red-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* High Severity Card */}
              <div className="bg-orange-950/30 border border-orange-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
                    HIGH RISK (51-75)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-orange-200">{highLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Severe instability triggered by continuous monsoon rain. Restrict night highway transit.
                </p>
                <div className="pt-2 border-t border-orange-900/40 space-y-1">
                  {highLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-orange-900/40 hover:bg-orange-800/60 text-orange-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-orange-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderate Severity Card */}
              <div className="bg-yellow-950/30 border border-yellow-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                    MODERATE (26-50)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-yellow-200">{moderateLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Heightened vigilance. IoT piezometers and rainfall sensors reporting elevated pore water pressure.
                </p>
                <div className="pt-2 border-t border-yellow-900/40 space-y-1">
                  {moderateLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-yellow-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Low Severity Card */}
              <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    LOW RISK (0-25)
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-200">{lowLocations.length} Slopes</p>
                <p className="text-xs text-slate-300 leading-snug">
                  Stable geotechnical parameters. Standard baseline monitoring active.
                </p>
                <div className="pt-2 border-t border-emerald-900/40 space-y-1">
                  {lowLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => onSelectLocation(loc)}
                      className="w-full text-left px-2 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-[11px] font-semibold flex items-center justify-between"
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="font-mono font-bold text-emerald-300 ml-1">{loc.riskScore}/100</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: ROAD CONNECTIVITY STATUS DASHBOARD */}
      {activeSection === 'road_connectivity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <Truck className="w-5 h-5 mr-2 text-amber-400" />
                  Highway Lifeline Connectivity & Blockage Clearance Radar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Critical supply corridors connecting remote hill districts across 8 NER states
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded bg-red-950 text-red-300 border border-red-700">
                  {blockedRoads.length} Fully Blocked
                </span>
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 border border-orange-700">
                  {partialRoads.length} Partially Blocked
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {clearRoads.length} Clear Corridors
                </span>
              </div>
            </div>

            {/* List of All Monitored Highway Lifelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roads.map((road) => {
                const isBlocked = road.status === 'FULLY_BLOCKED';
                const isPartial = road.status === 'PARTIALLY_BLOCKED';
                return (
                  <div
                    key={road.id}
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      isBlocked
                        ? 'bg-red-950/20 border-red-600/40'
                        : isPartial
                        ? 'bg-orange-950/20 border-orange-600/40'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-100 flex items-center">
                        <Route className="w-4 h-4 mr-1 text-amber-400" />
                        {road.roadNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isBlocked
                            ? 'bg-red-600 text-white animate-pulse'
                            : isPartial
                            ? 'bg-orange-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {road.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-200">{road.name}</p>

                    {road.blockageLocation && (
                      <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1 text-slate-300">
                        <p className="text-red-400 font-bold flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                          Blockage: {road.blockageLocation.landmark}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Clearance ETA: <strong className="text-slate-200">{road.clearanceETA || 'Under Assessment'}</strong>
                        </p>
                        <p className="text-emerald-400 text-[11px] font-medium">
                          Safe Alternate: {road.alternateRouteName}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>District: {road.district || 'NER Corridor'} ({road.state})</span>
                      <span className="text-[10px] text-slate-500 font-mono">{road.importance}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: EMERGENCY RESPONSE PRIORITISATION & GROUND-TRUTH INTELLIGENCE GRID */}
      {activeSection === 'emergency_priorities' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-100 font-['Outfit'] flex items-center">
                  <Flame className="w-5 h-5 mr-2 text-red-400" />
                  Emergency Response Prioritisation & Resource Allocation Grid
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tactical dispatch coordination fusing algorithmic hazard priorities with verified ground-truth intelligence from Field Geotechnical Officers and Citizen Observers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                  NDMA / NDRF Protocol Active
                </span>
              </div>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Priority Sectors</span>
                  <div className="text-base font-extrabold text-slate-100">{priorities.length} Active</div>
                </div>
              </div>

              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-800/80 text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Field Officer Reports</span>
                  <div className="text-base font-extrabold text-blue-300">
                    {incidentList.filter((i) => i.reporterRole.toLowerCase().includes('officer') || i.reporterRole.toLowerCase().includes('pwd')).length} Verified
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Citizen Reports</span>
                  <div className="text-base font-extrabold text-emerald-300">
                    {incidentList.filter((i) => i.reporterRole.toLowerCase().includes('citizen')).length} Crowdsourced
                  </div>
                </div>
              </div>

              <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Photos & AI Feedback</span>
                  <div className="text-base font-extrabold text-amber-300">
                    {incidentList.filter((i) => i.photoUrl && i.aiAssessment).length} Processed
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Controls Toolbar */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Source Filters */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Source:
                </span>
                <button
                  onClick={() => setReportSourceFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    reportSourceFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  All Grid & Intel ({priorities.length + incidentList.length})
                </button>
                <button
                  onClick={() => setReportSourceFilter('field_officer')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    reportSourceFilter === 'field_officer'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-800 text-blue-300 hover:bg-slate-750'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Field Officer Reports ({incidentList.filter((i) => i.reporterRole.toLowerCase().includes('officer') || i.reporterRole.toLowerCase().includes('pwd')).length})</span>
                </button>
                <button
                  onClick={() => setReportSourceFilter('citizen')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    reportSourceFilter === 'citizen'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-emerald-300 hover:bg-slate-750'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Citizen Reports ({incidentList.filter((i) => i.reporterRole.toLowerCase().includes('citizen')).length})</span>
                </button>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1">Severity:</span>
                {(['all', 'Critical', 'High', 'Medium'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setReportSeverityFilter(sev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      reportSeverityFilter === sev
                        ? sev === 'Critical'
                          ? 'bg-red-600 text-white'
                          : sev === 'High'
                          ? 'bg-amber-500 text-slate-950'
                          : sev === 'Medium'
                          ? 'bg-yellow-500 text-slate-950'
                          : 'bg-slate-700 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sev === 'all' ? 'All' : sev}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION A: STRATEGIC RESOURCE PRIORITISATION SECTORS (Visible when all selected) */}
            {reportSourceFilter === 'all' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Strategic Algorithmic Dispatch Priorities (Ranked Grid)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Showing top {priorities.length} composite risk allocations
                  </span>
                </div>

                <div className="space-y-3">
                  {priorities
                    .filter((item) => {
                      if (reportSeverityFilter === 'Critical') return item.priorityTitle.includes('CRITICAL') || item.priorityTitle.includes('High');
                      if (reportSeverityFilter === 'High') return item.priorityTitle.includes('HIGH') || item.priorityTitle.includes('Urgent');
                      if (reportSeverityFilter === 'Medium') return item.priorityTitle.includes('MONITOR') || item.priorityTitle.includes('Active');
                      return true;
                    })
                    .map((item, index) => {
                      const isDispatched = dispatchedPrios.includes(item.id);
                      const normState = item.state.toLowerCase();
                      const normDist = item.district.toLowerCase();
                      const normLoc = item.locationName.toLowerCase();
                      const locKeywords = normLoc.split(/[\s,-]+/).filter((w) => w.length > 3);

                      // Match ground reports for this priority sector
                      const matchedIncidents = incidentList.filter((inc) => {
                        const incState = inc.state.toLowerCase();
                        const incDist = inc.district.toLowerCase();
                        const incLoc = inc.locationName.toLowerCase();

                        return (
                          incDist.includes(normDist) ||
                          normDist.includes(incDist) ||
                          locKeywords.some((kw) => incLoc.includes(kw) || inc.title.toLowerCase().includes(kw)) ||
                          incState === normState
                        );
                      });

                      const pool = matchedIncidents.length > 0 ? matchedIncidents : incidentList;

                      const officerReport =
                        pool.find((i) => i.reporterRole.toLowerCase().includes('officer') || i.reporterRole.toLowerCase().includes('pwd')) ||
                        incidentList.find((i) => i.reporterRole.toLowerCase().includes('officer') || i.reporterRole.toLowerCase().includes('pwd'));

                      const citizenReport =
                        pool.find((i) => i.reporterRole.toLowerCase().includes('citizen')) ||
                        incidentList.find((i) => i.reporterRole.toLowerCase().includes('citizen'));

                      const currentSource = selectedPhotoSourceForPrio[item.id] || (officerReport ? 'field_officer' : 'citizen');
                      const activeReport = currentSource === 'field_officer' ? (officerReport || citizenReport) : (citizenReport || officerReport);
                      const isExpanded = !!expandedPriorityReports[item.id];

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-850 border border-slate-800 hover:border-slate-750 p-4 rounded-xl transition-all space-y-3 shadow-lg"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                                  {item.priorityTitle}
                                </span>
                                <span className="text-sm font-bold text-slate-100">{item.locationName}</span>
                                <span className="text-xs text-slate-400">
                                  ({item.district}, {item.state})
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed">
                                <strong className="text-amber-400">Diagnostic Factor:</strong> {item.reasoning}
                              </p>

                              {/* DETAILS ROW WITH STATS AND DIRECT OPTION TO SHOW GIS PHOTO */}
                              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                  <span className="text-blue-300 flex items-center gap-1">
                                    <span>👥</span>
                                    <span><strong>{item.populationAffected.toLocaleString()}</strong> residents</span>
                                  </span>
                                  <span>•</span>
                                  <span className="text-orange-300 flex items-center gap-1">
                                    <span>🛣️</span>
                                    <span><strong>{item.roadConnectivityState}</strong></span>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <span>🏥</span>
                                    <span>Hospital: <strong className={item.hospitalAccessible ? 'text-emerald-400' : 'text-red-400'}>{item.hospitalAccessible ? 'Accessible' : 'Cut Off'}</strong></span>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-blue-300">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>Field Officer Reports: <strong className={officerReport ? 'text-blue-300' : 'text-slate-500'}>{officerReport ? '1 Verified' : '0 Reports'}</strong></span>
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-emerald-300">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Citizen Reports: <strong className={citizenReport ? 'text-emerald-300' : 'text-slate-500'}>{citizenReport ? '1 Active' : '0 Reports'}</strong></span>
                                  </span>
                                </div>

                                {/* Option in Details Row: Show GIS Photo sent by Field Officer or Citizen */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedPriorityReports((prev) => ({
                                        ...prev,
                                        [item.id]: !prev[item.id],
                                      }))
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                                      isExpanded
                                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20'
                                        : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-500/40 hover:border-amber-400'
                                    }`}
                                    title="Click to toggle GIS photo sent by field officer or citizen in their report"
                                  >
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>{isExpanded ? 'Hide GIS Photo' : 'Show GIS Photo'}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/90 text-slate-200 border border-slate-700 font-mono">
                                      {officerReport && citizenReport
                                        ? 'Officer & Citizen'
                                        : officerReport
                                        ? 'Field Officer'
                                        : 'Citizen'}
                                    </span>
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-xs text-emerald-300 flex items-center justify-between">
                                <div>
                                  <strong>Operational Directive:</strong> {item.suggestedAction}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  const match = locations.find((l) => l.name.includes(item.locationName.split(' ')[0]));
                                  if (match) onSelectLocation(match);
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                              >
                                Inspect Slope
                              </button>

                              <button
                                onClick={() => handleDispatchPriority(item.id)}
                                disabled={isDispatched}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                                  isDispatched
                                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 active:scale-95'
                                }`}
                              >
                                {isDispatched ? '✓ Units Dispatched' : 'Dispatch NDRF / SDRF'}
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED GIS PHOTO & AI INTELLIGENCE DETAILS VIEW */}
                          {isExpanded && activeReport && (
                            <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-3.5 animate-in fade-in duration-200">
                              {/* Source Selector: Field Officer Photo vs Citizen Photo */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Report GIS Photo Source:
                                  </span>
                                  <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                                    {officerReport && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedPhotoSourceForPrio((prev) => ({
                                            ...prev,
                                            [item.id]: 'field_officer',
                                          }))
                                        }
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                          currentSource === 'field_officer'
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                                        <span>Field Officer GIS Photo</span>
                                      </button>
                                    )}

                                    {citizenReport && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedPhotoSourceForPrio((prev) => ({
                                            ...prev,
                                            [item.id]: 'citizen',
                                          }))
                                        }
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                                          currentSource === 'citizen'
                                            ? 'bg-emerald-600 text-white shadow-md'
                                            : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                      >
                                        <Users className="w-3.5 h-3.5 text-emerald-300" />
                                        <span>Citizen GIS Photo</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                      activeReport.severity.toLowerCase() === 'critical'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-amber-500 text-slate-950'
                                    }`}
                                  >
                                    {activeReport.severity} Severity
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(activeReport.reportedAt).toLocaleDateString()} {new Date(activeReport.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>

                              {/* Photo Canvas + AI Telemetry Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Geotagged Photo Display */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                      <Camera className="w-4 h-4 text-amber-400" />
                                      <span>
                                        {currentSource === 'field_officer' ? 'Official Field Officer Photo' : 'Crowdsourced Citizen Photo'}
                                      </span>
                                    </span>
                                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                      By <strong className="text-slate-200">{activeReport.reportedBy}</strong> ({activeReport.reporterRole})
                                    </span>
                                  </div>

                                  <div
                                    onClick={() => setSelectedPhotoModal(activeReport)}
                                    className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer aspect-video max-h-56"
                                    title="Click to zoom high-resolution photo"
                                  >
                                    {activeReport.photoUrl ? (
                                      <img
                                        src={activeReport.photoUrl}
                                        alt={activeReport.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                                        No photo available
                                      </div>
                                    )}

                                    {/* Stamped Watermark Header */}
                                    <div className="absolute top-2 left-2 right-2 px-2.5 py-1 rounded bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-200 flex flex-wrap items-center justify-between gap-1 shadow-md">
                                      <span className="flex items-center text-amber-300 font-bold">
                                        <MapPin className="w-3 h-3 mr-1 text-red-400 shrink-0" />
                                        {activeReport.lat.toFixed(4)}°N, {activeReport.lng.toFixed(4)}°E
                                      </span>
                                      <span className="text-slate-300">
                                        Slope Incline: {activeReport.aiAssessment?.slopeAngleEstimate || 38}°
                                      </span>
                                    </div>

                                    {/* Hover Enlarge Callout */}
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-2">
                                      <ZoomIn className="w-4 h-4 text-amber-400" />
                                      <span>Click to Enlarge High-Resolution Photo</span>
                                    </div>

                                    {/* Stamped Footer */}
                                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-mono">
                                      <span className="truncate max-w-[200px] text-slate-300">
                                        {activeReport.locationName}
                                      </span>
                                      <span className="text-emerald-400 font-bold shrink-0">
                                        {activeReport.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedPhotoModal(activeReport)}
                                      className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                                    >
                                      <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Enlarge Full-Screen Photo</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const match = locations.find(
                                          (l) =>
                                            l.district.toLowerCase() === activeReport.district.toLowerCase() ||
                                            l.state.toLowerCase() === activeReport.state.toLowerCase() ||
                                            l.name.toLowerCase().includes(activeReport.locationName.toLowerCase().split(' ')[0])
                                        );
                                        if (match) onSelectLocation(match);
                                      }}
                                      className="px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                                    >
                                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                      <span>Locate on GIS Map</span>
                                    </button>
                                  </div>
                                </div>

                                {/* AI Vision Diagnostics & Geotechnical Feedback */}
                                <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-amber-400" />
                                      Automated AI Vision Diagnostic
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-bold">
                                      {Math.round((activeReport.aiAssessment?.confidenceScore || 0.92) * 100)}% Confidence
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                    <p className="font-semibold text-slate-100 mb-1">{activeReport.title}</p>
                                    <p className="text-slate-400 text-[11px] leading-relaxed">{activeReport.description}</p>
                                  </div>

                                  <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                                    "{activeReport.aiAssessment?.explanation}"
                                  </p>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                      <span className="text-slate-400 block text-[10px]">Estimated Slope</span>
                                      <strong className="text-slate-100 font-bold">
                                        {activeReport.aiAssessment?.slopeAngleEstimate || 38}° Incline
                                      </strong>
                                    </div>
                                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                                      <span className="text-slate-400 block text-[10px]">Debris Runout</span>
                                      <strong className="text-slate-100 font-bold truncate">
                                        {activeReport.aiAssessment?.debrisVolumeEstimate || '1,800 m³'}
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="pt-1">
                                    <span className="text-[10px] font-bold text-slate-400 block mb-1">
                                      Detected Geological Hazard Markers:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {activeReport.aiAssessment?.detectedHazards.map((h, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-amber-300 border border-amber-500/30 font-medium"
                                        >
                                          {h}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SECTION B: GROUND-TRUTH INCIDENT INTELLIGENCE FEED (FIELD OFFICER & CITIZEN REPORTS) */}
            <div className="space-y-6 pt-4 border-t border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" />
                    Ground-Truth Incident Intelligence Feed
                  </h4>
                  <p className="text-xs text-slate-400">
                    Live operational ground reports with high-resolution photo evidence, stamped GPS coordinates, and AI vision diagnostics
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">
                    Showing <strong className="text-blue-300">{incidentList.filter((i) => (i.reporterRole.toLowerCase().includes('officer') || i.reporterRole.toLowerCase().includes('pwd')) && (reportSeverityFilter === 'all' || i.severity.toLowerCase() === reportSeverityFilter.toLowerCase())).length} Field Officer</strong> & <strong className="text-emerald-300">{incidentList.filter((i) => i.reporterRole.toLowerCase().includes('citizen') && (reportSeverityFilter === 'all' || i.severity.toLowerCase() === reportSeverityFilter.toLowerCase())).length} Citizen</strong> reports
                  </span>
                </div>
              </div>

              {/* FIELD 1: FIELD OFFICER REPORTS */}
              {(reportSourceFilter === 'all' || reportSourceFilter === 'field_officer') && (() => {
                const officerReports = incidentList
                  .filter((inc) => inc.reporterRole.toLowerCase().includes('officer') || inc.reporterRole.toLowerCase().includes('pwd'))
                  .filter((inc) => reportSeverityFilter === 'all' || inc.severity.toLowerCase() === reportSeverityFilter.toLowerCase());

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900 border border-blue-900/60 shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-950 border border-blue-700/80 text-blue-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            Field Officer Reports
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-700 font-mono font-bold">
                              {officerReports.length} Verified
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            Official ground-truth intelligence & slope analysis from deployed Field Geotechnical Officers
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 px-2 py-1 rounded border border-blue-900">
                        OFFICIAL GEOTECHNICAL INTEL
                      </span>
                    </div>

                    {officerReports.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {officerReports.map(renderIncidentCard)}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                        No Field Officer Reports matching severity filter ({reportSeverityFilter}).
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* FIELD 2: CITIZEN REPORTS */}
              {(reportSourceFilter === 'all' || reportSourceFilter === 'citizen') && (() => {
                const citizenReports = incidentList
                  .filter((inc) => inc.reporterRole.toLowerCase().includes('citizen'))
                  .filter((inc) => reportSeverityFilter === 'all' || inc.severity.toLowerCase() === reportSeverityFilter.toLowerCase());

                return (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-slate-900 border border-emerald-900/60 shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/80 text-emerald-400">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            Citizen Reports
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold">
                              {citizenReports.length} Submitted
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">
                            Crowdsourced incident alerts, road blockage notifications, and photo evidence sent directly from citizens
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-900">
                        CROWDSOURCED GROUND TRUTH
                      </span>
                    </div>

                    {citizenReports.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {citizenReports.map(renderIncidentCard)}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                        No Citizen Reports matching severity filter ({reportSeverityFilter}).
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-slate-100">Issue Emergency CAP Alert</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Severity Level
                </label>
                <select
                  value={newAlertLevel}
                  onChange={(e) => setNewAlertLevel(e.target.value as any)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700 focus:ring-1 focus:ring-red-500"
                >
                  <option value="CRITICAL">RED ALERT (Imminent Debris Flow / Evacuate)</option>
                  <option value="HIGH">ORANGE ALERT (Severe Landslide Watch)</option>
                  <option value="MODERATE">YELLOW ALERT (Heightened Vigilance)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target State</label>
                  <input
                    type="text"
                    value={newAlertState}
                    onChange={(e) => setNewAlertState(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                    placeholder="e.g. Assam"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target District</label>
                  <input
                    type="text"
                    value={newAlertDistrict}
                    onChange={(e) => setNewAlertDistrict(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                    placeholder="e.g. Dima Hasao"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Headline</label>
                <input
                  type="text"
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                  placeholder="e.g. RED ALERT: Evacuation Advisory for Haflong-Jatinga"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Advisory Message (Broadcast via SMS / Mobile / Radio)
                </label>
                <textarea
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-2 border border-slate-700"
                  placeholder="Provide precise safety instructions and emergency shelter locations..."
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-600/30 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit CAP Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High-Resolution Ground Photo & AI Diagnostics Modal */}
      {selectedPhotoModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedPhotoModal(null)}
          />

          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col z-10 text-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-['Outfit'] flex items-center gap-2">
                    {selectedPhotoModal.title}
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-extrabold uppercase ${
                        selectedPhotoModal.severity.toLowerCase() === 'critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      {selectedPhotoModal.severity}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Reported by {selectedPhotoModal.reportedBy} ({selectedPhotoModal.reporterRole}) •{' '}
                    {selectedPhotoModal.locationName}, {selectedPhotoModal.district}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 scrollbar-thin">
              {/* Photo Canvas */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[55vh] flex items-center justify-center">
                {selectedPhotoModal.photoUrl ? (
                  <img
                    src={selectedPhotoModal.photoUrl}
                    alt={selectedPhotoModal.title}
                    className="w-full h-full max-h-[55vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="py-20 text-slate-500 text-xs">No image payload available</div>
                )}

                {/* Stamped Watermark Header */}
                <div className="absolute top-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/90 backdrop-blur-sm border border-slate-700/80 text-[11px] font-mono text-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-lg">
                  <span className="flex items-center text-amber-300 font-bold">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />
                    LAT: {selectedPhotoModal.lat.toFixed(6)}°N | LNG: {selectedPhotoModal.lng.toFixed(6)}°E
                  </span>
                  <span className="text-slate-300">
                    Timestamp: {new Date(selectedPhotoModal.reportedAt).toISOString()}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Source: {selectedPhotoModal.reporterRole}
                  </span>
                </div>
              </div>

              {/* AI Vision Diagnostic & Feedback Details */}
              <div className="p-4 rounded-xl bg-slate-850 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Automated AI Vision Diagnostic Report
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    Confidence: {Math.round((selectedPhotoModal.aiAssessment?.confidenceScore || 0.92) * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                  {selectedPhotoModal.aiAssessment?.explanation}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Slope Angle</span>
                    <strong className="text-slate-100 font-bold">
                      {selectedPhotoModal.aiAssessment?.slopeAngleEstimate || 38}° Incline
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Debris Runout</span>
                    <strong className="text-slate-100 font-bold">
                      {selectedPhotoModal.aiAssessment?.debrisVolumeEstimate || '1,800 m³'}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Suggested Severity</span>
                    <strong className="text-red-400 font-bold">
                      {selectedPhotoModal.aiAssessment?.suggestedSeverity || selectedPhotoModal.severity}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Validation State</span>
                    <strong className="text-emerald-400 font-bold">
                      {selectedPhotoModal.status}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Visual Hazard Markers:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPhotoModal.aiAssessment?.detectedHazards.map((hazard, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-900 text-amber-300 border border-amber-500/40 font-semibold"
                      >
                        {hazard}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Original description: <span className="text-slate-300">{selectedPhotoModal.description}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const match = locations.find(
                      (l) =>
                        l.district.toLowerCase() === selectedPhotoModal.district.toLowerCase() ||
                        l.state.toLowerCase() === selectedPhotoModal.state.toLowerCase()
                    );
                    if (match) {
                      onSelectLocation(match);
                      setSelectedPhotoModal(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  Locate on Map
                </button>
                <button
                  onClick={() => setSelectedPhotoModal(null)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
