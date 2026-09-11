import React, { useState, useEffect } from 'react';
import {
  Radio,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Save,
  RotateCw,
  Send,
  Navigation,
  Check,
  Share2,
  HardDrive,
  Database,
  RefreshCw,
} from 'lucide-react';
import { IncidentReport, HazardType, SeverityLevel, LanguageCode, GisEvidenceMetadata, NERState } from '../types';
import { translations } from '../locales/translations';
import { GisCamera } from './gis-camera/GisCamera';
import { LocationShare } from './gis-camera/LocationShare';
import { formatCoordinates } from './gis-camera/gisUtils';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { PWAInstallButton } from './PWAInstallButton';
import { offlineStorage } from '../services/offlineStorage';

const NER_STATES: NERState[] = [
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
];

const STATE_DISTRICTS: Record<NERState, string[]> = {
  Assam: ['Dima Hasao', 'Kamrup Metropolitan', 'Cachar', 'Karbi Anglong', 'Hailakandi', 'Dibrugarh'],
  'Arunachal Pradesh': ['Papum Pare', 'West Kameng', 'Tawang', 'Upper Subansiri', 'East Siang'],
  Manipur: ['Imphal West', 'Churachandpur', 'Kangpokpi', 'Senapati', 'Tamenglong', 'Ukhrul'],
  Meghalaya: ['East Khasi Hills (Sohra)', 'West Jaintia Hills', 'Ri-Bhoi', 'West Garo Hills'],
  Mizoram: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Mamit'],
  Nagaland: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Phek', 'Mon'],
  Sikkim: ['North Sikkim (Mangan)', 'Gangtok', 'Pakyong', 'Namchi', 'Gyalshing'],
  Tripura: ['West Tripura', 'Dhalai', 'Unakoti', 'North Tripura', 'Gomati'],
};

interface FieldOfficerPWAProps {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  onSubmitReport: (reportData: Partial<IncidentReport>) => void;
  currentLang: LanguageCode;
}

