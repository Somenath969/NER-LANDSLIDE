/**
 * NER LandslideWatch - Resilient Offline-First Storage Engine
 * Implements high-durability IndexedDB local storage for all disaster management datasets:
 * - Hazard Locations & AI Risk Scores
 * - IoT Sensor Telemetry & Historical Trends
 * - Field Incident Recon Reports & GIS Geotagged Evidence
 * - CAP India Early Warnings & Broadcast Alerts
 * - Road Lifelines & Critical Evacuation Corridors
 * - Audit Trail Logs
 * - Outbound Mutation Sync Queue with Conflict Resolution State
 * - Offline GeoJSON & Map Layer Cache
 */

import {
  LocationData,
  SensorData,
  IncidentReport,
  DisasterAlert,
  RoadStatus,
  AuditLogItem,
  EdgeDeviceTelemetryNode,
} from '../types';

import {
  initialLocations,
  initialSensors,
  initialRoads,
  initialIncidents,
  initialAlerts,
  initialAuditLogs,
  initialEdgeDevices,
} from '../data/nerData';

export interface SyncQueueItem {
  id: string;
  entityType: 'INCIDENT' | 'ALERT' | 'ROAD_STATUS' | 'SENSOR_READING' | 'AUDIT_LOG' | 'LOCATION_UPDATE';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'RESOLVED_CONFLICT';
  errorMessage?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  conflictResolutionStrategy?: 'CLIENT_WINS' | 'SERVER_WINS' | 'LAST_WRITE_WINS';
}

const DB_NAME = 'NER_DisasterWatch_OfflineDB';
const DB_VERSION = 1;

export class OfflineStorageEngine {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isAvailable: boolean = true;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[OfflineStorage] IndexedDB not available in current environment. Using memory fallback.');
      this.isAvailable = false;
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // 1. Locations Store
          if (!db.objectStoreNames.contains('locations')) {
            const store = db.createObjectStore('locations', { keyPath: 'id' });
            store.createIndex('state', 'state', { unique: false });
            store.createIndex('district', 'district', { unique: false });
            store.createIndex('riskLevel', 'riskLevel', { unique: false });
          }

