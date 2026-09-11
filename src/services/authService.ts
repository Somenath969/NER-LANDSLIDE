import { UserAccount, UserRole, NERState, LanguageCode } from '../types';
import { getBrowserSupabase } from './supabaseClient';

export interface SessionData {
  token: string;
  user: UserAccount;
  expiresAt: number;
  loginMethod: 'phone_otp' | 'email_password' | 'demo';
}

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  color: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecialChar) score += 1;

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Weak',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      color: 'text-slate-400',
    };
  }

  if (score <= 1) {
    return {
      score,
      label: 'Weak',
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      color: 'text-red-500',
    };
  }
  if (score === 2) {
    return {
      score,
      label: 'Fair',
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      color: 'text-amber-500',
    };
  }
  if (score === 3) {
    return {
      score,
      label: 'Good',
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      color: 'text-blue-500',
    };
  }
  return {
    score: 4,
    label: 'Strong',
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    color: 'text-emerald-500',
  };
}

// Role Dashboard Route Mapping
export const ROLE_DASHBOARDS: Record<UserRole, { tab: string; title: string; desc: string }> = {
  citizen: {
    tab: 'public_portal',
    title: 'Citizen Disaster Safety Portal',
    desc: 'Report landslide hazards, check local danger alerts, and view evacuation guides.',
  },
  field_officer: {
    tab: 'field_pwa',
    title: 'Field Geotechnical Officer PWA',
    desc: 'Offline reconnaissance, slope crack inspections, and telemetry diagnostics.',
  },
  dm_officer: {
    tab: 'authority',
    title: 'NDRF / Disaster Operations Commander',
    desc: 'Tactical SAR deployment, emergency priority triaging, and evacuation routes.',
  },
  police_pwd: {
    tab: 'road_monitoring',
    title: 'PWD & Highway Police Logistics',
    desc: 'Mountain highway blockage clearance, heavy machinery dispatch, and traffic diversion.',
  },
  district_authority: {
    tab: 'authority',
    title: 'District Magistrate & DEOC Commander',
    desc: 'District-wide emergency alerts, shelter activation, and civil resource allocation.',
  },
  state_authority: {
    tab: 'decision_ecosystem',
    title: 'SDMA State Hazard Intelligence',
    desc: 'State-wide multi-district vulnerability matrix and multi-hazard response coordination.',
  },
  super_admin: {
    tab: 'admin_audit',
    title: 'National Disaster Governance & Model Lab',
    desc: 'Full system oversight, ML model recalibration, and cryptographic audit provenance.',
  },
};

// Route Guard & Authorization Checker
export function canUserAccessTab(role: UserRole, targetTab: string): boolean {
  // Normal Citizen role strictly restricted to public dashboard tabs
  if (role === 'citizen') {
    return [
      'public_portal',
      'gis_map',
      'roads',
      'public_weather_forecasts',
    ].includes(targetTab);
  }

  // Officer roles cannot see or access public dashboard portal or public weather view
  if (['public_portal', 'public_weather_forecasts'].includes(targetTab)) {
    return false;
  }

  // Common tabs accessible by officer roles
  const officerCommonTabs = [
    'gis_map',
    'roads',
    'radar_met',
    'decision_ecosystem',
    'ecosystem',
    'trajectory',
  ];
  if (officerCommonTabs.includes(targetTab)) return true;

  if (role === 'super_admin') return true;

  switch (targetTab) {
    case 'admin_audit':
    case 'models':
    case 'supabase_baas':
      return ['state_authority', 'super_admin'].includes(role);

    case 'authority':
    case 'authority_dashboard':
      return [
        'state_authority',
        'field_officer',
        'district_authority',
        'dm_officer',
        'super_admin',
      ].includes(role);

    case 'field_pwa':
    case 'sensors':
      return [
        'state_authority',
        'district_authority',
        'field_officer',
        'dm_officer',
        'super_admin',
      ].includes(role);

    case 'road_monitoring':
      return [
        'state_authority',
        'district_authority',
        'police_pwd',
        'dm_officer',
        'super_admin',
      ].includes(role);

    default:
      return true;
  }
}

// Session Management Helpers
const SESSION_STORAGE_KEY = 'ner_auth_session';

