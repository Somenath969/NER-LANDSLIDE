import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Key,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  Camera,
  UserCheck,
  FileText,
  Radio,
  Server,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchSupabaseStatus,
  seedSupabaseDatabase,
  fetchSupabaseSQLSchema,
  testSupabaseInsert,
  SupabaseStatusData,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_KEY,
  sanitizeSupabaseUrl,
  sanitizeSupabaseKey,
  extractSupabaseProjectId,
} from '../services/supabaseClient';
import { LanguageCode } from '../types';

interface SupabaseBaaSViewProps {
  currentLang: LanguageCode;
  onRefreshAllData?: () => void;
}

export const SupabaseBaaSView: React.FC<SupabaseBaaSViewProps> = ({
  onRefreshAllData,
}) => {
  const [status, setStatus] = useState<SupabaseStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [seedErrorMsg, setSeedErrorMsg] = useState<string | null>(null);

  // Test Runner state
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
    error?: any;
    hint?: string;
  } | null>(null);

  // SQL Schema state
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [showSql, setShowSql] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const activeProjectId = status?.projectId || extractSupabaseProjectId(import.meta.env.VITE_SUPABASE_URL) || 'wthajsdsaryerqkglysp';
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;
  const activePublishableKey = sanitizeSupabaseKey(rawKey) || DEFAULT_SUPABASE_KEY;
  const activeSupabaseUrl = status?.url || sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSupabaseStatus();
      setStatus(data);
    } catch {
      // handled in service
    } finally {
      setLoading(false);
    }
  };

  const loadSchema = async () => {
    try {
      const sql = await fetchSupabaseSQLSchema();
      setSqlSchema(sql);
    } catch (err) {
      console.warn('Failed to load SQL schema:', err);
    }
  };

  useEffect(() => {
    loadStatus();
    loadSchema();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccessMsg(null);
    setSeedErrorMsg(null);
    try {
      const res = await seedSupabaseDatabase();
      if (res.success) {
        setSeedSuccessMsg('Successfully seeded Supabase database with NER GIS, IoT sensors, photos, and incident datasets!');
        await loadStatus();
        if (onRefreshAllData) onRefreshAllData();
      } else {
        const errorDetail = res.error || 'Seeding failed.';
        const isTableMissing = errorDetail.includes('relation') || errorDetail.includes('PGRST205') || errorDetail.includes('schema cache');
        setSeedErrorMsg(
          isTableMissing
            ? 'Tables not found in Supabase yet. Please execute the SQL Migration Script below in your Supabase SQL Editor first, then click Seed.'
            : errorDetail
        );
      }
    } catch (err: any) {
      setSeedErrorMsg(err?.message || 'Error executing seed action');
    } finally {
      setSeeding(false);
    }
  };

  const handleRunTest = async (type: 'login' | 'photo' | 'incident') => {
    setTestingType(type);
    setTestResult(null);
    try {
      const res = await testSupabaseInsert(type);
      setTestResult(res);
      await loadStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Test execution failed',
      });
    } finally {
      setTestingType(null);
    }
  };

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tableList = [
    { key: 'profiles', label: 'User Profiles', count: status?.tables.profiles, desc: 'User accounts, agencies & RBAC' },
    { key: 'user_logins', label: 'User Logins', count: status?.tables.user_logins, desc: 'Login history & device audits' },
    { key: 'incident_photos', label: 'Incident Photos', count: status?.tables.incident_photos, desc: 'Geotagged field photos & EXIF' },
    { key: 'incidents', label: 'Incidents', count: status?.tables.incidents, desc: 'Citizen & field hazard reports' },
    { key: 'locations', label: 'GIS Locations', count: status?.tables.locations, desc: 'PostGIS spatial risk zones' },
    { key: 'sensors', label: 'IoT Sensors', count: status?.tables.sensors, desc: 'Pore pressure & tilt telemetry' },
    { key: 'disaster_alerts', label: 'Disaster Alerts', count: status?.tables.disaster_alerts, desc: 'CAP India broadcast alerts' },
    { key: 'road_lifelines', label: 'Road Lifelines', count: status?.tables.road_lifelines, desc: 'Highway corridors & detour routes' },
    { key: 'audit_logs', label: 'Audit Logs', count: status?.tables.audit_logs, desc: 'Cryptographic provenance trail' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Credentials Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Supabase Cloud Backend (BaaS)
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                    CONNECTED & ACTIVE
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Connected to Project <strong className="text-emerald-400 font-mono">{activeProjectId}</strong>. Persisting logins, geotagged photos, and incident reports.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={loadStatus}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2.5 rounded-xl flex items-center space-x-2 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${seeding ? 'animate-bounce' : ''}`} />
              <span>{seeding ? 'Seeding Tables...' : 'Seed Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block">Project ID:</span>
              <span className="font-mono text-emerald-400 font-semibold">{activeProjectId}</span>
            </div>
            <a
              href={`https://supabase.com/dashboard/project/${activeProjectId}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-white p-1 rounded"
              title="Open in Supabase Dashboard"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-slate-400 block">Project Endpoint:</span>
              <span className="font-mono text-slate-200 truncate block">{activeSupabaseUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(activeSupabaseUrl, setCopiedUrl)}
              className="text-slate-400 hover:text-white p-1 rounded shrink-0 cursor-pointer"
              title="Copy URL"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-slate-400 block">Publishable API Key:</span>
              <span className="font-mono text-slate-300 truncate block">
                {activePublishableKey.slice(0, 16)}...{activePublishableKey.slice(-8)}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(activePublishableKey, setCopiedKey)}
              className="text-slate-400 hover:text-white p-1 rounded shrink-0 cursor-pointer"
              title="Copy Publishable Key"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {seedSuccessMsg && (
          <div className="mt-4 p-4 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-sm text-emerald-200 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}

        {seedErrorMsg && (
          <div className="mt-4 p-4 bg-amber-950/80 border border-amber-700/60 rounded-xl text-sm text-amber-200 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold">Action Required: Tables Not Initialized in Supabase</div>
              <p className="text-xs text-amber-300/90">{seedErrorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Connected Data Types Grid (User Logins, Photos, Incidents, Lifelines) */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <span>Connected Data Types & Live Supabase Synchronization</span>
          </h2>
          <p className="text-xs text-slate-400">
            Every login, captured photo, citizen report, and emergency advisory is connected to your Supabase project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: User Logins & Profiles */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                  {status?.tables.profiles !== null ? `${status?.tables.profiles ?? 0} Profiles` : 'Pending Schema'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">User Logins & Profiles</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Persists user credentials, full names, official agencies, RBAC permissions, and phone OTP verifications in Supabase <code className="text-blue-300">profiles</code> and <code className="text-blue-300">user_logins</code>.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => handleRunTest('login')}
                disabled={testingType === 'login'}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Key className={`w-3.5 h-3.5 ${testingType === 'login' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'login' ? 'Syncing...' : 'Test Sync Login Record'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Incident Photos & Storage */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  {status?.tables.incident_photos !== null ? `${status?.tables.incident_photos ?? 0} Photos` : 'Pending Schema'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Photos & Evidence</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Uploads high-resolution field photos to Supabase Storage bucket <code className="text-emerald-300">incident-photos</code> with EXIF metadata, GPS geotags, and AI hazard assessment.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => handleRunTest('photo')}
                disabled={testingType === 'photo'}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Camera className={`w-3.5 h-3.5 ${testingType === 'photo' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'photo' ? 'Uploading...' : 'Test Upload Evidence Photo'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Submitted Incidents */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                  {status?.tables.incidents !== null ? `${status?.tables.incidents ?? 0} Reports` : 'Pending Schema'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Submitted Incidents</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Citizen sightings and field officer geotechnical surveys with GPS coordinates, hazard severity, and reporter details are written directly to Supabase <code className="text-rose-300">incidents</code>.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => handleRunTest('incident')}
                disabled={testingType === 'incident'}
                className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <FileText className={`w-3.5 h-3.5 ${testingType === 'incident' ? 'animate-spin' : ''}`} />
                <span>{testingType === 'incident' ? 'Inserting...' : 'Test Submit Incident'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Test Feedback Console */}
        {testResult && (
          <div className="mt-4 p-4 rounded-xl border bg-slate-950/90 font-mono text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-300">Supabase Live Execution Result:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  testResult.success
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {testResult.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <p className={testResult.success ? 'text-emerald-400' : 'text-rose-400'}>
              {testResult.message}
            </p>
            {testResult.hint && (
              <div className="p-2.5 bg-amber-950/60 border border-amber-800/60 rounded text-amber-300 text-[11px]">
                <strong>Notice:</strong> {testResult.hint}
              </div>
            )}
            {testResult.data && (
              <pre className="bg-slate-900 p-2.5 rounded text-slate-300 overflow-x-auto text-[11px]">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* 3. Step-by-Step Setup Guide & SQL Schema Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Supabase Database Setup & SQL Migration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              To create the required tables in project <strong className="text-emerald-400 font-mono">{activeProjectId}</strong>, run this SQL script in your Supabase SQL Editor.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => copyToClipboard(sqlSchema, setCopiedSql)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 shadow cursor-pointer transition"
            >
              {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema Script'}</span>
            </button>
            <a
              href={`https://supabase.com/dashboard/project/${activeProjectId}/sql`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-xl flex items-center space-x-1.5 border border-slate-700 transition"
            >
              <span>Open SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* 3-Step Visual Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="font-bold text-white">Copy Migration Script</h4>
            <p className="text-slate-400">
              Click &ldquo;Copy SQL Schema Script&rdquo; above. It contains DDL for all 9 tables, PostGIS geometries, and photo storage policies.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="font-bold text-white">Execute in Supabase</h4>
            <p className="text-slate-400">
              Open your Supabase SQL Editor at <code className="text-slate-300">/project/{activeProjectId}/sql</code>, paste the script, and click <strong>RUN</strong>.
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="font-bold text-white">Seed & Verify</h4>
            <p className="text-slate-400">
              Return here and click &ldquo;Seed Data to Supabase&rdquo;. All GIS coordinates, sensor nodes, and demo records will populate automatically!
            </p>
          </div>
        </div>

        {/* Expandable SQL Viewer */}
        <div className="pt-2">
          <button
            onClick={() => setShowSql(!showSql)}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 cursor-pointer py-1"
          >
            <span>{showSql ? 'Hide Complete SQL Migration Script' : 'Preview Complete SQL Migration Script (600+ Lines)'}</span>
            {showSql ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSql && (
            <div className="mt-3 relative">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-96 overflow-y-auto leading-relaxed">
                {sqlSchema || '-- Loading schema...'}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 4. Live Table Row Count Status Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>Live Supabase Database Tables & Records</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live count of records stored in PostgreSQL tables inside your Supabase project.
            </p>
          </div>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Counts</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tableList.map((t) => {
            const hasRows = typeof t.count === 'number' && t.count > 0;
            const isZero = typeof t.count === 'number' && t.count === 0;
            const notFound = t.count === null;

            return (
              <div
                key={t.key}
                className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white text-xs flex items-center space-x-1.5">
                    <span className="font-mono text-slate-300">{t.key}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{t.desc}</span>
                </div>
                <div className="text-right">
                  {notFound ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Not Migrated
                    </span>
                  ) : isZero ? (
                    <span className="text-xs font-bold text-slate-400 font-mono">0 rows</span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {t.count} rows
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
