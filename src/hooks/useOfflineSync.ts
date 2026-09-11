/**
 * NER LandslideWatch - React Hook for Offline Storage & Sync Engine
 */

import React, { useState, useEffect, useCallback } from 'react';
import { syncEngine, SyncEngineStatus } from '../services/syncEngine';
import { offlineStorage, SyncQueueItem } from '../services/offlineStorage';

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncEngineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    syncState: 'IDLE',
    pendingCount: 0,
    lastSyncedAt: null,
    lastError: null,
    syncedItemsCount: 0,
    activeTransport: '4G_LTE_CLOUD',
  });

  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Subscribe to sync engine status
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
      setIsSyncing(newStatus.syncState === 'SYNCING');
    });

    // Initial queue load
    offlineStorage.getSyncQueue().then(setQueueItems);

    return () => {
      unsubscribe();
    };
  }, []);

  // Manual Trigger Sync
  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    const result = await syncEngine.flushSyncQueue();
    const freshQueue = await offlineStorage.getSyncQueue();
    setQueueItems(freshQueue);
    setIsSyncing(false);
    return result;
  }, []);

  // Toggle simulated online/offline mode
  const setSimulatedOnline = useCallback((online: boolean) => {
    syncEngine.setSimulatedOnline(online);
  }, []);

  return {
    ...status,
    queueItems,
    isSyncing,
    triggerManualSync,
    setSimulatedOnline,
  };
}
