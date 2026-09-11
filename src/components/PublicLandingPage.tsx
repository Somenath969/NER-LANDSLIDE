import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  ShieldCheck,
  GitFork,
  Users,
  Radio,
  Brain,
  Smartphone,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  User,
  UserPlus,
  LogIn,
  Activity,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  MapPin,
  Truck,
  Satellite,
  Zap,
  Flame,
  LifeBuoy,
  Target,
  Send,
  ExternalLink,
} from 'lucide-react';
import { ThemeMode, UserAccount, LocationData, DisasterAlert } from '../types';
import disasterBgImg from '../assets/images/himalayan_landslide_hero_bg_1788358349438.jpg';

interface PublicLandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToDashboard: () => void;
  currentUser: UserAccount | null;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onLogout: () => void;
  alerts?: DisasterAlert[];
  locations?: LocationData[];
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToDashboard,
  currentUser,
  theme,
  setTheme,
  onLogout,
  alerts = [],
  locations = [],
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Auto-track scroll position for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'how-it-works', 'features', 'states', 'contact'];
      const scrollPos = window.scrollY + 220;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSent(true);
      setTimeout(() => {
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setContactSent(false);
      }, 4000);
    }
  };

  const nerStatesList = [
    {
      name: 'Assam',
      districts: 'Dima Hasao, Karbi Anglong, Cachar',
      helpline: '1070 / 1079',
      agency: 'Assam State Disaster Management Authority (ASDMA)',
      riskLevel: 'HIGH ALERT',
      color: 'border-red-500/40 bg-red-950/40 text-red-300',
    },
    {
      name: 'Arunachal Pradesh',
      districts: 'Papum Pare, Tawang, West Kameng',
      helpline: '1070 / 0360-2212373',
      agency: 'Department of Disaster Management Arunachal',
      riskLevel: 'WATCH',
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
    {
      name: 'Manipur',
      districts: 'Noney (Tupul Rail Yard), Kangpokpi, Tamenglong',
      helpline: '1070 / 0385-2443441',
      agency: 'Manipur State Disaster Management Authority',
      riskLevel: 'HIGH ALERT',
      color: 'border-red-500/40 bg-red-950/40 text-red-300',
    },
    {
      name: 'Meghalaya',
      districts: 'East Khasi Hills (Sohra/Cherrapunji), West Jaintia Hills',
      helpline: '1070 / 0364-2502098',
      agency: 'Meghalaya State Disaster Management Authority',
      riskLevel: 'CRITICAL',
      color: 'border-rose-500/50 bg-rose-950/50 text-rose-300',
    },
    {
      name: 'Mizoram',
      districts: 'Aizawl, Lunglei, Champhai',
      helpline: '1070 / 0389-2342520',
      agency: 'Disaster Management & Rehabilitation Department',
      riskLevel: 'WATCH',
      color: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    },
    {
      name: 'Nagaland',
      districts: 'Kohima, Dimapur (NH-29 Pagla Pahar), Phek',
      helpline: '1070 / 0370-2291122',
      agency: 'Nagaland State Disaster Management Authority (NSDMA)',
      riskLevel: 'HIGH ALERT',
      color: 'border-red-500/40 bg-red-950/40 text-red-300',
    },
    {
      name: 'Sikkim',
      districts: 'Mangan (North Sikkim), Gangtok, Namchi',
      helpline: '1070 / 03592-202797',
      agency: 'Sikkim State Disaster Management Authority (SSDMA)',
      riskLevel: 'CRITICAL',
      color: 'border-rose-500/50 bg-rose-950/50 text-rose-300',
    },
    {
      name: 'Tripura',
      districts: 'West Tripura, North Tripura (Jampui Hills)',
      helpline: '1070 / 0381-2416045',
      agency: 'Tripura State Disaster Management Authority (TDMA)',
      riskLevel: 'NORMAL',
      color: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-['Plus_Jakarta_Sans'] selection:bg-rose-500 selection:text-white overflow-x-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* 1. TOP NAVBAR (Pixel Match with Image) */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-md border-b border-white/5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => scrollToSection('home')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-rose-700 p-2 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 leading-tight">
                <span className="font-extrabold text-base sm:text-lg text-white font-['Outfit'] tracking-tight">
                  Bhuraksha
                </span>
                <span className="font-extrabold text-base sm:text-lg text-rose-500 font-['Outfit'] tracking-tight">
                  NER
                </span>
              </div>
              <span className="block text-[11px] text-slate-400 font-normal">
                Disaster Management System
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'how-it-works', label: 'How It Works' },
              { id: 'features', label: 'Features' },
              { id: 'contact', label: 'Contact' },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => scrollToSection(nav.id)}
                className={`transition-colors text-sm ${
                  activeSection === nav.id
                    ? 'text-rose-500 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0a0f1d] border-b border-white/10 px-6 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left py-1 text-slate-200"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-1 text-slate-200"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-1 text-slate-200"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-1 text-slate-200"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left py-1 text-slate-200"
              >
                Contact
              </button>
            </div>
            <div className="pt-3 border-t border-white/10 flex gap-2">
              <button
                onClick={onNavigateToLogin}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs text-center"
              >
                Login
              </button>
              <button
                onClick={onNavigateToSignUp}
                className="flex-1 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs text-center"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. HERO SECTION (Pixel Match with Image) */}
      {/* ---------------------------------------------------- */}
      <section
        id="home"
        className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden py-12 lg:py-20"
      >
        {/* Background Landslide Terrain Image with Smooth Atmospheric Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={disasterBgImg}
            alt="North Eastern Himalayan Mountain Landslide Scenery"
            className="w-full h-full object-cover object-right"
          />
          {/* Deep Navy/Black Gradient on Left for High Contrast Text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/90 to-[#070b14]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Status Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs sm:text-[13px] text-slate-300 font-normal">
                  Monsoon Landslide Season • Stay Safe, Stay Informed
                </span>
              </div>

              {/* Main Headline (Multi-Color Gradient as in Reference) */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12] font-['Outfit']">
                  North Eastern Region
                </h1>
                <div className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] font-['Outfit']">
                  <span className="text-rose-500">Landslide Safety & </span>
                </div>
                <div className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12] font-['Outfit']">
                  <span className="text-amber-400">Early Warning Portal</span>
                </div>
              </div>

              {/* Subheading / Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Real-time hazard warnings, safe mountain transit advisories, and citizen emergency reporting for the 8 North Eastern states of India.
              </p>

              {/* CTA Buttons: Login & Sign Up (Exact visual match) */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={onNavigateToLogin}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-2 active:scale-95"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={onNavigateToSignUp}
                  className="px-6 py-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-white/20 text-slate-200 hover:text-white font-bold text-sm backdrop-blur-md transition-all flex items-center space-x-2 active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* Right Live Floating Status Card (Exact visual match) */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-[380px] rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-white/10 p-5 space-y-4 shadow-2xl">
                
                {/* Active High Alert Sub-card */}
                <div
                  onClick={onNavigateToLogin}
                  className="p-3.5 rounded-xl bg-red-950/50 hover:bg-red-950/70 border border-red-500/30 transition-colors flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                        Active High Alert
                      </div>
                      <div className="text-xs text-slate-300 truncate">
                        3 Districts • 1070 citizens informed
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                {/* Metric 1: 8 North Eastern States */}
                <div className="flex items-center space-x-3.5 px-1 py-1">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white leading-tight">
                      8
                    </div>
                    <div className="text-xs text-slate-400">
                      North Eastern States
                    </div>
                  </div>
                </div>

                {/* Metric 2: 24/7 Monitoring & Alerts */}
                <div className="flex items-center space-x-3.5 px-1 py-1">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white leading-tight">
                      24/7
                    </div>
                    <div className="text-xs text-slate-400">
                      Monitoring & Alerts
                    </div>
                  </div>
                </div>

                {/* Metric 3: 10K+ Lives Protected */}
                <div className="flex items-center space-x-3.5 px-1 py-1">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base font-extrabold text-white leading-tight">
                      10K+
                    </div>
                    <div className="text-xs text-slate-400">
                      Lives Protected
                    </div>
                  </div>
                </div>

                {/* Status Footer Note */}
                <div className="pt-2 border-t border-white/5 text-center text-[11px] text-slate-400 font-medium">
                  Live Data • AI Powered • Community Driven
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. FOUR CORE FEATURE STRIP BAR (Exact Pixel Match) */}
      {/* ---------------------------------------------------- */}
      <section className="relative z-20 -mt-6 sm:-mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#0d1424]/90 backdrop-blur-md border border-white/10 p-5 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            
            {/* Feature 1: Real-time Alerts */}
            <div className="flex items-center space-x-3.5 sm:px-2 pt-2 sm:pt-0">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Real-time Alerts
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instant notifications
                </p>
              </div>
            </div>

            {/* Feature 2: Risk Assessment */}
            <div className="flex items-center space-x-3.5 sm:px-4 pt-4 sm:pt-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Risk Assessment
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI-powered analysis
                </p>
              </div>
            </div>

            {/* Feature 3: Safe Routes */}
            <div className="flex items-center space-x-3.5 sm:px-4 pt-4 sm:pt-0">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Safe Routes
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified transit paths
                </p>
              </div>
            </div>

            {/* Feature 4: Community Reports */}
            <div className="flex items-center space-x-3.5 sm:px-4 pt-4 sm:pt-0">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Community Reports
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Crowdsourced updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. HOW IT WORKS (Exact Match with Image 4 Steps) */}
      {/* ---------------------------------------------------- */}
      <section id="how-it-works" className="py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            How It Works
          </h2>
          <p className="text-sm text-slate-400">
            Simple steps to stay safe and informed
          </p>
        </div>

        {/* 4 Cards with Connector Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Card 1: Monitor (Blue) */}
          <div className="rounded-2xl bg-[#0b1120] border border-blue-500/20 p-6 flex flex-col justify-between space-y-6 relative hover:border-blue-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-white">
                Monitor
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our system continuously monitors weather, soil moisture, and geological conditions 24/7
              </p>
            </div>
            <div className="pt-4 flex justify-start text-blue-400">
              <Radio className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>

          {/* Card 2: Analyze (Green) */}
          <div className="rounded-2xl bg-[#0b1120] border border-emerald-500/20 p-6 flex flex-col justify-between space-y-6 relative hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-white">
                Analyze
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI algorithms analyze data to assess landslide risks and generate early warnings
              </p>
            </div>
            <div className="pt-4 flex justify-start text-emerald-400">
              <Brain className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>

          {/* Card 3: Alert (Amber/Orange) */}
          <div className="rounded-2xl bg-[#0b1120] border border-amber-500/20 p-6 flex flex-col justify-between space-y-6 relative hover:border-amber-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-white">
                Alert
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant alerts sent to authorities and citizens in high-risk areas
              </p>
            </div>
            <div className="pt-4 flex justify-start text-amber-400">
              <Smartphone className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>

          {/* Card 4: Respond (Red/Rose) */}
          <div className="rounded-2xl bg-[#0b1120] border border-rose-500/20 p-6 flex flex-col justify-between space-y-6 relative hover:border-rose-500/40 transition-colors">
            <div className="space-y-3">
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </div>
              <h3 className="text-base font-bold text-white">
                Respond
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Communities stay informed, safe routes recommended, lives protected
              </p>
            </div>
            <div className="pt-4 flex justify-start text-rose-500">
              <Users className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge Bar (Exact Match with Image) */}
        <div className="mt-12 flex items-center justify-center">
          <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-slate-400 font-medium px-4 py-2 rounded-full bg-slate-900/40 border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Trusted by Disaster Management Authorities • Powered by Advanced Technology • Built for Your Safety
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. ABOUT SECTION */}
      {/* ---------------------------------------------------- */}
      <section id="about" className="py-20 bg-[#090e1c] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">
                About The Platform
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-['Outfit']">
                Himalayan Landslide Mitigation for All 8 North Eastern States
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong>Bhuraksha NER</strong> unifies state-of-the-art satellite observations, IMD Doppler weather radars, on-ground IoT piezometer arrays, and crowdsourced citizen incident reporting into a single high-availability operational platform.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Full 8 Northeast States Integration</h4>
                    <p className="text-xs text-slate-400">
                      Covers Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Offline Resilience for Remote Mountain Ghats</h4>
                    <p className="text-xs text-slate-400">
                      Field officers operate in remote mountain valleys without network coverage using IndexedDB offline queues and edge-sync.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-400 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Open Government Data (OGD) Synchronized</h4>
                    <p className="text-xs text-slate-400">
                      Real-time rainfall telemetry direct from India Meteorological Department (IMD) automatic weather stations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToLogin}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition-all"
                >
                  <span>Sign In as Disaster Authority</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Platform Stats Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#0c1322] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-rose-400" />
                  <span>Regional Telemetry Summary</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                    <div className="text-2xl font-mono font-black text-rose-400">120+</div>
                    <div className="text-xs font-bold text-white">Monitored Slopes</div>
                    <p className="text-[11px] text-slate-400">Critical highway bottlenecks & settlements</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                    <div className="text-2xl font-mono font-black text-blue-400">45+</div>
                    <div className="text-xs font-bold text-white">IoT Sensor Nodes</div>
                    <p className="text-[11px] text-slate-400">Pore pressure, tiltmeters, rain gauges</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                    <div className="text-2xl font-mono font-black text-emerald-400">6</div>
                    <div className="text-xs font-bold text-white">Regional Languages</div>
                    <p className="text-[11px] text-slate-400">English, Hindi, Assamese, Bengali, Mizo, Manipuri</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                    <div className="text-2xl font-mono font-black text-amber-400">100%</div>
                    <div className="text-xs font-bold text-white">Public Availability</div>
                    <p className="text-[11px] text-slate-400">Free open citizen reporting & warnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. FEATURES GRID */}
      {/* ---------------------------------------------------- */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Comprehensive Disaster Management Ecosystem
          </h2>
          <p className="text-sm text-slate-400">
            Engineered specifically for Himalayan landslide early warning and response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">GIS Risk Map & Spatial Heatmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Leaflet satellite maps with multi-layer overlays showing slope gradients, geology, fault lines, and live sensor telemetry.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Road Lifelines & Habitation Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connectivity graph analysis tracking blocked corridors, isolated villages, detour distances, and PWD heavy equipment dispatch.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Sub-Surface IoT Geotechnical Grid</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time monitoring of piezometers, inclinometers, and rain gauges with automatic threshold alerts when pore pressure spikes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Satellite className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">IMD Doppler Radar & OGD Met Feed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live meteorological feeds from Cherrapunji, Mohanbari, and Gangtok Doppler weather radars with cloudburst risk estimation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Digital Twin & Rainfall Surge Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive physics engine enabling disaster commissioners to simulate cloudburst scenarios and preview slope failure cascades.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1120] border border-white/10 hover:border-white/20 shadow-lg space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">PostgreSQL RBAC & Audit Provenance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-role access control supporting Citizens, Field Officers, District Magistrates, and Super Admins with cryptographic action audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. 8 NER STATES EMERGENCY HELPLINES GRID */}
      {/* ---------------------------------------------------- */}
      <section id="states" className="py-20 bg-[#090e1c] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 font-mono">
              State Operations Centres
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              8 North Eastern States Helpline Grid
            </h2>
            <p className="text-sm text-slate-400">
              Direct emergency helpline integration with State Emergency Operations Centres (SEOCs).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nerStatesList.map((st) => (
              <div
                key={st.name}
                className="p-5 rounded-2xl bg-[#0c1322] border border-white/10 space-y-2.5 shadow-md hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-white">{st.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                    {st.riskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  <strong>Key Sectors:</strong> {st.districts}
                </p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">SEOC Helpline</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{st.helpline}</span>
                  </div>
                  <a
                    href="tel:1070"
                    className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                    title={`Call Helpline for ${st.name}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. CONTACT & EMERGENCY DISPATCH FORM */}
      {/* ---------------------------------------------------- */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400 font-mono">
              Emergency Contact
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Get in Touch with Disaster Response Coordination
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              For active landslide emergencies, please call the national disaster toll-free hotline <strong>1070</strong> immediately. For technical inquiries, agency integration, or data partnerships, reach our coordination team.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-[#0c1322] border border-white/10 flex items-center space-x-3.5">
                <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">National Emergency Control</div>
                  <div className="text-sm font-bold text-white font-mono">1070 / 1079 (Toll Free 24/7)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0c1322] border border-white/10 flex items-center space-x-3.5">
                <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">SEOC Operations Email</div>
                  <div className="text-sm font-bold text-white font-mono">seoc-ner@ndma.gov.in</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#0c1322] border border-white/10 p-6 sm:p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">
                Send a Dispatch or Feedback
              </h3>

              {contactSent ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-200">Message Dispatched Successfully</h4>
                  <p className="text-xs text-slate-300">
                    Thank you. Our nodal disaster operations officer has received your message.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g., Tsering Dorjee"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="officer@disaster.gov.in"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Message / Coordination Request
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Specify your jurisdiction, slope inquiry, or integration query..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070b14] border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                  >
                    Submit Coordination Dispatch
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 9. FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="border-t border-white/5 bg-[#05080f] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">Bhuraksha NER</span>
            <span className="text-slate-500">|</span>
            <span>Disaster Management Early Warning Portal</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Compliant with NDMA, IMD, GSI, and NESAC Standards • 24/7 Operations
          </div>
        </div>
      </footer>
    </div>
  );
};
