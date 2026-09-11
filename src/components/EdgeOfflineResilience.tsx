import React, { useState } from 'react';
import {
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  BatteryCharging,
  Sun,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { EdgeDeviceTelemetryNode } from '../types';
import { initialEdgeDevices } from '../data/nerData';

interface EdgeOfflineResilienceProps {
  devices?: EdgeDeviceTelemetryNode[];
}

export const EdgeOfflineResilience: React.FC<EdgeOfflineResilienceProps> = ({
  devices = initialEdgeDevices,
}) => {
  const [deviceNodes, setDeviceNodes] = useState<EdgeDeviceTelemetryNode[]>(devices);
  const [simulatedBlackout, setSimulatedBlackout] = useState<boolean>(false);

  // Toggle network blackout simulation
  const handleToggleBlackout = () => {
    const nextState = !simulatedBlackout;
    setSimulatedBlackout(nextState);

    const updated = deviceNodes.map((n) => {
      if (nextState) {
        // Disconnect 4G / Cloud, switch to LoRa Mesh & offline queue
        return {
          ...n,
          networkUplink: 'LORA_MESH' as const,
          offlineBufferQueueCount: n.offlineBufferQueueCount + 48,
          lastLocalSync: 'LoRa Mesh (P2P Direct)',
        };
      } else {
        // Restore Cloud
        return {
          ...n,
          networkUplink: '4G_LTE' as const,
          offlineBufferQueueCount: 0,
          lastLocalSync: 'Just now (Cloud Restored)',
        };
      }
    });
    setDeviceNodes(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/40">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Offline Intelligence & Edge Mesh Architecture
                <span className="text-xs bg-amber-950 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-800">
                  Solar + TinyML + LoRa
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Guarantees zero downtime inference (&lt;15ms) and autonomous siren activation even when mountain cloudbursts sever all cellular connectivity.
              </p>
            </div>
          </div>
        </div>

        {/* Network Blackout Stress Test Trigger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleBlackout}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border transition-all shadow-md ${
              simulatedBlackout
                ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-rose-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {simulatedBlackout ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{simulatedBlackout ? 'Restore 4G / WAN Cloud' : 'Simulate Mountain Network Blackout'}</span>
          </button>
        </div>
      </div>

      {/* Live Edge Telemetry Devices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deviceNodes.map((node) => {
          const isOnline = node.networkUplink === '4G_LTE' || node.networkUplink === 'FIBRE_INTERNET';

          return (
            <div
              key={node.deviceId}
              className="p-4 rounded-2xl border bg-slate-850 border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  {node.deviceName}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isOnline
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {node.networkUplink}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hardware:</span>
                  <strong className="text-slate-200">{node.hardware}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span>{node.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Inference Latency:</span>
                  <span className="text-cyan-400 font-mono font-bold">{node.localInferenceLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Local Status:</span>
                  <span className={`font-mono font-bold ${node.localAnomalyDetected ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {node.localAnomalyDetected ? 'Spike Flagged (Filtered)' : 'Stable Baseline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2.5">
                <span className="flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  {node.batteryLevelPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  {node.solarInputWatts}W Solar
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                  {node.offlineBufferQueueCount} Q
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
