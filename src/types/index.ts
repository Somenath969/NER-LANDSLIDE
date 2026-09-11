export type NERState =
  | 'Assam'
  | 'Arunachal Pradesh'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Sikkim'
  | 'Tripura';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type UserRole =
  | 'super_admin'
  | 'state_authority'
  | 'district_authority'
  | 'dm_officer'
  | 'field_officer'
  | 'police_pwd'
  | 'citizen';

export type LanguageCode = 'en' | 'hi' | 'as' | 'bn' | 'lus' | 'mni';

export type ThemeMode = 'dark' | 'light';

export interface MultiModalFusionScores {
  rainfallRisk: number; // e.g. 82%
  soilMoistureRisk: number; // e.g. 74%
  slopeRisk: number; // e.g. 91%
  groundMovementRisk: number; // e.g. 68%
  historicalRisk: number; // e.g. 77%
  satelliteRisk: number; // e.g. 63%
  citizenReportRisk: number; // e.g. 80%
  fusedRiskScore: number; // e.g. 86%
  fusedProbability: number; // 0.86
  fusedLevel: RiskLevel;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  dataQualityPercent: number; // e.g. 91%
  weights: {
    rainfall: number;
    soil: number;
    terrain: number;
    iot: number;
    historical: number;
    satellite: number;
    citizen: number;
  };
}

export interface RiskTrajectoryPoint {
  time: string; // e.g. "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"
  timestamp: string;
  riskScore: number;
  riskLevel: RiskLevel;
  rainfallHourlyMm: number;
  soilMoisturePercent: number;
  groundMovementMm: number;
  statusNote: string;
}

export interface DigitalTwinProfile {
  id: string;
  locationId: string;
  slopeHeightM: number;
  slopeAngleDeg: number;
  waterTableDepthM: number;
  shearStrengthKPa: number;
  poreWaterPressureKPa: number;
  factorOfSafety: number; // e.g. 1.45 (Stable) -> 0.88 (Failure Imminent)
  stabilityStatus: 'STABLE' | 'MARGINALLY_STABLE' | 'FAILURE_IMMINENT';
  cohesionKPa: number;
  frictionAngleDeg: number;
  estimatedDebrisVolumeM3: number;
  atRiskVillageCount: number;
  atRiskPopulation: number;
  roadIntersectLengthM: number;
  activeSensorsCount: number;
  recommendedIntervention: string;
  simulationStep: number;
}

export interface ConnectivityGraphNode {
  id: string;
  name: string;
  type: 'VILLAGE' | 'TOWN' | 'HOSPITAL' | 'EOC_HQ' | 'HELIPAD' | 'RELIEF_CAMP';
  state: NERState;
  population: number;
  lat: number;
  lng: number;
  isIsolated?: boolean;
}

export interface ConnectivityGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  roadName: string;
  distanceKm: number;
  status: 'OPEN' | 'VULNERABLE' | 'BLOCKED';
  isLifeline: boolean;
  clearanceETAHours?: number;
  alternateDetourDistanceKm?: number;
}

export interface ExplainableAIShap {
  featureName: string;
  featureValue: string;
  shapContributionPercent: number; // e.g. 31%
  category: 'Meteorological' | 'Hydrological' | 'Geomorphological' | 'InSAR IoT' | 'Historical' | 'Anthropogenic';
  impactDirection: 'INCREASES_RISK' | 'DECREASES_RISK';
  humanDescription: string;
}

export interface ClosedLoopFeedbackRecord {
  id: string;
  locationId: string;
  locationName: string;
  alertCode: string;
  predictedRiskScore: number;
  predictedLevel: RiskLevel;
  issuedAt: string;
  verifiedAt: string;
  verifiedBy: string;
  officerRole: string;
  actualEventOccurred: boolean; // True = Landslide occurred, False = False alarm
  observedDebrisVolume?: string;
  geotechnicalValidationNotes: string;
  recalibrationFeedbackWeight: number;
  status: 'AUDITED' | 'PENDING_RETRAINING' | 'MODEL_UPDATED';
}

export interface EdgeDeviceTelemetryNode {
  deviceId: string;
  deviceName: string;
  locationName: string;
  hardware: 'Raspberry Pi 4B (Edge AI)' | 'ESP32 LoRa Gateway' | 'NVIDIA Jetson Nano' | 'STM32 Micro-Edge';
  cpuUtilizationPercent: number;
  batteryLevelPercent: number;
  solarInputWatts: number;
  networkUplink: 'FIBRE_INTERNET' | '4G_LTE' | 'LORA_MESH' | 'OFFLINE_BUFFER';
  localAnomalyDetected: boolean;
  localInferenceLatencyMs: number;
  offlineBufferQueueCount: number;
  lastLocalSync: string;
}

