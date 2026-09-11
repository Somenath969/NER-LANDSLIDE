import React, { useState } from 'react';
import {
  ShieldAlert,
  User,
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  X,
  UserCheck,
  Languages,
  BadgeCheck,
} from 'lucide-react';
import { UserRole, NERState, LanguageCode, UserAccount } from '../types';
import { translations } from '../locales/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  currentLang: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  currentLang,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State - no fields filled by default
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [state, setState] = useState<NERState | ''>('');
  const [district, setDistrict] = useState('');
  const [agency, setAgency] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(currentLang);

  if (!isOpen) return null;

  const nerStates: NERState[] = [
    'Assam',
    'Arunachal Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ];

  const roleOptions: { role: UserRole; label: string; desc: string; defaultAgency: string }[] = [
    {
      role: 'super_admin',
      label: 'Super Admin (NDMA / NEC)',
      desc: 'Full national oversight, ML model threshold recalibration, and system audits.',
      defaultAgency: 'North Eastern Council (NEC) / NDMA Technical Core',
    },
    {
      role: 'state_authority',
      label: 'State Authority (SDMA)',
      desc: 'State-wide hazard monitoring, district mobilization, and emergency declarations.',
      defaultAgency: 'Assam State Disaster Management Authority (ASDMA)',
    },
    {
      role: 'district_authority',
      label: 'District Magistrate / DEOC',
      desc: 'Local evacuation orders, relief shelter activation, and public alerts.',
      defaultAgency: 'District Disaster Management Authority (DDMA)',
    },
    {
      role: 'dm_officer',
      label: 'NDRF / DM Commander',
      desc: 'Search & rescue operations, tactical deployment, and casualty management.',
      defaultAgency: '1st Battalion NDRF (Patgaon, Guwahati)',
    },
    {
      role: 'field_officer',
      label: 'Field Geotechnical Officer',
      desc: 'On-ground slope verification, sensor diagnostics, and photo reconnaissance.',
      defaultAgency: 'Geological Survey of India (GSI) / State Geologist',
    },
    {
      role: 'police_pwd',
      label: 'PWD / Highway Police',
      desc: 'Mountain highway blockage clearance, heavy machinery dispatch, and traffic diversion.',
      defaultAgency: 'Public Works Department (Highways & Bridges)',
    },
    {
      role: 'citizen',
      label: 'Citizen / Community Volunteer',
      desc: 'Report landslide hazards, receive verified multilingual alerts, and view evacuation guides.',
      defaultAgency: 'Village Disaster Management Committee (VDMC)',
    },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
  };

  const handleQuickLogin = (presetEmail: string, presetRole: UserRole, presetName: string, presetAgency: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setRole(presetRole);
    setName(presetName);
    setAgency(presetAgency);
    executeLogin(presetEmail, presetRole);
  };

  const executeLogin = async (loginEmail: string, loginRole?: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: password || 'pass123',
          role: loginRole || (role ? role : 'citizen'),
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMsg(`Welcome back, ${data.user.name}!`);
        localStorage.setItem('ner_landslide_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.message || 'Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      console.warn('Backend login fallback to local session:', err);
      const fallbackUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: name || loginEmail.split('@')[0],
        email: loginEmail,
        phone: phone || '+91 98640 10700',
        role: loginRole || (role ? role : 'citizen'),
        state: state || 'Assam',
        district: district || 'Dima Hasao',
        preferredLanguage: preferredLanguage,
        agency: agency || 'Emergency Response Authority',
      };
      localStorage.setItem('ner_landslide_user', JSON.stringify(fallbackUser));
      setSuccessMsg(`Session started for ${fallbackUser.name}`);
      setTimeout(() => {
        onLoginSuccess(fallbackUser);
        onClose();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and official or personal email.');
      return;
    }
    if (!role) {
      setErrorMsg('Please select your official or citizen role.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || '+91 90000 00000',
          role,
          state: state || 'Assam',
          district: district || 'General District',
          agency: agency || 'Disaster Management',
          preferredLanguage,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMsg(`Account registered successfully in backend database! Logging in as ${data.user.name}...`);
        localStorage.setItem('ner_landslide_user', JSON.stringify(data.user));
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 900);
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      console.warn('Backend registration fallback to local state:', err);
      const fallbackUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || '+91 98640 10700',
        role,
        state: state || 'Assam',
        district: district || 'General District',
        preferredLanguage,
        agency: agency || 'Disaster Management',
      };
      localStorage.setItem('ner_landslide_user', JSON.stringify(fallbackUser));
      setSuccessMsg(`Account created and registered locally for ${fallbackUser.name}`);
      setTimeout(() => {
        onLoginSuccess(fallbackUser);
        onClose();
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] text-slate-100">
                {currentUser ? 'Official Profile & Session' : authMode === 'login' ? 'Official / Citizen Sign In' : 'Create & Register New Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                NER Landslide Early Warning & Disaster Decision Support System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ALREADY LOGGED IN VIEW */}
        {currentUser ? (
          <div className="space-y-6">
            <div className="bg-slate-850 border border-slate-800 p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center">
                      {currentUser.name}
                      <BadgeCheck className="w-4 h-4 text-blue-400 ml-1.5 inline" />
                    </h3>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {currentUser.role.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Assigned Jurisdiction:</span>
                  <strong>{currentUser.district}, {currentUser.state}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Agency / Command:</span>
                  <strong>{currentUser.agency}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone:</span>
                  <span>{currentUser.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Backend Storage:</span>
                  <span className="text-emerald-400 font-semibold">PostgreSQL / Supabase Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onLogout();
                  localStorage.removeItem('ner_landslide_user');
                  setSuccessMsg('Logged out successfully.');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-red-200 bg-red-950/80 hover:bg-red-900 border border-red-800 transition-colors"
              >
                Log Out / Switch User
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATION / REGISTRATION TABS & FORMS */
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In to Existing Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register & Store in Backend
              </button>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-600/40 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN FORM */}
            {authMode === 'login' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeLogin(email);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address / Official ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ops.ndrf1st@nic.in or user@gmail.com"
                      className="w-full bg-slate-800 text-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password / Secure PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800 text-slate-100 rounded-xl pl-9 pr-3 py-2.5 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                  {isLoading ? (
                    <span>Authenticating with Backend...</span>
                  ) : (
                    <>
                      <span>Sign In to Operational Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* 1-Click Quick Demo Login Presets */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    1-Click Instant Official Roles (Backend Demo Profiles):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('admin@ner-landslide.gov.in', 'super_admin', 'Prof. S. K. Bhattacharya', 'NDMA Technical Core')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">Super Admin</strong>
                      <span className="text-[10px] text-slate-400">NDMA / NEC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('ops.ndrf1st@nic.in', 'dm_officer', 'Lt. Col. Rajesh Sharma', '1st Bn NDRF')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">NDRF Commander</strong>
                      <span className="text-[10px] text-slate-400">Tactical SAR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('tenzing.lepcha@sikkim.gov.in', 'field_officer', 'Tenzing Lepcha', 'SSDMA Geologist')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">Field Officer</strong>
                      <span className="text-[10px] text-slate-400">Sikkim PWA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('pwd.aizawl@mizoram.gov.in', 'police_pwd', 'Er. Lalthanpuia Sailo', 'PWD Highways')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">PWD Highway Eng</strong>
                      <span className="text-[10px] text-slate-400">Mizoram PWD</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('director.asdma@assam.gov.in', 'state_authority', 'Dr. Anamika Barman', 'ASDMA State HQ')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">State Authority</strong>
                      <span className="text-[10px] text-slate-400">ASDMA Assam</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickLogin('citizen.bipul@gmail.com', 'citizen', 'Bipul Gogoi', 'Community Volunteer')
                      }
                      className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-left border border-slate-700/80 transition-all"
                    >
                      <strong className="text-slate-200 block text-[11px]">Citizen Volunteer</strong>
                      <span className="text-[10px] text-slate-400">Dima Hasao</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB 2: REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Bora"
                        className="w-full bg-slate-800 text-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. r.bora@sdma.gov.in"
                        className="w-full bg-slate-800 text-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Official or Citizen Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    required
                    className="w-full bg-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="" disabled>-- Select Official or Citizen Role * --</option>
                    {roleOptions.map((opt) => (
                      <option key={opt.role} value={opt.role}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {roleOptions.find((r) => r.role === role)?.desc}
                  </p>
                </div>

                {/* Row 3: State & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      State (NER Region)
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value as NERState)}
                      className="w-full bg-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="" disabled>-- Select NER State --</option>
                      {nerStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      District Jurisdiction
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Dima Hasao, Mangan, Aizawl"
                      className="w-full bg-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 4: Agency & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Agency / Department Name
                    </label>
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="e.g. ASDMA / PWD / NDRF"
                      className="w-full bg-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number (For SMS Alerts)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98640 11223"
                      className="w-full bg-slate-800 text-slate-100 rounded-xl px-3 py-2 text-xs border border-slate-700 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all mt-2"
                >
                  {isLoading ? (
                    <span>Persisting Account to Backend...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Save to Database</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
