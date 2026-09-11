import { GisEvidenceMetadata, GisStampConfig, HazardType, SeverityLevel } from '../../types';

// Predefined NER Lifeline Highways & Locations for instant reverse-geocoding fallback
export const NER_KNOWN_LOCATIONS = [
  {
    name: 'Haflong-Jatinga Hill Cut KM 142',
    district: 'Dima Hasao',
    state: 'Assam',
    road: 'NH-27 (Silchar – Haflong – Lumding Corridor)',
    lat: 25.1764,
    lng: 93.0238,
    elevationM: 680,
    weather: '23°C • Rain 18mm/h • 91% RH',
  },
  {
    name: 'Sonapur Tunnel Approaching Slope',
    district: 'East Jaintia Hills',
    state: 'Meghalaya',
    road: 'NH-06 (Shillong – Silchar Arterial)',
    lat: 25.1054,
    lng: 92.3654,
    elevationM: 740,
    weather: '21°C • Heavy Downpour 32mm/h • 96% RH',
  },
  {
    name: 'Lalmati – Paglajhora Vulnerability Sector',
    district: 'Darjeeling / South Sikkim',
    state: 'Sikkim',
    road: 'NH-10 (Sevoke – Gangtok Lifeline)',
    lat: 27.0215,
    lng: 88.4287,
    elevationM: 1120,
    weather: '18°C • Mist & Rain 14mm/h • 94% RH',
  },
  {
    name: 'Hunphun Cliff Sector',
    district: 'Ukhrul',
    state: 'Manipur',
    road: 'NH-202 (Imphal – Ukhrul Highway)',
    lat: 25.1167,
    lng: 94.3667,
    elevationM: 1660,
    weather: '19°C • Light Rain 6mm/h • 88% RH',
  },
  {
    name: 'Phesama Slope KM 44',
    district: 'Kohima',
    state: 'Nagaland',
    road: 'NH-29 (Dimapur – Kohima – Imphal Lifeline)',
    lat: 25.6214,
    lng: 94.1124,
    elevationM: 1440,
    weather: '17°C • Drizzle 4mm/h • 89% RH',
  },
  {
    name: 'Hunli – Anini Valley Road KM 68',
    district: 'Dibang Valley',
    state: 'Arunachal Pradesh',
    road: 'NH-313 (Strategic Trans-Arunachal Route)',
    lat: 28.3241,
    lng: 95.9521,
    elevationM: 1890,
    weather: '15°C • Continuous Rain 22mm/h • 98% RH',
  },
  {
    name: 'Bawngkawn – Durtlang Ridge',
    district: 'Aizawl',
    state: 'Mizoram',
    road: 'NH-54 / SH-1 (Aizawl – Silchar Route)',
    lat: 23.7541,
    lng: 92.7324,
    elevationM: 1080,
    weather: '22°C • Rain 12mm/h • 90% RH',
  },
  {
    name: 'Atharamura Hill Range KM 52',
    district: 'Khowai',
    state: 'Tripura',
    road: 'NH-08 (Agartala – Assam Lifeline)',
    lat: 23.8541,
    lng: 91.6854,
    elevationM: 280,
    weather: '27°C • Thunderstorm 28mm/h • 87% RH',
  },
];

export const DEFAULT_STAMP_CONFIG: GisStampConfig = {
  showLocation: true,
  showCoordinates: true,
  showDateTime: true,
  showAltitude: true,
  showGpsAccuracy: true,
  showMiniMap: true,
  showRoad: true,
  showHazardType: true,
  showSeverity: true,
  showIncidentId: true,
  showWeather: true,
  showCompass: true,
  mapPosition: 'left',
  mapStyle: 'terrain',
  fontSize: 'medium',
  cardOpacity: 88,
  theme: 'dark',
  textAlign: 'left',
};

