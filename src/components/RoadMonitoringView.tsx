import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Edit,
  Save,
  Route,
  Filter,
  Navigation,
  Activity,
  Layers,
  PhoneCall,
  Wrench,
} from 'lucide-react';
import { RoadStatus, LanguageCode, NERState, UserRole } from '../types';
import { translations } from '../locales/translations';
import { getLocalizedRoad, getLocalizedState, getLocalizedRiskLevel } from '../locales/contentTranslations';

interface RoadMonitoringViewProps {
  roads: RoadStatus[];
  onUpdateRoadStatus?: (roadId: string, updatedFields: Partial<RoadStatus>) => void;
  currentLang: LanguageCode;
  userRole?: UserRole;
  isCitizen?: boolean;
}

export const RoadMonitoringView: React.FC<RoadMonitoringViewProps> = ({
  roads = [],
  onUpdateRoadStatus,
  currentLang,
  userRole = 'citizen',
  isCitizen = userRole === 'citizen',
}) => {
  const t = translations[currentLang] || translations.en;
  const [editingRoadId, setEditingRoadId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RoadStatus['status']>('FULLY_BLOCKED');
  const [editETA, setEditETA] = useState('');
  const [editAlternate, setEditAlternate] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const handleStartEdit = (road: RoadStatus) => {
    if (isCitizen) return;
    setEditingRoadId(road.id);
    setEditStatus(road.status);
    setEditETA(road.clearanceETA || '');
    setEditAlternate(road.alternateRouteName);
  };

  const handleSaveEdit = (roadId: string) => {
    if (isCitizen) return;
    if (onUpdateRoadStatus) {
      onUpdateRoadStatus(roadId, {
        status: editStatus,
        clearanceETA: editETA,
        alternateRouteName: editAlternate,
        lastUpdated: new Date().toISOString(),
      });
    }
    setEditingRoadId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FULLY_BLOCKED':
        return 'bg-red-500/20 text-red-400 border-red-500/40 ring-1 ring-red-500/30';
      case 'PARTIALLY_BLOCKED':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'HIGH_RISK_WARNING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  // Safe KPI calculations
  const totalRoads = roads.length;
  const blockedRoads = roads.filter((r) => r.status === 'FULLY_BLOCKED');
  const partialRoads = roads.filter((r) => r.status === 'PARTIALLY_BLOCKED');
  const warningRoads = roads.filter((r) => r.status === 'HIGH_RISK_WARNING');
  const openRoads = roads.filter((r) => r.status === 'OPEN');

  // Filtered list
  const filteredRoads = roads.filter((road) => {
    if (selectedStateFilter !== 'all' && road.state !== selectedStateFilter) return false;
    if (selectedStatusFilter !== 'all' && road.status !== selectedStatusFilter) return false;
    return true;
  });

  const nerStates: NERState[] = [
    'Assam',
    'Arunachal Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ROW 1: HEADER & EXECUTIVE OPERATIONAL STATUS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Truck className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
                {t.roadGridTitle}
              </h2>
              <span className="bg-blue-500/20 text-blue-300 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-blue-500/30">
                PWD / BRO Live Grid
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl">
              {t.roadGridDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Border Roads Task Force:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-800">
              BRTF Active
            </span>
          </div>
        </div>

        {/* ROW 1.5: OPERATIONAL KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-850 border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t.monitoredCorridors}</span>
              <Route className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-100">{totalRoads}</p>
            <p className="text-[11px] text-slate-400">{t.kpiStrategicArteries || 'Strategic NH & SH arteries'}</p>
          </div>

          <div className="bg-red-950/30 border border-red-600/40 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-red-300 font-bold">
              <span>{t.fullyBlocked}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            </div>
            <p className="text-2xl font-black text-red-200">{blockedRoads.length}</p>
            <p className="text-[11px] text-red-300/80">{t.kpiDiversionsActive || 'Diversions active'}</p>
          </div>

          <div className="bg-orange-950/30 border border-orange-600/40 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-orange-300 font-bold">
              <span>{t.partialObstruction}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            </div>
            <p className="text-2xl font-black text-orange-200">{partialRoads.length + warningRoads.length}</p>
            <p className="text-[11px] text-orange-300/80">{t.kpiSingleLaneCaution || 'Single-lane / Caution'}</p>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-600/40 p-4 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span>{t.openCorridors}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-200">{openRoads.length}</p>
            <p className="text-[11px] text-emerald-300/80">{t.kpiNormalTransit || 'Normal transit flowing'}</p>
          </div>
        </div>

        {/* ROW 1.8: STATE & STATUS FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">{t.filterStatus}:</span>
            <div className="flex items-center space-x-1.5">
              {[
                { id: 'all', label: t.allRoads },
                { id: 'FULLY_BLOCKED', label: t.blocked },
                { id: 'PARTIALLY_BLOCKED', label: t.partial },
                { id: 'HIGH_RISK_WARNING', label: t.warning },
                { id: 'OPEN', label: t.open },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedStatusFilter(filter.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    selectedStatusFilter === filter.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">{t.stateLabel || 'State'}:</span>
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs rounded-lg px-3 py-1.5 border border-slate-700 font-medium"
            >
              <option value="all">{t.allStates || 'All 8 NER States'}</option>
              {nerStates.map((st) => (
                <option key={st} value={st}>
                  {getLocalizedState(st, currentLang)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ROW 2: ACTIVE CRITICAL OBSTRUCTIONS WITH IMMEDIATE DETOURS */}
      {!isCitizen && blockedRoads.length > 0 && selectedStatusFilter !== 'OPEN' && (
        <div className="bg-slate-900 border border-red-600/40 p-6 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-black text-red-300 uppercase tracking-wider">
                {t.criticalBlockagesBannerTitle || 'Critical Blockages Requiring Immediate Detour Routing'}
              </h3>
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-700">
              {blockedRoads.length} {t.activeEmergencyDiversions || 'Active Emergency Diversions'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blockedRoads.map((road) => {
              const locRoad = getLocalizedRoad(road, currentLang);
              return (
                <div
                  key={`urgent-${road.id}`}
                  className="bg-red-950/20 border border-red-600/30 p-4 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded">
                        {road.roadNumber}
                      </span>
                      <span className="font-bold text-slate-100 text-sm">{locRoad.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-800 animate-pulse">
                      {t.statusFullyBlocked || t.blocked || 'FULLY BLOCKED'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-2">
                    {road.blockageLocation && (
                      <div className="flex items-start space-x-1.5 text-red-300 font-semibold">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                        <span>
                          {t.blockagePointLabel || 'Blockage Point'}: {locRoad.blockageLandmark || road.blockageLocation.landmark} ({road.blockageLocation.lat.toFixed(4)}°N, {road.blockageLocation.lng.toFixed(4)}°E)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1.5 text-amber-300 font-medium">
                      <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
                      <span>{t.clearanceEtaLabel || 'Clearance ETA'}: {locRoad.clearanceETA || road.clearanceETA || 'Under Assessment'}</span>
                    </div>

                    <div className="flex items-start space-x-1.5 text-emerald-300 font-medium border-t border-slate-800 pt-2">
                      <Compass className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <span className="font-bold">{t.recommendedDetourLabel || 'Recommended Detour'}:</span> {locRoad.alternateRouteName}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {locRoad.alternateRouteDescription || road.alternateRouteDescription || 'Follow PWD traffic bypass signages.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROW 3: ALL HIGHWAY CORRIDOR CARDS (MULTI-ROW GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 font-['Outfit'] flex items-center">
            <Layers className="w-4 h-4 mr-2 text-amber-400" />
            {t.highwayArterialInventory || 'Highway Arterial Inventory'} ({filteredRoads.length} {t.corridorsLabel || 'Corridors'})
          </h3>
          <span className="text-xs text-slate-400">
            {t.showingCorridors || 'Showing'} {filteredRoads.length} {t.ofCorridors || 'of'} {roads.length} {t.corridorsLabel || 'corridors'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRoads.map((road) => {
            const isEditing = editingRoadId === road.id;
            const locRoad = getLocalizedRoad(road, currentLang);

            return (
              <div
                key={road.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-xl space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-slate-800 text-amber-300 font-black text-xs px-3 py-1 rounded-lg border border-slate-700">
                          {road.roadNumber}
                        </span>
                        <h4 className="text-base font-bold text-slate-100">{locRoad.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400">
                        {road.district}, {getLocalizedState(road.state, currentLang)} • <span className="text-slate-300 font-medium">{locRoad.importance}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(road.status)}`}>
                        {road.status === 'FULLY_BLOCKED'
                          ? (t.statusFullyBlocked || t.blocked || 'FULLY BLOCKED')
                          : road.status === 'PARTIALLY_BLOCKED'
                          ? (t.statusPartiallyBlocked || t.partial || 'PARTIALLY BLOCKED')
                          : road.status === 'HIGH_RISK_WARNING'
                          ? (t.statusHighRiskWarning || t.warning || 'HIGH RISK WARNING')
                          : (t.statusOpenSafe || t.open || 'OPEN / SAFE')}
                      </span>

                      {!isCitizen && onUpdateRoadStatus && (
                        !isEditing ? (
                          <button
                            onClick={() => handleStartEdit(road)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
                            title="Update Operational Status"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Update</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveEdit(road.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-md"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Route Trajectory */}
                  <div className="p-2.5 bg-slate-855 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-400">{t.routeLabel || 'Route'}:</span>
                      <span className="font-bold text-slate-200">{locRoad.startPoint}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-slate-200">{locRoad.endPoint}</span>
                    </div>
                  </div>

                  {/* Blockage and Detour Details or Edit Form */}
                  {!isCitizen && isEditing ? (
                    <div className="p-4 bg-slate-850 rounded-xl border border-amber-500/40 space-y-3 text-xs">
                      <h5 className="font-bold text-amber-300 flex items-center">
                        <Wrench className="w-3.5 h-3.5 mr-1" />
                        Update PWD / Highway Status
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="w-full bg-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-700"
                          >
                            <option value="FULLY_BLOCKED">FULLY BLOCKED</option>
                            <option value="PARTIALLY_BLOCKED">PARTIALLY BLOCKED</option>
                            <option value="HIGH_RISK_WARNING">HIGH RISK WARNING</option>
                            <option value="OPEN">OPEN / SAFE</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Clearance ETA</label>
                          <input
                            type="text"
                            value={editETA}
                            onChange={(e) => setEditETA(e.target.value)}
                            className="w-full bg-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-700"
                            placeholder="e.g. 4 Hours"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1 font-semibold">Alternate Route</label>
                          <input
                            type="text"
                            value={editAlternate}
                            onChange={(e) => setEditAlternate(e.target.value)}
                            className="w-full bg-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-700"
                            placeholder="e.g. NH-6 via Jowai"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {road.blockageLocation ? (
                        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="font-bold text-red-400 flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            {t.obstructionLabel || 'Obstruction'}: {locRoad.blockageLandmark || road.blockageLocation.landmark}
                          </span>
                          <p className="text-slate-400 text-[11px]">
                            GPS: {road.blockageLocation.lat.toFixed(4)}, {road.blockageLocation.lng.toFixed(4)}
                          </p>
                          {(locRoad.clearanceETA || road.clearanceETA) && (
                            <p className="text-amber-400 flex items-center pt-0.5 font-semibold text-[11px]">
                              <Clock className="w-3 h-3 mr-1" />
                              {t.clearanceEtaLabel || 'Clearance'}: {locRoad.clearanceETA || road.clearanceETA}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
                          <span className="font-bold text-emerald-400 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            {t.noActiveBlockages || 'No Active Blockages'}
                          </span>
                          <p className="text-slate-400 text-[11px]">{t.normalHighwayClearance || 'Normal highway clearance maintained.'}</p>
                        </div>
                      )}

                      <div className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-emerald-400 flex items-center">
                          <Compass className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                          {t.alternateDetour || 'Alternate Detour'}
                        </span>
                        <p className="text-slate-200 font-medium text-[11px] truncate">
                          {locRoad.alternateRouteName || 'Direct Main Highway'}
                        </p>
                        <p className="text-slate-400 text-[10px] line-clamp-2">
                          {locRoad.alternateRouteDescription || 'Follow standard mountain highway signages.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                  <span>{t.stateLabel || 'State'}: <strong className="text-slate-300">{getLocalizedState(road.state, currentLang)}</strong></span>
                  <span>{t.updatedLabel || 'Updated'}: {new Date(road.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW 4: INTER-AGENCY RESPONSE & HIGHWAY ADVISORY */}
      {!isCitizen && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3 text-xs">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center">
            <PhoneCall className="w-4 h-4 mr-2 text-blue-400" />
            Highway Incident Control & Heavy Machinery Dispatch Protocol
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 pt-1">
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-amber-300">BRO / Project Pushpak & Vartak</span>
              <p className="text-slate-400 text-[11px]">
                Strategic border arterial corridors maintain 24/7 hydraulic excavators, rock breakers, and crawler loaders on standby at designated nodal stations.
              </p>
            </div>
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-red-300">National Highway Toll & Police Diversion</span>
              <p className="text-slate-400 text-[11px]">
                Upon RED alert confirmation, traffic police at entry check gates divert heavy commercial lorries to designated mountain bypasses.
              </p>
            </div>
            <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-300">Emergency Fuel & Food Convoy Escorts</span>
              <p className="text-slate-400 text-[11px]">
                NDRF & SDRF provide convoy security and radio connectivity for essential supply trucks transiting single-lane cleared spurs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