export interface LocationData {
  id: string;
  name: string;
  district: string;
  state: NERState;
  lat: number;
  lng: number;
  elevationM: number;
  slopeDeg: number;
  aspect: string;
  curvature: 'Concave' | 'Convex' | 'Planar';
  geology: string;
  soilMoisturePercent: number;
  rainfall1h: number;
  rainfall6h: number;
  rainfall24h: number;
  rainfall72h: number;
  rainfall7d: number;
  rainfallForecast24h: number;
  groundMovementMmDay: number;
  historicalLandslidesCount: number;
  distanceToRoadM: number;
  vegetationNDVI: number;
  populationAtRisk: number;
  vulnerableVillages: string[];
  nearbyInfrastructure: string[];
  riskScore: number; // 0 to 100
  riskProbability: number; // 0 to 1.0
  riskLevel: RiskLevel;
  majorFactors: {
    factor: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    weightPercent: number;
    description: string;
  }[];
  aiExplanation: string;
  recommendedAction: string;
  lastUpdated: string;
  // Advanced Architecture Attributes
  fusionScores?: MultiModalFusionScores;
  trajectory?: RiskTrajectoryPoint[];
  digitalTwin?: DigitalTwinProfile;
  shapAttributions?: ExplainableAIShap[];
  riskConfidence?: {
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    dataQualityPercent: number;
    sensorAvailable: boolean;
    sensorOutageNote?: string;
  };
  multiLayerScores?: {
    hazardScore: number;
    exposureScore: number;
    vulnerabilityScore: number;
    connectivityScore: number;
    compositePriority: number; // 0-100
  };
}

export interface SensorData {
  id: string;
  sensorCode: string;
  name: string;
  sensorType: 'Rain Gauge' | 'Soil Moisture Probe' | 'Tiltmeter' | 'Piezometer' | 'InSAR Ground Radar';
  locationName: string;
  district: string;
  state: NERState;
  lat: number;
  lng: number;
  status: 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  batteryPercent: number;
  signalStrength: number; // 0-100
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  telemetryHistory: {
    time: string;
    value: number;
    threshold: number;
  }[];
  installationDate: string;
}

export type HazardType =
  | 'Landslide'
  | 'Road Blockage'
  | 'Slope Crack'
  | 'Rockfall'
  | 'Soil Movement'
  | 'Mudflow'
  | 'Damaged Bridge'
  | 'Infrastructure Damage'
  | 'Other';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type AlertChannel =
  | 'Web Portal'
  | 'Mobile Push'
  | 'SMS Alert'
  | 'CAP India Broadcast'
  | 'Police Radio'
  | 'CAP India Protocol'
  | 'SMS Broadcast'
  | 'Mobile App';

export interface GisEvidenceMetadata {
  incidentId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  altitudeMeters?: number;
  timestamp: string;
  timezone: string;
  address: string;
  state: string;
  district: string;
  road?: string;
  hazardType: string;
  severity: string;
  description?: string;
  photoUrl: string;
  originalPhotoUrl?: string;
  stampedPhotoUrl: string;
  heading?: number;
  compassDirection?: string;
  weather?: string;
  isGpsLocked: boolean;
  capturedAtISO?: string;
}

export interface GisStampConfig {
  showLocation: boolean;
  showCoordinates: boolean;
  showDateTime: boolean;
  showAltitude: boolean;
  showGpsAccuracy: boolean;
  showMiniMap: boolean;
  showRoad: boolean;
  showHazardType: boolean;
  showSeverity: boolean;
  showIncidentId: boolean;
  showWeather: boolean;
  showCompass: boolean;
  mapPosition: 'left' | 'right' | 'none';
  mapStyle: 'standard' | 'satellite' | 'terrain';
  fontSize: 'small' | 'medium' | 'large';
  cardOpacity: number; // 0 to 100
  theme: 'dark' | 'light';
  textAlign: 'left' | 'center';
}

export interface IncidentReport {
  id: string;
  title: string;
  hazardType: HazardType;
  description: string;
  state: NERState;
  district: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: SeverityLevel;
  status: 'Pending Verification' | 'Verified' | 'In Response' | 'Resolved';
  reportedBy: string;
  reporterPhone?: string;
  reporterRole: string;
  photoUrl?: string;
  originalPhotoUrl?: string;
  stampedPhotoUrl?: string;
  gisEvidence?: GisEvidenceMetadata;
  videoUrl?: string;
  aiAssessment?: {
    detectedHazards: string[];
    confidenceScore: number;
    suggestedSeverity: SeverityLevel;
    slopeAngleEstimate: number;
    debrisVolumeEstimate: string;
    explanation: string;
    humanVerificationRequired: boolean;
  };
  reportedAt: string;
  isOfflineQueued?: boolean;
}

