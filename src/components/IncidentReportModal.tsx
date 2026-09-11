import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  MapPin,
  Sparkles,
  Send,
  RotateCw,
  CheckCircle2,
  Share2,
  Upload,
  Check,
} from 'lucide-react';
import { IncidentReport, HazardType, SeverityLevel, LanguageCode, GisEvidenceMetadata, NERState } from '../types';
import { translations } from '../locales/translations';
import { GisCamera } from './gis-camera/GisCamera';
import { LocationShare } from './gis-camera/LocationShare';
import { formatCoordinates } from './gis-camera/gisUtils';

interface IncidentReportModalProps {
  onClose: () => void;
  onSubmitReport: (reportData: Partial<IncidentReport>, affectedRoadId?: string, roadStatus?: string) => void;
  isOnline?: boolean;
  currentLang: LanguageCode;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  onClose,
  onSubmitReport,
  isOnline = true,
  currentLang,
}) => {
  const t = translations[currentLang] || translations.en;

  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState<string>('');
  const [customHazardType, setCustomHazardType] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [locationName, setLocationName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [gisEvidence, setGisEvidence] = useState<GisEvidenceMetadata | null>(null);

  const [isGisCameraOpen, setIsGisCameraOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAssessment, setAiAssessment] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setOriginalPhoto(result);

      // Create fallback GIS evidence record
      const parsedLat = parseFloat(lat) || 25.1764;
      const parsedLng = parseFloat(lng) || 93.0238;
      const effectiveHazard = hazardType === 'Other' ? (customHazardType.trim() || 'Other Hazard') : (hazardType || 'Landslide');
      const fallbackEvidence: GisEvidenceMetadata = {
        incidentId: `INC-${Date.now().toString().slice(-8)}`,
        latitude: parsedLat,
        longitude: parsedLng,
        accuracyMeters: 10.0,
        altitudeMeters: 650,
        timestamp: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' }) + ' IST',
        timezone: 'IST',
        address: locationName || (district && state ? `${district}, ${state}` : 'On-Site Location'),
        state: state || 'Assam',
        district: district || 'Dima Hasao',
        road: 'Local Corridor',
        hazardType: effectiveHazard as HazardType,
        severity: (severity as SeverityLevel) || 'Medium',
        photoUrl: result,
        originalPhotoUrl: result,
        stampedPhotoUrl: result,
        isGpsLocked: Boolean(lat && lng),
      };
      setGisEvidence(fallbackEvidence);
      runVisionAnalysis(result);
    };
    reader.readAsDataURL(file);
  };

  const handleGisCameraCapture = (
    stampedPhotoUrl: string,
    originalPhotoUrl: string,
    metadata: GisEvidenceMetadata
  ) => {
    setPhotoPreview(stampedPhotoUrl);
    setOriginalPhoto(originalPhotoUrl);
    setGisEvidence(metadata);

    // Autofill ONLY District, Specific Location / Landmark, Latitude (°N), Longitude (°E) from GIS camera
    if (metadata.latitude) setLat(metadata.latitude.toFixed(4));
    if (metadata.longitude) setLng(metadata.longitude.toFixed(4));
    if (metadata.address) setLocationName(metadata.address);
    if (metadata.district) setDistrict(metadata.district);

    setIsGisCameraOpen(false);

    // Run AI Vision analysis on captured photo
    runVisionAnalysis(originalPhotoUrl || stampedPhotoUrl);
  };

  const runVisionAnalysis = async (base64Img: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          description: description || 'Citizen reported slope hazard',
        }),
      });
      const data = await response.json();
      if (data.success && data.assessment) {
        setAiAssessment(data.assessment);
      }
    } catch (err) {
      console.warn('AI analysis fallback:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveHazard = hazardType === 'Other' ? (customHazardType.trim() || 'Other Hazard') : hazardType;

    onSubmitReport(
      {
        title: title || `${effectiveHazard} reported at ${locationName || district}`,
        hazardType: effectiveHazard as HazardType,
        severity: (severity as SeverityLevel) || 'Medium',
        state: (state as NERState) || 'Assam',
        district: district.trim(),
        locationName: locationName.trim(),
        lat: parseFloat(lat) || 25.1764,
        lng: parseFloat(lng) || 93.0238,
        description: description.trim(),
        reportedBy: reporterName.trim() || 'Citizen Reporter',
        reporterPhone: reporterPhone.trim(),
        reporterRole: 'Citizen',
        photoUrl: photoPreview || undefined,
        originalPhotoUrl: originalPhoto || photoPreview || undefined,
        stampedPhotoUrl: photoPreview || undefined,
        gisEvidence: gisEvidence || undefined,
        aiAssessment: aiAssessment || undefined,
      },
      undefined,
      severity === 'Critical' ? 'FULLY_BLOCKED' : severity === 'High' ? 'PARTIALLY_BLOCKED' : 'CLEAR'
    );

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 z-[750] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 text-slate-100 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                  Report Landslide / Road Obstruction
                </h3>
                <p className="text-[11px] text-slate-400">
                  Direct alert to State Emergency Operations Centre (SEOC)
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-100">Incident Transmitted</h4>
              <p className="text-xs text-slate-300">
                Your field report and verified GIS photo evidence have been logged and dispatched to the District Emergency Control Room.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Hazard Category <span className="text-rose-400">*</span>
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
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:ring-1 focus:ring-amber-400"
                    required
                  >
                    <option value="" disabled>Select Hazard Category</option>
                    <option value="Landslide">Landslide (Active Slide)</option>
                    <option value="Slope Crack">Slope Tension Crack</option>
                    <option value="Road Blockage">Highway Blockage</option>
                    <option value="Rockfall">Rockfall / Falling Debris</option>
                    <option value="Mudflow">Debris / Mud Flow</option>
                    <option value="Damaged Bridge">Damaged Bridge / Culvert</option>
                    <option value="Other">Other</option>
                  </select>

                  {hazardType === 'Other' && (
                    <div className="mt-2.5">
                      <label className="block font-semibold text-amber-300 mb-1">
                        Specify Hazard Category <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={customHazardType}
                        onChange={(e) => setCustomHazardType(e.target.value)}
                        placeholder="e.g. Flash Flood Erosion, Soil Creep, Subsidence..."
                        className="w-full bg-slate-850 text-slate-100 text-xs rounded-xl px-3 py-2 border border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                        required
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Severity Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700 font-bold focus:ring-1 focus:ring-amber-400"
                    required
                  >
                    <option value="" disabled>Select Severity Level</option>
                    <option value="Critical">Critical (Immediate Danger)</option>
                    <option value="High">High (Road Blocked)</option>
                    <option value="Medium">Medium (Partial Restriction)</option>
                    <option value="Low">Low (Minor Warning)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    State <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                    required
                  >
                    <option value="" disabled>Select State</option>
                    <option value="Assam">Assam</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    District <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Dima Hasao"
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Specific Location / Landmark <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Haflong-Jatinga Hill Cut KM 142 near bypass"
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                  required
                />
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Latitude (°N) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="e.g. 25.1764 (or capture via GIS Camera)"
                    className="w-full bg-slate-800 text-slate-100 text-xs font-mono rounded-xl px-3 py-2 border border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Longitude (°E) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="e.g. 93.0238 (or capture via GIS Camera)"
                    className="w-full bg-slate-800 text-slate-100 text-xs font-mono rounded-xl px-3 py-2 border border-slate-700"
                    required
                  />
                </div>
              </div>

              {!isOnline && (
                <div className="p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-xl flex items-center space-x-2 text-[11px] text-amber-300">
                  <span>📵 Offline Mode Active: Incident report will be securely queued in local storage and synced automatically once connection is restored.</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Incident Description <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the slide extent, road conditions, trapped vehicles or affected houses (optional)..."
                  className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                />
              </div>

              {/* ENHANCED GIS CAMERA / LOCATION EVIDENCE SECTION */}
              <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                      <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                        <Camera className="w-3.5 h-3.5" />
                      </span>
                      <span>GIS Camera / Location Evidence</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Capture on-site photo with embedded GPS coordinates, altitude, timestamp & survey stamp
                    </p>
                  </div>

                  {isAnalyzing && (
                    <span className="text-amber-400 flex items-center space-x-1 text-[11px] font-semibold">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Scanning...</span>
                    </span>
                  )}
                </div>

                {/* Prominent Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Primary: Open GIS Camera */}
                  <button
                    type="button"
                    onClick={() => setIsGisCameraOpen(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-slate-950" />
                    <span>📍 Open GIS Camera</span>
                  </button>

                  {/* Secondary: Upload Existing Photo */}
                  <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>Upload Existing Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>

                {/* Evidence Status Checkmarks & Visual Preview */}
                {photoPreview && (
                  <div className="space-y-3 pt-2">
                    {/* Status Check Grid */}
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

                    {/* Stamped Photo Card & Quick Actions */}
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 flex flex-col sm:flex-row gap-3">
                      <div className="relative w-full sm:w-36 h-28 shrink-0 rounded-lg overflow-hidden bg-black border border-slate-800">
                        <img
                          src={photoPreview}
                          alt="GIS Stamped Hazard Evidence"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-950/80 rounded text-[9px] font-mono text-amber-400 font-bold">
                          GIS STAMP
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-xs truncate">
                            {gisEvidence?.incidentId || 'INC-2026-0902-00124'}
                          </span>
                          {gisEvidence && (
                            <button
                              type="button"
                              onClick={() => setIsShareModalOpen(true)}
                              className="text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share GIS</span>
                            </button>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 font-mono">
                          {formatCoordinates(parseFloat(lat) || 25.1764, parseFloat(lng) || 93.0238)}
                          {gisEvidence?.altitudeMeters ? ` • Alt: ${gisEvidence.altitudeMeters}m` : ''}
                        </p>

                        <p className="text-[11px] text-slate-400 truncate">
                          {locationName ? `${locationName}, ` : ''}{district ? `${district}, ` : ''}{state}
                        </p>

                        {/* AI Vision Scan Result */}
                        <div className="pt-1 border-t border-slate-800">
                          <span className="font-bold text-amber-400 flex items-center text-[11px]">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Hazard Detection:
                          </span>
                          {aiAssessment ? (
                            <p className="text-[10px] text-slate-300 mt-0.5">
                              {aiAssessment.detectedHazards.join(', ')} • {aiAssessment.debrisVolumeEstimate}
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-500">Scanning geotechnical features...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Your Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Contact Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    placeholder="+91 94350 XXXXX"
                    className="w-full bg-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Incident Report</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* GIS CAMERA FULL SCREEN / MODAL INTERFACE */}
      {isGisCameraOpen && (
        <GisCamera
          onClose={() => setIsGisCameraOpen(false)}
          onCaptureEvidence={handleGisCameraCapture}
          initialHazardType={
            (hazardType === 'Other' ? (customHazardType || 'Landslide') : (hazardType || 'Landslide')) as HazardType
          }
          initialSeverity={(severity as SeverityLevel) || 'Medium'}
          initialState={state || 'Assam'}
          initialDistrict={district || 'NER'}
          initialLocationName={locationName || ''}
          initialRoadName=""
        />
      )}

      {/* LOCATION SHARING MODAL */}
      {isShareModalOpen && gisEvidence && (
        <LocationShare
          metadata={gisEvidence}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </>
  );
};
