import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Search,
  MapPin,
  Flame,
  CheckCircle2,
  HelpCircle,
  Camera,
  Navigation,
  Info,
  ExternalLink,
} from 'lucide-react';
import { DisasterAlert, LocationData, LanguageCode } from '../types';
import { translations } from '../locales/translations';
import { getLocalizedAlert, getLocalizedState, getLocalizedRiskLevel } from '../locales/contentTranslations';

interface PublicPortalProps {
  alerts: DisasterAlert[];
  locations: LocationData[];
  onOpenReportModal: () => void;
  onSelectLocation: (loc: LocationData) => void;
  currentLang: LanguageCode;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  alerts,
  locations,
  onOpenReportModal,
  onSelectLocation,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const [searchDistrict, setSearchDistrict] = useState('');

  // Active Critical/Orange Alerts
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE');

  // Filtered district lookup
  const searchResults = searchDistrict
    ? locations.filter(
        (l) =>
          l.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          l.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          l.state.toLowerCase().includes(searchDistrict.toLowerCase())
      )
    : [];

  const stateHelplines = [
    { state: 'Assam', number: '1070 / 1079', agency: 'Assam State Disaster Management Authority' },
    { state: 'Sikkim', number: '1070 / 03592-202797', agency: 'Sikkim State Disaster Management' },
    { state: 'Meghalaya', number: '1070 / 0364-2502098', agency: 'Meghalaya State DM Authority' },
    { state: 'Nagaland', number: '1070 / 0370-2291122', agency: 'Nagaland State DM Authority' },
    { state: 'Manipur', number: '1070 / 0385-2443441', agency: 'Manipur Disaster Management' },
    { state: 'Mizoram', number: '1070 / 0389-2342520', agency: 'Disaster Management & Rehab Mizoram' },
    { state: 'Arunachal Pradesh', number: '1070 / 0360-2212373', agency: 'Department of DM Arunachal' },
    { state: 'Tripura', number: '1070 / 0381-2416045', agency: 'Tripura State Disaster Management' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Warning & Action Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{t.monsoonAlertBanner}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.citizenRoleActiveBadge}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight font-['Outfit']">
            {t.publicPortalHeroTitle}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {t.publicPortalHeroSubtitle}
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-2 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.reportHazardBtn}</span>
            </button>

            <a
              href="#district-lookup"
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>{t.checkDistrictRiskBtn}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Broadcast Advisories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span>{t.activeDisasterWarningsTitle}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">{activeAlerts.length} {t.officialBulletins}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeAlerts.map((alert) => {
            const locAlert = getLocalizedAlert(alert, currentLang);
            return (
              <div
                key={alert.id}
                className="bg-slate-900 border border-red-500/40 p-4 rounded-2xl shadow-lg space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                    {alert.alertCode}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {t.issued}: {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 leading-snug">{locAlert.title}</h3>

                <p className="text-xs text-slate-300 leading-relaxed">{locAlert.message}</p>

                <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                  <span>
                    📍 <strong>{locAlert.locationName || alert.locationName}</strong> ({locAlert.state})
                  </span>
                  <span className="text-amber-400">
                    👥 ~{alert.affectedPopulation.toLocaleString()} {t.citizensAffected}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* District Safety Lookup Tool */}
      <div id="district-lookup" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>{t.districtSafetyLookupTitle}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.districtSafetyLookupDesc}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            placeholder={t.searchDistrictPlaceholder}
            className="w-full bg-slate-800 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {searchResults.map((loc) => (
              <div
                key={loc.id}
                onClick={() => onSelectLocation(loc)}
                className="bg-slate-850 border border-slate-700/80 hover:border-amber-400/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-1.5 shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                    {loc.name}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      loc.riskLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : loc.riskLevel === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {getLocalizedRiskLevel(loc.riskLevel, currentLang)} ({loc.riskScore}/100)
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {loc.district}, {getLocalizedState(loc.state, currentLang)} • {t.rainfallLabel || '24h Rain'}: {loc.rainfall24h}mm
                </p>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1">{loc.aiExplanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Landslide Action Guidelines */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <span>{t.whatToDoTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Before */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px]">
              {t.beforeHeavyRainsTitle}
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>{t.beforeTip1}</li>
              <li>{t.beforeTip2}</li>
              <li>{t.beforeTip3}</li>
              <li>{t.beforeTip4}</li>
            </ul>
          </div>

          {/* During */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-red-300 uppercase tracking-wider text-[11px]">
              {t.duringSlideTitle}
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>{t.duringTip1}</li>
              <li>{t.duringTip2}</li>
              <li>{t.duringTip3}</li>
              <li>{t.duringTip4}</li>
            </ul>
          </div>

          {/* After */}
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px]">
              {t.afterSlideTitle}
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>{t.afterTip1}</li>
              <li>{t.afterTip2}</li>
              <li>{t.afterTip3}</li>
              <li>{t.afterTip4}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* State Emergency Helplines (8 NER States) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <span>{t.seocTitle}</span>
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">{t.tollFreeActive}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stateHelplines.map((item, idx) => (
            <div key={idx} className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-slate-100">{getLocalizedState(item.state, currentLang)}</span>
              <p className="text-xs font-black text-emerald-400 font-mono">{item.number}</p>
              <p className="text-[10px] text-slate-400 truncate">{item.agency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
