import React, { useState, useRef, useEffect } from 'react';
import {
  Workflow,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  LocationData,
  SensorData,
  RoadStatus,
  DisasterAlert,
  EmergencyPriorityItem,
  LanguageCode,
  RiskLevel,
} from '../types';
import { MultiModalFusionEngine } from './MultiModalFusionEngine';
import { EdgeOfflineResilience } from './EdgeOfflineResilience';

interface DisasterDecisionEcosystemProps {
  locations: LocationData[];
  sensors: SensorData[];
  roads: RoadStatus[];
  alerts: DisasterAlert[];
  priorities: EmergencyPriorityItem[];
  currentLang: LanguageCode;
  onNavigateTab?: (tab: string) => void;
  onSelectLocation?: (loc: LocationData) => void;
  onOpenSimulateModal?: () => void;
  onTriggerAlertDispatch?: (message: string) => void;
}

export const DisasterDecisionEcosystemView: React.FC<DisasterDecisionEcosystemProps> = ({
  locations,
}) => {
  // Selected Location for Deep Dive
  const [selectedLoc, setSelectedLoc] = useState<LocationData>(locations[0] || ({} as LocationData));

  // Top ecosystem navigation scroll ref & controls
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

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsNavRef.current) {
      const amount = 220;
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

  // Active View Tab Filter: strictly 'FUSION_ENGINE' | 'EDGE_OFFLINE' (Offline Intelligence)
  const [activeTab, setActiveTab] = useState<'FUSION_ENGINE' | 'EDGE_OFFLINE'>('FUSION_ENGINE');

  const handleApplyFusionScore = (newScore: number, newLevel: RiskLevel) => {
    setSelectedLoc((prev) => ({
      ...prev,
      riskScore: newScore,
      riskLevel: newLevel,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-100">
      {/* ROW 1: ECOSYSTEM HEADER & PHILOSOPHY BANNER */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-400">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-100">
                  AI-Driven Disaster Decision & Response Ecosystem
                </h2>
                <p className="text-xs sm:text-sm text-cyan-300/90 font-medium">
                  &ldquo;The important innovation is not another prediction model. It is an AI-driven disaster decision and response ecosystem.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800 font-bold flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Live Sync
            </span>
          </div>
        </div>

        {/* Navigation Tabs Bar with only Fusion Engine and Offline Intelligence */}
        <div className="relative group/tabs pt-1">
          {canScrollLeft && (
            <button
              onClick={() => handleScrollTabs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 shadow-xl flex items-center justify-center backdrop-blur transition-all active:scale-90"
              title="Scroll navigation left"
              aria-label="Scroll navigation left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
          )}

          <div
            ref={tabsNavRef}
            onScroll={checkTabsScroll}
            onWheel={handleTabsWheel}
            className="flex items-center space-x-2 overflow-x-auto scroll-smooth scrollbar-thin px-1 py-1 text-xs font-semibold select-none"
          >
            {[
              { id: 'FUSION_ENGINE', label: 'Fusion Engine' },
              { id: 'EDGE_OFFLINE', label: 'Offline Intelligence' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as 'FUSION_ENGINE' | 'EDGE_OFFLINE')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all shrink-0 ${
                  activeTab === item.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold shadow-cyan-500/20'
                    : 'bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
          )}

          {canScrollRight && (
            <button
              onClick={() => handleScrollTabs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 shadow-xl flex items-center justify-center backdrop-blur transition-all active:scale-90"
              title="Scroll navigation right"
              aria-label="Scroll navigation right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: MULTI-MODAL RISK FUSION ENGINE */}
      {activeTab === 'FUSION_ENGINE' && (
        <MultiModalFusionEngine
          selectedLocation={selectedLoc}
          onApplyFusionScore={handleApplyFusionScore}
        />
      )}

      {/* VIEW 2: OFFLINE INTELLIGENCE (EDGE TINYML) */}
      {activeTab === 'EDGE_OFFLINE' && (
        <EdgeOfflineResilience />
      )}
    </div>
  );
};
