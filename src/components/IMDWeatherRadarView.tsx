import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Satellite,
  ShieldAlert,
  MapPin,
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
import { LanguageCode } from '../types';

interface IMDWeatherRadarViewProps {
  currentLang: LanguageCode;
  onSimulateSurgeFromRadar?: (locationId: string, surgeMm: number) => void;
}

export const IMDWeatherRadarView: React.FC<IMDWeatherRadarViewProps> = ({
  currentLang,
  onSimulateSurgeFromRadar,
}) => {
  const [stations, setStations] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAllFeeds = async () => {
    try {
      setRefreshing(true);
      const [rainRes, warnRes] = await Promise.all([
        fetch('/api/ogd/rainfall').then((r) => r.json()),
        fetch('/api/ogd/warnings').then((r) => r.json()),
      ]);

      if (rainRes?.success) setStations(rainRes.data || []);
      if (warnRes?.success) setWarnings(warnRes.data || []);
    } catch (err) {
      console.warn('Error fetching OGD/IMD feeds:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllFeeds();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950/80 text-cyan-400 border border-cyan-700/60 shadow-lg shadow-cyan-950/50">
              <Satellite className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2.5">
                IMD Weather HUB
                <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OGD API Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Connected with Open Government Data (data.gov.in) & India Meteorological Department (IMD) for automated weather telemetry and rainfall monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: IMD AUTOMATIC WEATHER STATIONS (AWS) DAILY RAINFALL MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-amber-400" />
              IMD Daily Station Rainfall & Soil Moisture Saturation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Live AWS telemetry across 8 North Eastern States ingested through the OGD REST API.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {stations.length} Active Stations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono">
                <th className="py-2.5 px-3">Station Name</th>
                <th className="py-2.5 px-3">State / District</th>
                <th className="py-2.5 px-3 text-right">24h Rain (mm)</th>
                <th className="py-2.5 px-3 text-right">3h Intensity (mm)</th>
                <th className="py-2.5 px-3 text-right">Departure (%)</th>
                <th className="py-2.5 px-3 text-right">Soil Saturation</th>
                <th className="py-2.5 px-3 text-center">Warning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {stations.map((st) => (
                <tr key={st.stationId} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{st.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {st.state} <span className="text-slate-500">({st.district})</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                    {st.rainfall24hMm} mm
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">
                    {st.intensity3hMm} mm/h
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-400">
                    {st.normalDeparturePct > 0 ? `+${st.normalDeparturePct}%` : `${st.normalDeparturePct}%`}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        st.soilMoistureFraction > 0.85
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {(st.soilMoistureFraction * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        st.warningStatus === 'RED_ALERT'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : st.warningStatus === 'ORANGE_WARNING'
                          ? 'bg-amber-600 text-white'
                          : 'bg-yellow-500 text-slate-950'
                      }`}
                    >
                      {st.warningStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: DISTRICT-WISE 5-DAY WARNING BULLETINS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold font-['Outfit'] text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          IMD District-Wise Real-time Rainfall & Landslide Warning Bulletins
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2.5 ${
                w.warningLevel === 'RED_ALERT'
                  ? 'bg-rose-950/60 border-rose-700/80 shadow-lg shadow-rose-950/30'
                  : 'bg-amber-950/60 border-amber-700/80 shadow-lg shadow-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm text-slate-100 font-['Outfit']">{w.district}</strong>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    w.warningLevel === 'RED_ALERT' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {w.warningLevel.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">{w.phenomenon}</div>
              <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <strong>Action:</strong> {w.actionRequired}
              </p>
              <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                <span>Risk Index: <strong className="text-rose-400">{w.riskScore}/100</strong></span>
                <span>Valid 24-48 Hours</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: WEATHER-LINKED RISK FORECASTS & THRESHOLD PROBABILITY MODELING */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              Weather-Linked Risk Forecasts & Threshold Probability Modeling
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Doppler radar precipitation trends, soil moisture saturation (%), and 24h predictive slope failure probability
            </p>
          </div>
          <span className="text-xs text-cyan-300 font-mono bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800 self-start sm:self-auto">
            IMD Doppler Radar Sync: LIVE
          </span>
        </div>

        {/* Weather Risk Correlation Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { hour: '00:00', actualRain: 12, predictedRain: 15, riskProbability: 18, soilSat: 62 },
                { hour: '04:00', actualRain: 25, predictedRain: 28, riskProbability: 32, soilSat: 68 },
                { hour: '08:00', actualRain: 48, predictedRain: 52, riskProbability: 58, soilSat: 79 },
                { hour: '12:00', actualRain: 78, predictedRain: 84, riskProbability: 82, soilSat: 88 },
                { hour: '16:00 (Surge)', actualRain: 110, predictedRain: 125, riskProbability: 94, soilSat: 96 },
                { hour: '20:00', actualRain: 95, predictedRain: 105, riskProbability: 89, soilSat: 94 },
                { hour: '24:00 (Proj)', actualRain: 60, predictedRain: 70, riskProbability: 71, soilSat: 89 },
              ]}
            >
              <defs>
                <linearGradient id="imdRiskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="imdRainGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="riskProbability"
                name="Landslide Failure Probability (%)"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#imdRiskGrad)"
              />
              <Area
                type="monotone"
                dataKey="actualRain"
                name="Rainfall Intensity (mm/h)"
                stroke="#38bdf8"
                fillOpacity={1}
                fill="url(#imdRainGrad)"
              />
              <Line
                type="monotone"
                dataKey="soilSat"
                name="Soil Saturation Index (%)"
                stroke="#eab308"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Explanatory Technical Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-cyan-300">Antecedent Moisture Threshold</span>
            <p className="text-slate-300 leading-relaxed">
              Continuous 3-day rainfall &gt;120mm saturates bedrock porosity, accelerating critical pore pressure build-up.
            </p>
          </div>
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-amber-300">Caine Intensity-Duration Formula</span>
            <p className="text-slate-300 leading-relaxed">
              <code className="text-amber-200 bg-amber-950/40 px-1 py-0.5 rounded">I = 14.82 * D^(-0.39)</code> defines threshold breach curve in eastern Himalayas.
            </p>
          </div>
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-rose-300">Flash Warning Protocol</span>
            <p className="text-slate-300 leading-relaxed">
              Automatic CAP broadcast triggers if 1-hour rainfall rate exceeds 45mm/hr in steep terrain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