export function saveSession(session: SessionData): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem('ner_landslide_user', JSON.stringify(session.user));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionData;
    if (session && session.expiresAt && Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('ner_landslide_user');
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

// API Service Callers
export async function sendMobileOtp(phone: string, role?: UserRole): Promise<{
  success: boolean;
  message: string;
  maskedPhone?: string;
  countdownSeconds?: number;
  debugDemoOtp?: string;
}> {
  // 1. Try Supabase Auth client if configured
  const supabase = getBrowserSupabase();
  if (supabase) {
    try {
      const cleanDigits = phone.replace(/\D/g, '');
      const fullPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
      await supabase.auth.signInWithOtp({ phone: fullPhone });
    } catch (err) {
      console.warn('Supabase client OTP fallback:', err);
    }
  }

  // 2. Call server OTP endpoint
  const res = await fetch('/api/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, role }),
  });
  return await res.json();
}

export async function verifyMobileOtp(
  phone: string,
  otp: string,
  role?: UserRole
): Promise<{
  success: boolean;
  message: string;
  user?: UserAccount;
  token?: string;
  redirectRoute?: string;
  accountStatus?: string;
}> {
  const res = await fetch('/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, role }),
  });
  const data = await res.json();
  if (data.success && data.user) {
    saveSession({
      token: data.token || `token-${Date.now()}`,
      user: data.user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      loginMethod: 'phone_otp',
    });
  }
  return data;
}

export async function loginWithEmailPassword(
  email: string,
  password: string,
  rememberMe: boolean = true,
  role?: UserRole,
  extraProfile?: { name?: string; phone?: string; state?: NERState; district?: string }
): Promise<{
  success: boolean;
  message: string;
  user?: UserAccount;
  token?: string;
  redirectRoute?: string;
  accountStatus?: string;
}> {
  // 1. Try Supabase Auth
  const supabase = getBrowserSupabase();
  if (supabase) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) console.warn('Supabase Auth error:', error.message);
    } catch (e) {
      console.warn('Supabase auth catch:', e);
    }
  }

  // 2. Call Server Login Endpoint
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      role,
      name: extraProfile?.name,
      phone: extraProfile?.phone,
      state: extraProfile?.state,
      district: extraProfile?.district,
    }),
  });
  const data = await res.json();
  if (data.success && data.user) {
    if (extraProfile) {
      if (extraProfile.name) data.user.name = extraProfile.name;
      if (extraProfile.phone) data.user.phone = extraProfile.phone.startsWith('+91') ? extraProfile.phone : `+91 ${extraProfile.phone}`;
      if (extraProfile.state) data.user.state = extraProfile.state;
      if (extraProfile.district) data.user.district = extraProfile.district;
    }
    saveSession({
      token: data.token || `token-${Date.now()}`,
      user: data.user,
      expiresAt: Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000,
      loginMethod: 'email_password',
    });
  }
  return data;
}

export async function registerAccount(params: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  state: NERState;
  district: string;
  agency?: string;
  preferredLanguage?: LanguageCode;
}): Promise<{
  success: boolean;
  message: string;
  user?: UserAccount;
  token?: string;
  accountStatus?: string;
}> {
  // 1. Try Supabase Auth Sign Up
  const supabase = getBrowserSupabase();
  if (supabase) {
    try {
      await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.name,
            phone: params.phone,
            role: params.role,
            state: params.state,
            district: params.district,
          },
        },
      });
    } catch (e) {
      console.warn('Supabase signup catch:', e);
    }
  }

  // 2. Call Server Register Endpoint
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (data.success && data.user && data.accountStatus === 'APPROVED') {
    saveSession({
      token: data.token || `token-${Date.now()}`,
      user: data.user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      loginMethod: 'email_password',
    });
  }
  return data;
}

export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  demoResetToken?: string;
}> {
  const supabase = getBrowserSupabase();
  if (supabase) {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      console.warn('Supabase reset email catch:', e);
    }
  }

  const res = await fetch('/api/auth/password/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function completePasswordReset(
  email: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/auth/password/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  });
  return await res.json();
}

export async function logoutUser(user?: UserAccount | null): Promise<void> {
  const supabase = getBrowserSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase logout catch:', e);
    }
  }

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
  } catch (e) {
    console.warn('Server logout error:', e);
  }
  clearSession();
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserAccount>
): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  const res = await fetch(`/api/auth/profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (data.success && data.user) {
    const existing = loadSession();
    if (existing) {
      saveSession({
        ...existing,
        user: data.user,
      });
    }
  }
  return data;
}
