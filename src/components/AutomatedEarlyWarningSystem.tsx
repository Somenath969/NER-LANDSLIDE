import React, { useState, useEffect } from 'react';
import {
  Radio,
  BellRing,
  Send,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CloudRain,
  Layers,
  Activity,
  Zap,
  Sliders,
  Users,
  RefreshCw,
  Phone,
  MessageSquare,
  Globe,
  Lock,
  Plus,
  Trash2,
  Clock,
  Check,
  Volume2,
} from 'lucide-react';
import {
  LocationData,
  DisasterAlert,
  LanguageCode,
  AutomatedEarlyWarningConfig,
  EarlyWarningSubscriber,
  EarlyWarningBroadcastLog,
} from '../types';
import { translations } from '../locales/translations';

interface AutomatedEarlyWarningSystemProps {
  locations: LocationData[];
  alerts: DisasterAlert[];
  currentLang: LanguageCode;
  onSelectLocation?: (loc: LocationData) => void;
  onCreateAlert?: (alertData: Partial<DisasterAlert>) => void;
}

export const AutomatedEarlyWarningSystem: React.FC<AutomatedEarlyWarningSystemProps> = ({
  locations,
  alerts,
  currentLang,
  onSelectLocation,
  onCreateAlert,
}) => {
  const t = translations[currentLang] || translations.en;

  // Configuration State
  const [config, setConfig] = useState<AutomatedEarlyWarningConfig>({
    id: 'cfg-ner-sentinel-01',
    autoDispatchEnabled: true,
    sentinelStatus: 'ACTIVE_ARMED',
    rainfallThreshold24hMm: 95,
    soilMoistureThresholdPercent: 80,
    slopeTiltRateMmDay: 2.0,
    aiHazardScoreThreshold: 75,
    throttleIntervalMinutes: 30,
    channels: {
      smsCellBroadcast: true,
      appPushNotification: true,
      automatedVoiceIVR: true,
      capProtocol: true,
    },
    targetLanguages: ['en', 'as', 'hi', 'bn'],
    totalRegisteredSubscribers: 48920,
    telecomGatewayStatus: 'OPERATIONAL',
    averageLatencySeconds: 1.4,
    lastSentinelScanTime: new Date().toISOString(),
  });

  const [subscribers, setSubscribers] = useState<EarlyWarningSubscriber[]>([]);
  const [broadcastLogs, setBroadcastLogs] = useState<EarlyWarningBroadcastLog[]>([]);
  const [triggeringLocations, setTriggeringLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isEvaluatingSentinel, setIsEvaluatingSentinel] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);

  // Test SMS Dispatcher State
  const [testPhone, setTestPhone] = useState('+91 94350 12849');
  const [testSector, setTestSector] = useState(locations[0]?.name || 'Haflong Hill Cut');
  const [testLang, setTestLang] = useState<LanguageCode>('en');
  const [testChannel, setTestChannel] = useState<'SMS' | 'IVR'>('SMS');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  // New Subscriber Modal State
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubRole, setNewSubRole] = useState<'Village Headman' | 'VDMC Volunteer' | 'School Headmaster' | 'Emergency Medical Staff' | 'Transport Driver' | 'Citizen'>('Village Headman');
  const [newSubDistrict, setNewSubDistrict] = useState('Dima Hasao');
  const [newSubSector, setNewSubSector] = useState('Haflong Town');
  const [newSubLang, setNewSubLang] = useState<LanguageCode>('as');

  // Sub-Tab inside Early Warning View
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'subscribers' | 'logs'>('overview');

  // Load config, subscribers, and logs from backend
  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      const [cfgRes, subRes, logRes] = await Promise.all([
        fetch('/api/early-warning/config'),
        fetch('/api/early-warning/subscribers'),
        fetch('/api/early-warning/logs'),
      ]);

      if (cfgRes.ok) {
        const data = await cfgRes.json();
        if (data.config) setConfig(data.config);
        if (data.triggeringLocations) setTriggeringLocations(data.triggeringLocations);
      }
      if (subRes.ok) {
        const data = await subRes.json();
        if (data.subscribers) setSubscribers(data.subscribers);
      }
      if (logRes.ok) {
        const data = await logRes.json();
        if (data.logs) setBroadcastLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch early warning data from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  // Save updated config
  const handleSaveConfig = async (newConfig: Partial<AutomatedEarlyWarningConfig>) => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/early-warning/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          // Refresh triggering locations
          const cfgRes = await fetch('/api/early-warning/config');
          const cfgData = await cfgRes.json();
          if (cfgData.triggeringLocations) setTriggeringLocations(cfgData.triggeringLocations);
        }
      }
    } catch (err) {
      console.warn('Save config error:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Run instant sentinel scan
  const handleRunSentinelScan = async () => {
    setIsEvaluatingSentinel(true);
    setEvaluationResult(null);
    try {
      const res = await fetch('/api/early-warning/evaluate-sentinel', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data.message);
        loadSystemData();
      }
    } catch (err) {
      setEvaluationResult('Scan failed to complete. Check network gateway.');
    } finally {
      setIsEvaluatingSentinel(false);
    }
  };

  // Dispatch Test Alert
  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/early-warning/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          sectorName: testSector,
          language: testLang,
          channel: testChannel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(data);
        // Refresh logs
        const logRes = await fetch('/api/early-warning/logs');
        const logData = await logRes.json();
        if (logData.logs) setBroadcastLogs(logData.logs);
      }
    } catch (err) {
      console.warn('Test send error:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Add Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubPhone) return;

    try {
      const res = await fetch('/api/early-warning/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName,
          phone: newSubPhone,
          role: newSubRole,
          district: newSubDistrict,
          state: 'Assam',
          sectorName: newSubSector,
          preferredLanguage: newSubLang,
        }),
      });
      if (res.ok) {
        setShowAddSubModal(false);
        setNewSubName('');
        setNewSubPhone('');
        loadSystemData();
      }
    } catch (err) {
      console.warn('Add subscriber error:', err);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (id: string) => {
    try {
      const res = await fetch(`/api/early-warning/subscribers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.warn('Delete subscriber error:', err);
    }
  };

  // Translations preview dictionary
  const previewTemplates: Record<LanguageCode, string> = {
    en: `[NER-LANDSLIDE EARLY WARNING] HIGH ALERT: IoT piezometer & radar detect active slope saturation at ${testSector}. Move away from road cuts. Emergency: 1070.`,
    as: `[ভূমিস্খলন সতৰ্কবাণী] সতৰ্ক হওক! ${testSector}ত মাটিৰ তীব্ৰ পানী শোষণ আৰু ভূমিস্খলনৰ আশংকা। পাহাৰীয়া পথ পৰিহাৰ কৰক। জৰুৰীকালীন: ১০৭০।`,
    hi: `[भूस्खलन प्रारंभिक चेतावनी] उच्च अलर्ट! ${testSector} में अत्यधिक नमी और ढलान खिसकने का खतरा है। सुरक्षित स्थानों पर रहें। आपातकालीन: 1070।`,
    bn: `[ভূমিধস সতর্কবার্তা] সতর্কবার্তা! ${testSector}-এ মাটি ধসের প্রবল সম্ভাবনা। ঢালু রাস্তা এড়িয়ে চলুন ও নিরাপদ স্থানে যান। জরুরি: ১০৭০।`,
    lus: `[LEILIH VAINA] Fimkhur rawh! ${testSector} ah leimin a hlauhawm hle. Hmun him lam pan rawh. Helpline: 1070.`,
    mni: `[CHING-SHINBA CHEKSIN-WA] Cheksinbiyu! ${testSector} da leikhom hek khei-re. Safe shelter da chatchilbi-u. 1070.`,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-['Plus_Jakarta_Sans']">
      {/* 1. TOP HEADER & OPERATIONAL SENTINEL BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-black text-slate-100 tracking-tight font-['Outfit']">
                  Automated SMS & App-based Early Warning System
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                  SENTINEL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Continuous autonomous monitoring of IoT slope telemetry, rainfall radar, and XGBoost hazard scores with zero-delay SMS cell broadcasts and citizen app alerts.
              </p>
            </div>
          </div>

          {/* Master Autonomous Auto-Dispatch Switch */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-200">
                {config.autoDispatchEnabled ? 'Autonomous Auto-Dispatch' : 'Manual Approval Mode'}
              </p>
              <p className="text-[10px] text-slate-400">
                {config.autoDispatchEnabled ? 'Broadcasts automatically on breach' : 'Requires officer 1-click release'}
              </p>
            </div>
            <button
              onClick={() => handleSaveConfig({ autoDispatchEnabled: !config.autoDispatchEnabled })}
              disabled={isSavingConfig}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                config.autoDispatchEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  config.autoDispatchEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sentinel Live Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Subscribers In Range</span>
            <span className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-cyan-400" />
              {config.totalRegisteredSubscribers.toLocaleString()} Citizens
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Active Telecom Route</span>
            <span className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Priority A+ ({config.averageLatencySeconds}s Latency)
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Multi-Lingual Grid</span>
            <span className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <Globe className="w-4 h-4 text-amber-400" />
              EN • অসমীয়া • हिन्दी • বাংলা
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Triggered Sectors</span>
              <span className="text-base font-bold text-red-400 flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 text-red-400" />
                {triggeringLocations.length} Critical
              </span>
            </div>
            <button
              onClick={handleRunSentinelScan}
              disabled={isEvaluatingSentinel}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluatingSentinel ? 'animate-spin' : ''}`} />
              <span>Scan Now</span>
            </button>
          </div>
        </div>

        {/* Scan Notification Result */}
        {evaluationResult && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{evaluationResult}</span>
            </div>
            <button
              onClick={() => setEvaluationResult(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Automated Triggers & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'simulator'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>SMS Live Dispatcher</span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'subscribers'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Village Contacts Registry ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-2 ${
            activeTab === 'logs'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Dispatch History ({broadcastLogs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: AUTOMATED TRIGGER MATRIX & RULES ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rule 1: 24h Rainfall Surge */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  Rainfall Threshold
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/20">
                  IMD / AWS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger warning when cumulative 24h rainfall crosses limit.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trigger Threshold:</span>
                  <span className="font-bold text-slate-100">{config.rainfallThreshold24hMm} mm / 24h</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="5"
                  value={config.rainfallThreshold24hMm}
                  onChange={(e) => setConfig({ ...config, rainfallThreshold24hMm: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Action:</span>
                <span className="text-amber-400 font-bold">SMS Warning Broadcast</span>
              </div>
            </div>

            {/* Rule 2: Soil Pore Saturation */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Soil Pore Saturation
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                  IoT Piezometers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger when volumetric soil moisture exceeds safety ratio.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trigger Threshold:</span>
                  <span className="font-bold text-slate-100">{config.soilMoistureThresholdPercent}% Saturation</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="95"
                  step="1"
                  value={config.soilMoistureThresholdPercent}
                  onChange={(e) => setConfig({ ...config, soilMoistureThresholdPercent: Number(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Action:</span>
                <span className="text-red-400 font-bold">High Alert & In-App Alarm</span>
              </div>
            </div>

            {/* Rule 3: IoT Slope Tilt Movement */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Slope Tilt Velocity
                </span>
                <span className="text-[10px] bg-orange-500/10 text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-500/20">
                  Inclinometers
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger when sub-surface ground displacement velocity spikes.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trigger Threshold:</span>
                  <span className="font-bold text-slate-100">{config.slopeTiltRateMmDay} mm / day</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={config.slopeTiltRateMmDay}
                  onChange={(e) => setConfig({ ...config, slopeTiltRateMmDay: Number(e.target.value) })}
                  className="w-full accent-orange-400"
                />
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Action:</span>
                <span className="text-red-400 font-bold">Immediate Evacuation Voice IVR</span>
              </div>
            </div>

            {/* Rule 4: AI XGBoost Hazard Score */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  AI Hazard Score
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/20">
                  Multi-Modal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trigger when ML composite failure probability exceeds rating.
              </p>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Trigger Threshold:</span>
                  <span className="font-bold text-slate-100">{config.aiHazardScoreThreshold} / 100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="1"
                  value={config.aiHazardScoreThreshold}
                  onChange={(e) => setConfig({ ...config, aiHazardScoreThreshold: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                <span>Action:</span>
                <span className="text-purple-400 font-bold">CAP Protocol + Police Radio</span>
              </div>
            </div>
          </div>

          {/* Save Settings Bar */}
          <div className="flex justify-end">
            <button
              onClick={() => handleSaveConfig(config)}
              disabled={isSavingConfig}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingConfig ? 'Saving Configuration...' : 'Save & Update Trigger Thresholds'}</span>
            </button>
          </div>

          {/* Currently Tripping Sectors Section */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>Real-Time Sectors Tripping Trigger Thresholds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sectors where live rainfall, moisture, or tilt currently breach safety limits.
                </p>
              </div>
              <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-full font-bold border border-red-500/30">
                {triggeringLocations.length} Triggered
              </span>
            </div>

            {triggeringLocations.length === 0 ? (
              <div className="text-center py-8 text-xs text-emerald-400 space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold">All monitored mountain slopes are currently within safe thresholds.</p>
                <p className="text-slate-400">The Automated Early Warning Sentinel will immediately fire alerts if rainfall or sensor metrics spike.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {triggeringLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="p-4 bg-slate-950 rounded-xl border border-red-900/50 space-y-2.5 hover:border-red-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100 text-xs font-bold">{loc.name}</strong>
                      <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                        {loc.riskLevel} ({loc.riskScore}/100)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      District: {loc.district}, {loc.state}
                    </p>
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 block font-semibold">Breached Safety Criteria:</span>
                      {loc.trippedCriteria?.map((crit: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] bg-red-500/10 text-red-300 px-2 py-0.5 rounded mr-1 mb-1 border border-red-500/20"
                        >
                          ⚠️ {crit}
                        </span>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Auto-Dispatched:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        SMS + App Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SMS & APP LIVE DISPATCHER SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dispatch Control Form */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-400" />
                <span>Targeted Emergency Alert Dispatcher</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send an instant test or emergency warning SMS to mobile devices across the North Eastern region.
              </p>
            </div>

            <form onSubmit={handleSendTestAlert} className="space-y-3.5 text-xs">
              {/* Target Phone Number */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Recipient Mobile Number (E.164 Format):
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+91 94350 12849"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Target Hazard Sector */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Landslide Sector / Corridor:
                </label>
                <select
                  value={testSector}
                  onChange={(e) => setTestSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name} ({l.district}, {l.state}) - Risk: {l.riskScore}/100
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Broadcast Language:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'as', label: 'অসমীয়া (Assamese)' },
                    { id: 'hi', label: 'हिन्दी (Hindi)' },
                    { id: 'bn', label: 'বাংলা (Bengali)' },
                  ].map((lang) => (
                    <button
                      type="button"
                      key={lang.id}
                      onClick={() => setTestLang(lang.id as LanguageCode)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        testLang === lang.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel Mode */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Transmission Channel:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'SMS', label: 'SMS Broadcast', icon: MessageSquare },
                    { id: 'IVR', label: 'Automated IVR Call', icon: Volume2 },
                  ].map((chan) => (
                    <button
                      type="button"
                      key={chan.id}
                      onClick={() => setTestChannel(chan.id as any)}
                      className={`p-2 rounded-xl text-center border flex items-center justify-center gap-1.5 transition-all ${
                        testChannel === chan.id
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <chan.icon className="w-3.5 h-3.5" />
                      <span>{chan.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isSendingTest}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingTest ? 'Transmitting Over Telecom Gateway...' : 'Send Live Test Warning'}</span>
              </button>
            </form>

            {/* Delivery Acknowledgment Feedback */}
            {testResult && (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-800 rounded-xl space-y-2 text-xs text-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Handset Delivery Acknowledged
                  </span>
                  <span className="text-[10px] bg-emerald-900 text-emerald-100 px-2 py-0.5 rounded font-mono">
                    Latency: {testResult.latencySeconds}s
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Route: {testResult.telecomRoute} • GSM Credits: {testResult.gsmCredits}
                </p>
              </div>
            )}
          </div>

          {/* Smartphone Simulator Preview */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-slate-900 border-4 border-slate-800 rounded-[36px] p-4 shadow-2xl relative">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Phone Screen Canvas */}
              <div className="bg-slate-950 rounded-[24px] p-4 border border-slate-800 space-y-4 min-h-[380px]">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pb-2 border-b border-slate-800">
                  <span>AIRTEL 4G / BSNL</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>100% 🔋</span>
                </div>

                {/* SMS Notification Bubble */}
                <div className="bg-slate-900/90 border border-red-500/40 rounded-2xl p-3.5 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-red-600 rounded-lg text-white">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-red-400">AX-NDMAEW (Disaster Auth)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">NOW</span>
                  </div>

                  <p className="text-xs text-slate-100 leading-relaxed font-sans">
                    {previewTemplates[testLang] || previewTemplates.en}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Priority Emergency Alert</span>
                    <span className="text-emerald-400 font-bold">1070 Helpline</span>
                  </div>
                </div>

                {/* In-App Push Notification Bubble */}
                <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-3 space-y-1.5 shadow-md">
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-300">
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    <span>NER LandslideWatch App</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    High saturation detected at {testSector}. Safe detour route computed via GIS Navigation.
                  </p>
                </div>
              </div>

              {/* Home bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-4" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: VILLAGE CONTACTS & SUBSCRIBERS REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'subscribers' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Village Headmen & Key Community Disaster Contacts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Designated community leaders, school principals, and volunteers receiving automated emergency voice and SMS alerts.
              </p>
            </div>
            <button
              onClick={() => setShowAddSubModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Contact</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Contact Name</th>
                  <th className="p-3">Role / Designation</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Assigned Sector</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Language</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-850 transition-colors">
                    <td className="p-3 font-semibold text-slate-100">{sub.name}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px]">
                        {sub.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-cyan-300">{sub.phone}</td>
                    <td className="p-3 text-slate-300">{sub.sectorName}</td>
                    <td className="p-3 text-slate-400">{sub.district}, {sub.state}</td>
                    <td className="p-3 uppercase font-bold text-amber-300">{sub.preferredLanguage}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub.id)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-950/50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: AUTOMATED DISPATCH HISTORY LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Automated Warning Dispatch History Ledger</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically verified audit trail of all automated multi-channel emergency transmissions.
            </p>
          </div>

          <div className="space-y-3">
            {broadcastLogs.map((log, idx) => (
              <div
                key={`${log.id || 'ew-log'}-${idx}`}
                className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-cyan-300 font-bold">{log.broadcastCode}</span>
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-bold">
                      {log.riskSeverity}
                    </span>
                    <span className="text-slate-400 font-semibold">{log.sectorName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <p className="text-slate-200"><strong>Message:</strong> {log.messagePreviewEn}</p>
                  {log.messagePreviewLocal && (
                    <p className="text-amber-200 mt-1"><strong>Regional:</strong> {log.messagePreviewLocal}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <span>Trigger: <strong className="text-slate-200">{log.triggerReading}</strong></span>
                  <div className="flex items-center gap-3">
                    <span>Recipients: <strong className="text-slate-200">{log.totalRecipients.toLocaleString()}</strong></span>
                    <span className="text-emerald-400 font-bold">Delivered: {log.deliveredCount.toLocaleString()}</span>
                    <span>Latency: {log.latencySeconds}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW CONTACT */}
      {/* ========================================================================= */}
      {showAddSubModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Register Community Emergency Contact</span>
              </h3>
              <button
                onClick={() => setShowAddSubModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubscriber} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name & Title:</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Gaonburha L. Jidung"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone (+91):</label>
                <input
                  type="tel"
                  required
                  value={newSubPhone}
                  onChange={(e) => setNewSubPhone(e.target.value)}
                  placeholder="+91 94350 12849"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Role / Designation:</label>
                  <select
                    value={newSubRole}
                    onChange={(e) => setNewSubRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Village Headman">Village Headman</option>
                    <option value="VDMC Volunteer">VDMC Volunteer</option>
                    <option value="School Headmaster">School Headmaster</option>
                    <option value="Emergency Medical Staff">Medical Staff</option>
                    <option value="Transport Driver">Transport Driver</option>
                    <option value="Citizen">Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Preferred Language:</label>
                  <select
                    value={newSubLang}
                    onChange={(e) => setNewSubLang(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="as">অসমীয়া (Assamese)</option>
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">District:</label>
                <input
                  type="text"
                  required
                  value={newSubDistrict}
                  onChange={(e) => setNewSubDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specific Sector / Hill Range:</label>
                <input
                  type="text"
                  required
                  value={newSubSector}
                  onChange={(e) => setNewSubSector(e.target.value)}
                  placeholder="Haflong Town & Mahur Ridge"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