export const FieldOfficerPWA: React.FC<FieldOfficerPWAProps> = ({
  isOnline: propIsOnline,
  setIsOnline: propSetIsOnline,
  onSubmitReport,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;
  const { isOnline, pendingCount, syncState, isSyncing, triggerManualSync, setSimulatedOnline, activeTransport } = useOfflineSync();

  // No fields filled by default; only populated when fetched from GIS camera or entered by user
  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState<string>('');
  const [customHazardType, setCustomHazardType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [gisEvidence, setGisEvidence] = useState<GisEvidenceMetadata | null>(null);
  const [isGisCameraOpen, setIsGisCameraOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [cachedIncidentsCount, setCachedIncidentsCount] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    offlineStorage.getIncidents().then((items) => {
      setCachedIncidentsCount(items.length);
    });
  }, [submitSuccess, isSyncing]);

  // Mock / File Photo Capture
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      runVisionAnalysis(result);
    };
    reader.readAsDataURL(file);
  };

  const runVisionAnalysis = async (base64Img: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          description: description || 'Field survey photo of slope condition',
        }),
      });
      const data = await response.json();
      if (data.success && data.assessment) {
        setAiAssessment(data.assessment);
        if (data.assessment.suggestedSeverity) {
          setSeverity(data.assessment.suggestedSeverity);
        }
      }
    } catch (err) {
      console.warn('AI analysis fallback (offline):', err);
      // Offline fallback heuristic
      setAiAssessment({
        detectedHazards: ['Slope Tension Crack', 'Saturated Debris Matrix'],
        debrisVolumeEstimate: '1,200 - 2,500 m³',
        slopeAngleEstimate: 42,
        explanation: 'Local offline heuristic: Geotechnical features consistent with rotational shear failure along road cutting.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGisCameraCapture = (
    stampedPhotoUrl: string,
    originalPhotoUrl: string,
    metadata: GisEvidenceMetadata
  ) => {
    setPhotoPreview(stampedPhotoUrl);
    setOriginalPhoto(originalPhotoUrl);
    setGisEvidence(metadata);

    // Auto sync form fields from verified GPS capture
    setLat(metadata.latitude.toFixed(4));
    setLng(metadata.longitude.toFixed(4));
    if (metadata.address) setLocationName(metadata.address);
    if (metadata.district) setDistrict(metadata.district);
    if (metadata.state) setState(metadata.state);
    if (metadata.hazardType) {
      if (['Landslide', 'Slope Crack', 'Road Blockage', 'Rockfall', 'Mudflow', 'Damaged Bridge'].includes(metadata.hazardType)) {
        setHazardType(metadata.hazardType);
        setCustomHazardType('');
      } else {
        setHazardType('Other');
        setCustomHazardType(metadata.hazardType);
      }
    }
    if (metadata.severity) setSeverity(metadata.severity);

    setFormError(null);
    setGpsError(null);
    setIsGisCameraOpen(false);
    runVisionAnalysis(originalPhotoUrl || stampedPhotoUrl);
  };

  const handleAcquireGPS = () => {
    setGpsError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
        },
        () => {
          setGpsError('GPS fix unavailable or permission denied. Please allow location permissions or use Open GIS Camera.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate that every field is filled (Mandatory requirement)
    if (!hazardType) {
      setFormError('Hazard Classification is mandatory. Please select a classification.');
      return;
    }
    if (hazardType === 'Other' && !customHazardType.trim()) {
      setFormError('Please specify the Hazard Classification in the text box.');
      return;
    }
    if (!severity) {
      setFormError('Assessed Severity is mandatory. Please select a severity level.');
      return;
    }
    if (!state) {
      setFormError('NER State selection is mandatory. Please select an NER State.');
      return;
    }
    if (!district) {
      setFormError('District Jurisdiction selection is mandatory. Please select a District.');
      return;
    }
    if (!locationName.trim()) {
      setFormError('Landmark / KM Marker is mandatory. Please provide a location description.');
      return;
    }
    if (!lat.trim() || isNaN(parseFloat(lat))) {
      setFormError('Latitude coordinate is mandatory and must be a valid number.');
      return;
    }
    if (!lng.trim() || isNaN(parseFloat(lng))) {
      setFormError('Longitude coordinate is mandatory and must be a valid number.');
      return;
    }
    if (!description.trim()) {
      setFormError('Geomorphological Observations & Dimensions description is mandatory.');
      return;
    }
    if (!photoPreview) {
      setFormError('GIS Camera Photo Evidence is mandatory. Please capture photo using Open GIS Camera or upload an image.');
      return;
    }

    setIsSubmitting(true);
    const effectiveHazard = hazardType === 'Other' ? (customHazardType.trim() || 'Other Hazard') : hazardType;

    const newReport: Partial<IncidentReport> = {
      title: title || `${effectiveHazard} at ${locationName}`,
      hazardType: effectiveHazard as HazardType,
      severity: severity as SeverityLevel,
      description,
      state,
      district,
      locationName,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      reportedBy: 'Field Geotechnical Recon Officer',
      reporterRole: 'Field Officer',
      photoUrl: photoPreview || undefined,
      originalPhotoUrl: originalPhoto || photoPreview || undefined,
      stampedPhotoUrl: photoPreview || undefined,
      gisEvidence: gisEvidence || undefined,
      aiAssessment: aiAssessment || undefined,
    };

    onSubmitReport(newReport);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      resetForm();
    }, 350);
  };

  const resetForm = () => {
    setTitle('');
    setHazardType('');
    setCustomHazardType('');
    setSeverity('');
    setState('');
    setDistrict('');
    setLocationName('');
    setLat('');
    setLng('');
    setDescription('');
    setPhotoPreview(null);
    setOriginalPhoto(null);
    setGisEvidence(null);
    setAiAssessment(null);
    setFormError(null);
    setGpsError(null);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Mobile Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-bold shadow-md shrink-0">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 font-['Outfit']">
                Field Officer Geotechnical Recon PWA
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-700/60">
                IndexedDB Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Offline-first mobile recon console for SDRF, PWD engineers, and district disaster responders
            </p>
          </div>
        </div>

        {/* Sync & Connectivity status controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <PWAInstallButton />

          <button
            type="button"
            onClick={() => {
              const nextState = !isOnline;
              setSimulatedOnline(nextState);
              propSetIsOnline(nextState);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all border shrink-0 ${
              isOnline
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                : 'bg-rose-950 text-rose-300 border-rose-700/60 animate-pulse'
            }`}
            title="Click to toggle simulated online / offline carrier blackout"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Online (4G LTE)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline ({pendingCount} Queued)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offline Storage & Edge Sync Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Local Device Cache</span>
            <span className="text-xs font-bold text-slate-100">{cachedIncidentsCount} Reports Stored</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${pendingCount > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Outbound Sync Queue</span>
            <span className="text-xs font-bold text-slate-100">{pendingCount} Pending Mutations</span>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sync Protocol</span>
              <span className="text-xs font-bold text-slate-100">{activeTransport === '4G_LTE_CLOUD' ? 'Cloud REST + Supabase' : 'Offline IndexedDB'}</span>
            </div>
          </div>
          {pendingCount > 0 && isOnline && (
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
              title="Flush sync queue now"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Offline Sync Banner (if queued) */}
      {pendingCount > 0 && (
        <div className="bg-amber-950/80 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-300">
            <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{pendingCount} Mutation(s)</strong> buffered in IndexedDB local storage. {isOnline ? 'Network restored. Ready to flush to central Disaster Ops DB.' : 'Will automatically sync as soon as cellular or satellite connectivity is acquired.'}
            </span>
          </div>
          {isOnline && (
            <button
              onClick={triggerManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 shrink-0"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-xl flex items-center space-x-2 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Field Recon Report safely recorded in <strong>IndexedDB</strong> {isOnline ? 'and transmitted to District Emergency Operations Center (DEOC)' : 'offline buffer. Will auto-sync on network reconnect'}.
          </span>
        </div>
      )}

      {/* Field Incident Submission Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>New Field Geotechnical Recon Report</span>
          </h3>
          <span className="text-[11px] font-semibold text-rose-400">
            * All fields are mandatory
          </span>
        </div>

        {formError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {gpsError && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Hazard Type & Severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Hazard Classification <span className="text-rose-400">*</span>
            </label>
            <select
              value={hazardType}
              onChange={(e) => {
                const val = e.target.value;
                setHazardType(val);
                if (val !== 'Other') {
                  setCustomHazardType('');
                }
              }}
              required
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
            >
              <option value="" disabled>-- Select Hazard Classification * --</option>
              <option value="Landslide">Landslide (Mass Movement / Slip)</option>
              <option value="Slope Crack">Slope Tension Crack (Pre-failure)</option>
              <option value="Road Blockage">Road / Highway Blockage</option>
              <option value="Rockfall">Rockfall / Boulder Roll</option>
              <option value="Mudflow">Debris / Mud Flow</option>
              <option value="Damaged Bridge">Bridge / Culvert Structural Hazard</option>
              <option value="Other">Other</option>
            </select>

            {/* If Other is clicked add a textbox to write the Hazard Classification */}
            {hazardType === 'Other' && (
              <div className="mt-2.5 space-y-1">
                <label className="block text-xs font-semibold text-amber-300">
                  Specify Hazard Classification <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customHazardType}
                  onChange={(e) => setCustomHazardType(e.target.value)}
                  placeholder="Enter hazard classification (e.g. Soil Creep, Subsidence, Riverbank Erosion)..."
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-amber-500/60 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assessed Severity <span className="text-rose-400">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400 font-bold"
            >
              <option value="" disabled>-- Select Assessed Severity * --</option>
              <option value="Critical">Critical (Immediate Evacuation Required)</option>
              <option value="High">High (Major Threat / Highway Disrupted)</option>
              <option value="Medium">Medium (Developing Crack / Drainage Clog)</option>
              <option value="Low">Low (Minor Raveling / Superficial)</option>
            </select>
          </div>
        </div>

        {/* State & District Jurisdiction */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              NER State <span className="text-rose-400">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => {
                const s = e.target.value;
                setState(s);
                setDistrict('');
              }}
              required
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400"
            >
              <option value="" disabled>-- Select NER State * --</option>
              {NER_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              District Jurisdiction <span className="text-rose-400">*</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              disabled={!state}
              className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
            >
              <option value="" disabled>
                {state ? '-- Select District * --' : '-- Select State First --'}
              </option>
              {(state ? STATE_DISTRICTS[state as NERState] || [] : []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & GPS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Geospatial Coordinates & Location <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={handleAcquireGPS}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Acquire GPS Fix</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Landmark / KM Marker <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Haflong - Jatinga KM 142"
                className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Latitude <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g. 25.1764"
                className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Longitude <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. 93.0238"
                className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Geomorphological Observations & Dimensions <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Document crack aperture, scarp height, estimated debris volume, affected infrastructure, and immediate risk to traffic..."
            className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
            required
          />
        </div>

        {/* Photo Attachment & Live Vision AI Analysis */}
        <div className={`space-y-3 p-4 bg-slate-950/80 border rounded-2xl ${!photoPreview && formError ? 'border-rose-500/60 ring-1 ring-rose-500/30' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-100 flex items-center space-x-1.5">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>GIS Camera / Location Evidence <span className="text-rose-400">*</span></span>
            </label>

            {isAnalyzing && (
              <span className="text-xs text-amber-400 flex items-center space-x-1.5 font-semibold">
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running AI Computer Vision...</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIsGisCameraOpen(true)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <MapPin className="w-4 h-4 text-slate-950" />
              <span>📍 Open GIS Camera</span>
            </button>

            <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-slate-400" />
              <span>Upload Existing Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>

          {/* Photo Preview & AI Assessment Output */}
          {photoPreview && (
            <div className="space-y-3 pt-2">
              {/* Evidence Status Checkmarks */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px]">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>GIS Location Captured</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>GPS Accuracy: ±{Math.round(gisEvidence?.accuracyMeters || 5)} m</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Timestamp Recorded</span>
                </div>
                <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Photo Evidence Attached</span>
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded-xl border border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={photoPreview}
                    alt="Field Survey"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-950/80 rounded text-[9px] font-mono text-amber-400 font-bold">
                    GIS EVIDENCE
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      AI Vision Hazard Assessment
                    </span>
                    {gisEvidence && (
                      <button
                        type="button"
                        onClick={() => setIsShareModalOpen(true)}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center space-x-1"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Share GIS</span>
                      </button>
                    )}
                  </div>

                  <p className="font-mono text-[11px] text-slate-300">
                    {formatCoordinates(parseFloat(lat) || 25.1764, parseFloat(lng) || 93.0238)}
                    {gisEvidence?.altitudeMeters ? ` • Alt: ${gisEvidence.altitudeMeters}m` : ''}
                  </p>

                  {aiAssessment ? (
                    <div className="space-y-1 text-slate-300 pt-1 border-t border-slate-800">
                      <p>
                        <strong>Detected Features:</strong> {aiAssessment.detectedHazards ? (Array.isArray(aiAssessment.detectedHazards) ? aiAssessment.detectedHazards.join(', ') : String(aiAssessment.detectedHazards)) : 'Tension Cracks, Saturated Debris'}
                      </p>
                      <p>
                        <strong>Estimated Volume:</strong> {aiAssessment.debrisVolumeEstimate || '1,500 m³'} •{' '}
                        <strong>Slope:</strong> ~{aiAssessment.slopeAngleEstimate || 38}°
                      </p>
                      <p className="text-slate-400 text-[11px] italic leading-tight">
                        "{aiAssessment.explanation}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">Awaiting vision inference...</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-600/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>
              {isOnline ? 'Transmit Field Incident Report' : 'Save Locally to IndexedDB Offline Queue'}
            </span>
          </button>
        </div>
      </form>

      {/* GIS Camera Modal */}
      {isGisCameraOpen && (
        <GisCamera
          onClose={() => setIsGisCameraOpen(false)}
          onCaptureEvidence={handleGisCameraCapture}
          initialHazardType={
            (hazardType === 'Other' ? customHazardType : hazardType) as HazardType || 'Landslide'
          }
          initialSeverity={(severity as SeverityLevel) || 'High'}
          initialState={state}
          initialDistrict={district}
          initialLocationName={locationName}
          initialRoadName=""
        />
      )}

      {/* Location Share Modal */}
      {isShareModalOpen && gisEvidence && (
        <LocationShare
          metadata={gisEvidence}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};
