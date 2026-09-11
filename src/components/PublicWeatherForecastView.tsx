import React, { useState, useMemo } from 'react';
import {
  CloudRain,
  MapPin,
  Compass,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { LocationData, RoadStatus, DisasterAlert, LanguageCode } from '../types';
import { translations } from '../locales/translations';
import {
  getLocalizedState,
  getLocalizedWeatherDay,
  getLocalizedWeatherCondition,
  getLocalizedWeatherAdvisory,
  getLocalizedWeatherRiskBadge,
  getLocalizedRiskLevel,
  getLocalizedLocationName,
} from '../locales/contentTranslations';

interface PublicWeatherForecastViewProps {
  locations: LocationData[];
  roads?: RoadStatus[];
  alerts?: DisasterAlert[];
  currentLang?: LanguageCode;
  onSelectLocation?: (location: LocationData) => void;
}

export const PublicWeatherForecastView: React.FC<PublicWeatherForecastViewProps> = ({
  locations,
  roads = [],
  alerts = [],
  currentLang = 'en',
  onSelectLocation,
}) => {
  const t = translations[currentLang] || translations.en;
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations[0]?.id || ''
  );

  // Filter locations by state & search query
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchState = selectedState === 'ALL' || loc.state.toLowerCase() === selectedState.toLowerCase();
      const matchSearch =
        searchQuery === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchSearch;
    });
  }, [locations, selectedState, searchQuery]);

  // Currently selected location object
  const activeLocation = useMemo(() => {
    const found = locations.find((loc) => loc.id === selectedLocationId);
    return found || filteredLocations[0] || locations[0];
  }, [locations, selectedLocationId, filteredLocations]);

  // Derive state list
  const stateList = useMemo(() => {
    const states = Array.from(new Set(locations.map((loc) => loc.state)));
    return ['ALL', ...states];
  }, [locations]);

  // Dynamic 24-hour Hourly Forecast for the active location
  const hourlyForecast = useMemo(() => {
    if (!activeLocation) return [];
    const baseRain = activeLocation.rainfall1h || 12;
    const baseForecast = activeLocation.rainfallForecast24h || 65;
    const baseSoil = activeLocation.soilMoisturePercent || 75;
    const baseRisk = activeLocation.riskProbability ? Math.round(activeLocation.riskProbability * 100) : activeLocation.riskScore || 60;

    return [
      {
        hour: '02:00',
        rain: Math.max(2, Math.round(baseRain * 0.7)),
        soilSat: Math.min(99, Math.round(baseSoil * 0.94)),
        riskProb: Math.max(10, Math.round(baseRisk * 0.65)),
      },
      {
        hour: '06:00',
        rain: Math.max(4, Math.round(baseRain * 0.9)),
        soilSat: Math.min(99, Math.round(baseSoil * 0.96)),
        riskProb: Math.max(15, Math.round(baseRisk * 0.75)),
      },
      {
        hour: '10:00',
        rain: Math.round(baseRain * 1.3),
        soilSat: Math.min(99, Math.round(baseSoil * 0.98)),
        riskProb: Math.max(20, Math.round(baseRisk * 0.88)),
      },
      {
        hour: '14:00 (Peak)',
        rain: Math.round(baseRain * 1.8),
        soilSat: Math.min(99, Math.round(baseSoil * 1.05)),
        riskProb: Math.min(98, Math.round(baseRisk * 1.15)),
      },
      {
        hour: '18:00',
        rain: Math.round(baseRain * 1.4),
        soilSat: Math.min(99, Math.round(baseSoil * 1.02)),
        riskProb: Math.min(95, Math.round(baseRisk * 1.08)),
      },
      {
        hour: '22:00',
        rain: Math.round(baseRain * 1.1),
        soilSat: Math.min(99, Math.round(baseSoil * 0.99)),
        riskProb: Math.min(90, Math.round(baseRisk * 0.95)),
      },
      {
        hour: '02:00 (+1d)',
        rain: Math.round(baseRain * 0.8),
        soilSat: Math.min(99, Math.round(baseSoil * 0.97)),
        riskProb: Math.min(85, Math.round(baseRisk * 0.82)),
      },
    ];
  }, [activeLocation]);

  // 5-Day Outlook for the selected region
  const fiveDayOutlook = useMemo(() => {
    if (!activeLocation) return [];
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
    const rainMultipliers = [1.0, 1.3, 1.1, 0.7, 0.5];
    const riskLevels: Array<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'> = [
      activeLocation.riskLevel,
      activeLocation.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      activeLocation.riskLevel === 'CRITICAL' ? 'HIGH' : activeLocation.riskLevel,
      activeLocation.riskLevel === 'LOW' ? 'LOW' : 'MODERATE',
      'LOW',
    ];

    const weatherConditions = [
      'Heavy Monsoon Cloudburst',
      'Intense Orographic Rainfall',
      'Intermittent Thundershowers',
      'Scattered Hill Precipitation',
      'Partly Cloudy / Light Mist',
    ];

    return days.map((day, idx) => {
      const expectedRain = Math.round((activeLocation.rainfallForecast24h || 55) * rainMultipliers[idx]);
      return {
        day,
        condition: weatherConditions[idx],
        rainMm: expectedRain,
        risk: riskLevels[idx],
        tempMin: 18 + idx,
        tempMax: 24 + idx,
        advisory:
          riskLevels[idx] === 'CRITICAL'
            ? 'Avoid transit. Extreme debris flow risk.'
            : riskLevels[idx] === 'HIGH'
            ? 'Essential travel only. Watch cut slopes.'
            : riskLevels[idx] === 'MODERATE'
            ? 'Exercise caution during night hours.'
            : 'Normal mountain travel conditions.',
      };
    });
  }, [activeLocation]);

  // Risk badge colors
  const getRiskBadge = (level: string) => {
    const locBadge = getLocalizedWeatherRiskBadge(level, currentLang);
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-600',
          dot: 'bg-rose-500',
          label: locBadge.label,
          desc: locBadge.desc,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-600',
          dot: 'bg-orange-500',
          label: locBadge.label,
          desc: locBadge.desc,
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-600',
          dot: 'bg-amber-500',
          label: locBadge.label,
          desc: locBadge.desc,
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-600',
          dot: 'bg-emerald-500',
          label: locBadge.label,
          desc: locBadge.desc,
        };
    }
  };

  const riskMeta = getRiskBadge(activeLocation?.riskLevel || 'MODERATE');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                {t.weatherPublicAdvisoryTitle || 'Public Weather & Slope Risk Advisory'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-semibold">
                {t.nerStatesLiveFeed || '8 NER States Live Feed'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-100 font-['Outfit'] tracking-tight">
              {t.weatherForecastTitle}
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1 leading-relaxed">
              {t.weatherForecastSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* REGION & DISTRICT SELECTOR CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* State Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1.5 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> {t.stateLabel || 'State'}:
            </span>
            {stateList.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSelectedState(st);
                  // Pick first location matching if current doesn't match
                  const matching = locations.filter(
                    (l) => st === 'ALL' || l.state.toLowerCase() === st.toLowerCase()
                  );
                  if (matching.length > 0 && !matching.some((m) => m.id === selectedLocationId)) {
                    setSelectedLocationId(matching[0].id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedState === st
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? (t.allStates || 'ALL') : getLocalizedState(st, currentLang)}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchRegionPlaceholder || 'Search region, district, pass...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Corridor / Location Quick Selector Pills */}
        <div className="pt-1">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            {t.selectMonitoringZone || 'SELECT HAZARD CORRIDOR / DISTRICT'} ({filteredLocations.length} {t.availableLabel || 'AVAILABLE'}):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredLocations.map((loc) => {
              const isSelected = activeLocation?.id === loc.id;
              const badge = getRiskBadge(loc.riskLevel);
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`px-3.5 py-2 rounded-xl text-left transition-all border shrink-0 flex items-center space-x-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {getLocalizedLocationName(loc.id, loc.name, currentLang)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {loc.district}, {getLocalizedState(loc.state, currentLang)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeLocation && (
        <>
          {/* PRIMARY REGION SPOTLIGHT CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{getLocalizedState(activeLocation.state, currentLang)}</span>
                  <span>•</span>
                  <span>{activeLocation.district} {t.districtLabel || 'District'}</span>
                  <span>•</span>
                  <span>{t.elevationLabel || 'Elevation'}: {activeLocation.elevationM}m MSL</span>
                  <span>•</span>
                  <span>{t.slopeLabel || 'Slope'}: {activeLocation.slopeDeg}°</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-slate-100 font-['Outfit']">
                  {getLocalizedLocationName(activeLocation.id, activeLocation.name, currentLang)}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  <strong className="text-slate-300">{t.geologyLabel || 'Geology'}:</strong> {activeLocation.geology}
                </p>
              </div>

              {/* Live Safety Status Pill */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2.5 rounded-2xl border ${riskMeta.bg} shadow-lg flex items-center space-x-3`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${riskMeta.dot} animate-pulse`} />
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase block">
                      {riskMeta.label}
                    </span>
                    <span className="text-[11px] opacity-90 block">
                      {riskMeta.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KEY METEOROLOGICAL & GEOTECHNICAL METRICS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {/* Metric 1: 1h Rainfall */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{t.currentRain1h || 'Current 1h Rain'}</span>
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-cyan-300 font-mono">
                  {activeLocation.rainfall1h || 18.5}
                  <span className="text-xs text-slate-400 ml-1 font-sans">mm/h</span>
                </div>
                <span className="text-[10px] text-slate-400">{t.awsStationGauge || 'AWS Station Gauge'}</span>
              </div>

              {/* Metric 2: 24h Rain */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{t.cumulativePrecipitation24h || '24h Total Rain'}</span>
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-300 font-mono">
                  {activeLocation.rainfall24h || 140}
                  <span className="text-xs text-slate-400 ml-1 font-sans">mm</span>
                </div>
                <span className="text-[10px] text-rose-400 font-bold">
                  {activeLocation.rainfall24h > 120 ? (t.aboveCriticalThreshold || 'Above Critical Threshold') : (t.withinNormalRange || 'Within Normal Range')}
                </span>
              </div>

              {/* Metric 3: 24h Forecast */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{t.forecast24h || '24h Forecast'}</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {activeLocation.rainfallForecast24h || 85}
                  <span className="text-xs text-slate-400 ml-1 font-sans">mm</span>
                </div>
                <span className="text-[10px] text-slate-400">{t.imdMesoScaleModel || 'IMD Meso-Scale Model'}</span>
              </div>

              {/* Metric 4: Soil Saturation */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{t.soilSaturation || 'Soil Saturation'}</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-300 font-mono">
                  {activeLocation.soilMoisturePercent || 82}
                  <span className="text-xs text-slate-400 ml-1 font-sans">%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      activeLocation.soilMoisturePercent > 80
                        ? 'bg-rose-500'
                        : activeLocation.soilMoisturePercent > 65
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${activeLocation.soilMoisturePercent || 80}%` }}
                  />
                </div>
              </div>

              {/* Metric 5: Estimated Risk Score */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 md:col-span-4 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>{t.slopeRiskIndex || 'Slope Risk Index'}</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  {activeLocation.riskScore}
                  <span className="text-xs text-slate-400 ml-1 font-sans">/100</span>
                </div>
                <span className="text-[10px] text-slate-300">
                  {t.probLabel || 'Prob'}: <strong>{Math.round((activeLocation.riskProbability || 0.8) * 100)}%</strong>
                </span>
              </div>
            </div>

            {/* AI CITIZEN SAFETY ADVISORY & EXPLANATION */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.travelSafetyBreakdownTitle || 'Travel Safety & Slope Hazard Breakdown for'} {getLocalizedLocationName(activeLocation.id, activeLocation.name, currentLang)}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeLocation.aiExplanation}
              </p>
              <div className="pt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-700 text-slate-300">
                  <strong className="text-amber-300">{t.publicAdviceLabel || 'Public Advice'}:</strong> {activeLocation.recommendedAction}
                </span>
              </div>
            </div>
          </div>

          {/* 24-HOUR HOURLY WEATHER & RISK PROBABILITY CORRELATION CHART */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-cyan-400" />
                  {t.predictiveCurveTitle || '24-Hour Predictive Hourly Weather & Landslide Probability Curve'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.predictiveCurveDesc || 'Real-time correlation of forecasted precipitation rate against slope saturation index and failure probability for'} {getLocalizedLocationName(activeLocation.id, activeLocation.name, currentLang)}
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800 self-start sm:self-auto">
                {t.updatedEvery15Mins || 'Updated Every 15 Mins'}
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyForecast}>
                  <defs>
                    <linearGradient id="pubRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pubRainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="riskProb"
                    name={t.chartFailureRisk || 'Landslide Failure Risk (%)'}
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#pubRiskGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rain"
                    name={t.chartPrecipIntensity || 'Precipitation Intensity (mm/h)'}
                    stroke="#38bdf8"
                    fillOpacity={1}
                    fill="url(#pubRainGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="soilSat"
                    name={t.chartSoilSaturation || 'Soil Moisture Saturation (%)'}
                    stroke="#eab308"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5-DAY EXTENDED REGIONAL OUTLOOK */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-['Outfit'] text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              {t.extendedOutlook5DayTitle || '5-Day Extended Weather & Slope Travel Safety Outlook'} ({activeLocation.district})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              {fiveDayOutlook.map((item, idx) => {
                const badge = getRiskBadge(item.risk);
                return (
                  <div
                    key={idx}
                    className="bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-100 font-['Outfit']">
                          {getLocalizedWeatherDay(item.day, currentLang)}
                        </strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                          {getLocalizedRiskLevel(item.risk, currentLang)}
                        </span>
                      </div>
                      <div className="text-[11px] text-cyan-300 font-medium mt-1">
                        {getLocalizedWeatherCondition(item.condition, currentLang)}
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{t.rainfallLabel || 'Rainfall'}:</span>
                        <span className="text-cyan-300 font-bold">{item.rainMm} mm</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{t.tempLabel || 'Temp'}:</span>
                        <span>{item.tempMin}° - {item.tempMax}°C</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-300 leading-tight">
                      {getLocalizedWeatherAdvisory(item.advisory, currentLang)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
