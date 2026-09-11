import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  LocationData,
  SensorData,
  IncidentReport,
  DisasterAlert,
  RoadStatus,
  AuditLogItem,
} from '../types';

export const DEFAULT_SUPABASE_URL = 'https://wthajsdsaryerqkglysp.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_R5USLrvqqnfWUVBuK6L5wA_TGg19YA5';

let browserClient: SupabaseClient | null = null;

/**
 * Robustly sanitizes and extracts a valid Supabase origin URL.
 * Strips descriptive prefixes, subpaths like /rest/v1/, quotes, etc.
 */
export function sanitizeSupabaseUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let cleaned = rawUrl.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return null;

  const httpMatch = cleaned.match(/(https?:\/\/[^\s"',]+)/i);
  if (httpMatch) {
    cleaned = httpMatch[1];
  }

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    if (cleaned.includes('.supabase.co') || cleaned.includes('.supabase.in') || cleaned.includes('localhost')) {
      cleaned = `https://${cleaned}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Robustly sanitizes and extracts a Supabase API key.
 */
export function sanitizeSupabaseKey(rawKey?: string | null): string | null {
  if (!rawKey || typeof rawKey !== 'string') return null;
  let cleaned = rawKey.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return null;

  const keyPrefixMatch = cleaned.match(
    /(?:anon[-_\s]*key|service[-_\s]*role[-_\s]*key|publishable[-_\s]*key|api[-_\s]*key|key)\s*[:=]\s*(\S+)/i
  );
  if (keyPrefixMatch) {
    cleaned = keyPrefixMatch[1];
  }

  cleaned = cleaned.replace(/^["']+|["';,]+$/g, '').trim();
  return cleaned || null;
}

/**
 * Extracts the project ID from a Supabase URL
 */
export function extractSupabaseProjectId(url?: string | null): string {
  const sanitized = sanitizeSupabaseUrl(url);
  if (!sanitized) return 'wthajsdsaryerqkglysp';
  try {
    const hostname = new URL(sanitized).hostname;
    const parts = hostname.split('.');
    if (parts.length > 0 && parts[0] !== 'localhost') {
      return parts[0];
    }
  } catch {}
  return 'wthajsdsaryerqkglysp';
}

export function getBrowserSupabase(): SupabaseClient | null {
  if (browserClient) return browserClient;
  const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  const url = sanitizeSupabaseUrl(rawUrl) || sanitizeSupabaseUrl(DEFAULT_SUPABASE_URL);
  const anonKey = sanitizeSupabaseKey(rawKey) || sanitizeSupabaseKey(DEFAULT_SUPABASE_KEY);

  if (url && anonKey) {
    try {
      browserClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return browserClient;
    } catch (e) {
      console.warn('Failed to init client-side Supabase:', e);
      return null;
    }
  }
  return null;
}

export interface SupabaseStatusData {
  isConfigured: boolean;
  isConnected: boolean;
  url: string;
  projectId: string;
  authType: 'service_role' | 'anon_key' | 'publishable_key' | 'none';
  tables: {
    locations: number | null;
    sensors: number | null;
    incidents: number | null;
    incident_photos: number | null;
    disaster_alerts: number | null;
    road_lifelines: number | null;
    audit_logs: number | null;
    profiles: number | null;
    user_logins: number | null;
  };
  storageBuckets: string[];
  lastChecked: string;
  errorMessage?: string;
}

export async function fetchSupabaseStatus(): Promise<SupabaseStatusData> {
  try {
    const res = await fetch('/api/supabase/status');
    const json = await res.json();
    if (json.success && json.status) {
      return json.status;
    }
    throw new Error(json.error || 'Failed to fetch status');
  } catch (err: any) {
    const fallbackUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
    const fallbackProjectId = extractSupabaseProjectId(fallbackUrl);
    return {
      isConfigured: true,
      isConnected: false,
      url: fallbackUrl,
      projectId: fallbackProjectId,
      authType: 'publishable_key',
      tables: {
        locations: null,
        sensors: null,
        incidents: null,
        incident_photos: null,
        disaster_alerts: null,
        road_lifelines: null,
        audit_logs: null,
        profiles: null,
        user_logins: null,
      },
      storageBuckets: [],
      lastChecked: new Date().toISOString(),
      errorMessage: err?.message || 'Server error communicating with Supabase gateway',
    };
  }
}

export async function seedSupabaseDatabase(): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/supabase/seed', { method: 'POST' });
    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, error: err?.message || 'Seed request failed' };
  }
}

export async function fetchSupabaseSQLSchema(): Promise<string> {
  try {
    const res = await fetch('/api/supabase/schema');
    const json = await res.json();
    return json.sql || '';
  } catch {
    return '-- Failed to load schema from server';
  }
}

export async function uploadPhotoToSupabase(
  base64Data: string,
  filename?: string
): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  try {
    const res = await fetch('/api/supabase/upload-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Data, filename }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

export async function testSupabaseInsert(type: 'login' | 'photo' | 'incident'): Promise<{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}> {
  try {
    const res = await fetch('/api/supabase/test-insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message: 'Test insert failed', error: err?.message };
  }
}

export async function fetchLocationsAPI(): Promise<LocationData[]> {
  try {
    const res = await fetch('/api/locations');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch locations error:', e);
    return [];
  }
}

export async function fetchSensorsAPI(): Promise<SensorData[]> {
  try {
    const res = await fetch('/api/sensors');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch sensors error:', e);
    return [];
  }
}

export async function fetchIncidentsAPI(): Promise<IncidentReport[]> {
  try {
    const res = await fetch('/api/incidents');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch incidents error:', e);
    return [];
  }
}

export async function fetchAlertsAPI(): Promise<DisasterAlert[]> {
  try {
    const res = await fetch('/api/alerts');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch alerts error:', e);
    return [];
  }
}

export async function fetchRoadsAPI(): Promise<RoadStatus[]> {
  try {
    const res = await fetch('/api/roads');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch roads error:', e);
    return [];
  }
}

export async function fetchAuditLogsAPI(): Promise<AuditLogItem[]> {
  try {
    const res = await fetch('/api/audit-logs');
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('Fetch audit logs error:', e);
    return [];
  }
}
