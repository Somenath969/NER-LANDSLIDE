import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  initialLocations,
  initialSensors,
  initialRoads,
  initialIncidents,
  initialAlerts,
  initialAuditLogs,
} from '../src/data/nerData';

dotenv.config();

// Active Supabase Credentials for Project wthajsdsaryerqkglysp
export const DEFAULT_SUPABASE_URL = 'https://wthajsdsaryerqkglysp.supabase.co';
export const DEFAULT_SUPABASE_KEY = 'sb_publishable_R5USLrvqqnfWUVBuK6L5wA_TGg19YA5';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Robustly sanitizes and extracts a valid Supabase origin URL.
 * Handles inputs with leading text like "supabase url : https://...",
 * subpaths like "/rest/v1/", extra quotes, or trailing slashes.
 */
export function sanitizeSupabaseUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let cleaned = rawUrl.trim().replace(/^["']+|["']+$/g, '').trim();
  if (!cleaned) return null;

  // Extract URL portion if preceded by labels like "supabase url :"
  const httpMatch = cleaned.match(/(https?:\/\/[^\s"',]+)/i);
  if (httpMatch) {
    cleaned = httpMatch[1];
  }

  // Prepend https:// if protocol was omitted but contains supabase domain
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    if (cleaned.includes('.supabase.co') || cleaned.includes('.supabase.in') || cleaned.includes('localhost')) {
      cleaned = `https://${cleaned}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(cleaned);
    // Supabase base URL must strictly be the origin, e.g. https://xyz.supabase.co
    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * Robustly sanitizes and extracts a Supabase API key.
 * Strips prefix labels like "anon key :", "apikey :", extra quotes, and trailing punctuation.
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

/**
 * Resolves sanitized Supabase credentials from environment or defaults
 */
export function getSupabaseCredentials(): {
  url: string;
  key: string;
  authType: 'service_role' | 'anon_key' | 'publishable_key' | 'none';
} {
  const rawUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const serviceRoleRaw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonRaw =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  const cleanUrl =
    sanitizeSupabaseUrl(rawUrl) ||
    sanitizeSupabaseUrl(DEFAULT_SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const cleanServiceKey = sanitizeSupabaseKey(serviceRoleRaw);
  const cleanAnonKey =
    sanitizeSupabaseKey(anonRaw) ||
    sanitizeSupabaseKey(DEFAULT_SUPABASE_KEY) ||
    DEFAULT_SUPABASE_KEY;

  const activeKey = cleanServiceKey || cleanAnonKey;
  const authType = cleanServiceKey
    ? 'service_role'
    : activeKey.startsWith('sb_publishable')
    ? 'publishable_key'
    : 'anon_key';

  return { url: cleanUrl, key: activeKey, authType };
}

export interface SupabaseStatusInfo {
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

/**
 * Lazy initialization for Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('[Supabase Server] Initialization error:', err);
    return null;
  }
}

/**
 * Check connection status, table counts, and storage buckets
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatusInfo> {
  const { url, key, authType } = getSupabaseCredentials();
  const projectId = extractSupabaseProjectId(url);
  const client = getSupabaseClient();

  if (!client || !url || !key) {
    return {
      isConfigured: false,
      isConnected: false,
      url: url || 'Not Configured',
      projectId,
      authType: 'none',
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
      errorMessage: 'Supabase URL or keys are not defined or invalid.',
    };
  }

  try {
    // Probe tables with limit(1) to avoid false positives and inspect exact presence
    const [
      locRes,
      sensRes,
      incRes,
      photoRes,
      alertRes,
      roadRes,
      auditRes,
      profRes,
      loginRes,
      bucketRes,
    ] = await Promise.allSettled([
      client.from('locations').select('id', { count: 'exact' }).limit(1),
      client.from('sensors').select('id', { count: 'exact' }).limit(1),
      client.from('incidents').select('id', { count: 'exact' }).limit(1),
      client.from('incident_photos').select('id', { count: 'exact' }).limit(1),
      client.from('disaster_alerts').select('id', { count: 'exact' }).limit(1),
      client.from('road_lifelines').select('id', { count: 'exact' }).limit(1),
      client.from('audit_logs').select('id', { count: 'exact' }).limit(1),
      client.from('profiles').select('id', { count: 'exact' }).limit(1),
      client.from('user_logins').select('id', { count: 'exact' }).limit(1),
      client.storage.listBuckets(),
    ]);

    const getCount = (res: PromiseSettledResult<{ count: number | null; error: any }>) => {
      if (res.status === 'fulfilled' && !res.value.error) {
        return res.value.count ?? 0;
      }
      return null;
    };

    const buckets =
      bucketRes.status === 'fulfilled' && bucketRes.value.data
        ? bucketRes.value.data.map((b: any) => b.name)
        : [];

    const isConnected = bucketRes.status === 'fulfilled' && !bucketRes.value.error;

    return {
      isConfigured: true,
      isConnected,
      url,
      projectId,
      authType,
      tables: {
        locations: getCount(locRes),
        sensors: getCount(sensRes),
        incidents: getCount(incRes),
        incident_photos: getCount(photoRes),
        disaster_alerts: getCount(alertRes),
        road_lifelines: getCount(roadRes),
        audit_logs: getCount(auditRes),
        profiles: getCount(profRes),
        user_logins: getCount(loginRes),
      },
      storageBuckets: buckets,
      lastChecked: new Date().toISOString(),
      errorMessage: isConnected
        ? undefined
        : 'Could not connect to Supabase backend. Verify your Project ID and API credentials.',
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      url,
      projectId,
      authType,
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
      errorMessage: err?.message || 'Connection attempt failed',
    };
  }
}

/**
 * Upload incident photo to Supabase Storage bucket 'incident-photos'
 */
export async function uploadIncidentPhotoToSupabase(
  base64Data: string,
  filename: string
): Promise<{ success: boolean; publicUrl?: string; storagePath?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not available' };
  }

  try {
    let base64Payload = base64Data;
    let mimeType = 'image/jpeg';

    if (base64Data.startsWith('data:')) {
      const match = base64Data.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Payload = match[2];
      } else {
        const commaIndex = base64Data.indexOf(',');
        if (commaIndex !== -1) {
          base64Payload = base64Data.slice(commaIndex + 1);
        }
      }
    }

    const buffer = Buffer.from(base64Payload, 'base64');
    const storagePath = `evidence/${filename}`;

    const { error } = await client.storage
      .from('incident-photos')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicUrlData } = client.storage
      .from('incident-photos')
      .getPublicUrl(storagePath);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      storagePath,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to upload photo' };
  }
}

/**
 * Seed data into Supabase tables
 */
export async function seedSupabaseData(): Promise<{
  success: boolean;
  inserted: {
    locations: number;
    sensors: number;
    incidents: number;
    incident_photos: number;
    alerts: number;
    roads: number;
    auditLogs: number;
    profiles: number;
    userLogins: number;
  };
  errors: string[];
}> {
  const client = getSupabaseClient();
  const errors: string[] = [];

  if (!client) {
    throw new Error('Supabase client is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  const result = {
    locations: 0,
    sensors: 0,
    incidents: 0,
    incident_photos: 0,
    alerts: 0,
    roads: 0,
    auditLogs: 0,
    profiles: 0,
    userLogins: 0,
  };

  // 1. Locations
  try {
    const formattedLocations = initialLocations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      district: loc.district,
      state: loc.state,
      lat: loc.lat,
      lng: loc.lng,
      elevation_m: loc.elevationM,
      slope_deg: loc.slopeDeg,
      aspect: loc.aspect,
      curvature: loc.curvature,
      geology: loc.geology,
      soil_moisture_percent: loc.soilMoisturePercent,
      rainfall_1h: loc.rainfall1h,
      rainfall_6h: loc.rainfall6h,
      rainfall_24h: loc.rainfall24h,
      rainfall_72h: loc.rainfall72h,
      rainfall_7d: loc.rainfall7d,
      rainfall_forecast_24h: loc.rainfallForecast24h,
      ground_movement_mm_day: loc.groundMovementMmDay,
      historical_landslides_count: loc.historicalLandslidesCount,
      distance_to_road_m: loc.distanceToRoadM,
      vegetation_ndvi: loc.vegetationNDVI,
      population_at_risk: loc.populationAtRisk,
      vulnerable_villages: loc.vulnerableVillages,
      nearby_infrastructure: loc.nearbyInfrastructure,
      risk_score: loc.riskScore,
      risk_probability: loc.riskProbability,
      risk_level: loc.riskLevel,
      major_factors: loc.majorFactors,
      ai_explanation: loc.aiExplanation,
      recommended_action: loc.recommendedAction,
      last_updated: loc.lastUpdated,
    }));

    const { data, error } = await client.from('locations').upsert(formattedLocations, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.locations = data?.length || formattedLocations.length;
  } catch (err: any) {
    errors.push(`locations: ${err.message}`);
  }

  // 2. Sensors
  try {
    const formattedSensors = initialSensors.map((s) => ({
      id: s.id,
      sensor_code: s.sensorCode,
      name: s.name,
      sensor_type: s.sensorType,
      location_name: s.locationName,
      state: s.state,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      battery_percent: s.batteryPercent,
      signal_strength: s.signalStrength,
      status: s.status,
      last_reading: s.lastReading,
      telemetry_history: s.telemetryHistory,
      installation_date: s.installationDate,
    }));

    const { data, error } = await client.from('sensors').upsert(formattedSensors, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.sensors = data?.length || formattedSensors.length;
  } catch (err: any) {
    errors.push(`sensors: ${err.message}`);
  }

  // 3. Incidents
  try {
    const formattedIncidents = initialIncidents.map((inc) => ({
      id: inc.id,
      reported_at: inc.reportedAt,
      status: inc.status,
      title: inc.title,
      hazard_type: inc.hazardType,
      severity: inc.severity,
      description: inc.description,
      state: inc.state,
      district: inc.district,
      location_name: inc.locationName,
      lat: inc.lat,
      lng: inc.lng,
      reported_by: inc.reportedBy,
      reporter_phone: inc.reporterPhone,
      reporter_role: inc.reporterRole,
      photo_url: inc.photoUrl,
      original_photo_url: inc.originalPhotoUrl || inc.photoUrl,
      stamped_photo_url: inc.stampedPhotoUrl || inc.photoUrl,
      video_url: inc.videoUrl,
      gis_evidence: inc.gisEvidence || {},
      ai_assessment: inc.aiAssessment || {},
    }));

    const { data, error } = await client.from('incidents').upsert(formattedIncidents, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.incidents = data?.length || formattedIncidents.length;
  } catch (err: any) {
    errors.push(`incidents: ${err.message}`);
  }

  // 4. Incident Photos
  try {
    const formattedPhotos = initialIncidents
      .filter((inc) => inc.photoUrl)
      .map((inc) => ({
        id: `photo-${inc.id}`,
        incident_id: inc.id,
        title: inc.title,
        photo_url: inc.photoUrl,
        original_photo_url: inc.originalPhotoUrl || inc.photoUrl,
        stamped_photo_url: inc.stampedPhotoUrl || inc.photoUrl,
        hazard_type: inc.hazardType,
        severity: inc.severity,
        state: inc.state,
        district: inc.district,
        location_name: inc.locationName,
        lat: inc.lat,
        lng: inc.lng,
        altitude_m: inc.gisEvidence?.altitudeMeters || 840,
        accuracy_m: inc.gisEvidence?.accuracyMeters || 3.2,
        timestamp: inc.reportedAt,
        reporter_name: inc.reportedBy,
        reporter_phone: inc.reporterPhone || '+91 94350 12345',
        reporter_role: inc.reporterRole,
        ai_detected_hazards: inc.aiAssessment?.detectedHazards || ['Tension Crack', 'Unstable Toe'],
        ai_debris_volume: inc.aiAssessment?.debrisVolumeEstimate || '2,400 m³',
        storage_path: `evidence/photo-${inc.id}.jpg`,
      }));

    if (formattedPhotos.length > 0) {
      const { data, error } = await client.from('incident_photos').upsert(formattedPhotos, { onConflict: 'id' }).select('id');
      if (error) throw error;
      result.incident_photos = data?.length || formattedPhotos.length;
    }
  } catch (err: any) {
    errors.push(`incident_photos: ${err.message}`);
  }

  // 5. Disaster Alerts
  try {
    const formattedAlerts = initialAlerts.map((a) => ({
      id: a.id,
      alert_code: a.alertCode,
      issued_at: a.issuedAt,
      expires_at: a.expiresAt,
      status: a.status,
      title: a.title,
      message: a.message,
      risk_level: a.riskLevel,
      state: a.state,
      district: a.district,
      location_name: a.locationName,
      affected_population: a.affectedPopulation,
      triggered_by: a.triggeredBy,
      channels: a.channels,
    }));

    const { data, error } = await client.from('disaster_alerts').upsert(formattedAlerts, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.alerts = data?.length || formattedAlerts.length;
  } catch (err: any) {
    errors.push(`disaster_alerts: ${err.message}`);
  }

  // 6. Road Lifelines
  try {
    const formattedRoads = initialRoads.map((r) => ({
      id: r.id,
      road_number: r.roadNumber,
      name: r.name,
      state: r.state,
      district: r.district,
      start_point: r.startPoint,
      end_point: r.endPoint,
      status: r.status,
      importance: r.importance,
      blockage_location: r.blockageLocation,
      clearance_eta: r.clearanceETA,
      alternate_route_name: r.alternateRouteName,
      alternate_route_description: r.alternateRouteDescription,
      path_coords: r.pathCoords,
      last_updated: r.lastUpdated,
    }));

    const { data, error } = await client.from('road_lifelines').upsert(formattedRoads, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.roads = data?.length || formattedRoads.length;
  } catch (err: any) {
    errors.push(`road_lifelines: ${err.message}`);
  }

  // 7. Audit Logs
  try {
    const formattedLogs = initialAuditLogs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp,
      actor_name: log.actorName,
      actor_role: log.actorRole,
      action: log.action,
      target_entity: log.targetEntity,
      details: log.details,
      ip_address: log.ipAddress,
    }));

    const { data, error } = await client.from('audit_logs').upsert(formattedLogs, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.auditLogs = data?.length || formattedLogs.length;
  } catch (err: any) {
    errors.push(`audit_logs: ${err.message}`);
  }

  // 8. User Profiles
  try {
    const demoProfiles = [
      {
        id: 'usr-citizen-demo',
        full_name: 'Debojit Sarmah',
        email: 'citizen@ner-landslide.gov.in',
        phone: '+91 94350 12345',
        role: 'citizen',
        state: 'Assam',
        district: 'Dima Hasao',
        preferred_language: 'as',
        agency: 'Citizen Volunteer & VDMC Leader',
        account_status: 'APPROVED',
        is_active: true,
        is_verified: true,
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr-field-demo',
        full_name: 'Dr. Tenzing Lepcha',
        email: 'field.geotech@ner-landslide.gov.in',
        phone: '+91 98640 22334',
        role: 'field_officer',
        state: 'Sikkim',
        district: 'North Sikkim (Mangan)',
        preferred_language: 'en',
        agency: 'Geological Survey of India (GSI) North-Eastern Region',
        account_status: 'APPROVED',
        is_active: true,
        is_verified: true,
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr-state-demo',
        full_name: 'Col. Ranjit Barua',
        email: 'authority@ner-landslide.gov.in',
        phone: '+91 94350 99887',
        role: 'state_authority',
        state: 'Assam',
        district: 'Kamrup Metropolitan',
        preferred_language: 'en',
        agency: 'Assam State Disaster Management Authority (ASDMA)',
        account_status: 'APPROVED',
        is_active: true,
        is_verified: true,
        last_login: new Date().toISOString(),
      },
      {
        id: 'usr-pwd-demo',
        full_name: 'Inspector L. Sangma',
        email: 'pwd.police@ner-landslide.gov.in',
        phone: '+91 98620 55667',
        role: 'police_pwd',
        state: 'Meghalaya',
        district: 'East Khasi Hills (Sohra)',
        preferred_language: 'en',
        agency: 'Meghalaya PWD (NH Wing) & Traffic Logistics',
        account_status: 'APPROVED',
        is_active: true,
        is_verified: true,
        last_login: new Date().toISOString(),
      },
    ];

    const { data, error } = await client.from('profiles').upsert(demoProfiles, { onConflict: 'email' }).select('id');
    if (error) throw error;
    result.profiles = data?.length || demoProfiles.length;
  } catch (err: any) {
    errors.push(`profiles: ${err.message}`);
  }

  // 9. User Logins
  try {
    const demoLogins = [
      {
        id: 'login-init-1',
        user_id: 'usr-state-demo',
        email: 'authority@ner-landslide.gov.in',
        phone: '+91 94350 99887',
        role: 'state_authority',
        name: 'Col. Ranjit Barua',
        login_method: 'email_password',
        ip_address: '103.24.120.14',
        logged_in_at: new Date().toISOString(),
      },
      {
        id: 'login-init-2',
        user_id: 'usr-field-demo',
        email: 'field.geotech@ner-landslide.gov.in',
        phone: '+91 98640 22334',
        role: 'field_officer',
        name: 'Dr. Tenzing Lepcha',
        login_method: 'phone_otp',
        ip_address: '117.201.88.92',
        logged_in_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const { data, error } = await client.from('user_logins').upsert(demoLogins, { onConflict: 'id' }).select('id');
    if (error) throw error;
    result.userLogins = data?.length || demoLogins.length;
  } catch (err: any) {
    errors.push(`user_logins: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    inserted: result,
    errors,
  };
}

/**
 * Returns complete, production-ready SQL Schema script for copying into Supabase SQL Editor
 */
export function getSupabaseSQLSchema(): string {
  const { url } = getSupabaseCredentials();
  const projectId = extractSupabaseProjectId(url);
  return `-- =========================================================================
-- NER Landslide Early Warning & Risk Monitoring System
-- Supabase Project: ${projectId}
-- Complete PostgreSQL + PostGIS BaaS Schema & Row-Level Security Policies
-- =========================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Locations Table (GIS Spatial Risk Grid)
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom geometry(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)) STORED,
    elevation_m DOUBLE PRECISION DEFAULT 0,
    slope_deg DOUBLE PRECISION DEFAULT 0,
    aspect TEXT,
    curvature TEXT,
    geology TEXT,
    soil_moisture_percent DOUBLE PRECISION DEFAULT 0,
    rainfall_1h DOUBLE PRECISION DEFAULT 0,
    rainfall_6h DOUBLE PRECISION DEFAULT 0,
    rainfall_24h DOUBLE PRECISION DEFAULT 0,
    rainfall_72h DOUBLE PRECISION DEFAULT 0,
    rainfall_7d DOUBLE PRECISION DEFAULT 0,
    rainfall_forecast_24h DOUBLE PRECISION DEFAULT 0,
    ground_movement_mm_day DOUBLE PRECISION DEFAULT 0,
    historical_landslides_count INTEGER DEFAULT 0,
    distance_to_road_m DOUBLE PRECISION DEFAULT 0,
    vegetation_ndvi DOUBLE PRECISION DEFAULT 0,
    population_at_risk INTEGER DEFAULT 0,
    vulnerable_villages JSONB DEFAULT '[]'::jsonb,
    nearby_infrastructure JSONB DEFAULT '[]'::jsonb,
    risk_score INTEGER DEFAULT 0,
    risk_probability DOUBLE PRECISION DEFAULT 0,
    risk_level TEXT NOT NULL DEFAULT 'LOW',
    major_factors JSONB DEFAULT '[]'::jsonb,
    ai_explanation TEXT,
    recommended_action TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON public.locations USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_locations_state_risk ON public.locations (state, risk_level);

-- 3. IoT Sensors Table
CREATE TABLE IF NOT EXISTS public.sensors (
    id TEXT PRIMARY KEY,
    sensor_code TEXT UNIQUE NOT NULL,
    name TEXT,
    sensor_type TEXT NOT NULL,
    location_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    battery_percent INTEGER DEFAULT 100,
    signal_strength INTEGER DEFAULT 95,
    status TEXT NOT NULL DEFAULT 'ONLINE',
    last_reading JSONB DEFAULT '{}'::jsonb,
    telemetry_history JSONB DEFAULT '[]'::jsonb,
    installation_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensors_code ON public.sensors (sensor_code);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON public.sensors (status);

-- 4. Incident Reports Table (Field & Citizen Hazard Submissions)
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    title TEXT NOT NULL,
    hazard_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    location_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    reported_by TEXT NOT NULL,
    reporter_phone TEXT,
    reporter_role TEXT DEFAULT 'Citizen',
    photo_url TEXT,
    original_photo_url TEXT,
    stamped_photo_url TEXT,
    video_url TEXT,
    gis_evidence JSONB DEFAULT '{}'::jsonb,
    ai_assessment JSONB DEFAULT '{}'::jsonb,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_state ON public.incidents (state, status);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON public.incidents (reported_at DESC);

-- 5. Incident Photos Table (Dedicated High-Resolution Photo Evidence & Metadata)
CREATE TABLE IF NOT EXISTS public.incident_photos (
    id TEXT PRIMARY KEY,
    incident_id TEXT REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT,
    photo_url TEXT NOT NULL,
    original_photo_url TEXT,
    stamped_photo_url TEXT,
    hazard_type TEXT,
    severity TEXT,
    state TEXT,
    district TEXT,
    location_name TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    altitude_m DOUBLE PRECISION DEFAULT 0,
    accuracy_m DOUBLE PRECISION DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    reporter_name TEXT,
    reporter_phone TEXT,
    reporter_role TEXT,
    ai_detected_hazards JSONB DEFAULT '[]'::jsonb,
    ai_debris_volume TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_photos_inc_id ON public.incident_photos (incident_id);

-- 6. Disaster Alerts Table (CAP India Broadcast System)
CREATE TABLE IF NOT EXISTS public.disaster_alerts (
    id TEXT PRIMARY KEY,
    alert_code TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    risk_level TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    location_name TEXT NOT NULL,
    affected_population INTEGER DEFAULT 0,
    triggered_by TEXT NOT NULL,
    channels JSONB DEFAULT '["CAP India Protocol", "SMS Broadcast", "Mobile App"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.disaster_alerts (status, risk_level);

-- 7. Road Lifelines & Mountain Corridors Table
CREATE TABLE IF NOT EXISTS public.road_lifelines (
    id TEXT PRIMARY KEY,
    road_number TEXT NOT NULL,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    start_point TEXT,
    end_point TEXT,
    status TEXT NOT NULL DEFAULT 'CLEAR',
    importance TEXT DEFAULT 'High',
    blockage_location TEXT,
    clearance_eta TEXT,
    alternate_route_name TEXT,
    alternate_route_description TEXT,
    path_coords JSONB DEFAULT '[]'::jsonb,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_road_status ON public.road_lifelines (status);

-- 8. Audit & Provenance Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs (timestamp DESC);

-- 9. User Profiles Table (Authentication, Roles & Agencies)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    auth_user_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'citizen',
    state TEXT NOT NULL DEFAULT 'Assam',
    district TEXT NOT NULL DEFAULT 'Kamrup Metropolitan',
    preferred_language TEXT NOT NULL DEFAULT 'en',
    agency TEXT,
    account_status TEXT NOT NULL DEFAULT 'APPROVED',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 10. User Logins History Table (Login Session & Device Auditing)
CREATE TABLE IF NOT EXISTS public.user_logins (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    email TEXT,
    phone TEXT,
    role TEXT,
    name TEXT,
    login_method TEXT DEFAULT 'email_password',
    ip_address TEXT,
    logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_logins_email ON public.user_logins (email);
CREATE INDEX IF NOT EXISTS idx_user_logins_time ON public.user_logins (logged_in_at DESC);

-- 11. Early Warning Subscribers (Community SMS Broadcast Alert Registry)
CREATE TABLE IF NOT EXISTS public.early_warning_subscribers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    village TEXT,
    preferred_language TEXT DEFAULT 'en',
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Storage Buckets (Evidence & Field Photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-photos', 'incident-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public select on incident-photos" ON storage.objects;
CREATE POLICY "Public select on incident-photos" ON storage.objects FOR SELECT USING (bucket_id = 'incident-photos');

DROP POLICY IF EXISTS "Public insert on incident-photos" ON storage.objects;
CREATE POLICY "Public insert on incident-photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-photos');

DROP POLICY IF EXISTS "Public update on incident-photos" ON storage.objects;
CREATE POLICY "Public update on incident-photos" ON storage.objects FOR UPDATE USING (bucket_id = 'incident-photos');

-- 13. Enable Row-Level Security (RLS) & Configure Permissive Policies for Web Clients
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_lifelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_warning_subscribers ENABLE ROW LEVEL SECURITY;

-- Permissive policies for publishable / anonymous API key access
DROP POLICY IF EXISTS "Allow all on locations" ON public.locations;
CREATE POLICY "Allow all on locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on sensors" ON public.sensors;
CREATE POLICY "Allow all on sensors" ON public.sensors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on incidents" ON public.incidents;
CREATE POLICY "Allow all on incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on incident_photos" ON public.incident_photos;
CREATE POLICY "Allow all on incident_photos" ON public.incident_photos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on disaster_alerts" ON public.disaster_alerts;
CREATE POLICY "Allow all on disaster_alerts" ON public.disaster_alerts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on road_lifelines" ON public.road_lifelines;
CREATE POLICY "Allow all on road_lifelines" ON public.road_lifelines FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on audit_logs" ON public.audit_logs;
CREATE POLICY "Allow all on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on profiles" ON public.profiles;
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on user_logins" ON public.user_logins;
CREATE POLICY "Allow all on user_logins" ON public.user_logins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on early_warning_subscribers" ON public.early_warning_subscribers;
CREATE POLICY "Allow all on early_warning_subscribers" ON public.early_warning_subscribers FOR ALL USING (true) WITH CHECK (true);
`;
}