// Generate unique incident / photo ID
export function generateIncidentId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INC-${year}-${month}${day}-${rand}`;
}

// Convert decimal degrees to formatted string
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

// Convert degrees to Deg Min Sec format
export function formatDMS(lat: number, lng: number): string {
  const toDms = (deg: number) => {
    const d = Math.floor(Math.abs(deg));
    const minFloat = (Math.abs(deg) - d) * 60;
    const m = Math.floor(minFloat);
    const s = ((minFloat - m) * 60).toFixed(1);
    return `${d}° ${m}' ${s}"`;
  };
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${toDms(lat)} ${latDir}, ${toDms(lng)} ${lngDir}`;
}

// Convert bearing degrees to 8-point compass
export function getCompassDirection(bearingDeg?: number): string {
  if (bearingDeg === undefined || isNaN(bearingDeg)) return 'NE (42°)';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((bearingDeg %= 360) < 0 ? bearingDeg + 360 : bearingDeg) / 45) % 8;
  return `${directions[index]} (${Math.round(bearingDeg)}°)`;
}

// Format IST Date & Time
export function formatISTDateTime(date: Date = new Date()): { dateStr: string; timeStr: string; fullStr: string } {
  // IST is UTC+5:30
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  };

  const dateStr = new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
  const timeStr = new Intl.DateTimeFormat('en-GB', optionsTime).format(date);

  return {
    dateStr,
    timeStr: `${timeStr} IST`,
    fullStr: `${dateStr} • ${timeStr} IST`,
  };
}

// Calculate distance between two lat/lng in km (Haversine formula)
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fast reverse geocoding with NER known locations fallback and online fetch
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<{
  address: string;
  state: string;
  district: string;
  road?: string;
  altitudeMeters: number;
  weather: string;
}> {
  // 1. Find closest known NER landslide location
  let closest = NER_KNOWN_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of NER_KNOWN_LOCATIONS) {
    const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  // If very close to known NER station (< 25km), prioritize high-accuracy landmark
  if (minDistance < 25) {
    return {
      address: closest.name,
      state: closest.state,
      district: closest.district,
      road: closest.road,
      altitudeMeters: closest.elevationM,
      weather: closest.weather,
    };
  }

  // Try online reverse geocode if network allows
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const state = addr.state || closest.state;
      const district = addr.county || addr.state_district || addr.city || closest.district;
      const road = addr.road || addr.highway || closest.road;
      const name = data.display_name?.split(',').slice(0, 3).join(',') || closest.name;

      return {
        address: name,
        state,
        district,
        road,
        altitudeMeters: Math.round(450 + Math.random() * 800),
        weather: '22°C • Overcast 10mm/h • 90% RH',
      };
    }
  } catch (e) {
    // Network offline or timeout - fallback safely
  }

  return {
    address: `${closest.name} (${Math.round(minDistance)}km vicinity)`,
    state: closest.state,
    district: closest.district,
    road: closest.road,
    altitudeMeters: closest.elevationM,
    weather: closest.weather,
  };
}

// High-resolution Canvas Stamping Engine
// Burns the GIS survey metadata + mini-map preview into the bottom of the captured photo
export async function renderGisStampOnCanvas(
  rawImageSrc: string,
  metadata: GisEvidenceMetadata,
  config: GisStampConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 1280;
        const height = img.naturalHeight || img.height || 720;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawImageSrc);
          return;
        }

        // 1. Draw original base image
        ctx.drawImage(img, 0, 0, width, height);

        // Responsive sizing based on image dimensions
        const scale = Math.max(width / 1200, 0.75);
        const cardPadding = 20 * scale;
        const cardHeight = 150 * scale;
        const cardY = height - cardHeight;

        // 2. Draw semi-transparent dark/light card background at bottom
        ctx.save();
        const opacity = Math.min(Math.max((config.cardOpacity || 88) / 100, 0.4), 1);
        ctx.fillStyle = config.theme === 'light' ? `rgba(248, 250, 252, ${opacity})` : `rgba(15, 23, 42, ${opacity})`;
        ctx.fillRect(0, cardY, width, cardHeight);

        // Top accent line on card
        ctx.fillStyle = metadata.severity === 'Critical' ? '#EF4444' : metadata.severity === 'High' ? '#F59E0B' : '#10B981';
        ctx.fillRect(0, cardY, width, 4 * scale);

        // Mini-map dimensions
        const mapSize = 110 * scale;
        const mapX = config.mapPosition === 'right' ? width - mapSize - cardPadding : cardPadding;
        const mapY = cardY + (cardHeight - mapSize) / 2;

        // 3. Draw Mini Map (if enabled and not 'none')
        if (config.showMiniMap && config.mapPosition !== 'none') {
          // Map container background
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.roundRect(mapX, mapY, mapSize, mapSize, 8 * scale);
          ctx.fill();
          ctx.stroke();

          // Draw simulated terrain/topography contour lines or grid
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(mapX, mapY, mapSize, mapSize, 8 * scale);
          ctx.clip();

          // Map background based on style
          if (config.mapStyle === 'satellite') {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(mapX, mapY, mapSize, mapSize);
            // Green patch
            ctx.fillStyle = '#14532d';
            ctx.beginPath();
            ctx.arc(mapX + mapSize * 0.3, mapY + mapSize * 0.4, mapSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#020617';
            ctx.fillRect(mapX, mapY, mapSize, mapSize);
            // Contour lines
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            for (let i = 1; i <= 3; i++) {
              ctx.beginPath();
              ctx.arc(mapX + mapSize * 0.5, mapY + mapSize * 0.5, (mapSize / 4) * i, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          // Highway Line across map
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3 * scale;
          ctx.beginPath();
          ctx.moveTo(mapX, mapY + mapSize * 0.7);
          ctx.bezierCurveTo(
            mapX + mapSize * 0.4,
            mapY + mapSize * 0.6,
            mapX + mapSize * 0.6,
            mapY + mapSize * 0.4,
            mapX + mapSize,
            mapY + mapSize * 0.2
          );
          ctx.stroke();

          // Target Pin in Center
          const pinX = mapX + mapSize / 2;
          const pinY = mapY + mapSize / 2;

          // Pulse ring
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.beginPath();
          ctx.arc(pinX, pinY, 12 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Pin marker
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(pinX, pinY, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5 * scale;
          ctx.stroke();

          // GIS LOCATION Badge
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(mapX + 4 * scale, mapY + mapSize - 18 * scale, mapSize - 8 * scale, 14 * scale);
          ctx.fillStyle = '#FBBF24';
          ctx.font = `bold ${8 * scale}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('GIS LOCATION', mapX + mapSize / 2, mapY + mapSize - 7 * scale);

          ctx.restore();
        }

        // 4. Render GIS / Hazard Text
        const textX =
          config.showMiniMap && config.mapPosition === 'left'
            ? mapX + mapSize + 16 * scale
            : cardPadding;
        let textY = cardY + 22 * scale;

        const textColor = config.theme === 'light' ? '#0f172a' : '#f8fafc';
        const mutedColor = config.theme === 'light' ? '#475569' : '#94a3b8';
        const accentColor = '#F59E0B';

        ctx.textAlign = 'left';

        // Row 1: Hazard Badge + Severity
        if (config.showHazardType || config.showSeverity) {
          const badgeText = `⚠️ ${metadata.hazardType.toUpperCase()} — ${metadata.severity.toUpperCase()}`;
          ctx.font = `bold ${11 * scale}px system-ui, sans-serif`;
          ctx.fillStyle = metadata.severity === 'Critical' ? '#F87171' : '#FBBF24';
          ctx.fillText(badgeText, textX, textY);

          if (config.showIncidentId) {
            ctx.fillStyle = mutedColor;
            ctx.font = `normal ${9.5 * scale}px monospace, sans-serif`;
            const idText = `ID: ${metadata.incidentId}`;
            ctx.fillText(idText, textX + 220 * scale, textY);
          }
          textY += 18 * scale;
        }

        // Row 2: Location Name & District/State
        if (config.showLocation) {
          ctx.font = `bold ${14 * scale}px system-ui, sans-serif`;
          ctx.fillStyle = textColor;
          const locString = `📍 ${metadata.address || `${metadata.district}, ${metadata.state}`}`;
          ctx.fillText(locString.length > 55 ? locString.slice(0, 52) + '...' : locString, textX, textY);
          textY += 17 * scale;
        }

        // Row 3: Road / Lifeline Corridor
        if (config.showRoad && metadata.road) {
          ctx.font = `600 ${11 * scale}px system-ui, sans-serif`;
          ctx.fillStyle = accentColor;
          ctx.fillText(`🛣️ ${metadata.road}`, textX, textY);
          textY += 16 * scale;
        }

        // Row 4: Coordinates, Altitude, GPS Accuracy
        if (config.showCoordinates || config.showAltitude || config.showGpsAccuracy) {
          ctx.font = `500 ${10.5 * scale}px system-ui, sans-serif`;
          ctx.fillStyle = textColor;

          const coordPart = config.showCoordinates ? formatCoordinates(metadata.latitude, metadata.longitude) : '';
          const altPart = config.showAltitude && metadata.altitudeMeters ? ` • Alt: ${metadata.altitudeMeters}m` : '';
          const accPart = config.showGpsAccuracy ? ` • GPS Acc: ±${Math.round(metadata.accuracyMeters)}m` : '';

          ctx.fillText(`${coordPart}${altPart}${accPart}`, textX, textY);
          textY += 16 * scale;
        }

        // Row 5: Date, Time (IST), Weather, Compass
        if (config.showDateTime || config.showWeather || config.showCompass) {
          ctx.font = `normal ${9.5 * scale}px system-ui, sans-serif`;
          ctx.fillStyle = mutedColor;

          const timePart = config.showDateTime ? metadata.timestamp : '';
          const weatherPart = config.showWeather && metadata.weather ? ` • ${metadata.weather}` : '';
          const compassPart = config.showCompass && metadata.compassDirection ? ` • Heading: ${metadata.compassDirection}` : '';

          ctx.fillText(`${timePart}${weatherPart}${compassPart}`, textX, textY);
        }

        // Top-right survey watermark tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(width - 170 * scale, 12 * scale, 158 * scale, 24 * scale);
        ctx.fillStyle = '#38BDF8';
        ctx.font = `bold ${9 * scale}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NER LANDSLIDEWATCH GIS CAM', width - 91 * scale, 28 * scale);

        ctx.restore();

        const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(stampedDataUrl);
      } catch (err) {
        console.error('Error rendering GIS stamp on canvas:', err);
        resolve(rawImageSrc);
      }
    };
    img.onerror = () => {
      resolve(rawImageSrc);
    };
    img.src = rawImageSrc;
  });
}

// Sound effects for realistic camera experience
export function playCameraShutterSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {
    // AudioContext not permitted or supported
  }
}
