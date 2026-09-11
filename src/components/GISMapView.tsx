import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Eye,
  AlertTriangle,
  Radio,
  Truck,
  Maximize2,
  Filter,
  Search,
  Crosshair,
  Flame,
  Info,
  Navigation,
  LocateFixed,
  Compass,
  CheckCircle2,
  X,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { LocationData, SensorData, RoadStatus, IncidentReport, LanguageCode, ThemeMode } from '../types';
import { translations } from '../locales/translations';
import { getLocalizedState, getLocalizedRiskLevel } from '../locales/contentTranslations';

interface GISMapViewProps {
  locations: LocationData[];
  sensors: SensorData[];
  roads: RoadStatus[];
  incidents: IncidentReport[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedRisk: string;
  setSelectedRisk: (risk: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentLang: LanguageCode;
  theme?: ThemeMode;
  onSimulateSurge?: (locId: string, amount: number) => void;
}

interface UserLocationInfo {
  lat: number;
  lng: number;
  accuracy: number;
  label: string;
  nearestLocation: LocationData | null;
  distanceToNearestKm: number;
  nearestRoad: RoadStatus | null;
  distanceToRoadKm: number;
  safetyStatus: 'SAFE' | 'ELEVATED' | 'HIGH_RISK';
}

// Calculate Haversine Distance in Kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export const GISMapView: React.FC<GISMapViewProps> = ({
  locations,
  sensors,
  roads,
  incidents,
  selectedLocation,
  onSelectLocation,
  selectedState,
  setSelectedState,
  selectedRisk,
  setSelectedRisk,
  searchQuery,
  setSearchQuery,
  currentLang,
  theme = 'dark',
}) => {
  const t = translations[currentLang] || translations.en;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerGroupRef = useRef<L.LayerGroup | null>(null);

  // Layer Visibility Toggles - By default, only AI Landslide Risk Scores is selected
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showSensors, setShowSensors] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [baseLayerType, setBaseLayerType] = useState<'dark' | 'satellite' | 'terrain' | 'maptiler_topo' | 'osm'>(
    theme === 'light' ? 'osm' : 'dark'
  );

  // Sync baseLayerType when theme switches if not satellite/terrain
  useEffect(() => {
    if (baseLayerType === 'dark' || baseLayerType === 'osm') {
      setBaseLayerType(theme === 'light' ? 'osm' : 'dark');
    }
  }, [theme]);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocationInfo | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [showLocateHUD, setShowLocateHUD] = useState(false);

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    const matchesState = selectedState === 'all' || loc.state.toLowerCase() === selectedState.toLowerCase();
    const matchesRisk = selectedRisk === 'all' || loc.riskLevel.toLowerCase() === selectedRisk.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesRisk && matchesSearch;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center coordinates of North East India (Guwahati / Shillong / Central NER)
      const map = L.map(mapContainerRef.current, {
        center: [26.2, 92.9],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Base tile layers
      const darkLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18 }
      );
      darkLayer.addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
      userMarkerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const maptilerKey = import.meta.env.VITE_MAPTILER_API_KEY || 'PD1myr0t87Z92zHcr5h1';

    let newTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let maxZoom = 19;

    if (baseLayerType === 'dark') {
      newTileUrl = `https://api.maptiler.com/maps/backdrop-dark/{z}/{x}/{y}.png?key=${maptilerKey}`;
    } else if (baseLayerType === 'satellite') {
      newTileUrl = `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerKey}`;
    } else if (baseLayerType === 'terrain') {
      newTileUrl = `https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
    } else if (baseLayerType === 'maptiler_topo') {
      newTileUrl = `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
    } else {
      newTileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
    }

    const tileLayer = L.tileLayer(newTileUrl, {
      maxZoom,
      attribution: '© MapTiler © OpenStreetMap contributors',
    });

    // Gracefully fallback if network tile fails
    tileLayer.on('tileerror', () => {
      // MapTiler fallback to public OSM / CartoDB if needed
    });

    tileLayer.addTo(map);
  }, [baseLayerType]);

  // Geolocation Location Finder Function
  const handleFindLocation = (customLat?: number, customLng?: number, label?: string) => {
    setIsLocating(true);
    setLocateError(null);

    const processCoords = (lat: number, lng: number, accuracyM = 50, locationLabel = 'Your Current GPS Location') => {
      // Find closest hazard location
      let closestLoc: LocationData | null = null;
      let minDistanceKm = 999999;

      locations.forEach((loc) => {
        const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
        if (dist < minDistanceKm) {
          minDistanceKm = dist;
          closestLoc = loc;
        }
      });

      // Find closest road
      let closestRoad: RoadStatus | null = null;
      let minRoadDistKm = 999999;
      roads.forEach((road) => {
        if (road.pathCoords && road.pathCoords.length > 0) {
          road.pathCoords.forEach(([rLat, rLng]) => {
            const dist = calculateDistanceKm(lat, lng, rLat, rLng);
            if (dist < minRoadDistKm) {
              minRoadDistKm = dist;
              closestRoad = road;
            }
          });
        }
      });

      let safety: 'SAFE' | 'ELEVATED' | 'HIGH_RISK' = 'SAFE';
      if (minDistanceKm <= 15 && closestLoc && (closestLoc as LocationData).riskScore >= 70) {
        safety = 'HIGH_RISK';
      } else if (minDistanceKm <= 30 && closestLoc && (closestLoc as LocationData).riskScore >= 45) {
        safety = 'ELEVATED';
      }

      const locInfo: UserLocationInfo = {
        lat,
        lng,
        accuracy: accuracyM,
        label: locationLabel,
        nearestLocation: closestLoc,
        distanceToNearestKm: minDistanceKm,
        nearestRoad: closestRoad,
        distanceToRoadKm: minRoadDistKm,
        safetyStatus: safety,
      };

      setUserLocation(locInfo);
      setShowLocateHUD(true);
      setIsLocating(false);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 11, { duration: 1.5 });
      }
    };

    if (customLat !== undefined && customLng !== undefined) {
      processCoords(customLat, customLng, 25, label || 'Simulated NER Location');
      return;
    }

    if (!navigator.geolocation) {
      setLocateError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      // Fallback to Haflong Central Hill Station
      processCoords(25.174, 93.023, 200, 'Haflong Hill Station, Assam (Demo Location)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        processCoords(
          position.coords.latitude,
          position.coords.longitude,
          Math.round(position.coords.accuracy || 45),
          'Your Live GPS Location'
        );
      },
      (err) => {
        console.warn('Geolocation error or permission denied:', err);
        setLocateError('Could not acquire live GPS. Loaded central NER monitoring point.');
        // Graceful fallback to Haflong Dima Hasao
        processCoords(25.174, 93.023, 150, 'Haflong, Dima Hasao (Default NER Center)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Render User Location Pin & Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerGroupRef.current) return;
    const group = userMarkerGroupRef.current;
    group.clearLayers();

    if (userLocation) {
      // 1. Accuracy Circle
      const accCircle = L.circle([userLocation.lat, userLocation.lng], {
        radius: Math.max(userLocation.accuracy, 2500),
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '3, 6',
      });
      accCircle.addTo(group);

      // 2. Custom Pulsing User Marker
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute w-10 h-10 rounded-full bg-cyan-500/40 animate-ping"></div>
            <div class="absolute w-6 h-6 rounded-full bg-blue-600/60 animate-pulse"></div>
            <div class="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-[10px]">
              📍
            </div>
            <div class="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-950/90 text-cyan-300 font-bold text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border border-cyan-500/40 shadow-lg pointer-events-none">
              You are here
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
      userMarker.bindPopup(`
        <div class="p-2 text-xs text-slate-900">
          <p class="font-extrabold text-blue-700 flex items-center">
            <span class="mr-1">🎯</span> ${userLocation.label}
          </p>
          <p class="text-[11px] text-slate-600 mt-1">
            Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)} (±${userLocation.accuracy}m)
          </p>
          ${
            userLocation.nearestLocation
              ? `<div class="mt-2 p-1.5 bg-slate-100 rounded border border-slate-300 text-[11px]">
                  <p class="font-semibold text-slate-800">Nearest Risk Slope: <b>${userLocation.nearestLocation.name}</b></p>
                  <p class="text-slate-600">Distance: <b>${userLocation.distanceToNearestKm} km</b> • Risk: <span class="font-bold text-red-600">${userLocation.nearestLocation.riskLevel} (${userLocation.nearestLocation.riskScore}/100)</span></p>
                </div>`
              : ''
          }
        </div>
      `);
      userMarker.addTo(group);
    }
  }, [userLocation]);

  // Render Overlays (Locations, Heatmap, Sensors, Roads, Incidents)
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // 1. Heatmap / Risk buffer circles
    if (showHeatmap) {
      filteredLocations.forEach((loc) => {
        const radius = loc.riskScore >= 75 ? 35000 : loc.riskScore >= 50 ? 25000 : 15000;
        const color =
          loc.riskLevel === 'CRITICAL'
            ? '#ef4444'
            : loc.riskLevel === 'HIGH'
            ? '#f97316'
            : loc.riskLevel === 'MODERATE'
            ? '#eab308'
            : '#10b981';

        const heatCircle = L.circle([loc.lat, loc.lng], {
          radius: radius,
          fillColor: color,
          fillOpacity: loc.riskScore >= 75 ? 0.25 : 0.15,
          color: color,
          weight: 1,
          dashArray: '4, 8',
        });
        heatCircle.addTo(layerGroup);
      });
    }

    // 2. Risk Location Markers
    if (showRiskZones) {
      filteredLocations.forEach((loc) => {
        const isSelected = selectedLocation?.id === loc.id;
        const color =
          loc.riskLevel === 'CRITICAL'
            ? '#ef4444'
            : loc.riskLevel === 'HIGH'
            ? '#f97316'
            : loc.riskLevel === 'MODERATE'
            ? '#eab308'
            : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-risk-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              ${
                loc.riskLevel === 'CRITICAL'
                  ? `<div class="absolute w-8 h-8 rounded-full animate-ping opacity-75" style="background-color: ${color};"></div>`
                  : ''
              }
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 shadow-lg border-2 transition-transform transform group-hover:scale-125 ${
                isSelected ? 'ring-4 ring-white scale-125' : ''
              }" style="background-color: ${color}; border-color: #ffffff;">
                ${loc.riskScore}
              </div>
              <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-slate-700">
                ${loc.name} (${loc.riskLevel})
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
        marker.on('click', () => {
          onSelectLocation(loc);
        });

        marker.addTo(layerGroup);
      });
    }

    // 3. Roads & Blockages
    if (showRoads) {
      roads.forEach((road) => {
        const isBlocked = road.status === 'FULLY_BLOCKED';
        const isPartial = road.status === 'PARTIALLY_BLOCKED';
        const roadColor = isBlocked ? '#ef4444' : isPartial ? '#f97316' : '#3b82f6';

        // Draw Polyline
        const polyline = L.polyline(road.pathCoords, {
          color: roadColor,
          weight: isBlocked ? 5 : 3,
          dashArray: isBlocked ? '6, 6' : undefined,
          opacity: 0.85,
        });

        polyline.bindTooltip(
          `<b>${road.roadNumber}</b>: ${road.name}<br/>Status: <span style="color:${roadColor}; font-weight:bold;">${road.status.replace(/_/g, ' ')}</span>`,
          { sticky: true }
        );
        polyline.addTo(layerGroup);

        // Blockage Marker
        if (road.blockageLocation) {
          const blockageIcon = L.divIcon({
            className: 'custom-blockage-marker',
            html: `
              <div class="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-[11px] shadow-lg border border-white animate-bounce">
                ⛔
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const blockMarker = L.marker([road.blockageLocation.lat, road.blockageLocation.lng], {
            icon: blockageIcon,
          });
          blockMarker.bindPopup(`
            <div class="p-1 text-xs">
              <p class="font-bold text-red-600">ROAD BLOCKED: ${road.roadNumber}</p>
              <p class="text-slate-700">${road.blockageLocation.landmark}</p>
              <p class="mt-1 font-semibold text-slate-900">ETA Clearance: ${road.clearanceETA || 'Assessing'}</p>
              <p class="mt-1 text-emerald-700"><b>Alternate:</b> ${road.alternateRouteName}</p>
            </div>
          `);
          blockMarker.addTo(layerGroup);
        }
      });
    }

    // 4. Sensors
    if (showSensors) {
      sensors.forEach((sensor) => {
        const sensorColor =
          sensor.status === 'CRITICAL'
            ? '#ef4444'
            : sensor.status === 'WARNING'
            ? '#f59e0b'
            : sensor.status === 'ONLINE'
            ? '#10b981'
            : '#64748b';

        const sensorIcon = L.divIcon({
          className: 'custom-sensor-marker',
          html: `
            <div class="w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-slate-900" style="background-color: ${sensorColor};">
              <span class="text-[9px] text-white font-bold">📡</span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const sMarker = L.marker([sensor.lat, sensor.lng], { icon: sensorIcon });
        sMarker.bindPopup(`
          <div class="p-1 text-xs">
            <p class="font-bold text-slate-900">${sensor.name}</p>
            <p class="text-slate-600">${sensor.sensorType} (${sensor.district})</p>
            <p class="mt-1 font-semibold text-slate-800">Reading: ${sensor.lastReading.value} ${sensor.lastReading.unit}</p>
            <p class="text-[10px] text-slate-500">Status: <span style="color:${sensorColor}; font-weight:bold;">${sensor.status}</span> | Battery: ${sensor.batteryPercent}%</p>
          </div>
        `);
        sMarker.addTo(layerGroup);
      });
    }

    // 5. Citizen / Field Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        const incIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: `
            <div class="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg border border-white">
              ⚠️
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const iMarker = L.marker([inc.lat, inc.lng], { icon: incIcon });
        iMarker.bindPopup(`
          <div class="p-1 text-xs max-w-[200px]">
            <p class="font-bold text-slate-900">${inc.title}</p>
            <p class="text-slate-600 mt-0.5">${inc.locationName} (${inc.state})</p>
            <p class="text-slate-700 mt-1 line-clamp-2">${inc.description}</p>
            <p class="mt-1 text-[10px] font-semibold text-amber-700">Status: ${inc.status} | Severity: ${inc.severity}</p>
          </div>
        `);
        iMarker.addTo(layerGroup);
      });
    }
  }, [
    filteredLocations,
    sensors,
    roads,
    incidents,
    showRiskZones,
    showSensors,
    showRoads,
    showIncidents,
    showHeatmap,
    selectedLocation,
  ]);

  // Fly to selected location
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedLocation.lat, selectedLocation.lng], 10, {
        duration: 1.2,
      });
    }
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full min-h-[calc(100vh-60px)] bg-slate-950 overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search & Filter & Location Finder Group */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-2xl">
          {/* Location Finder Icon Button (Primary GPS) */}
          <button
            onClick={() => handleFindLocation()}
            disabled={isLocating}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-600/30 transition-all active:scale-95 border border-cyan-400/40"
            title="Find My Current Location on Map using GPS"
          >
            <LocateFixed className={`w-4 h-4 text-white ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating GPS...' : t.findMyLocation}</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder={t.searchLocationPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 w-44 sm:w-60"
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            <option value="all">{t.allStates}</option>
            <option value="Assam">{getLocalizedState('Assam', currentLang)}</option>
            <option value="Arunachal Pradesh">{getLocalizedState('Arunachal Pradesh', currentLang)}</option>
            <option value="Manipur">{getLocalizedState('Manipur', currentLang)}</option>
            <option value="Meghalaya">{getLocalizedState('Meghalaya', currentLang)}</option>
            <option value="Mizoram">{getLocalizedState('Mizoram', currentLang)}</option>
            <option value="Nagaland">{getLocalizedState('Nagaland', currentLang)}</option>
            <option value="Sikkim">{getLocalizedState('Sikkim', currentLang)}</option>
            <option value="Tripura">{getLocalizedState('Tripura', currentLang)}</option>
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer hidden sm:block"
          >
            <option value="all">{t.allRisks}</option>
            <option value="CRITICAL">{getLocalizedRiskLevel('CRITICAL', currentLang)} (76-100)</option>
            <option value="HIGH">{getLocalizedRiskLevel('HIGH', currentLang)} (51-75)</option>
            <option value="MODERATE">{getLocalizedRiskLevel('MODERATE', currentLang)} (26-50)</option>
            <option value="LOW">{getLocalizedRiskLevel('LOW', currentLang)} (0-25)</option>
          </select>
        </div>

        {/* Base Layer Switcher */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl text-xs">
          <button
            onClick={() => setBaseLayerType('dark')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              baseLayerType === 'dark' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.baseLayerDark || 'Dark'}
          </button>
          <button
            onClick={() => setBaseLayerType('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              baseLayerType === 'satellite'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.baseLayerSatellite || 'Satellite'}
          </button>
          <button
            onClick={() => setBaseLayerType('terrain')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              baseLayerType === 'terrain'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.baseLayerTerrain || 'Terrain'}
          </button>
          <button
            onClick={() => setBaseLayerType('maptiler_topo')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              baseLayerType === 'maptiler_topo'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.baseLayerTopo || 'Topo'}
          </button>
        </div>
      </div>

      {/* Map Element Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Location Finder Quick Icon Widget on Top-Right */}
      <div className="absolute top-20 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={() => handleFindLocation()}
          disabled={isLocating}
          className="w-10 h-10 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-cyan-400 border border-slate-700 shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          title="Find Location on Map (GPS)"
        >
          <Crosshair className={`w-5 h-5 text-cyan-400 group-hover:text-cyan-300 ${isLocating ? 'animate-spin' : ''}`} />
        </button>

        {/* Preset Location Quick Jump Menu */}
        <div className="bg-slate-900/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-2xl text-[10px] text-slate-300 space-y-1">
          <p className="px-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Test GPS In</p>
          <button
            onClick={() => handleFindLocation(25.174, 93.023, 'Haflong Central Hill Station')}
            className="w-full text-left px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-200 transition-colors truncate"
          >
            📍 Haflong (Assam)
          </button>
          <button
            onClick={() => handleFindLocation(27.338, 88.606, 'Gangtok Capital Hill')}
            className="w-full text-left px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-200 transition-colors truncate"
          >
            📍 Gangtok (Sikkim)
          </button>
          <button
            onClick={() => handleFindLocation(24.817, 93.936, 'Imphal Valley Corridor')}
            className="w-full text-left px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-200 transition-colors truncate"
          >
            📍 Imphal (Manipur)
          </button>
        </div>
      </div>

      {/* Location Finder & Safety Assessment HUD Slide-Over / Card */}
      {showLocateHUD && userLocation && (
        <div className="absolute top-20 left-4 z-[400] w-full max-w-sm bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl p-4 text-slate-100 space-y-3 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Navigation className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
                  Location Safety Radar
                </h4>
                <p className="text-xs font-bold text-slate-100 truncate max-w-[200px]">
                  {userLocation.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLocateHUD(false)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400">Latitude:</span>
              <p className="font-mono font-bold text-slate-200">{userLocation.lat.toFixed(4)}° N</p>
            </div>
            <div>
              <span className="text-slate-400">Longitude:</span>
              <p className="font-mono font-bold text-slate-200">{userLocation.lng.toFixed(4)}° E</p>
            </div>
            <div>
              <span className="text-slate-400">GPS Accuracy:</span>
              <p className="font-mono font-bold text-cyan-400">±{userLocation.accuracy} m</p>
            </div>
            <div>
              <span className="text-slate-400">Hazard Exposure:</span>
              <p
                className={`font-bold ${
                  userLocation.safetyStatus === 'HIGH_RISK'
                    ? 'text-red-400'
                    : userLocation.safetyStatus === 'ELEVATED'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {userLocation.safetyStatus === 'HIGH_RISK'
                  ? '⚠️ High Risk Vicinity'
                  : userLocation.safetyStatus === 'ELEVATED'
                  ? '⚡ Elevated Watch'
                  : '✅ Safe Perimeter'}
              </p>
            </div>
          </div>

          {/* Closest Hazard Slope Proximity */}
          {userLocation.nearestLocation && (
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Closest Monitored Hazard:</span>
                <span className="font-bold text-amber-300">{userLocation.distanceToNearestKm} km away</span>
              </div>
              <p className="font-bold text-slate-100">{userLocation.nearestLocation.name} ({userLocation.nearestLocation.district})</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Risk Level: <strong className="text-red-400">{userLocation.nearestLocation.riskLevel} ({userLocation.nearestLocation.riskScore}/100)</strong></span>
                <span>24h Rain: <strong className="text-blue-300">{userLocation.nearestLocation.rainfall24h} mm</strong></span>
              </div>
            </div>
          )}

          {/* Closest Road Lifeline */}
          {userLocation.nearestRoad && (
            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold">Nearest Highway Corridor:</span>
                <span className="font-bold text-blue-300">{userLocation.distanceToRoadKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">{userLocation.nearestRoad.roadNumber} - {userLocation.nearestRoad.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    userLocation.nearestRoad.status === 'FULLY_BLOCKED'
                      ? 'bg-red-500/20 text-red-400'
                      : userLocation.nearestRoad.status === 'PARTIALLY_BLOCKED'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {userLocation.nearestRoad.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1 flex items-center gap-2">
            {userLocation.nearestLocation && (
              <button
                onClick={() => onSelectLocation(userLocation.nearestLocation!)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-1.5 px-2 rounded-lg transition-colors text-center"
              >
                Inspect Slope Diagnostic
              </button>
            )}
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13);
                }
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 px-3 rounded-lg border border-slate-700 font-medium"
            >
              Re-center
            </button>
          </div>
        </div>
      )}

      {/* Bottom Left: Layer Toggles Card */}
      <div className="absolute bottom-6 left-4 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl text-xs text-slate-200 max-w-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-amber-300">
          <span className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.gisMapLayersTitle || 'GIS Map Layers'}</span>
          </span>
          <span className="text-[10px] text-slate-400">{filteredLocations.length} {t.locationsCountLabel || 'locations'}</span>
        </div>

        <div className="space-y-1.5 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRiskZones}
              onChange={(e) => setShowRiskZones(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1.5"></span>
              {t.layerAiLandslideScores || 'AI Landslide Risk Scores'}
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 mr-1.5"></span>
              {t.layerSusceptibilityHeatmap || 'Susceptibility Heatmap Buffers'}
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-1.5"></span>
              {t.layerHighwayCorridors || 'Highway Corridors & Blockages'}
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5"></span>
              {t.layerIotSensors || 'IoT Telemetry Sensors'}
            </span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
            />
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5"></span>
              {t.layerCitizenReports || 'Citizen Hazard Reports'}
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Right Legend Card */}
      <div className="absolute bottom-6 right-16 z-[400] bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl text-xs text-slate-300 hidden md:block">
        <div className="font-semibold text-slate-100 mb-1.5">{t.riskLevelScaleTitle || 'Risk Level Scale'}</div>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>0-25 {t.scaleLow || 'Low'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span>26-50 {t.scaleMod || 'Mod'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>51-75 {t.scaleHigh || 'High'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>76-100 {t.scaleCritical || 'Critical'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
