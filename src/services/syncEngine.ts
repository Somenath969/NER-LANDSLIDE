/**
 * NER LandslideWatch - Resilient Bidirectional Sync Engine
 * Handles offline detection, background queue synchronization, conflict resolution,
 * delta reconciliation, and event broadcasting across all dashboard modules.
 */

import { offlineStorage, SyncQueueItem } from './offlineStorage';
import {
  LocationData,
  SensorData,
  IncidentReport,
  DisasterAlert,
  RoadStatus,
  AuditLogItem,
} from '../types';

export type SyncState = 'IDLE' | 'SYNCING' | 'OFFLINE' | 'ERROR' | 'SUCCESS';

export interface SyncEngineStatus {
  isOnline: boolean;
  syncState: SyncState;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  syncedItemsCount: number;
  activeTransport: '4G_LTE_CLOUD' | 'LORA_MESH_RELAY' | 'OFFLINE_INDEXED_DB';
}

type SyncListener = (status: SyncEngineStatus) => void;

export class SyncEngine {
  private listeners: Set<SyncListener> = new Set();
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncState: SyncState = 'IDLE';
  private lastSyncedAt: string | null = null;
  private lastError: string | null = null;
  private isProcessingQueue: boolean = false;
  private heartbeatTimer: any = null;
  private syncedItemsCount: number = 0;

  constructor() {
    this.setupNetworkListeners();
    this.startHeartbeat();
  }

