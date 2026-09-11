import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Radio,
  Battery,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SensorData, LanguageCode } from '../types';
import { translations } from '../locales/translations';

interface SensorTelemetryViewProps {
  sensors: SensorData[];
  onUpdateSensorReading: (sensorCode: string, value: number, unit: string) => void;
  onOpenPipelineSimulator?: () => void;
  currentLang: LanguageCode;
}

export const SensorTelemetryView: React.FC<SensorTelemetryViewProps> = ({
  sensors,
  onUpdateSensorReading,
  onOpenPipelineSimulator,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const [selectedSensor, setSelectedSensor] = useState<SensorData>(sensors[0]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'ONLINE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
              NER IoT Geotechnical & Meteorological Telemetry Mesh
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Live Sensor Ingestion
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pore water pressure, subsurface tiltmeters, automated rain gauges, and InSAR ground displacement stations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              sensors.forEach((s) => {
                const delta = (Math.random() * 8 - 2);
                onUpdateSensorReading(s.sensorCode, Number((s.lastReading.value + delta).toFixed(1)), s.lastReading.unit);
              });
            }}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 flex items-center space-x-1.5 transition-all active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Poll All IoT Nodes</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sensor List (Left) & Telemetry Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Active Telemetry Pods ({sensors.length})
          </h3>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {sensors.map((sensor) => {
              const isSelected = selectedSensor?.id === sensor.id;

              return (
                <div
                  key={sensor.id}
                  onClick={() => {
                    setSelectedSensor(sensor);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{sensor.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        sensor.status
                      )}`}
                    >
                      {sensor.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{sensor.sensorType}</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {sensor.lastReading.value} {sensor.lastReading.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{sensor.district}, {sensor.state}</span>
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Battery className="w-3 h-3" />
                      <span>{sensor.batteryPercent}%</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Detail & Chart */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSensor && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-800 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-slate-700 font-bold">
                      {selectedSensor.sensorCode}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100">{selectedSensor.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Installed at: {selectedSensor.locationName} ({selectedSensor.district}, {selectedSensor.state}) • Type: {selectedSensor.sensorType}
                  </p>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${getStatusBadge(
                    selectedSensor.status
                  )}`}
                >
                  {selectedSensor.status}
                </span>
              </div>

              {/* Real-time reading score box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Current Reading</span>
                  <p className="text-xl font-extrabold text-amber-400 mt-1">
                    {selectedSensor.lastReading.value}{' '}
                    <span className="text-xs text-slate-300">{selectedSensor.lastReading.unit}</span>
                  </p>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Battery Level</span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-1">
                    {selectedSensor.batteryPercent}%
                  </p>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Cellular Signal (4G)</span>
                  <p className="text-xl font-extrabold text-blue-400 mt-1">
                    {selectedSensor.signalStrength}%
                  </p>
                </div>

                <div className="bg-slate-850 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Deployment Date</span>
                  <p className="text-xs font-mono font-bold text-slate-200 mt-2">
                    {selectedSensor.installationDate}
                  </p>
                </div>
              </div>

              {/* Telemetry Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Telemetry Trend History vs Critical Danger Threshold
                  </h4>
                  <span className="text-[11px] text-slate-400">Last 6 Hours</span>
                </div>

                <div className="h-56 w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedSensor.telemetryHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Sensor Value"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#f59e0b' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="threshold"
                        name="Alert Threshold"
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
