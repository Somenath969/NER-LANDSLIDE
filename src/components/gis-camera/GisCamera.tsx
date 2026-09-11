import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Navigation,
  Image as ImageIcon,
  Map as MapIcon,
  RotateCw,
  AlertTriangle,
  Sliders,
  Sparkles,
  Layers,
  ChevronLeft,
  Compass,
  Check,
} from 'lucide-react';
import { GisEvidenceMetadata, GisStampConfig, HazardType, SeverityLevel } from '../../types';
import { CameraPreview } from './CameraPreview';
import { GpsStatus } from './GpsStatus';
import { LocationPermission } from './LocationPermission';
import { PhotoEvidencePreview } from './PhotoEvidencePreview';
import { MapPreview } from './MapPreview';
import {
  DEFAULT_STAMP_CONFIG,
  generateIncidentId,
  formatISTDateTime,
  reverseGeocodeLocation,
  renderGisStampOnCanvas,
  playCameraShutterSound,
  getCompassDirection,
  formatCoordinates,
  NER_KNOWN_LOCATIONS,
} from './gisUtils';

interface GisCameraProps {
  onClose: () => void;
  onCaptureEvidence: (
    stampedPhotoUrl: string,
    originalPhotoUrl: string,
    metadata: GisEvidenceMetadata
  ) => void;
  initialHazardType?: HazardType;
  initialSeverity?: SeverityLevel;
  initialState?: string;
  initialDistrict?: string;
  initialLocationName?: string;
  initialRoadName?: string;
}