  private setupNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[SyncEngine] Network connectivity detected. Verifying uplink...');
      this.checkConnectivityAndSync();
    });

    window.addEventListener('offline', () => {
      console.log('[SyncEngine] Network offline. Switching to local IndexedDB buffer...');
      this.isOnline = false;
      this.syncState = 'OFFLINE';
      this.notifyListeners();
    });
  }

  private startHeartbeat() {
    // Periodic heartbeat check every 25 seconds
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.checkConnectivityAndSync();
    }, 25000);
  }

  public async checkConnectivityAndSync(): Promise<boolean> {
    try {
      // Direct quick ping to backend health endpoint with short 3s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const wasOffline = !this.isOnline;
        this.isOnline = true;
        if (wasOffline || this.syncState === 'OFFLINE') {
          this.syncState = 'IDLE';
        }
        this.notifyListeners();

        // If we came back online, trigger queue flush and delta sync
        await this.flushSyncQueue();
        return true;
      } else {
        this.isOnline = false;
        this.syncState = 'OFFLINE';
        this.notifyListeners();
        return false;
      }
    } catch {
      // In sandbox/local, if navigator.onLine is true, assume local dev server is reachable
      const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      this.isOnline = browserOnline;
      if (!browserOnline) {
        this.syncState = 'OFFLINE';
      }
      this.notifyListeners();
      return browserOnline;
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Send immediate initial status
    this.getStatus().then((status) => listener(status));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners() {
    const status = await this.getStatus();
    this.listeners.forEach((fn) => fn(status));
  }

  public async getStatus(): Promise<SyncEngineStatus> {
    const queue = await offlineStorage.getSyncQueue();
    const pendingCount = queue.filter((i) => i.status === 'PENDING' || i.status === 'FAILED').length;

    let transport: '4G_LTE_CLOUD' | 'LORA_MESH_RELAY' | 'OFFLINE_INDEXED_DB' = '4G_LTE_CLOUD';
    if (!this.isOnline) {
      transport = 'OFFLINE_INDEXED_DB';
    }

    return {
      isOnline: this.isOnline,
      syncState: this.syncState,
      pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
      syncedItemsCount: this.syncedItemsCount,
      activeTransport: transport,
    };
  }

  // Force manual or simulated online status (for developer/field testing)
  public setSimulatedOnline(online: boolean) {
    this.isOnline = online;
    this.syncState = online ? 'IDLE' : 'OFFLINE';
    this.notifyListeners();
    if (online) {
      this.flushSyncQueue();
    }
  }

  // ----------------------------------------------------
  // UPSTREAM QUEUE FLUSH (Upload local mutations to server)
  // ----------------------------------------------------
  public async flushSyncQueue(): Promise<{ success: boolean; syncedCount: number; failedCount: number }> {
    if (this.isProcessingQueue || !this.isOnline) {
      return { success: false, syncedCount: 0, failedCount: 0 };
    }

    this.isProcessingQueue = true;
    this.syncState = 'SYNCING';
    this.notifyListeners();

    let syncedCount = 0;
    let failedCount = 0;

    try {
      const queue = await offlineStorage.getSyncQueue();
      const pendingItems = queue
        .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
        .sort((a, b) => {
          // Process CRITICAL first, then by timestamp
          if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
          if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });

      if (pendingItems.length === 0) {
        this.syncState = 'SUCCESS';
        this.lastSyncedAt = new Date().toISOString();
        this.isProcessingQueue = false;
        this.notifyListeners();
        return { success: true, syncedCount: 0, failedCount: 0 };
      }

      console.log(`[SyncEngine] Processing ${pendingItems.length} queued offline mutations...`);

      for (const item of pendingItems) {
        item.status = 'SYNCING';
        item.lastAttempt = new Date().toISOString();
        await offlineStorage.updateSyncItem(item);

        try {
          const success = await this.transmitMutation(item);
          if (success) {
            await offlineStorage.removeSyncItem(item.id);
            syncedCount++;
            this.syncedItemsCount++;
          } else {
            item.status = 'FAILED';
            item.retryCount += 1;
            item.errorMessage = 'Server rejected mutation';
            await offlineStorage.updateSyncItem(item);
            failedCount++;
          }
        } catch (err: any) {
          console.warn(`[SyncEngine] Failed to sync mutation ${item.id}:`, err);
          item.status = 'FAILED';
          item.retryCount += 1;
          item.errorMessage = err?.message || 'Network error during sync';
          await offlineStorage.updateSyncItem(item);
          failedCount++;
        }
      }

      this.syncState = failedCount === 0 ? 'SUCCESS' : 'ERROR';
      this.lastSyncedAt = new Date().toISOString();
      if (failedCount > 0) {
        this.lastError = `${failedCount} items failed to sync. Will retry automatically.`;
      } else {
        this.lastError = null;
      }
    } catch (e: any) {
      console.error('[SyncEngine] Critical flushSyncQueue error:', e);
      this.syncState = 'ERROR';
      this.lastError = e?.message || 'Sync processing exception';
    } finally {
      this.isProcessingQueue = false;
      this.notifyListeners();
    }

    return { success: failedCount === 0, syncedCount, failedCount };
  }

  // Transmit single mutation to backend API
  private async transmitMutation(item: SyncQueueItem): Promise<boolean> {
    let endpoint = '';
    let method = 'POST';

    switch (item.entityType) {
      case 'INCIDENT':
        endpoint = '/api/incidents';
        method = 'POST';
        break;
      case 'ALERT':
        endpoint = '/api/alerts';
        method = 'POST';
        break;
      case 'ROAD_STATUS':
        endpoint = `/api/roads/${item.payload.id || item.payload.roadId || ''}`;
        method = 'PUT';
        break;
      case 'SENSOR_READING':
        endpoint = '/api/sensors/readings';
        method = 'POST';
        break;
      case 'LOCATION_UPDATE':
        endpoint = `/api/locations/${item.payload.id || ''}`;
        method = 'PUT';
        break;
      case 'AUDIT_LOG':
        endpoint = '/api/audit-logs';
        method = 'POST';
        break;
      default:
        endpoint = '/api/sync/mutation';
        method = 'POST';
    }

    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Offline-Synced': 'true',
        'X-Client-Timestamp': item.timestamp,
      },
      body: JSON.stringify(item.payload),
    });

    return res.ok;
  }

  // ----------------------------------------------------
  // DOWNSTREAM SYNC (Pull freshest server state to IndexedDB)
  // ----------------------------------------------------
  public async pullDeltaUpdates(): Promise<{
    locations: LocationData[];
    sensors: SensorData[];
    incidents: IncidentReport[];
    alerts: DisasterAlert[];
    roads: RoadStatus[];
    auditLogs: AuditLogItem[];
  }> {
    if (!this.isOnline) {
      // Return cached data from IndexedDB
      const [locations, sensors, incidents, alerts, roads, auditLogs] = await Promise.all([
        offlineStorage.getLocations(),
        offlineStorage.getSensors(),
        offlineStorage.getIncidents(),
        offlineStorage.getAlerts(),
        offlineStorage.getRoads(),
        offlineStorage.getAuditLogs(),
      ]);

      return { locations, sensors, incidents, alerts, roads, auditLogs };
    }

    try {
      const [locRes, sensRes, incRes, altRes, rdsRes, logsRes] = await Promise.allSettled([
        fetch('/api/locations').then((r) => r.json()),
        fetch('/api/sensors').then((r) => r.json()),
        fetch('/api/incidents').then((r) => r.json()),
        fetch('/api/alerts').then((r) => r.json()),
        fetch('/api/roads').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
      ]);

      const locations: LocationData[] = locRes.status === 'fulfilled' && locRes.value.data ? locRes.value.data : await offlineStorage.getLocations();
      const sensors: SensorData[] = sensRes.status === 'fulfilled' && sensRes.value.data ? sensRes.value.data : await offlineStorage.getSensors();
      const incidents: IncidentReport[] = incRes.status === 'fulfilled' && incRes.value.data ? incRes.value.data : await offlineStorage.getIncidents();
      const alerts: DisasterAlert[] = altRes.status === 'fulfilled' && altRes.value.data ? altRes.value.data : await offlineStorage.getAlerts();
      const roads: RoadStatus[] = rdsRes.status === 'fulfilled' && rdsRes.value.data ? rdsRes.value.data : await offlineStorage.getRoads();
      const auditLogs: AuditLogItem[] = logsRes.status === 'fulfilled' && logsRes.value.data ? logsRes.value.data : await offlineStorage.getAuditLogs();

      // Persist downloaded cloud state into IndexedDB for offline resilience
      await Promise.all([
        offlineStorage.saveLocations(locations),
        offlineStorage.saveSensors(sensors),
        offlineStorage.saveIncidents(incidents),
        offlineStorage.saveAlerts(alerts),
        offlineStorage.saveRoads(roads),
        offlineStorage.saveAuditLogs(auditLogs),
      ]);

      this.lastSyncedAt = new Date().toISOString();
      this.syncState = 'SUCCESS';
      this.notifyListeners();

      return { locations, sensors, incidents, alerts, roads, auditLogs };
    } catch (err: any) {
      console.warn('[SyncEngine] Downstream pull error, falling back to IndexedDB:', err);
      const [locations, sensors, incidents, alerts, roads, auditLogs] = await Promise.all([
        offlineStorage.getLocations(),
        offlineStorage.getSensors(),
        offlineStorage.getIncidents(),
        offlineStorage.getAlerts(),
        offlineStorage.getRoads(),
        offlineStorage.getAuditLogs(),
      ]);
      return { locations, sensors, incidents, alerts, roads, auditLogs };
    }
  }

  // ----------------------------------------------------
  // MUTATION DISPATCHER (Used by UI to queue or execute changes)
  // ----------------------------------------------------
  public async dispatchMutation(
    entityType: SyncQueueItem['entityType'],
    action: SyncQueueItem['action'],
    payload: any,
    priority: SyncQueueItem['priority'] = 'NORMAL'
  ): Promise<{ queued: boolean; syncedDirectly: boolean; queueItem?: SyncQueueItem }> {
    // 1. Immediately store into local IndexedDB active stores so user sees change
    if (entityType === 'INCIDENT') {
      await offlineStorage.addIncident(payload);
    } else if (entityType === 'ALERT') {
      await offlineStorage.addAlert(payload);
    } else if (entityType === 'ROAD_STATUS') {
      await offlineStorage.updateRoad(payload);
    } else if (entityType === 'LOCATION_UPDATE') {
      await offlineStorage.updateLocation(payload);
    } else if (entityType === 'AUDIT_LOG') {
      await offlineStorage.addAuditLog(payload);
    }

    // 2. If online, attempt immediate sync
    if (this.isOnline) {
      try {
        const item: SyncQueueItem = {
          id: `mut-${Date.now()}`,
          entityType,
          action,
          payload,
          timestamp: new Date().toISOString(),
          retryCount: 0,
          status: 'SYNCING',
          priority,
        };

        const success = await this.transmitMutation(item);
        if (success) {
          this.syncedItemsCount++;
          this.lastSyncedAt = new Date().toISOString();
          this.notifyListeners();
          return { queued: false, syncedDirectly: true };
        }
      } catch (e) {
        console.warn('[SyncEngine] Direct mutation failed, enqueuing for offline sync:', e);
      }
    }

    // 3. If offline or direct transmission failed, queue for background sync
    const queuedItem = await offlineStorage.enqueueSyncItem({
      entityType,
      action,
      payload,
      priority,
      conflictResolutionStrategy: entityType === 'INCIDENT' ? 'CLIENT_WINS' : 'LAST_WRITE_WINS',
    });

    this.notifyListeners();
    return { queued: true, syncedDirectly: false, queueItem: queuedItem };
  }
}

// Global Singleton Instance
export const syncEngine = new SyncEngine();
