import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  X,
  User,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  ShieldCheck,
  Shield,
  Radio,
  Compass,
  FileText,
  UserPlus,
  LogIn,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  Award,
  Smartphone,
  ChevronDown,
  Flame,
  PlusSquare,
  ShieldAlert,
  Bell,
  Check,
} from 'lucide-react';
import { UserRole, NERState, LanguageCode, UserAccount, ThemeMode } from '../types';
import disasterBgImg from '../assets/images/himalayan_landslide_hero_bg_1788358349438.jpg';
import {
  sendMobileOtp,
  verifyMobileOtp,
  loginWithEmailPassword,
  registerAccount,
  requestPasswordReset,
  evaluatePasswordStrength,
  ROLE_DASHBOARDS,
  updateUserProfile,
} from '../services/authService';

interface SecureAuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount, targetTab?: string) => void;
  onLogout: () => void;
  currentLang: LanguageCode;
  theme?: ThemeMode;
  initialMode?: 'login' | 'register' | 'profile' | 'gateway';
  initialRoleTarget?: UserRole;
  onNavigateHome?: () => void;
}

export const SecureAuthPortal: React.FC<SecureAuthPortalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  currentLang,
  initialMode = 'login',
  initialRoleTarget,
  onNavigateHome,
}) => {
  // Navigation & View Modes
  const [viewMode, setViewMode] = useState<
    'auth_modal' | 'profile' | 'forgot_password' | 'login_success'
  >(initialMode === 'profile' ? 'profile' : 'auth_modal');

  // User type selection: Citizen vs Officer (from screenshot)
  const [userCategory, setUserCategory] = useState<'citizen' | 'officer'>(
    initialRoleTarget && initialRoleTarget !== 'citizen' ? 'officer' : 'citizen'
  );

  // Officer designation choices (Requirement: "Field Geotechnical Officer" and "State Authority")
  const [officerChoice, setOfficerChoice] = useState<'field_officer' | 'state_authority'>(
    initialRoleTarget === 'state_authority' ? 'state_authority' : 'field_officer'
  );

  // Auth method tab: Mobile OTP vs Email & Password vs Register
  // Officers are strictly allowed only email access (password tab)
  const [authTab, setAuthTab] = useState<'otp' | 'password' | 'register'>(
    userCategory === 'officer' ? 'password' : initialMode === 'register' ? 'register' : 'otp'
  );

  useEffect(() => {
    if (initialMode === 'profile') {
      setViewMode('profile');
    } else if (initialMode === 'register') {
      setViewMode('auth_modal');
      setUserCategory('citizen'); // Only citizens can register
      setAuthTab('register');
    } else if (initialMode === 'login') {
      setViewMode('auth_modal');
      if (userCategory === 'officer') {
        setAuthTab('password');
      } else if (authTab === 'register') {
        setAuthTab('otp');
      }
    }
  }, [initialMode]);

  // OTP State
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email & Password State - empty by default
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Officer Specific Inputs (Name, Contact Number, State, District) - empty by default
  const [officerName, setOfficerName] = useState('');
  const [officerContact, setOfficerContact] = useState('');
  const [officerState, setOfficerState] = useState<NERState | ''>('');
  const [officerDistrict, setOfficerDistrict] = useState('');

  // Registration Specific Fields - empty by default
  const [fullName, setFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole | ''>('');
  const [regState, setRegState] = useState<NERState | ''>('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regAgency, setRegAgency] = useState('');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(currentLang);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileState, setProfileState] = useState<NERState>(currentUser?.state || 'Assam');
  const [profileDistrict, setProfileDistrict] = useState(currentUser?.district || 'Kamrup Metropolitan');
  const [profileLanguage, setProfileLanguage] = useState<LanguageCode>(currentUser?.preferredLanguage || 'en');

  // Async & Notification State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Success Redirect Splash
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(null);
  const [targetRedirectTab, setTargetRedirectTab] = useState<string>('public_portal');

  // Pre-configured Test Accounts
  const demoAccounts = [
    {
      label: 'Citizen Resident',
      name: 'Bipul Gogoi',
      role: 'citizen' as UserRole,
      phone: '9435577610',
      email: 'citizen.bipul@gmail.com',
      state: 'Assam' as NERState,
      district: 'Dima Hasao',
      agency: 'Village Disaster Committee',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    {
      label: 'Field Geotechnical Officer',
      name: 'Tenzing Lepcha',
      role: 'field_officer' as UserRole,
      phone: '9733045892',
      email: 'tenzing.lepcha@sikkim.gov.in',
      state: 'Sikkim' as NERState,
      district: 'North Sikkim (Mangan)',
      agency: 'Geological Survey of India (GSI) / State Geologist',
      badgeColor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
    },
    {
      label: 'State Authority',
      name: 'Dr. Anamika Barman',
      role: 'state_authority' as UserRole,
      phone: '9435122849',
      email: 'anamika.barman@ner-disaster.gov.in',
      state: 'Assam' as NERState,
      district: 'Kamrup Metropolitan',
      agency: 'State Disaster Management Authority (ASDMA)',
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
  ];

  // NER States and Districts
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

  const stateDistricts: Record<NERState, string[]> = {
    Assam: ['Dima Hasao', 'Kamrup Metropolitan', 'Cachar', 'Karbi Anglong', 'Hailakandi', 'Dibrugarh'],
    'Arunachal Pradesh': ['Papum Pare', 'West Kameng', 'Tawang', 'Upper Subansiri', 'East Siang'],
    Manipur: ['Imphal West', 'Churachandpur', 'Kangpokpi', 'Senapati', 'Tamenglong', 'Ukhrul'],
    Meghalaya: ['East Khasi Hills (Sohra)', 'West Jaintia Hills', 'Ri-Bhoi', 'West Garo Hills'],
    Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Mamit'],
    Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Phek', 'Mon'],
    Sikkim: ['North Sikkim (Mangan)', 'Gangtok', 'Pakyong', 'Namchi', 'Gyalshing'],
    Tripura: ['West Tripura', 'Dhalai', 'Unakoti', 'North Tripura', 'Gomati'],
  };

  const roleDefinitions: {
    role: UserRole;
    label: string;
    badge: string;
    category: 'citizen' | 'officer';
    defaultAgency: string;
  }[] = [
    {
      role: 'citizen',
      label: 'Citizen / Community Resident',
      badge: 'PUBLIC ACCESS',
      category: 'citizen',
      defaultAgency: 'Village Disaster Management Committee (VDMC)',
    },
    {
      role: 'field_officer',
      label: 'Field Geotechnical Officer',
      badge: 'FIELD RECONNAISSANCE',
      category: 'officer',
      defaultAgency: 'Geological Survey of India (GSI) / State Geologist',
    },
    {
      role: 'dm_officer',
      label: 'NDRF / Disaster Operations Commander',
      badge: 'TACTICAL COMMAND',
      category: 'officer',
      defaultAgency: '1st Battalion NDRF',
    },
    {
      role: 'police_pwd',
      label: 'PWD & Highway Police Logistics',
      badge: 'LIFELINE LOGISTICS',
      category: 'officer',
      defaultAgency: 'PWD Highways & BRO',
    },
    {
      role: 'district_authority',
      label: 'District Magistrate / DEOC Authority',
      badge: 'DISTRICT EOC',
      category: 'officer',
      defaultAgency: 'District Disaster Management Authority (DDMA)',
    },
    {
      role: 'super_admin',
      label: 'National Core Admin (NDMA / NEC)',
      badge: 'SYSTEM GOVERNANCE',
      category: 'officer',
      defaultAgency: 'North Eastern Council (NEC) / NDMA Core',
    },
  ];

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Sync profile editing fields when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone);
      setProfileState(currentUser.state);
      setProfileDistrict(currentUser.district);
      setProfileLanguage(currentUser.preferredLanguage);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Handlers
  const handleCategoryChange = (category: 'citizen' | 'officer') => {
    setUserCategory(category);
    if (category === 'citizen') {
      setRegRole('citizen');
      setRegAgency('Village Disaster Management Committee (VDMC)');
      if (authTab === 'password' && !email) {
        setAuthTab('otp');
      }
    } else {
      // Officers are strictly allowed only email access (mobile is prohibited)
      setAuthTab('password');
      setIsOtpSent(false);
      setRegRole(officerChoice);
      setRegAgency(
        officerChoice === 'field_officer'
          ? 'Geological Survey of India (GSI) / State Geologist'
          : 'State Disaster Management Authority (SDMA)'
      );
      // Officers cannot sign up - switch to login if in register mode
      if (authTab === 'register') {
        setAuthTab('password');
        setViewMode('auth_modal');
      }
    }
    setStatusMessage(null);
  };

  const handleOfficerChoiceChange = (choice: 'field_officer' | 'state_authority') => {
    setOfficerChoice(choice);
    setRegRole(choice);
    setRegAgency(
      choice === 'field_officer'
        ? 'Geological Survey of India (GSI) / State Geologist'
        : 'State Disaster Management Authority (SDMA)'
    );
    setStatusMessage(null);
  };

  const handleSendOtp = async () => {
    if (userCategory === 'officer') {
      setStatusMessage({
        type: 'error',
        text: 'Officers are strictly allowed email access only. Mobile number login is not permitted.',
      });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number (+91).' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const activeRole = userCategory === 'citizen' ? 'citizen' : regRole;
      const res = await sendMobileOtp(cleanPhone, activeRole);
      if (res.success) {
        setIsOtpSent(true);
        setMaskedPhone(res.maskedPhone || `+91 ******${cleanPhone.slice(-4)}`);
        setCountdown(res.countdownSeconds || 30);
        setDemoOtpHint(res.debugDemoOtp || '123456');
        setStatusMessage({
          type: 'success',
          text: `Verification code dispatched! For evaluation, use test OTP: ${res.debugDemoOtp || '123456'}`,
        });
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to send OTP.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Network error while sending OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (userCategory === 'officer') {
      setStatusMessage({ type: 'error', text: 'Officers are not permitted to authenticate via mobile OTP.' });
      return;
    }

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter the complete 6-digit OTP code.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const activeRole = 'citizen';
      const res = await verifyMobileOtp(phone, fullOtp, activeRole);
      if (res.success && res.user) {
        completeLoginRedirect(res.user, res.redirectRoute);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Invalid or expired OTP code.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error verifying OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatusMessage({ type: 'error', text: 'Email and password are required.' });
      return;
    }

    if (userCategory === 'officer' && (!officerName.trim() || !officerContact.trim() || !officerState || !officerDistrict)) {
      setStatusMessage({ type: 'error', text: 'Please enter Officer Name, Contact Number, State, and District.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const targetRole = userCategory === 'officer' ? officerChoice : 'citizen';
      const officerProfileData =
        userCategory === 'officer'
          ? {
              name: officerName.trim(),
              phone: officerContact.trim(),
              state: (officerState || 'Assam') as NERState,
              district: officerDistrict || 'Kamrup Metropolitan',
            }
          : undefined;

      const res = await loginWithEmailPassword(
        email,
        password,
        rememberMe,
        targetRole,
        officerProfileData
      );
      if (res.success && res.user) {
        completeLoginRedirect(res.user, res.redirectRoute);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Email or password is incorrect.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Authentication failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userCategory === 'officer') {
      setStatusMessage({
        type: 'error',
        text: 'Officers are not allowed to sign up. Officer accounts are issued directly by State Disaster Management Authorities.',
      });
      return;
    }

    if (!fullName || !email || !password) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!regState || !regDistrict) {
      setStatusMessage({ type: 'error', text: 'Please select your NER State and District.' });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await registerAccount({
        name: fullName,
        email,
        phone,
        password,
        role: 'citizen',
        state: (regState || 'Assam') as NERState,
        district: regDistrict || 'General District',
        agency: regAgency || 'Village Disaster Management Committee (VDMC)',
        preferredLanguage: preferredLang,
      });

      if (res.success && res.user) {
        completeLoginRedirect(res.user);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Registration failed.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error creating account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (account: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: `Authenticating as ${account.name} (${account.label})...` });

    setTimeout(() => {
      const demoUser: UserAccount = {
        id: `demo-${account.role}-${Date.now()}`,
        name: account.name,
        email: account.email,
        phone: `+91 ${account.phone}`,
        role: account.role,
        state: account.state,
        district: account.district,
        preferredLanguage: 'en',
        agency: account.agency,
        accountStatus: 'APPROVED',
        isVerified: true,
        phoneVerified: true,
        twoFactorEnabled: false,
        lastLogin: new Date().toISOString(),
      };

      completeLoginRedirect(demoUser);
      setIsLoading(false);
    }, 350);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please enter your registered email address.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Recovery instructions sent! Sample Token: ${res.demoResetToken || 'sample-789'}.`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to send recovery link.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Recovery request error.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await updateUserProfile(currentUser.id, {
        name: profileName,
        phone: profilePhone,
        state: profileState,
        district: profileDistrict,
        preferredLanguage: profileLanguage,
      });

      if (res.success && res.user) {
        setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditingProfile(false);
        onLoginSuccess(res.user);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Profile update failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const completeLoginRedirect = (user: UserAccount, suggestedTab?: string) => {
    setAuthenticatedUser(user);
    const target = user.role === 'citizen' ? 'public_portal' : 'authority_dashboard';
    setTargetRedirectTab(target);
    onLoginSuccess(user, target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between min-h-screen p-4 sm:p-6 overflow-y-auto bg-slate-950 font-sans">
      {/* 1. Exact Cinematic Disaster Management Wallpaper Background */}
      <img
        src={disasterBgImg}
        alt="Disaster Management Operations Background"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none scale-100 transform"
      />

      {/* 2. Atmospheric Dark Radial/Gradient Vignette for visual focus */}
      <div className="fixed inset-0 bg-slate-950/40 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/80 pointer-events-none" />

      {/* Close button in top-right corner */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition-all shadow-lg"
        title="Close Portal"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ---------------------------------------------------- */}
      {/* TOP BRAND HEADER (Exact design from screenshot) */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 pt-4 sm:pt-6 pb-4 text-center flex flex-col items-center">
        {/* Shield Logo with Hands / Family Symbol */}
        <div className="flex items-center justify-center gap-3.5 mb-1.5">
          <div className="relative w-12 h-13 sm:w-14 sm:h-15 flex items-center justify-center">
            {/* Custom Shield SVG Emblem */}
            <svg
              viewBox="0 0 100 120"
              className="w-12 h-14 sm:w-13 sm:h-15 drop-shadow-[0_4px_16px_rgba(249,115,22,0.4)]"
            >
              <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
              </defs>
              {/* Outer Shield Path */}
              <path
                d="M50 4 L92 22 C92 70 50 112 50 112 C50 112 8 70 8 22 Z"
                fill="#0f172a"
                stroke="url(#shieldGrad)"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              {/* Inner Caring Hands / Community Symbol */}
              <g fill="#ffffff" transform="translate(22, 28) scale(0.55)">
                {/* Center Family/Person Icon */}
                <circle cx="50" cy="22" r="10" fill="#ffffff" />
                <path d="M30 60 C30 45 40 40 50 40 C60 40 70 45 70 60 Z" fill="#ffffff" />
                {/* Left person */}
                <circle cx="20" cy="30" r="7" fill="#fdba74" />
                <path d="M8 60 C8 48 15 45 22 45 C28 45 32 48 32 60 Z" fill="#fdba74" />
                {/* Right person */}
                <circle cx="80" cy="30" r="7" fill="#fdba74" />
                <path d="M68 60 C68 48 72 45 78 45 C85 45 92 48 92 60 Z" fill="#fdba74" />
                {/* Supporting Hands Curve */}
                <path
                  d="M6 75 C25 95 75 95 94 75 C85 86 65 92 50 92 C35 92 15 86 6 75 Z"
                  fill="#f97316"
                />
              </g>
            </svg>
          </div>

          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none flex items-center gap-2">
              <span className="text-white drop-shadow-md font-sans">DISASTER</span>
              <span className="text-[#f97316] drop-shadow-md font-sans">MANAGEMENT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal tracking-wide mt-1 drop-shadow">
              Prepared Today, Safer Tomorrow
            </p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CENTER AUTHENTICATION CARD (Frosted Glass Floating Modal) */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 w-full max-w-[490px] my-auto">
        <div className="rounded-[28px] bg-slate-950/30 backdrop-blur-md border border-white/20 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8">
          
          {/* Dynamic Status Toast Banner */}
          {statusMessage && (
            <div
              className={`mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border backdrop-blur-md ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500/50'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/70 text-rose-200 border-rose-500/50'
                  : 'bg-blue-950/70 text-blue-200 border-blue-500/50'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Activity className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: MAIN LOGIN / AUTHENTICATION */}
          {/* ==================================================== */}
          {viewMode === 'auth_modal' && authTab !== 'register' && (
            <div>
              {/* Card Titles */}
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-md">
                  {userCategory === 'officer' ? 'Officer Portal Login' : 'Citizen Portal Login'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 drop-shadow">
                  {userCategory === 'officer'
                    ? 'Authorized State & Geotechnical Operations Command'
                    : 'Access localized landslide warnings, safe routes and alerts'}
                </p>
              </div>

              {/* 1. Citizen vs Officer User Category Toggle */}
              <div className="grid grid-cols-2 gap-2.5 p-1 rounded-2xl bg-slate-950/35 backdrop-blur-sm border border-white/15 mb-4">
                {/* Citizen Option */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('citizen')}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-all ${
                    userCategory === 'citizen'
                      ? 'bg-blue-600/30 border border-blue-400 shadow-md ring-1 ring-blue-400/40 text-white'
                      : 'bg-transparent border border-transparent text-slate-300 hover:text-white hover:bg-slate-900/30'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      userCategory === 'citizen'
                        ? 'bg-blue-500/40 text-blue-300'
                        : 'bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">Citizen</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                      Login & Sign Up
                    </div>
                  </div>
                </button>

                {/* Officer Option */}
                <button
                  type="button"
                  onClick={() => handleCategoryChange('officer')}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl text-left transition-all ${
                    userCategory === 'officer'
                      ? 'bg-orange-500/30 border border-orange-400 shadow-md ring-1 ring-orange-400/40 text-white'
                      : 'bg-transparent border border-transparent text-slate-300 hover:text-white hover:bg-slate-900/30'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      userCategory === 'officer'
                        ? 'bg-orange-500/40 text-orange-300'
                        : 'bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <Shield className="w-5 h-5 fill-current" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-white truncate">Officer</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                      Official Email Only
                    </div>
                  </div>
                </button>
              </div>

              {/* OFFICER SPECIFIC CONTROLS (Requirements 1 & 2) */}
              {userCategory === 'officer' ? (
                <div className="space-y-3 mb-4">
                  {/* Two Officer Choices */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
                        Select Officer Designation
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                        2 Authorized Choices
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Choice 1: Field Geotechnical Officer */}
                      <button
                        type="button"
                        onClick={() => handleOfficerChoiceChange('field_officer')}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          officerChoice === 'field_officer'
                            ? 'bg-emerald-950/70 border-emerald-400 shadow-lg ring-1 ring-emerald-400/50 text-white'
                            : 'bg-slate-950/40 border-white/15 text-slate-300 hover:text-white hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                officerChoice === 'field_officer'
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border border-white/10'
                              }`}
                            >
                              <Compass className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold leading-tight block">Field Geotechnical Officer</span>
                              <span className="text-[9px] text-emerald-300 font-mono">GSI / State Geologist</span>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              officerChoice === 'field_officer'
                                ? 'border-emerald-400 bg-emerald-500'
                                : 'border-slate-500'
                            }`}
                          >
                            {officerChoice === 'field_officer' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-normal pl-9">
                          IoT sensors, slope crack logs, ground reconnaissance & field PWA
                        </p>
                      </button>

                      {/* Choice 2: State Authority */}
                      <button
                        type="button"
                        onClick={() => handleOfficerChoiceChange('state_authority')}
                        className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                          officerChoice === 'state_authority'
                            ? 'bg-amber-950/70 border-amber-400 shadow-lg ring-1 ring-amber-400/50 text-white'
                            : 'bg-slate-950/40 border-white/15 text-slate-300 hover:text-white hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                officerChoice === 'state_authority'
                                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                  : 'bg-slate-900 text-slate-400 border border-white/10'
                              }`}
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold leading-tight block">State Authority</span>
                              <span className="text-[9px] text-amber-300 font-mono">SDMA State Operations</span>
                            </div>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              officerChoice === 'state_authority'
                                ? 'border-amber-400 bg-amber-500'
                                : 'border-slate-500'
                            }`}
                          >
                            {officerChoice === 'state_authority' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-normal pl-9">
                          SDMA State Command, decision ecosystem & early warning broadcast
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Authorized Officer Access Banner */}
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-amber-500/30 text-amber-200 text-xs">
                    <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-semibold text-amber-300 block">Authorized Emergency Access</span>
                      Enter your officer identity, contact details, jurisdiction, and official credentials to sign in.
                    </div>
                  </div>
                </div>
              ) : (
                /* CITIZEN LOGIN METHOD SELECTION (Mobile OTP vs Email & Password) */
                <>
                  <div className="text-center my-3">
                    <span className="text-[11px] text-slate-300 font-medium tracking-wide drop-shadow">
                      Choose Citizen Login Method
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('otp');
                        setStatusMessage(null);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        authTab === 'otp'
                          ? 'bg-blue-600/30 text-white border border-blue-400 shadow-sm'
                          : 'bg-slate-950/30 text-slate-300 border border-white/15 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span>Mobile OTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('password');
                        setStatusMessage(null);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        authTab === 'password'
                          ? 'bg-blue-600/30 text-white border border-blue-400 shadow-sm'
                          : 'bg-slate-950/30 text-slate-300 border border-white/15 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email & Password</span>
                    </button>
                  </div>
                </>
              )}

              {/* 3. MOBILE OTP FORM (FOR CITIZENS ONLY) */}
              {userCategory === 'citizen' && authTab === 'otp' && (
                <div>
                  {!isOtpSent ? (
                    <div className="space-y-4">
                      {/* Mobile Number Input with +91 country selector */}
                      <div className="flex items-center gap-2">
                        {/* Country code pill */}
                        <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-950/40 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-medium shrink-0">
                          <span className="text-base leading-none">🇮🇳</span>
                          <span>+91</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
                        </div>

                        {/* Phone Number Input */}
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit Mobile Number"
                            maxLength={10}
                            className="w-full pl-3 pr-10 py-3 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <Smartphone className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Send OTP Action Button */}
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading || phone.replace(/\D/g, '').length < 10}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-[0_4px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <span>Send Mobile OTP</span>
                        )}
                      </button>

                      {/* Quick autofill for citizen test phone */}
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPhone('9435577610');
                          }}
                          className="text-[11px] text-blue-300 hover:text-blue-200 underline underline-offset-2"
                        >
                          Use Test Citizen Phone (9435577610)
                        </button>
                      </div>

                      {/* OR Divider */}
                      <div className="relative flex items-center justify-center my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/15" />
                        </div>
                        <span className="relative px-3 bg-slate-950/60 backdrop-blur-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          OR
                        </span>
                      </div>

                      {/* Secondary Action: Login with Email & Password */}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('password');
                          setStatusMessage(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-900/50 border border-white/15 text-slate-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
                      >
                        <Mail className="w-4 h-4 text-slate-300" />
                        <span>Login with Email & Password</span>
                      </button>
                    </div>
                  ) : (
                    /* 6-Digit OTP Verification Screen */
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-xs text-slate-200">
                          Enter the 6-digit code sent to{' '}
                          <span className="text-blue-400 font-mono font-bold">{maskedPhone}</span>
                        </p>
                      </div>

                      <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold bg-slate-950/50 border border-white/25 rounded-xl text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 font-mono transition-all backdrop-blur-sm"
                          />
                        ))}
                      </div>

                      {demoOtpHint && (
                        <div className="text-center p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 backdrop-blur-sm">
                          <span className="text-[11px] text-blue-300 font-mono">
                            Demo Code: <strong>{demoOtpHint}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpDigits(demoOtpHint.split(''));
                            }}
                            className="ml-2 text-[10px] underline text-blue-400 hover:text-blue-200"
                          >
                            (Auto-fill)
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Didn't receive code?</span>
                        {countdown > 0 ? (
                          <span className="text-blue-400 font-mono">Resend in {countdown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="text-blue-400 hover:underline font-semibold"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isLoading || otpDigits.join('').length !== 6}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-[0_4px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify & Login</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="w-full text-xs text-slate-300 hover:text-white text-center py-1"
                      >
                        ← Change Mobile Number
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 4. EMAIL & PASSWORD FORM (For Officers always, or Citizens who select Email) */}
              {(userCategory === 'officer' || authTab === 'password') && (
                <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5">
                  {/* Officer Jurisdictional & Profile Fields: Name, Contact Number, State, District */}
                  {userCategory === 'officer' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Name *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <User className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              value={officerName}
                              onChange={(e) => setOfficerName(e.target.value)}
                              placeholder="Officer Full Name"
                              required
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            Contact Number *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              value={officerContact}
                              onChange={(e) => setOfficerContact(e.target.value)}
                              placeholder="10-digit mobile number"
                              required
                              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            State *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <select
                              value={officerState}
                              onChange={(e) => {
                                const newState = e.target.value as NERState;
                                setOfficerState(newState);
                                setOfficerDistrict('');
                              }}
                              className="w-full pl-9 pr-8 py-2.5 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 appearance-none cursor-pointer transition-all"
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-400">-- Select State * --</option>
                              {nerStates.map((st) => (
                                <option key={st} value={st} className="bg-slate-900 text-white">
                                  {st}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                            District *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                              <Building className="w-4 h-4" />
                            </div>
                            <select
                              value={officerDistrict}
                              onChange={(e) => setOfficerDistrict(e.target.value)}
                              disabled={!officerState}
                              className="w-full pl-9 pr-8 py-2.5 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 appearance-none cursor-pointer transition-all disabled:opacity-50"
                            >
                              <option value="" disabled className="bg-slate-900 text-slate-400">
                                {officerState ? '-- Select District * --' : '-- Select State First --'}
                              </option>
                              {(officerState ? stateDistricts[officerState as NERState] || [] : []).map((dist) => (
                                <option key={dist} value={dist} className="bg-slate-900 text-white">
                                  {dist}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      {userCategory === 'officer' ? 'Official Government Email' : 'Email Address'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          userCategory === 'officer'
                            ? officerChoice === 'field_officer'
                              ? 'e.g. tenzing.lepcha@sikkim.gov.in'
                              : 'e.g. anamika.barman@ner-disaster.gov.in'
                            : 'name@gmail.com'
                        }
                        className="w-full pl-9 pr-4 py-3 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-10 py-3 bg-slate-950/40 backdrop-blur-sm border border-white/20 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Test Credential Quick Fill Helper */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    {userCategory === 'officer' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (officerChoice === 'field_officer') {
                            setEmail('tenzing.lepcha@sikkim.gov.in');
                            setPassword('secureGovPass2026!');
                            setOfficerName('Tenzing Lepcha');
                            setOfficerContact('9733045892');
                            setOfficerState('Sikkim');
                            setOfficerDistrict('North Sikkim (Mangan)');
                          } else {
                            setEmail('anamika.barman@ner-disaster.gov.in');
                            setPassword('secureGovPass2026!');
                            setOfficerName('Dr. Anamika Barman');
                            setOfficerContact('9435122849');
                            setOfficerState('Assam');
                            setOfficerDistrict('Kamrup Metropolitan');
                          }
                        }}
                        className="text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1"
                      >
                        Fill {officerChoice === 'field_officer' ? 'Field Officer' : 'State Authority'} Test Account
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('citizen.bipul@gmail.com');
                          setPassword('citizenPass2026!');
                        }}
                        className="text-blue-300 hover:text-blue-200 underline underline-offset-2 flex items-center gap-1"
                      >
                        Fill Citizen Test Account
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setViewMode('forgot_password')}
                      className="text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-white ${
                      userCategory === 'officer'
                        ? officerChoice === 'field_officer'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40'
                          : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/40'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>
                        {userCategory === 'officer'
                          ? `Sign In as ${officerChoice === 'field_officer' ? 'Field Geotechnical Officer' : 'State Authority'}`
                          : 'Sign In as Citizen'}
                      </span>
                    )}
                  </button>

                  {/* Citizen only: Alternate to switch to Mobile OTP */}
                  {userCategory === 'citizen' && (
                    <>
                      <div className="relative flex items-center justify-center my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white/15" />
                        </div>
                        <span className="relative px-3 bg-slate-950/60 backdrop-blur-sm text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          OR
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('otp');
                          setStatusMessage(null);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-950/30 hover:bg-slate-900/50 border border-white/15 text-slate-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors backdrop-blur-sm"
                      >
                        <Smartphone className="w-4 h-4 text-slate-300" />
                        <span>Login with Mobile OTP</span>
                      </button>
                    </>
                  )}
                </form>
              )}

              {/* CARD FOOTER: Sign up available for Citizens (Restricted section for officers removed) */}
              {userCategory === 'citizen' && (
                <div className="text-center pt-4 mt-2">
                  <span className="text-xs text-slate-400">
                    New user?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab('register');
                        setStatusMessage(null);
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                    >
                      Sign Up as Citizen
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: REGISTRATION / SIGN UP (CITIZENS ONLY) */}
          {/* ==================================================== */}
          {viewMode === 'auth_modal' && authTab === 'register' && (
            <div>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">Create Citizen Account</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Register for community early warnings, evacuation routes and emergency alerts
                </p>
              </div>

              {/* Notice regarding officer registration restriction */}
              <div className="mb-3.5 p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-amber-300">Notice: </strong>
                  Officers are not allowed to sign up. Field Geotechnical Officers and State Authorities are provisioned directly by SDMA/NIC and must login using official email.
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Bipul Gogoi"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen.name@gmail.com"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Mobile Number (+91)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="94350 12345"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Account Type
                    </label>
                    <div className="px-3 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-xs flex items-center justify-between text-slate-200">
                      <span className="font-medium">Citizen / Community Resident</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        PUBLIC
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      NER State
                    </label>
                    <select
                      value={regState}
                      onChange={(e) => {
                        const s = e.target.value as NERState;
                        setRegState(s);
                        setRegDistrict('');
                      }}
                      className="w-full px-3 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="" disabled className="bg-slate-900 text-slate-400">-- Select NER State * --</option>
                      {nerStates.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                      District Jurisdiction
                    </label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      disabled={!regState}
                      className="w-full px-3 py-2 bg-slate-900/80 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="" disabled className="bg-slate-900 text-slate-400">
                        {regState ? '-- Select District * --' : '-- Select State First --'}
                      </option>
                      {(regState ? stateDistricts[regState as NERState] || [] : []).map((d) => (
                        <option key={d} value={d} className="bg-slate-900 text-white">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm shadow-lg disabled:opacity-50 transition-all mt-2"
                >
                  {isLoading ? 'Creating Citizen Account...' : 'Complete Citizen Registration'}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setUserCategory('citizen');
                        setAuthTab('otp');
                        setStatusMessage(null);
                      }}
                      className="text-blue-400 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: FORGOT PASSWORD */}
          {/* ==================================================== */}
          {viewMode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">Reset Your Password</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Enter your registered official email address to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@disaster.gov.in"
                    className="w-full px-3.5 py-3 bg-slate-900/60 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
                >
                  {isLoading ? 'Sending Link...' : 'Send Recovery Instructions'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('auth_modal');
                      setAuthTab('password');
                    }}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: PROFILE MANAGEMENT */}
          {/* ==================================================== */}
          {viewMode === 'profile' && currentUser && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500 text-blue-400 flex items-center justify-center font-bold">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{currentUser.name}</h3>
                    <p className="text-[11px] text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/15 text-white disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-white/15 text-white disabled:opacity-75"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Assigned State & District</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value={currentUser.state}
                      className="px-3 py-2 rounded-xl bg-slate-900/40 border border-white/10 text-slate-300"
                    />
                    <input
                      type="text"
                      disabled
                      value={currentUser.district}
                      className="px-3 py-2 rounded-xl bg-slate-900/40 border border-white/10 text-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                {isEditingProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* VIEW: LOGIN SUCCESS REDIRECT ANIMATION */}
          {/* ==================================================== */}
          {viewMode === 'login_success' && authenticatedUser && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  Welcome, {authenticatedUser.name}!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Authenticated as{' '}
                  <span className="text-emerald-400 font-bold font-mono">
                    {authenticatedUser.role.toUpperCase()}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Routing to designated operational command module...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* BOTTOM EMERGENCY HELPLINES & FOOTER BAR (From screenshot) */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 w-full pt-4 pb-2 flex flex-col items-center gap-3">
        {/* Helpline Badges Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 max-w-4xl px-2">
          {/* 1. Emergency Help */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400">Emergency Help</div>
              <div className="text-sm font-bold text-white font-mono">112</div>
            </div>
          </div>

          {/* 2. Fire Services */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400">Fire Services</div>
              <div className="text-sm font-bold text-white font-mono">101</div>
            </div>
          </div>

          {/* 3. Ambulance */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <PlusSquare className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400">Ambulance</div>
              <div className="text-sm font-bold text-white font-mono">102</div>
            </div>
          </div>

          {/* 4. Police */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400">Police</div>
              <div className="text-sm font-bold text-white font-mono">100</div>
            </div>
          </div>

          {/* 5. Disaster Alert */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] text-slate-400">Disaster Alert</div>
              <div className="text-xs font-bold text-blue-400">Stay Informed</div>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-center text-[11px] text-slate-500 font-mono mt-1">
          © 2026 Disaster Management System. All rights reserved.
        </div>
      </div>
    </div>
  );
};