export const GisCamera: React.FC<GisCameraProps> = ({
  onClose,
  onCaptureEvidence,
  initialHazardType = 'Landslide',
  initialSeverity = 'High',
  initialState = 'Assam',
  initialDistrict = 'Dima Hasao',
  initialLocationName = 'Haflong - Jatinga Sector KM 142',
  initialRoadName = 'NH-27 (Silchar – Haflong – Lumding Corridor)',
}) => {
  // Video and Stream Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardware State
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showGrid, setShowGrid] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isLiveStreamReady, setIsLiveStreamReady] = useState(false);

  // GPS & Telemetry State
  const [isGpsAcquiring, setIsGpsAcquiring] = useState(true);
  const [isGpsLocked, setIsGpsLocked] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [altitudeMeters, setAltitudeMeters] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | undefined>(undefined);

  // Live Real-Time Clock
  const [liveTimestamp, setLiveTimestamp] = useState<string>(
    formatISTDateTime(new Date()).fullStr
  );

  // Survey Metadata
  const [resolvedAddress, setResolvedAddress] = useState(initialLocationName);
  const [resolvedDistrict, setResolvedDistrict] = useState(initialDistrict);
  const [resolvedState, setResolvedState] = useState(initialState);
  const [resolvedRoad, setResolvedRoad] = useState(initialRoadName);
  const [weatherTelemetry, setWeatherTelemetry] = useState('23°C • Rain 18mm/h • 91% RH');

  // Preview & Stamp State
  const [stampConfig, setStampConfig] = useState<GisStampConfig>(DEFAULT_STAMP_CONFIG);
  const [showLiveMiniMap, setShowLiveMiniMap] = useState(true);
  const [capturedOriginalUrl, setCapturedOriginalUrl] = useState<string | null>(null);
  const [capturedStampedUrl, setCapturedStampedUrl] = useState<string | null>(null);
  const [capturedMetadata, setCapturedMetadata] = useState<GisEvidenceMetadata | null>(null);

  // Live Clock Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTimestamp(formatISTDateTime(new Date()).fullStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initialize GPS Tracking using browser Geolocation API
  const startGpsTracking = () => {
    setIsGpsAcquiring(true);
    setLocationPermissionDenied(false);

    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      setIsGpsAcquiring(false);
      // Fallback coordinates to regional station
      setLatitude(25.1764);
      setLongitude(93.0238);
      setAccuracyMeters(8.0);
      setAltitudeMeters(680);
      setIsGpsLocked(true);
      return () => {};
    }

    const handleSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy || 5;
      const alt = pos.coords.altitude ? Math.round(pos.coords.altitude) : null;
      const heading =
        pos.coords.heading !== null && !isNaN(pos.coords.heading)
          ? pos.coords.heading
          : undefined;

      setLatitude(lat);
      setLongitude(lng);
      setAccuracyMeters(acc);
      if (alt !== null) setAltitudeMeters(alt);
      if (heading !== undefined) setDeviceHeading(heading);

      setIsGpsLocked(true);
      setIsGpsAcquiring(false);
      setLocationPermissionDenied(false);

      // Reverse geocode real coordinates
      try {
        const geo = await reverseGeocodeLocation(lat, lng);
        if (geo.address) setResolvedAddress(geo.address);
        if (geo.district) setResolvedDistrict(geo.district);
        if (geo.state) setResolvedState(geo.state);
        if (geo.road) setResolvedRoad(geo.road);
        if (geo.altitudeMeters && alt === null) setAltitudeMeters(geo.altitudeMeters);
        if (geo.weather) setWeatherTelemetry(geo.weather);
      } catch (e) {
        console.warn('Reverse geocoding error:', e);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err.message);
      setIsGpsAcquiring(false);
      if (err.code === err.PERMISSION_DENIED) {
        setLocationPermissionDenied(true);
        // Provide regional fallback coordinates so field surveys aren't blocked
        setLatitude(25.1764);
        setLongitude(93.0238);
        setAccuracyMeters(15.0);
        setAltitudeMeters(680);
      } else {
        setLatitude(25.1764);
        setLongitude(93.0238);
        setAccuracyMeters(10.0);
        setAltitudeMeters(680);
        setIsGpsLocked(true);
      }
    };

    // Quick one-time position request
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Continuous location watcher
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  };

  // 2. Initialize Camera Video Stream
  const initCameraStream = async () => {
    // Stop any existing stream tracks first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveStreamReady(false);
    setCameraPermissionDenied(false);
    setCameraUnavailable(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('getUserMedia is not supported on this browser/environment.');
      setCameraUnavailable(true);
      return;
    }

    try {
      // Prefer rear environment camera on mobile
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode === 'environment' ? { ideal: 'environment' } : 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err: any) {
        // Fallback to basic video constraint if ideal resolution / facingMode fails
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsLiveStreamReady(true);
            })
            .catch((e) => {
              console.warn('Video play error:', e);
              setIsLiveStreamReady(true);
            });
        };
      }

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
      if (capabilities && capabilities.torch) {
        setHasFlash(true);
      } else {
        setHasFlash(false);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.name === 'SecurityError'
      ) {
        setCameraPermissionDenied(true);
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError' ||
        err.name === 'NotReadableError'
      ) {
        setCameraUnavailable(true);
      } else {
        setCameraPermissionDenied(true);
      }
      setIsLiveStreamReady(false);
    }
  };

  // 3. Orientation / Heading listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && !isNaN(e.alpha)) {
        setDeviceHeading(Math.round(e.alpha));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Mount effect: Start GPS and camera stream
  useEffect(() => {
    const stopGps = startGpsTracking();
    initCameraStream();

    return () => {
      if (stopGps) stopGps();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // Flash / Torch toggle
  const toggleFlash = async () => {
    if (!streamRef.current) {
      setFlashOn(!flashOn);
      return;
    }
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const newFlash = !flashOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: newFlash }],
      });
      setFlashOn(newFlash);
    } catch (e) {
      setFlashOn(!flashOn);
    }
  };

  // Switch Front/Rear Camera
  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Safe Close Handler
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    onClose();
  };

  // Capture Photo from Live Stream
  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    playCameraShutterSound();

    let rawDataUrl: string = '';

    if (videoRef.current && isLiveStreamReady) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If front camera, mirror horizontal for natural selfie view if needed
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        rawDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      }
    }

    if (!rawDataUrl) {
      setIsCapturing(false);
      return;
    }

    // Stop camera stream tracks to conserve battery & release sensor
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Prepare GIS evidence metadata using actual captured values
    const incidentId = generateIncidentId();
    const timeInfo = formatISTDateTime(new Date());
    const finalLat = latitude !== null ? latitude : 25.1764;
    const finalLng = longitude !== null ? longitude : 93.0238;
    const finalAcc = accuracyMeters !== null ? accuracyMeters : 5.0;
    const finalAlt = altitudeMeters !== null ? altitudeMeters : 680;

    const metadata: GisEvidenceMetadata = {
      incidentId,
      latitude: finalLat,
      longitude: finalLng,
      accuracyMeters: finalAcc,
      altitudeMeters: finalAlt,
      timestamp: timeInfo.fullStr,
      timezone: 'IST (UTC+05:30)',
      address: resolvedAddress || `${resolvedDistrict}, ${resolvedState}`,
      state: resolvedState,
      district: resolvedDistrict,
      road: resolvedRoad,
      hazardType: initialHazardType,
      severity: initialSeverity,
      photoUrl: rawDataUrl,
      originalPhotoUrl: rawDataUrl,
      stampedPhotoUrl: '',
      heading: deviceHeading,
      compassDirection: getCompassDirection(deviceHeading),
      weather: weatherTelemetry,
      isGpsLocked: isGpsLocked || latitude !== null,
      capturedAtISO: new Date().toISOString(),
    };

    // Render Canvas GIS Stamp
    try {
      const stamped = await renderGisStampOnCanvas(rawDataUrl, metadata, stampConfig);
      metadata.stampedPhotoUrl = stamped;

      setCapturedOriginalUrl(rawDataUrl);
      setCapturedStampedUrl(stamped);
      setCapturedMetadata(metadata);
    } catch (err) {
      console.error('Error rendering canvas GIS stamp:', err);
      // Fallback
      metadata.stampedPhotoUrl = rawDataUrl;
      setCapturedOriginalUrl(rawDataUrl);
      setCapturedStampedUrl(rawDataUrl);
      setCapturedMetadata(metadata);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle Manual File Upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;

      // Stop camera stream tracks if active
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const incidentId = generateIncidentId();
      const timeInfo = formatISTDateTime(new Date());
      const finalLat = latitude !== null ? latitude : 25.1764;
      const finalLng = longitude !== null ? longitude : 93.0238;
      const finalAcc = accuracyMeters !== null ? accuracyMeters : 10.0;
      const finalAlt = altitudeMeters !== null ? altitudeMeters : 680;

      const metadata: GisEvidenceMetadata = {
        incidentId,
        latitude: finalLat,
        longitude: finalLng,
        accuracyMeters: finalAcc,
        altitudeMeters: finalAlt,
        timestamp: timeInfo.fullStr,
        timezone: 'IST (UTC+05:30)',
        address: resolvedAddress || `${resolvedDistrict}, ${resolvedState}`,
        state: resolvedState,
        district: resolvedDistrict,
        road: resolvedRoad,
        hazardType: initialHazardType,
        severity: initialSeverity,
        photoUrl: result,
        originalPhotoUrl: result,
        stampedPhotoUrl: '',
        heading: deviceHeading,
        compassDirection: getCompassDirection(deviceHeading),
        weather: weatherTelemetry,
        isGpsLocked: isGpsLocked || latitude !== null,
        capturedAtISO: new Date().toISOString(),
      };

      try {
        const stamped = await renderGisStampOnCanvas(result, metadata, stampConfig);
        metadata.stampedPhotoUrl = stamped;

        setCapturedOriginalUrl(result);
        setCapturedStampedUrl(stamped);
        setCapturedMetadata(metadata);
      } catch (err) {
        metadata.stampedPhotoUrl = result;
        setCapturedOriginalUrl(result);
        setCapturedStampedUrl(result);
        setCapturedMetadata(metadata);
      }
    };
    reader.readAsDataURL(file);
  };

  // Use NER regional preset location if GPS is unavailable
  const handleUsePresetLocation = () => {
    const preset = NER_KNOWN_LOCATIONS[0];
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setAccuracyMeters(4.5);
    setAltitudeMeters(preset.elevationM);
    setResolvedAddress(preset.name);
    setResolvedDistrict(preset.district);
    setResolvedState(preset.state);
    setResolvedRoad(preset.road);
    setWeatherTelemetry(preset.weather);
    setIsGpsLocked(true);
    setLocationPermissionDenied(false);
  };

  return (
    <div className="fixed inset-0 z-[760] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-md overflow-hidden select-none">
      <div className="relative w-full h-full sm:max-w-2xl sm:max-h-[92vh] bg-slate-900 border-0 sm:border border-slate-700/80 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-850/95 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClose}
              type="button"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Close GIS Camera"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-100 flex items-center space-x-1.5">
                <span>GIS Camera / Location Evidence</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Live Georeferenced Field-Survey Capture
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <GpsStatus
              isAcquiring={isGpsAcquiring}
              isLocked={isGpsLocked}
              latitude={latitude || 25.1764}
              longitude={longitude || 93.0238}
              accuracyMeters={accuracyMeters || 5.0}
              compact={true}
            />

            <button
              onClick={handleClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Live Camera Viewport */}
        <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-2 sm:p-4">
          <div className="relative w-full h-full max-w-full flex items-center justify-center">
            <CameraPreview
              videoRef={videoRef}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              hasFlash={hasFlash}
              flashOn={flashOn}
              onToggleFlash={toggleFlash}
              onSwitchCamera={handleSwitchCamera}
              isCapturing={isCapturing}
              isLiveStreamReady={isLiveStreamReady}
              cameraPermissionDenied={cameraPermissionDenied}
              cameraUnavailable={cameraUnavailable}
              onRequestCameraPermission={initCameraStream}
              onUploadFile={handleFileUpload}
              latitude={latitude}
              longitude={longitude}
              accuracyMeters={accuracyMeters}
              altitudeMeters={altitudeMeters}
              timestamp={liveTimestamp}
              heading={deviceHeading}
              resolvedAddress={resolvedAddress}
              resolvedRoad={resolvedRoad}
            />

            {/* Real-time floating mini-map preview in corner */}
            {showLiveMiniMap && (isGpsLocked || latitude !== null) && (
              <div className="absolute bottom-4 left-4 z-20 w-24 h-24 sm:w-28 sm:h-28 shadow-2xl rounded-xl border border-slate-700/80 overflow-hidden group">
                <MapPreview
                  latitude={latitude || 25.1764}
                  longitude={longitude || 93.0238}
                  roadName={resolvedRoad}
                  locationName={resolvedAddress}
                  style={stampConfig.mapStyle}
                  interactive={false}
                  className="w-full h-full"
                />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setShowLiveMiniMap(false)}
                    className="p-0.5 bg-slate-900/90 rounded text-slate-400 hover:text-white"
                    title="Hide Mini Map"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Capture & Controls Bar */}
        <div className="px-4 sm:px-6 py-4 bg-slate-850 border-t border-slate-800 flex flex-col space-y-3 z-30 shrink-0">
          {/* Detailed GPS Status & Location Banner */}
          <div className="hidden sm:block">
            <GpsStatus
              isAcquiring={isGpsAcquiring}
              isLocked={isGpsLocked}
              latitude={latitude || 25.1764}
              longitude={longitude || 93.0238}
              accuracyMeters={accuracyMeters || 5.0}
              altitudeMeters={altitudeMeters || 680}
              onRefresh={startGpsTracking}
            />
          </div>

          {/* Primary Action Controls */}
          <div className="flex items-center justify-between">
            {/* Gallery Upload Option */}
            <label className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-2xl border border-slate-700 shadow-md cursor-pointer flex items-center space-x-2 transition-all active:scale-95">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline text-xs font-semibold">Upload Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Main Shutter Capture Button */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing || (!isLiveStreamReady && !cameraUnavailable && !cameraPermissionDenied)}
                className={`relative group p-1.5 rounded-full bg-slate-800 border-2 shadow-2xl transition-all active:scale-90 ${
                  isLiveStreamReady
                    ? 'border-amber-400/80 hover:border-amber-300 ring-4 ring-amber-500/20'
                    : 'border-slate-600 opacity-60 cursor-not-allowed'
                }`}
                title="Capture GIS Photo Evidence"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500 group-hover:bg-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/30 transition-transform">
                  <Camera className="w-7 h-7 text-slate-950" />
                </div>
              </button>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mt-1 font-mono">
                Capture GIS Evidence
              </span>
            </div>

            {/* Mini Map Toggle */}
            <button
              type="button"
              onClick={() => setShowLiveMiniMap(!showLiveMiniMap)}
              className={`p-3 rounded-2xl border shadow-md flex items-center space-x-2 transition-all active:scale-95 ${
                showLiveMiniMap
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              title="Toggle Mini Map"
            >
              <MapIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-semibold">
                {showLiveMiniMap ? 'Map On' : 'Map Off'}
              </span>
            </button>
          </div>
        </div>

        {/* Verification & Preview Screen when Photo is Captured */}
        {capturedOriginalUrl && capturedStampedUrl && capturedMetadata && (
          <PhotoEvidencePreview
            originalPhotoUrl={capturedOriginalUrl}
            initialStampedPhotoUrl={capturedStampedUrl}
            metadata={capturedMetadata}
            stampConfig={stampConfig}
            onUpdateStampConfig={setStampConfig}
            onRetake={() => {
              setCapturedOriginalUrl(null);
              setCapturedStampedUrl(null);
              setCapturedMetadata(null);
              initCameraStream();
            }}
            onUsePhoto={(stampedUrl, originalUrl, metadata) => {
              onCaptureEvidence(stampedUrl, originalUrl, metadata);
              handleClose();
            }}
            onClose={() => {
              setCapturedOriginalUrl(null);
              setCapturedStampedUrl(null);
              setCapturedMetadata(null);
              handleClose();
            }}
          />
        )}
      </div>
    </div>
  );
};
