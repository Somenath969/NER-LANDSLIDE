import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  Radio,
  FileText,
  Truck,
  Activity,
  Cpu,
  Workflow,
  Wifi,
  WifiOff,
  Languages,
  UserCheck,
  AlertTriangle,
  Flame,
  Layers,
  PhoneCall,
  Database,
  Zap,
  RotateCw,
  Menu,
  X,
  Compass,
  BarChart3,
  CloudRain,
  Route,
  Satellite,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  Maximize2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { NERState, RiskLevel, UserRole, LanguageCode, ThemeMode, UserAccount, DisasterAlert, IncidentReport } from '../types';
import { translations } from '../locales/translations';
import { getLocalizedAlert, getLocalizedIncident, getLocalizedState, getLocalizedRiskLevel } from '../locales/contentTranslations';
import { DisasterManagementLogo } from './DisasterManagementLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { NotificationToastData } from './AuthorityNotificationToast';
import { initialAlerts, initialIncidents } from '../data/nerData';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedRisk: string;
  setSelectedRisk: (risk: string) => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onOpenReportModal: () => void;
  onStartDemoTour: () => void;
  onOpenPipelineSimulator?: () => void;
  offlineQueueCount?: number;
  onSyncOfflineQueue?: () => void;
  criticalAlertCount: number;
  alerts?: DisasterAlert[];
  incidents?: IncidentReport[];
  notifications?: NotificationToastData[];
  onDismissNotification?: (id: string) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onNavigateToLanding?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  setIsOnline,
  activeRole,
  setActiveRole,
  currentLang,
  setCurrentLang,
  theme,
  setTheme,
  onOpenReportModal,
  onStartDemoTour,
  onOpenPipelineSimulator,
  offlineQueueCount = 0,
  onSyncOfflineQueue,
  criticalAlertCount,
  alerts,
  incidents = initialIncidents,
  notifications = [],
  onDismissNotification,
  currentUser,
  onOpenAuthModal,
  onNavigateToLanding,
  onLogout,
}) => {
  const t = translations[currentLang] || translations.en;
  const isCitizen = activeRole === 'citizen';

  // Make English the only language for officers
  useEffect(() => {
    if (!isCitizen && currentLang !== 'en') {
      setCurrentLang('en');
    }
  }, [isCitizen, currentLang, setCurrentLang]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'critical' | 'road' | 'weather' | 'reports'>('all');
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [expandedPhotoReportIds, setExpandedPhotoReportIds] = useState<Set<string>>(new Set());
  const [modalPhotoUrl, setModalPhotoUrl] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ner_left_pane_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const activeAlertList: DisasterAlert[] = alerts && alerts.length > 0 ? alerts : initialAlerts;
  const unreadAlerts = activeAlertList.filter((a) => !dismissedAlertIds.has(a.id));
  const unreadToasts = notifications.filter((n) => !dismissedAlertIds.has(n.id));
  const totalUnreadCount = unreadAlerts.length + unreadToasts.length;

  const reportsList = incidents && incidents.length > 0 ? incidents : initialIncidents;

  const togglePhoto = (id: string) => {
    setExpandedPhotoReportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('ner_left_pane_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  };

  const officerRoleLabels: { role: UserRole; label: string }[] = [
    { role: 'state_authority', label: 'State Authority (ASDMA)' },
    { role: 'field_officer', label: 'Field Geotechnical Officer' },
  ];

  // Group 1: "Officer's Dashboard" containing "Authority Dashboard", "Decision Ecosystem", "GIS Risk Map"
  const officersDashboardGroup = {
    group: t.officersDashboardGroup || "Officer's Dashboard",
    items: [
      { id: 'authority_dashboard', label: t.authorityDashboard || 'Authority Dashboard', icon: Activity, badge: t.badgeUnified || 'Unified' },
      { id: 'ecosystem', label: t.decisionEcosystem || 'Decision Ecosystem', icon: Workflow, badge: t.badgeAiEco || 'AI Eco' },
      { id: 'gis_map', label: t.gisMap || 'GIS Risk Map', icon: MapPin, hint: t.locationFinderHint || 'Location Finder' },
    ],
  };

  // Group 2: "Field Officer's Dashboard" containing "Field Officer PWA", "GIS Risk Map"
  const fieldOfficersDashboardGroup = {
    group: t.fieldOfficersDashboardGroup || "Field Officer's Dashboard",
    items: [
      { id: 'field_pwa', label: t.fieldPWA || 'Field Officer PWA', icon: Radio, badge: t.badgeOfflinePwa || 'Offline PWA' },
      { id: 'gis_map', label: t.gisMap || 'GIS Risk Map', icon: MapPin, hint: t.locationFinderHint || 'Location Finder' },
    ],
  };

  // Group 3: "System Operations" containing "Admin & Audit Logs", "ML Model Performance"
  const systemOperationsGroup = {
    group: t.systemOperationsGroup || 'System Operations',
    items: [
      { id: 'admin_audit', label: t.adminAudit || 'Admin & Audit Logs', icon: FileText },
      { id: 'models', label: t.modelLab || 'ML Model Performance', icon: Cpu },
    ],
  };

  // Visibility logic:
  // - for "State Authority (ASDMA)": show "Officer's Dashboard" and "System Operations" groups
  // - for "Field Geotechnical Officer": show "Field Officer's Dashboard" group only
  // - for Citizen: show "PUBLIC DASHBOARD" group
  const navItems = isCitizen
    ? [
        {
          group: t.publicDashboardGroup || 'PUBLIC DASHBOARD',
          items: [
            { id: 'public_portal', label: t.publicPortal || 'Public Portal', icon: ShieldAlert },
            { id: 'gis_map', label: t.gisMap || 'GIS Risk Map', icon: MapPin, hint: t.locationFinderHint || 'Location Finder' },
            { id: 'roads', label: t.roadLifelines || 'Road Lifelines', icon: Truck },
            { id: 'public_weather_forecasts', label: t.weatherLinkedForecast || 'Weather-Linked Forecasts', icon: CloudRain, badge: t.publicBadge || 'Public' },
          ],
        },
      ]
    : activeRole === 'field_officer'
    ? [fieldOfficersDashboardGroup]
    : [officersDashboardGroup, systemOperationsGroup];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 select-none overflow-y-auto scrollbar-thin">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/80 p-1 flex items-center justify-center shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/20 shrink-0">
            <DisasterManagementLogo size={32} />
          </div>
          <div className="min-w-0">
            <span className="font-black text-base tracking-tight bg-gradient-to-r from-amber-300 via-orange-200 to-rose-300 bg-clip-text text-transparent font-['Outfit'] block leading-tight truncate">
              Bhuraksha NER
            </span>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 truncate">
              {t.disasterManagementGrid || 'Disaster Management Grid'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Notification Icon at Top Right Corner - for both Officer and Citizen */}
          <button
            id="navbar-notification-bell-btn"
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 transition-all active:scale-95 shadow-sm group"
            title={t.emergencyNotificationsDrawer || "Emergency Notifications & Alert Broadcasts"}
            aria-label={t.emergencyNotificationsDrawer || "View notifications and emergency alerts"}
          >
            <Bell className="w-4 h-4 transition-transform group-hover:rotate-12 text-slate-300 group-hover:text-amber-300" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 border-2 border-slate-900 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            title="Close navigation"
            aria-label="Close navigation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Emergency Hotline Banner & Alert Counters */}
      <div className="px-3.5 py-2.5 bg-red-950/40 border-b border-red-900/30 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center font-bold text-red-400 animate-pulse text-[11px]">
            <Flame className="w-3.5 h-3.5 mr-1" />
            {t.activeAlertsCount}: {criticalAlertCount}
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-bold rounded">
            {t.demoDataBadge}
          </span>
        </div>
        {isCitizen && (
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center text-slate-300 font-semibold">
              <PhoneCall className="w-3 h-3 mr-1 text-emerald-400" />
              1070 / 112
            </span>
            <span className="text-slate-500">NDRF: 0361-2849005</span>
          </div>
        )}
      </div>

      {/* Quick Actions (Report for citizens, Pipeline for officers) */}
      {(isCitizen || onOpenPipelineSimulator) && (
        <div className="p-3 border-b border-slate-800/80 space-y-1.5">
          {isCitizen && (
            <button
              onClick={onOpenReportModal}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/20 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>{t.reportIncident}</span>
            </button>
          )}

          {!isCitizen && activeRole === 'state_authority' && onOpenPipelineSimulator && (
            <button
              onClick={onOpenPipelineSimulator}
              className="w-full bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] flex items-center justify-center space-x-1 shadow-sm transition-all"
              title="Hazard Simulator"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Hazard Simulator</span>
            </button>
          )}
        </div>
      )}

      {/* Vertical Navigation Links */}
      <div className="flex-1 py-3 px-2.5 space-y-4">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {group.group}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isGreen = (item as any).isGreen;
              return (
                <button
                  key={`${group.group}-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : isGreen
                      ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : isGreen ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Account / Authentication Bar */}
      <div className="p-3 border-t border-slate-800/90 bg-slate-950/70">
        {currentUser ? (
          <div className="w-full p-2 rounded-xl bg-slate-850 border border-slate-700/80 text-left transition-all">
            <div
              onClick={onOpenAuthModal}
              className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-1 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/50 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-100 block truncate group-hover:text-amber-300 transition-colors">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {currentUser.agency}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-blue-400 font-bold px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800 shrink-0">
                {t.profileLabel || 'Profile'}
              </span>
            </div>
            {onLogout && (
              <div className="pt-1.5 border-t border-slate-700/60 mt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                  title={t.logoutLabel || "Sign Out"}
                >
                  <span>{t.logoutLabel || 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="w-full py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>{t.signInRegister || 'Sign In / Register Account'}</span>
          </button>
        )}
      </div>

      {/* Role & Language Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2 text-xs">
        {/* Language Selector (Citizen portal only; Officers use English) */}
        {isCitizen && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Languages className="w-3 h-3 mr-1 text-slate-400" />
              {t.languageSelect}
            </label>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as LanguageCode)}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer font-medium"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="lus">Mizo (Duhlian)</option>
              <option value="mni">মৈতৈলোন্ (Manipuri)</option>
            </select>
          </div>
        )}

        {/* Active Role - Configured per Portal */}
        {isCitizen ? (
          /* Citizen Portal: Show active role as Citizen/Community volentier */
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <UserCheck className="w-3 h-3 mr-1 text-emerald-400" />
              {t.switchRole}
            </label>
            <div className="w-full bg-slate-800/90 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-700 font-medium flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                <span className="font-bold text-emerald-300 truncate text-xs">{t.citizenVolunteerRole || 'Citizen/Community Volunteer'}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold uppercase tracking-wider shrink-0">
                {t.activeBadge || 'Active'}
              </span>
            </div>
          </div>
        ) : (
          /* Officer Portal: Active official role locked after login (cannot be changed) */
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1 text-amber-400" />
                {t.activeOfficialRole || 'Active Official Role'}
              </label>
              <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1" title="Official credentials locked to this session">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
                {t.lockedLabel || 'Locked'}
              </span>
            </div>
            <div className="w-full bg-slate-800/90 text-slate-200 text-xs rounded-lg px-2.5 py-2 border border-slate-700 font-medium flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
                  activeRole === 'field_officer' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`font-bold truncate text-xs ${
                  activeRole === 'field_officer' ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {activeRole === 'field_officer'
                    ? (t.fieldOfficerLabel || 'Field Geotechnical Officer')
                    : (t.stateAuthorityLabel || 'State Authority (ASDMA)')}
                </span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ${
                activeRole === 'field_officer'
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/80 border-amber-800 text-amber-300'
              }`}>
                {t.activeBadge || 'Active'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight px-0.5">
              {t.assignedRoleNotice || 'Assigned via authenticated credentials. Role cannot be changed.'}
            </p>
          </div>
        )}

        {/* PWA Offline Install Button */}
        <PWAInstallButton className="w-full justify-center" />

        {/* Offline Queue Sync (if items queued) */}
        {offlineQueueCount > 0 && (
          <button
            onClick={onSyncOfflineQueue}
            className="w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/60 hover:bg-amber-900 transition-all animate-pulse"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Sync {offlineQueueCount} Queued</span>
          </button>
        )}

        {/* Online / Offline Network Simulator Switch */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            isOnline
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
              : 'bg-rose-950/80 text-rose-300 border-rose-700/60 hover:bg-rose-900 animate-pulse'
          }`}
          title="Toggle online / offline network simulation"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.online}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.offline}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Vertical Sidebar (Persistent Left Side) */}
      <aside
        className={`hidden md:block transition-all duration-300 ease-in-out relative shrink-0 z-40 h-screen sticky top-0 ${
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64 lg:w-72'
        }`}
      >
        <div className="w-64 lg:w-72 h-full relative">
          {sidebarContent}

          {/* Edge Arrow Toggle Button pinned centrally on the right border */}
          <button
            onClick={() => handleToggleCollapse(true)}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-400 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title="Close / Collapse left pane"
            aria-label="Close left pane"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Floating Arrow button to open the left pane when collapsed (centrally positioned, arrow only) */}
      {isCollapsed && (
        <button
          onClick={() => handleToggleCollapse(false)}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 items-center justify-center bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-l-0 border-slate-700 hover:border-amber-500/80 rounded-r-xl w-7 h-11 shadow-2xl backdrop-blur transition-all group active:scale-95 cursor-pointer"
          title="Open left pane"
          aria-label="Open left pane"
        >
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Mobile Top Header with Hamburger Toggle */}
      <header className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-slate-100 shadow-lg">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center">
            <DisasterManagementLogo size={24} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-amber-300 font-['Outfit'] leading-none">
              Bhuraksha NER
            </span>
            <span className="block text-[9px] text-slate-400 font-medium leading-none mt-0.5">
              Disaster Management Grid
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notification bell on mobile top bar */}
          <button
            id="mobile-navbar-notification-bell-btn"
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
            title="Emergency Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-red-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>

          {/* User Account / Login Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-300 hover:text-blue-200 transition-colors"
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In / Register'}
              aria-label="User Account"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
            </button>
          )}

          {isCitizen && (
            <button
              onClick={onOpenReportModal}
              className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg"
            >
              Report
            </button>
          )}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Emergency Notifications & Alerts Drawer (Available for both Officer and Citizen) */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsNotificationOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col z-10 text-slate-100 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shadow-lg">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-100 font-['Outfit'] flex items-center gap-1.5">
                    {t.emergencyNotificationsDrawer || 'Emergency Notifications'}
                    {totalUnreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black rounded-full">
                        {totalUnreadCount} {t.activeBadge || 'Active'}
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {isCitizen
                      ? (t.citizenAlertsSubtitle || 'Citizen Public Early Warnings & Safety Advisories')
                      : (t.authorityAlertsSubtitle || 'Authority & Field Geotechnical Early Warning Grid')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {totalUnreadCount > 0 && (
                  <button
                    onClick={() => {
                      const allIds = new Set<string>();
                      activeAlertList.forEach((a) => allIds.add(a.id));
                      notifications.forEach((n) => allIds.add(n.id));
                      setDismissedAlertIds(allIds);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                    title={t.markAllRead || "Mark all as read"}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{t.clearLabel || 'Clear'}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsNotificationOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Portal Context Banner */}
            <div className={`px-4 py-2 border-b text-[11px] flex items-center justify-between ${
              isCitizen
                ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-900/40 text-amber-300'
            }`}>
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                {t.currentTimeLabel || 'Current Time'}
              </span>
              <span className="text-[10px] opacity-80 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="p-2 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-1 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setNotifFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  notifFilter === 'all'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.tabAll || 'All'} ({unreadAlerts.length + unreadToasts.length})
              </button>
              <button
                onClick={() => setNotifFilter('critical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
                  notifFilter === 'critical'
                    ? 'bg-red-600 text-white'
                    : 'text-red-400 hover:bg-red-950/40'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>{t.tabCritical || 'Critical'} ({activeAlertList.filter((a) => a.riskLevel === 'CRITICAL' && !dismissedAlertIds.has(a.id)).length})</span>
              </button>
              <button
                onClick={() => setNotifFilter('road')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  notifFilter === 'road'
                    ? 'bg-orange-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.tabRoadLifelines || 'Road Lifelines'}
              </button>
              <button
                onClick={() => setNotifFilter('weather')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                  notifFilter === 'weather'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.tabRadarWeather || 'Radar/Weather'}
              </button>
              <button
                onClick={() => setNotifFilter('reports')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
                  notifFilter === 'reports'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-400 hover:text-purple-200 hover:bg-purple-950/40'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>{t.tabReports || 'Reports'} ({reportsList.length})</span>
              </button>
            </div>

            {/* Notification Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
              {/* Reports Tab: Field Officer & Citizen Reports with Photo option */}
              {notifFilter === 'reports' && (
                <div className="space-y-3">
                  {reportsList.map((rep) => {
                    const locRep = getLocalizedIncident(rep, currentLang);
                    const hasPhoto = Boolean(rep.photoUrl || rep.stampedPhotoUrl || rep.originalPhotoUrl);
                    const photoSrc = rep.stampedPhotoUrl || rep.photoUrl || rep.originalPhotoUrl;
                    const isExpanded = expandedPhotoReportIds.has(rep.id);
                    const isCitizenRep = (rep.reporterRole || '').toLowerCase().includes('citizen');
                    const isCrit = rep.severity === 'Critical';
                    const isHigh = rep.severity === 'High';

                    return (
                      <div
                        key={rep.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCrit
                            ? 'bg-red-950/30 border-red-700/60'
                            : isHigh
                            ? 'bg-amber-950/30 border-amber-700/50'
                            : 'bg-slate-855 border-slate-750'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center ${
                                isCitizenRep
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              }`}
                            >
                              <UserCheck className="w-2.5 h-2.5 mr-1" />
                              {isCitizenRep ? (t.citizenReportLabel || 'Citizen Report') : (t.fieldOfficerReportLabel || 'Field Officer Report')}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isCrit
                                  ? 'bg-red-600 text-white'
                                  : isHigh
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {getLocalizedRiskLevel(rep.severity, currentLang)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                              {locRep.hazardType}
                            </span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                            {rep.id}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 mt-2 leading-snug">{locRep.title}</h4>
                        {locRep.description && (
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{locRep.description}</p>
                        )}

                        <div className="mt-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                          <div className="flex items-center text-slate-400">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                            <span className="font-semibold text-slate-200">
                              {rep.locationName ? `${rep.locationName}, ` : ''}{rep.district}, {locRep.state}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>GPS: {rep.lat.toFixed(4)}°N, {rep.lng.toFixed(4)}°E</span>
                            <span className="text-slate-300">{t.reportedBy || 'By'}: {rep.reportedBy}</span>
                          </div>
                          {rep.reporterPhone && (
                            <div className="text-[10px] text-slate-400">
                              {t.contact || 'Contact'}: <span className="text-slate-300">{rep.reporterPhone}</span>
                            </div>
                          )}
                        </div>

                        {/* Photo Option & Time Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-slate-400" />
                            {new Date(rep.reportedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} {t.atTime || 'at'}{' '}
                            {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {hasPhoto ? (
                            <button
                              onClick={() => togglePhoto(rep.id)}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center space-x-1.5 transition-all ${
                                isExpanded
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700'
                              }`}
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>{isExpanded ? (t.hidePhoto || 'Hide Photo') : (t.showPhoto || 'Show Photo')}</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">{t.noPhotoAttached || 'No on-site photo attached'}</span>
                          )}
                        </div>

                        {/* Expandable Image Preview */}
                        {hasPhoto && isExpanded && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                            <div className="relative group cursor-pointer" onClick={() => setModalPhotoUrl(photoSrc!)}>
                              <img
                                src={photoSrc}
                                alt={locRep.title}
                                className="w-full max-h-60 object-cover hover:opacity-95 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="bg-slate-950/80 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 border border-slate-700">
                                  <Maximize2 className="w-3 h-3" />
                                  <span>{t.viewFullPhoto || 'View Full Photo'}</span>
                                </span>
                              </div>
                            </div>
                            <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                              <span>
                                {rep.gisEvidence?.isGpsLocked ? ('📍 ' + (t.verifiedGpsStamp || 'Verified GPS Stamp')) : (t.incidentVisualEvidence || 'Incident Visual Evidence')}
                              </span>
                              <button
                                onClick={() => setModalPhotoUrl(photoSrc!)}
                                className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                              >
                                {t.enlargePhoto || 'Enlarge'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {reportsList.length === 0 && (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <FileText className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="text-xs font-semibold text-slate-300">{t.noReportsRecorded || 'No reports recorded yet'}</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        {t.noReportsDesc || 'Field officer and citizen reports submitted will appear here with on-site photos.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Alerts & Toasts when not in Reports filter */}
              {notifFilter !== 'reports' && (
                <>
                  {unreadToasts
                    .filter((toast) => {
                      if (notifFilter === 'critical') return toast.level === 'CRITICAL';
                      if (notifFilter === 'road') return (toast.message || '').toLowerCase().includes('nh-') || (toast.message || '').toLowerCase().includes('road') || toast.title.toLowerCase().includes('road') || Boolean(toast.roadName);
                      if (notifFilter === 'weather') return (toast.message || '').toLowerCase().includes('rainfall') || (toast.message || '').toLowerCase().includes('rain') || toast.title.toLowerCase().includes('weather') || (toast.message || '').toLowerCase().includes('surge');
                      return true;
                    })
                    .map((toast) => {
                      const isCrit = toast.level === 'CRITICAL';
                      const isHigh = toast.level === 'HIGH';
                      return (
                        <div
                          key={toast.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCrit
                              ? 'bg-red-950/40 border-red-700/80 shadow-md shadow-red-950/20 text-slate-200'
                              : isHigh
                              ? 'bg-amber-950/30 border-amber-700/60 text-slate-200'
                              : 'bg-slate-850 border-slate-700/80 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center ${
                                  isCrit
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                    : isHigh
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCrit ? 'bg-red-400 animate-ping' : isHigh ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                                {isCrit ? (t.criticalAlertLabel || 'Critical Alert') : isHigh ? (t.highVigilanceLabel || 'High Vigilance') : (t.notificationLabel || 'Notification')}
                              </span>
                              <span className="text-xs font-bold text-slate-100">{toast.title}</span>
                            </div>
                            <button
                              onClick={() => {
                                setDismissedAlertIds((prev) => new Set(prev).add(toast.id));
                                if (onDismissNotification) onDismissNotification(toast.id);
                              }}
                              className="text-slate-400 hover:text-slate-200 p-0.5"
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{toast.message}</p>
                          {(toast.locationName || toast.district || toast.roadName) && (
                            <div className="flex items-center space-x-1 text-[10px] text-amber-400/90 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">
                                {[toast.roadName, toast.locationName, toast.district].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 pt-2 border-t border-slate-750 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-slate-400" />
                              {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {toast.actionTab && (
                              <button
                                onClick={() => {
                                  setActiveTab(toast.actionTab!);
                                  setIsNotificationOpen(false);
                                }}
                                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                              >
                                <span>{(t.openInLabel || 'Open in') + ' ' + (toast.actionTab === 'roads' ? (t.roadLifelines || 'Road Lifelines') : (t.gisMap || 'GIS Map'))}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

              {unreadAlerts
                .filter((alert) => {
                  if (notifFilter === 'critical') return alert.riskLevel === 'CRITICAL';
                  if (notifFilter === 'road') return (alert.message || '').toLowerCase().includes('nh-') || (alert.message || '').toLowerCase().includes('road') || alert.title.toLowerCase().includes('road');
                  if (notifFilter === 'weather') return (alert.message || '').toLowerCase().includes('rainfall') || (alert.message || '').toLowerCase().includes('rain') || alert.title.toLowerCase().includes('weather');
                  return true;
                })
                .map((alert) => {
                  const locAlert = getLocalizedAlert(alert, currentLang);
                  const isCrit = alert.riskLevel === 'CRITICAL';
                  const isHigh = alert.riskLevel === 'HIGH';
                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                        isCrit
                          ? 'bg-red-950/40 border-red-700/80 shadow-lg shadow-red-950/30'
                          : isHigh
                          ? 'bg-amber-950/30 border-amber-700/60'
                          : 'bg-slate-850 border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${
                              isCrit
                                ? 'bg-red-600 text-white'
                                : isHigh
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {getLocalizedRiskLevel(alert.riskLevel, currentLang)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{alert.alertCode}</span>
                        </div>
                        <button
                          onClick={() => setDismissedAlertIds((prev) => new Set(prev).add(alert.id))}
                          className="text-slate-400 hover:text-slate-200 p-0.5"
                          title="Acknowledge notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 mt-1.5 leading-snug">{locAlert.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{locAlert.message}</p>

                      <div className="mt-2.5 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        <div className="flex items-center text-slate-400">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />
                          <span className="font-semibold text-slate-200">
                            {alert.district}, {locAlert.state}
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-300/90 font-medium">
                          <strong>{t.directiveTrigger || 'Directive / Trigger'}:</strong> {alert.triggeredBy || locAlert.message}
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          {t.issuedAt || 'Issued'}: {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

              {unreadAlerts.length === 0 && unreadToasts.length === 0 && (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <CheckCheck className="w-10 h-10 mx-auto text-emerald-400/60" />
                  <p className="text-xs font-semibold text-slate-300">{t.noUnreadNotifications || 'No unread hazard notifications'}</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {t.allBulletinsAcknowledged || 'All emergency bulletins and sensor early warnings are currently acknowledged.'}
                  </p>
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Modal */}
      {modalPhotoUrl && (
        <div
          className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalPhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>Incident Evidence Photograph</span>
              </span>
              <button
                onClick={() => setModalPhotoUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center bg-black p-2">
              <img
                src={modalPhotoUrl}
                alt="Full Incident Evidence"
                className="max-w-full max-h-[72vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Click outside or button to dismiss view</span>
              <button
                onClick={() => setModalPhotoUrl(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