          // 2. Sensors Store
          if (!db.objectStoreNames.contains('sensors')) {
            const store = db.createObjectStore('sensors', { keyPath: 'id' });
            store.createIndex('sensorCode', 'sensorCode', { unique: false });
            store.createIndex('locationId', 'locationId', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }

          // 3. Incidents Store
          if (!db.objectStoreNames.contains('incidents')) {
            const store = db.createObjectStore('incidents', { keyPath: 'id' });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('reportedAt', 'reportedAt', { unique: false });
            store.createIndex('district', 'district', { unique: false });
          }

          // 4. Alerts Store
          if (!db.objectStoreNames.contains('alerts')) {
            const store = db.createObjectStore('alerts', { keyPath: 'id' });
            store.createIndex('riskLevel', 'riskLevel', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('issuedAt', 'issuedAt', { unique: false });
          }

          // 5. Roads Store
          if (!db.objectStoreNames.contains('roads')) {
            const store = db.createObjectStore('roads', { keyPath: 'id' });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('state', 'state', { unique: false });
          }

          // 6. Audit Logs Store
          if (!db.objectStoreNames.contains('auditLogs')) {
            const store = db.createObjectStore('auditLogs', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // 7. Sync Queue Store (Outbound buffer)
          if (!db.objectStoreNames.contains('syncQueue')) {
            const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
            store.createIndex('status', 'status', { unique: false });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('priority', 'priority', { unique: false });
          }

          // 8. Offline Map Cache & GeoJSON
          if (!db.objectStoreNames.contains('offlineMapCache')) {
            db.createObjectStore('offlineMapCache', { keyPath: 'key' });
          }

          // 9. Edge Telemetry Devices
          if (!db.objectStoreNames.contains('edgeDevices')) {
            db.createObjectStore('edgeDevices', { keyPath: 'deviceId' });
          }
        };

        request.onsuccess = () => {
          const db = request.result;
          resolve(db);
        };

        request.onerror = (e) => {
          console.error('[OfflineStorage] Failed to open IndexedDB:', e);
          this.isAvailable = false;
          reject(request.error);
        };
      } catch (err) {
        console.error('[OfflineStorage] Initialization error:', err);
        this.isAvailable = false;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // Generic Helper: Run Transaction
  private async executeTx<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest | void
  ): Promise<T> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = operation(store);

        if (req) {
          req.onsuccess = () => resolve(req.result as T);
          req.onerror = () => reject(req.error);
        } else {
          tx.oncomplete = () => resolve(true as unknown as T);
          tx.onerror = () => reject(tx.error);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  // ----------------------------------------------------
  // LOCATIONS
  // ----------------------------------------------------
  public async getLocations(): Promise<LocationData[]> {
    try {
      const items = await this.executeTx<LocationData[]>('locations', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      // Seed default if empty
      await this.saveLocations(initialLocations);
      return initialLocations;
    } catch {
      return initialLocations;
    }
  }

  public async saveLocations(locations: LocationData[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('locations', 'readwrite');
      const store = tx.objectStore('locations');
      for (const loc of locations) {
        store.put(loc);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveLocations error:', e);
    }
  }

  public async updateLocation(location: LocationData): Promise<void> {
    try {
      await this.executeTx('locations', 'readwrite', (store) => store.put(location));
    } catch (e) {
      console.warn('[OfflineStorage] updateLocation error:', e);
    }
  }

  // ----------------------------------------------------
  // SENSORS
  // ----------------------------------------------------
  public async getSensors(): Promise<SensorData[]> {
    try {
      const items = await this.executeTx<SensorData[]>('sensors', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveSensors(initialSensors);
      return initialSensors;
    } catch {
      return initialSensors;
    }
  }

  public async saveSensors(sensors: SensorData[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('sensors', 'readwrite');
      const store = tx.objectStore('sensors');
      for (const s of sensors) {
        store.put(s);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveSensors error:', e);
    }
  }

  public async updateSensor(sensor: SensorData): Promise<void> {
    try {
      await this.executeTx('sensors', 'readwrite', (store) => store.put(sensor));
    } catch (e) {
      console.warn('[OfflineStorage] updateSensor error:', e);
    }
  }

  // ----------------------------------------------------
  // INCIDENTS
  // ----------------------------------------------------
  public async getIncidents(): Promise<IncidentReport[]> {
    try {
      const items = await this.executeTx<IncidentReport[]>('incidents', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveIncidents(initialIncidents);
      return initialIncidents;
    } catch {
      return initialIncidents;
    }
  }

  public async saveIncidents(incidents: IncidentReport[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('incidents', 'readwrite');
      const store = tx.objectStore('incidents');
      for (const inc of incidents) {
        store.put(inc);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveIncidents error:', e);
    }
  }

  public async addIncident(incident: IncidentReport): Promise<void> {
    try {
      await this.executeTx('incidents', 'readwrite', (store) => store.put(incident));
    } catch (e) {
      console.warn('[OfflineStorage] addIncident error:', e);
    }
  }

  // ----------------------------------------------------
  // ALERTS
  // ----------------------------------------------------
  public async getAlerts(): Promise<DisasterAlert[]> {
    try {
      const items = await this.executeTx<DisasterAlert[]>('alerts', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveAlerts(initialAlerts);
      return initialAlerts;
    } catch {
      return initialAlerts;
    }
  }

  public async saveAlerts(alerts: DisasterAlert[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('alerts', 'readwrite');
      const store = tx.objectStore('alerts');
      for (const a of alerts) {
        store.put(a);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveAlerts error:', e);
    }
  }

  public async addAlert(alert: DisasterAlert): Promise<void> {
    try {
      await this.executeTx('alerts', 'readwrite', (store) => store.put(alert));
    } catch (e) {
      console.warn('[OfflineStorage] addAlert error:', e);
    }
  }

  // ----------------------------------------------------
  // ROADS
  // ----------------------------------------------------
  public async getRoads(): Promise<RoadStatus[]> {
    try {
      const items = await this.executeTx<RoadStatus[]>('roads', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveRoads(initialRoads);
      return initialRoads;
    } catch {
      return initialRoads;
    }
  }

  public async saveRoads(roads: RoadStatus[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('roads', 'readwrite');
      const store = tx.objectStore('roads');
      for (const r of roads) {
        store.put(r);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveRoads error:', e);
    }
  }

  public async updateRoad(road: RoadStatus): Promise<void> {
    try {
      await this.executeTx('roads', 'readwrite', (store) => store.put(road));
    } catch (e) {
      console.warn('[OfflineStorage] updateRoad error:', e);
    }
  }

  // ----------------------------------------------------
  // AUDIT LOGS
  // ----------------------------------------------------
  public async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const items = await this.executeTx<AuditLogItem[]>('auditLogs', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveAuditLogs(initialAuditLogs);
      return initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  }

  public async saveAuditLogs(logs: AuditLogItem[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('auditLogs', 'readwrite');
      const store = tx.objectStore('auditLogs');
      for (const log of logs) {
        store.put(log);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveAuditLogs error:', e);
    }
  }

  public async addAuditLog(log: AuditLogItem): Promise<void> {
    try {
      await this.executeTx('auditLogs', 'readwrite', (store) => store.put(log));
    } catch (e) {
      console.warn('[OfflineStorage] addAuditLog error:', e);
    }
  }

  // ----------------------------------------------------
  // SYNC QUEUE (Offline Outbound Buffer)
  // ----------------------------------------------------
  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const items = await this.executeTx<SyncQueueItem[]>('syncQueue', 'readonly', (store) => store.getAll());
      return items || [];
    } catch {
      return [];
    }
  }

  public async enqueueSyncItem(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'> & { id?: string }): Promise<SyncQueueItem> {
    const fullItem: SyncQueueItem = {
      id: item.id || `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING',
      ...item,
    };

    try {
      await this.executeTx('syncQueue', 'readwrite', (store) => store.put(fullItem));
    } catch (e) {
      console.warn('[OfflineStorage] enqueueSyncItem error:', e);
      // Fallback to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('ner_offline_sync_fallback') || '[]');
        existing.push(fullItem);
        localStorage.setItem('ner_offline_sync_fallback', JSON.stringify(existing));
      } catch {}
    }

    return fullItem;
  }

  public async updateSyncItem(item: SyncQueueItem): Promise<void> {
    try {
      await this.executeTx('syncQueue', 'readwrite', (store) => store.put(item));
    } catch (e) {
      console.warn('[OfflineStorage] updateSyncItem error:', e);
    }
  }

  public async removeSyncItem(id: string): Promise<void> {
    try {
      await this.executeTx('syncQueue', 'readwrite', (store) => store.delete(id));
    } catch (e) {
      console.warn('[OfflineStorage] removeSyncItem error:', e);
    }
  }

  public async clearSyncQueue(): Promise<void> {
    try {
      await this.executeTx('syncQueue', 'readwrite', (store) => store.clear());
    } catch (e) {
      console.warn('[OfflineStorage] clearSyncQueue error:', e);
    }
  }

  // ----------------------------------------------------
  // EDGE DEVICES
  // ----------------------------------------------------
  public async getEdgeDevices(): Promise<EdgeDeviceTelemetryNode[]> {
    try {
      const items = await this.executeTx<EdgeDeviceTelemetryNode[]>('edgeDevices', 'readonly', (store) => store.getAll());
      if (items && items.length > 0) return items;
      await this.saveEdgeDevices(initialEdgeDevices);
      return initialEdgeDevices;
    } catch {
      return initialEdgeDevices;
    }
  }

  public async saveEdgeDevices(devices: EdgeDeviceTelemetryNode[]): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('edgeDevices', 'readwrite');
      const store = tx.objectStore('edgeDevices');
      for (const d of devices) {
        store.put(d);
      }
      return new Promise((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    } catch (e) {
      console.warn('[OfflineStorage] saveEdgeDevices error:', e);
    }
  }

  // ----------------------------------------------------
  // OFFLINE MAP CACHE
  // ----------------------------------------------------
  public async getMapCache(key: string): Promise<any | null> {
    try {
      const res = await this.executeTx<{ key: string; data: any }>('offlineMapCache', 'readonly', (store) => store.get(key));
      return res ? res.data : null;
    } catch {
      return null;
    }
  }

  public async setMapCache(key: string, data: any): Promise<void> {
    try {
      await this.executeTx('offlineMapCache', 'readwrite', (store) => store.put({ key, data, cachedAt: new Date().toISOString() }));
    } catch (e) {
      console.warn('[OfflineStorage] setMapCache error:', e);
    }
  }
}

// Global Singleton Instance
export const offlineStorage = new OfflineStorageEngine();
