import React from 'react';
import {
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { MLModelStats, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface ModelManagementViewProps {
  modelStats: MLModelStats;
  currentLang: LanguageCode;
}

const getCategoryColor = (category?: string) => {
  switch (category) {
    case 'Meteorological':
      return '#38bdf8'; // Sky blue
    case 'Hydrological':
      return '#2dd4bf'; // Teal
    case 'Geomorphological':
      return '#a855f7'; // Purple
    case 'Anthropogenic':
      return '#f59e0b'; // Amber
    default:
      return '#a855f7';
  }
};

const formatFeatureTick = (val: string) => {
  if (val.includes('24h Cumulative Precipitation')) return '24h Precipitation';
  if (val.includes('Soil Moisture')) return 'Soil Moisture Saturation';
  if (val.includes('Slope Angle')) return 'Slope Angle';
  if (val.includes('72h Antecedent Rainfall')) return '72h Antecedent Rain';
  if (val.includes('Geological Formation')) return 'Geology & Weathering';
  if (val.includes('InSAR Ground Displacement')) return 'InSAR Ground Velocity';
  if (val.includes('Proximity to Unengineered')) return 'Road Cut Proximity';
  if (val.includes('Sentinel-2 NDVI')) return 'NDVI Vegetation Index';
  return val.replace(/\s*\(.*?\)/g, '');
};

export const ModelManagementView: React.FC<ModelManagementViewProps> = ({
  modelStats,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
              AI/ML Landslide Risk Engine Laboratory & Evaluation Matrix
            </h2>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full font-bold border border-purple-500/30">
              XGBoost v2.4 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ensemble Gradient Boosted Trees and Spatial Graph Attention trained on 48,650 historical NER landslide events (1985-2025).
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Calibrated: GSI NER & NESAC (Aug 2026)
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Accuracy</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {(modelStats.evaluationMetrics.accuracy * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Recall (Sensitivity)</span>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {(modelStats.evaluationMetrics.recall * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">Precision</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {(modelStats.evaluationMetrics.precision * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[11px] text-slate-400">F1-Score</span>
          <p className="text-2xl font-black text-purple-400 mt-1">
            {(modelStats.evaluationMetrics.f1Score * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-400">ROC-AUC</span>
          <p className="text-2xl font-black text-rose-400 mt-1">
            {modelStats.evaluationMetrics.rocAuc.toFixed(3)}
          </p>
        </div>
      </div>

      {/* Feature Importance Weighting (Exchanged X & Y Axis with Zero Overlap) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              <span>Feature Importance Weighting (SHAP Values)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Relative contribution of each environmental and geological factor to XGBoost model inference.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-slate-300">Meteorological</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span className="text-slate-300">Hydrological</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-slate-300">Geomorphological</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Anthropogenic</span>
            </div>
          </div>
        </div>

        {/* Vertical Columns Chart: X-Axis = Features (Rotated, No Overlap), Y-Axis = Importance % */}
        <div className="h-80 sm:h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={modelStats.featuresRanking}
              margin={{ top: 20, right: 20, left: 10, bottom: 85 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="feature"
                type="category"
                interval={0}
                angle={-30}
                textAnchor="end"
                dx={-4}
                dy={8}
                height={85}
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
                tickFormatter={formatFeatureTick}
                stroke="#64748b"
              />
              <YAxis
                type="number"
                domain={[0, 0.32]}
                tickFormatter={(val: number) => `${(val * 100).toFixed(0)}%`}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#64748b"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl space-y-1.5 max-w-xs backdrop-blur-md">
                        <p className="text-xs font-bold text-white leading-snug">{data.feature}</p>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Relative Weight:</span>
                          <span className="font-mono font-bold text-amber-300">
                            {(data.importance * 100).toFixed(1)}% ({data.importance})
                          </span>
                        </div>
                        {data.category && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Domain Category:</span>
                            <span
                              className="font-medium px-1.5 py-0.5 rounded text-[10px]"
                              style={{
                                backgroundColor: `${getCategoryColor(data.category)}20`,
                                color: getCategoryColor(data.category),
                                border: `1px solid ${getCategoryColor(data.category)}40`,
                              }}
                            >
                              {data.category}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" name="Importance Weight" radius={[6, 6, 0, 0]}>
                {modelStats.featuresRanking.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getCategoryColor(entry.category)}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Ranking Breakdown Table */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {modelStats.featuresRanking.map((item, idx) => (
              <div
                key={item.feature}
                className="bg-slate-950/50 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between space-x-2"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate" title={item.feature}>
                      {formatFeatureTick(item.feature)}
                    </p>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: getCategoryColor(item.category) }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-100 shrink-0">
                  {(item.importance * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