export interface RoadStatus {
  id: string;
  roadNumber: string;
  name: string;
  state: NERState;
  district: string;
  startPoint: string;
  endPoint: string;
  status: 'OPEN' | 'PARTIALLY_BLOCKED' | 'FULLY_BLOCKED' | 'HIGH_RISK_WARNING';
  importance: 'National Highway Lifeline' | 'State Highway' | 'Strategic Border Road' | 'District Arterial';
  blockageLocation?: {
    lat: number;
    lng: number;
    landmark: string;
  };
  clearanceETA?: string;
  alternateRouteName: string;
  alternateRouteDescription: string;
  pathCoords: [number, number][];
  lastUpdated: string;
}

export interface DisasterAlert {
  id: string;
  alertCode: string;
  title: string;
  message: string;
  riskLevel: RiskLevel;
  state: NERState;
  district: string;
  locationName: string;
  issuedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'EXPIRED' | 'CANCELLED';
  channels: AlertChannel[];
  affectedPopulation: number;
  triggeredBy: string;
}

export interface EmergencyPriorityItem {
  id: string;
  priorityRank: 1 | 2 | 3 | 4;
  priorityTitle: string; // e.g. "Priority 1 — Immediate Evacuation & SAR"
  badgeColor: string;
  locationName: string;
  district: string;
  state: NERState;
  riskScore: number;
  populationAffected: number;
  vulnerableVillagesCount: number;
  criticalInfrastructure: string[];
  hospitalAccessible: boolean;
  roadConnectivityState: string;
  incidentSeverity: string;
  reasoning: string;
  suggestedAction: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  state: NERState;
  district: string;
  preferredLanguage: LanguageCode;
  agency: string;
  accountStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  isVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
}

export interface MLModelStats {
  modelName: string;
  modelVersion: string;
  algorithm: string;
  trainingDate: string;
  datasetSize: string;
  evaluationMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    rocAuc: number;
  };
  featuresRanking: {
    feature: string;
    importance: number;
    category: 'Meteorological' | 'Geomorphological' | 'Hydrological' | 'Anthropogenic';
  }[];
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  lastCalibrated: string;
  trainingLoss: { epoch: number; trainLoss: number; valLoss: number }[];
}

export interface AutomatedEarlyWarningConfig {
  id: string;
  autoDispatchEnabled: boolean; // Autonomous mode vs manual approval
  sentinelStatus: 'ACTIVE_ARMED' | 'STANDBY' | 'MAINTENANCE';
  rainfallThreshold24hMm: number; // e.g. 95 mm
  soilMoistureThresholdPercent: number; // e.g. 80%
  slopeTiltRateMmDay: number; // e.g. 2.0 mm/day
  aiHazardScoreThreshold: number; // e.g. 75
  throttleIntervalMinutes: number; // Cooldown between duplicate alerts to same sector
  channels: {
    smsCellBroadcast: boolean;
    appPushNotification: boolean;
    automatedVoiceIVR: boolean;
    capProtocol: boolean;
  };
  targetLanguages: LanguageCode[];
  totalRegisteredSubscribers: number;
  telecomGatewayStatus: 'OPERATIONAL' | 'DEGRADED';
  averageLatencySeconds: number;
  lastSentinelScanTime: string;
}

export interface EarlyWarningSubscriber {
  id: string;
  name: string;
  phone: string;
  role: 'Village Headman' | 'VDMC Volunteer' | 'School Headmaster' | 'Emergency Medical Staff' | 'Transport Driver' | 'Citizen';
  district: string;
  state: NERState;
  sectorName: string;
  preferredLanguage: LanguageCode;
  receiveSMS: boolean;
  receivePush: boolean;
  receiveIVR: boolean;
  verified: boolean;
  registeredAt: string;
}

export interface EarlyWarningBroadcastLog {
  id: string;
  broadcastCode: string;
  timestamp: string;
  sectorName: string;
  district: string;
  state: NERState;
  triggerSource: 'Rainfall Surge' | 'IoT Soil Moisture' | 'Inclinometer Tilt' | 'AI Multi-Modal Fusion' | 'Manual Test';
  triggerReading: string; // e.g. "Rainfall: 118mm (Threshold > 95mm)"
  riskSeverity: RiskLevel;
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  channelsDispatched: string[];
  latencySeconds: number;
  messagePreviewEn: string;
  messagePreviewLocal: string;
  status: 'DELIVERED' | 'DISPATCHING' | 'QUEUED' | 'FAILED';
}

