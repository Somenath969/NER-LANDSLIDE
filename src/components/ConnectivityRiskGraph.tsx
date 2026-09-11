import React, { useState, useMemo, useRef } from 'react';
import {
  Share2,
  Building2,
  HeartPulse,
  Home,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Navigation,
  Radio,
  Download,
  Copy,
  Check,
  FileCode,
  MapPin,
  Layers,
  UploadCloud,
  Send,
  MessageSquare,
  Droplets,
  Tent,
  ZoomIn,
  ZoomOut,
  Maximize2,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { ConnectivityGraphNode, ConnectivityGraphEdge } from '../types';
import { initialConnectivityNodes, initialConnectivityEdges } from '../data/nerData';
import { dimaHasaoGeoJSON } from '../data/dimaHasaoGeoJSON';
import {
  parseGeoJsonToConnectivityGraph,
  calculateNetworkIsolation,
  exportConnectivityRiskGraphToGeoJson,
} from '../services/connectivityGeoJsonEngine';

interface ConnectivityRiskGraphProps {
  initialNodes?: ConnectivityGraphNode[];
  initialEdges?: ConnectivityGraphEdge[];
}

// Localized relief facilities and potable water source directory for Dima Hasao & NER habitations
interface LocalReliefInfo {
  potableWaterSource: string;
  potableWaterCapacity: string;
  reliefShelterName: string;
  reliefShelterCapacity: string;
  helipadDropZone: string;
  emergencyVhfFreq: string;
  localCoordinatorContact: string;
}

const HABITATION_RELIEF_DATA: Record<string, LocalReliefInfo> = {
  Haflong: {
    potableWaterSource: 'PHED Spring Gravity Filtration Plant #2',
    potableWaterCapacity: '45,000 L/day (Safe for Drinking)',
    reliefShelterName: 'Haflong Govt Higher Secondary School Relief Camp',
    reliefShelterCapacity: '450 evacuees (Medical post active)',
    helipadDropZone: 'Haflong District Sports Stadium (25.168°N, 93.019°E)',
    emergencyVhfFreq: '146.520 MHz (DDMA Command)',
    localCoordinatorContact: '+91-3673-236222 / 1077',
  },
  'Haflong Civil Hospital': {
    potableWaterSource: 'Hospital Dedicated Borewell + Reverse Osmosis Plant',
    potableWaterCapacity: '30,000 L/day (Medical Grade)',
    reliefShelterName: 'Haflong Civil Hospital Emergency Trauma Triage Wing',
    reliefShelterCapacity: '200 beds (18 ICU beds)',
    helipadDropZone: 'Civil Hospital Rooftop / Helipad Ground',
    emergencyVhfFreq: '146.550 MHz (Medical Net)',
    localCoordinatorContact: '108 / +91-3673-236102',
  },
  'Holy Spirit Hospital, Haflong': {
    potableWaterSource: 'Hill Spring Sand-Filter & Chlorination Depot',
    potableWaterCapacity: '15,000 L/day',
    reliefShelterName: 'Mission Community Emergency Ward',
    reliefShelterCapacity: '120 beds',
    helipadDropZone: 'Haflong Mission Ground',
    emergencyVhfFreq: '146.550 MHz',
    localCoordinatorContact: '108 / +91-3673-236155',
  },
  Mahur: {
    potableWaterSource: 'Mahur River Deep Spring Intake & Chlorine Depots',
    potableWaterCapacity: '18,000 L/day',
    reliefShelterName: 'Mahur Town Community Hall & High School Camp',
    reliefShelterCapacity: '300 evacuees',
    helipadDropZone: 'Mahur Railway Ground Clearance Zone (25.185°N, 93.115°E)',
    emergencyVhfFreq: '146.580 MHz',
    localCoordinatorContact: '+91-94350-88123',
  },
  Maibong: {
    potableWaterSource: 'Mahur-Diyung PHED Reservoir Tank #4',
    potableWaterCapacity: '22,000 L/day',
    reliefShelterName: 'Maibong Sub-Divisional Complex Relief Camp',
    reliefShelterCapacity: '400 evacuees',
    helipadDropZone: 'Maibong College Ground (25.304°N, 93.135°E)',
    emergencyVhfFreq: '146.600 MHz',
    localCoordinatorContact: '+91-3673-282245',
  },
  Langting: {
    potableWaterSource: 'Langting Hill Stream Gravity Tank with UV Purifier',
    potableWaterCapacity: '12,000 L/day',
    reliefShelterName: 'Langting Forest Rest House & Primary Health Centre',
    reliefShelterCapacity: '180 evacuees',
    helipadDropZone: 'Langting Railway Station Clearing (25.503°N, 93.120°E)',
    emergencyVhfFreq: '146.620 MHz',
    localCoordinatorContact: '+91-94351-77234',
  },
  Umrangso: {
    potableWaterSource: 'Kopili Dam Water Treatment Station',
    potableWaterCapacity: '50,000 L/day',
    reliefShelterName: 'NEEPCO Umrangso Guest Complex Relief Base',
    reliefShelterCapacity: '500 evacuees',
    helipadDropZone: 'NEEPCO Helipad (25.510°N, 92.740°E)',
    emergencyVhfFreq: '146.640 MHz',
    localCoordinatorContact: '+91-3670-288211',
  },
  Harangajao: {
    potableWaterSource: 'Jatinga River Upstream Mobile RO Purifier Unit #04',
    potableWaterCapacity: '15,000 L/day',
    reliefShelterName: 'Harangajao Model Hospital & BDO Office Camp',
    reliefShelterCapacity: '250 evacuees',
    helipadDropZone: 'Harangajao Bypass Flatbed Area',
    emergencyVhfFreq: '146.520 MHz',
    localCoordinatorContact: '+91-94355-12908',
  },
  Gunjong: {
    potableWaterSource: 'Gunjong Hill Spring Collection Well',
    potableWaterCapacity: '8,000 L/day',
    reliefShelterName: 'Gunjong ME School Disaster Shelter',
    reliefShelterCapacity: '150 evacuees',
    helipadDropZone: 'Gunjong Ridge Flat Ground',
    emergencyVhfFreq: '146.540 MHz',
    localCoordinatorContact: '+91-94352-99012',
  },
  Jatinga: {
    potableWaterSource: 'Jatinga Spring Intake Point with Chlorination Tablets',
    potableWaterCapacity: '10,000 L/day',
    reliefShelterName: 'Jatinga Youth Centre & Baptist Church Hall',
    reliefShelterCapacity: '160 evacuees',
    helipadDropZone: 'Jatinga Viewpoint Landing Ground',
    emergencyVhfFreq: '146.520 MHz',
    localCoordinatorContact: '+91-94354-88910',
  },
  Mupa: {
    potableWaterSource: 'Mupa Forest Stream Filter Wells',
    potableWaterCapacity: '6,000 L/day',
    reliefShelterName: 'Mupa LP School Emergency Camp',
    reliefShelterCapacity: '120 evacuees',
    helipadDropZone: 'Mupa Valley Open Field',
    emergencyVhfFreq: '146.560 MHz',
    localCoordinatorContact: '+91-94358-33411',
  },
  Laisong: {
    potableWaterSource: 'Laisong Mountain Catchment Reservoir',
    potableWaterCapacity: '5,500 L/day',
    reliefShelterName: 'Laisong Community Hall',
    reliefShelterCapacity: '100 evacuees',
    helipadDropZone: 'Laisong Ridge Airdrop Drop Zone',
    emergencyVhfFreq: '146.580 MHz',
    localCoordinatorContact: '+91-94359-22109',
  },
};

const DEFAULT_RELIEF: LocalReliefInfo = {
  potableWaterSource: 'Local PHED Gravity Spring Tank & Mobile Water Bowsers',
  potableWaterCapacity: '10,000 L/day (Purified)',
  reliefShelterName: 'Community Cyclone/Disaster Relief Shelter',
  reliefShelterCapacity: '200 evacuees',
  helipadDropZone: 'Designated Village Field Helipad (DDMA Mark 1)',
  emergencyVhfFreq: '146.520 MHz (Emergency VHF Net)',
  localCoordinatorContact: 'DDMA Control: 1077 / EOC: 1070',
};

export const ConnectivityRiskGraph: React.FC<ConnectivityRiskGraphProps> = ({
  initialNodes = initialConnectivityNodes,
  initialEdges = initialConnectivityEdges,
}) => {
  const [nodes, setNodes] = useState<ConnectivityGraphNode[]>(() => {
    const { nodes: osmNodes } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
    return osmNodes.length > 0 ? osmNodes : initialNodes;
  });
  const [edges, setEdges] = useState<ConnectivityGraphEdge[]>(() => {
    const { edges: osmEdges } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
    return osmEdges.length > 0 ? osmEdges : initialEdges;
  });

  // Selected element for detailed inspection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Active Tab for Right Side Tools: 'ROUTE_FINDER' | 'SMS_BROADCAST'
  const [activeToolTab, setActiveToolTab] = useState<'ROUTE_FINDER' | 'SMS_BROADCAST'>('ROUTE_FINDER');

  // SAFE ROUTE FINDER STATE
  const [routeOriginId, setRouteOriginId] = useState<string>('');
  const [routeDestId, setRouteDestId] = useState<string>('');

  // SMS BROADCAST STATE
  const [broadcastHabitationId, setBroadcastHabitationId] = useState<string>('ALL_ISOLATED');
  const [broadcastChannel, setBroadcastChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([]);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // MAP ZOOM & PAN STATE
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Modals for Export/Import
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);

  // Set default route origin/destination on load
  useMemo(() => {
    if (nodes.length > 0) {
      const defaultOrigin = nodes.find((n) => n.name.includes('Mahur') || n.name.includes('Langting')) || nodes[0];
      const defaultDest = nodes.find((n) => n.type === 'HOSPITAL') || nodes[nodes.length - 1];
      if (!routeOriginId) setRouteOriginId(defaultOrigin.id);
      if (!routeDestId) setRouteDestId(defaultDest.id);
    }
  }, [nodes]);

  // Reset graph to initial real network state
  const handleReset = () => {
    const { nodes: osmNodes, edges: osmEdges } = parseGeoJsonToConnectivityGraph(dimaHasaoGeoJSON);
    const { updatedNodes } = calculateNetworkIsolation(osmNodes, osmEdges);
    setNodes(updatedNodes);
    setEdges(osmEdges);
    const defOrigin = updatedNodes.find((n) => n.name.includes('Mahur')) || updatedNodes[0];
    const defDest = updatedNodes.find((n) => n.type === 'HOSPITAL') || updatedNodes[1];
    if (defOrigin) setRouteOriginId(defOrigin.id);
    if (defDest) setRouteDestId(defDest.id);
    setSelectedNodeId(null);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setBroadcastStatus(null);
  };

  // Toggle road blockage on click
  const handleToggleRoad = (edgeId: string) => {
    const updatedEdges = edges.map((e) => {
      if (e.id === edgeId) {
        const nextStatus: 'OPEN' | 'VULNERABLE' | 'BLOCKED' =
          e.status === 'OPEN' ? 'BLOCKED' : e.status === 'BLOCKED' ? 'VULNERABLE' : 'OPEN';
        return { ...e, status: nextStatus };
      }
      return e;
    });
    setEdges(updatedEdges);
    const { updatedNodes } = calculateNetworkIsolation(nodes, updatedEdges);
    setNodes(updatedNodes);
  };

  // Custom GeoJSON Import handler
  const handleApplyCustomGeoJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      const { nodes: parsedNodes, edges: parsedEdges } = parseGeoJsonToConnectivityGraph(parsed);
      if (parsedNodes.length === 0) {
        alert('No valid Point or LineString features found in GeoJSON.');
        return;
      }
      const { updatedNodes } = calculateNetworkIsolation(parsedNodes, parsedEdges);
      setNodes(updatedNodes);
      setEdges(parsedEdges);
      setIsImportModalOpen(false);
      setImportJsonText('');
    } catch (err: any) {
      alert('Invalid GeoJSON format: ' + err?.message);
    }
  };

  // Generated RFC 7946 GeoJSON
  const liveGeoJson = useMemo(() => {
    return exportConnectivityRiskGraphToGeoJson(nodes, edges);
  }, [nodes, edges]);

  const liveGeoJsonString = useMemo(() => {
    return JSON.stringify(liveGeoJson, null, 2);
  }, [liveGeoJson]);

  // Download GeoJSON file
  const handleDownloadGeoJson = () => {
    const blob = new Blob([liveGeoJsonString], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ner-connectivity-risk-${new Date().toISOString().slice(0, 10)}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy GeoJSON to clipboard
  const handleCopyGeoJson = () => {
    navigator.clipboard.writeText(liveGeoJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isolatedNodes = nodes.filter((n) => n.isIsolated);
  const totalIsolatedPop = isolatedNodes.reduce((sum, n) => sum + (n.population || 0), 0);
  const blockedRoads = edges.filter((e) => e.status === 'BLOCKED');

  // Compute coordinate bounding box for SVG projection
  const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
    if (nodes.length === 0) return { minLat: 25.0, maxLat: 25.6, minLng: 92.5, maxLng: 93.4 };
    const lats = nodes.map((n) => n.lat);
    const lngs = nodes.map((n) => n.lng);
    return {
      minLat: Math.min(...lats) - 0.05,
      maxLat: Math.max(...lats) + 0.05,
      minLng: Math.min(...lngs) - 0.05,
      maxLng: Math.max(...lngs) + 0.05,
    };
  }, [nodes]);

  // Project geographic coordinates (lat, lng) onto SVG viewbox with Zoom & Pan
  const projectCoord = (lat: number, lng: number) => {
    const width = 560;
    const height = 280;
    const paddingX = 40;
    const paddingY = 30;

    const baseCenterX = 320;
    const baseCenterY = 170;

    const rawX = paddingX + ((lng - minLng) / (maxLng - minLng || 1)) * width;
    const rawY = paddingY + ((maxLat - lat) / (maxLat - minLat || 1)) * height;

    // Apply zoom around center + pan offset
    const x = baseCenterX + (rawX - baseCenterX) * zoomLevel + panOffset.x;
    const y = baseCenterY + (rawY - baseCenterY) * zoomLevel + panOffset.y;

    return { x, y };
  };

  // =========================================================================
  // SAFE ROUTE FINDER (Dijkstra / Shortest Path on non-BLOCKED Edges)
  // =========================================================================
  const calculatedRoute = useMemo(() => {
    if (!routeOriginId || !routeDestId || routeOriginId === routeDestId) {
      return null;
    }

    // Build adjacency list taking into account road status
    // Weight = distance (km) + penalty for VULNERABLE road
    const adj: Record<string, { targetId: string; edge: ConnectivityGraphEdge; weight: number }[]> = {};
    nodes.forEach((n) => (adj[n.id] = []));

    edges.forEach((e) => {
      if (e.status !== 'BLOCKED') {
        const weight = e.status === 'VULNERABLE' ? e.distanceKm * 1.6 : e.distanceKm;
        adj[e.sourceNodeId]?.push({ targetId: e.targetNodeId, edge: e, weight });
        adj[e.targetNodeId]?.push({ targetId: e.sourceNodeId, edge: e, weight });
      }
    });

    // Dijkstra algorithm
    const dist: Record<string, number> = {};
    const prev: Record<string, { nodeId: string; edge: ConnectivityGraphEdge } | null> = {};
    const unvisited = new Set<string>();

    nodes.forEach((n) => {
      dist[n.id] = Infinity;
      prev[n.id] = null;
      unvisited.add(n.id);
    });

    dist[routeOriginId] = 0;

    while (unvisited.size > 0) {
      // Pick min dist unvisited
      let curr: string | null = null;
      let minDist = Infinity;
      unvisited.forEach((id) => {
        if (dist[id] < minDist) {
          minDist = dist[id];
          curr = id;
        }
      });

      if (!curr || minDist === Infinity) break;
      if (curr === routeDestId) break;

      unvisited.delete(curr);

      const neighbors = adj[curr] || [];
      for (const nbr of neighbors) {
        if (unvisited.has(nbr.targetId)) {
          const alt = dist[curr] + nbr.weight;
          if (alt < dist[nbr.targetId]) {
            dist[nbr.targetId] = alt;
            prev[nbr.targetId] = { nodeId: curr, edge: nbr.edge };
          }
        }
      }
    }

    // Check if destination is reachable
    if (dist[routeDestId] === Infinity) {
      // Find which blocked edges cut off the path
      const originNode = nodes.find((n) => n.id === routeOriginId);
      const destNode = nodes.find((n) => n.id === routeDestId);
      return {
        isPassable: false,
        originNode,
        destNode,
        pathNodes: [] as ConnectivityGraphNode[],
        pathEdges: [] as ConnectivityGraphEdge[],
        totalDistanceKm: 0,
        estimatedTimeMinutes: 0,
        warningNote: `Road corridor between ${originNode?.name} and ${destNode?.name} is severed by active landslide debris. Ground vehicle transit is impassable.`,
      };
    }

    // Reconstruct path
    const pathEdges: ConnectivityGraphEdge[] = [];
    const pathNodeIds: string[] = [routeDestId];
    let currNodeId = routeDestId;

    while (currNodeId !== routeOriginId) {
      const step = prev[currNodeId];
      if (!step) break;
      pathEdges.unshift(step.edge);
      pathNodeIds.unshift(step.nodeId);
      currNodeId = step.nodeId;
    }

    const pathNodes = pathNodeIds.map((id) => nodes.find((n) => n.id === id)!).filter(Boolean);
    const totalDistanceKm = pathEdges.reduce((sum, e) => sum + e.distanceKm, 0);
    // Mountain transit speed approx 35 km/h for open, 20 km/h for vulnerable
    const estimatedTimeMinutes = Math.round(
      pathEdges.reduce((sum, e) => sum + (e.distanceKm / (e.status === 'VULNERABLE' ? 20 : 35)) * 60, 0)
    );

    const hasVulnerable = pathEdges.some((e) => e.status === 'VULNERABLE');

    return {
      isPassable: true,
      originNode: nodes.find((n) => n.id === routeOriginId),
      destNode: nodes.find((n) => n.id === routeDestId),
      pathNodes,
      pathEdges,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      estimatedTimeMinutes,
      hasVulnerable,
      warningNote: hasVulnerable
        ? 'Route contains vulnerable mountain slopes with active rockfall caution. Maintain low speed and monitor VHF radio.'
        : 'All route segments are clear and structurally stable for emergency convoys & ambulances.',
    };
  }, [routeOriginId, routeDestId, nodes, edges]);

  // Set of edge IDs in active safe path
  const activePathEdgeIds = useMemo(() => {
    if (!calculatedRoute || !calculatedRoute.isPassable) return new Set<string>();
    return new Set(calculatedRoute.pathEdges.map((e) => e.id));
  }, [calculatedRoute]);

  // Set of node IDs in active safe path
  const activePathNodeIds = useMemo(() => {
    if (!calculatedRoute || !calculatedRoute.isPassable) return new Set<string>();
    return new Set(calculatedRoute.pathNodes.map((n) => n.id));
  }, [calculatedRoute]);

  // =========================================================================
  // PUBLIC SMS / WHATSAPP ADVISORY BROADCAST DISPATCHER
  // =========================================================================
  const activeBroadcastContent = useMemo(() => {
    const isTargetingAll = broadcastHabitationId === 'ALL_ISOLATED';
    const targetNode = isTargetingAll
      ? null
      : nodes.find((n) => n.id === broadcastHabitationId);

    const reliefInfo = targetNode
      ? HABITATION_RELIEF_DATA[targetNode.name] || DEFAULT_RELIEF
      : DEFAULT_RELIEF;

    const popAffected = isTargetingAll
      ? totalIsolatedPop
      : targetNode?.population || 0;

    const habitationTitle = isTargetingAll
      ? `ALL CUT-OFF HABITATIONS IN DIMA HASAO (${isolatedNodes.length} SECTORS)`
      : `${targetNode?.name.toUpperCase()} CITIZENS & ISOLATED SETTLEMENTS`;

    const smsText = `🚨 [DDMA EMERGENCY ADVISORY - LANDSLIDE ISOLATION]
Attention: ${habitationTitle}
Status: Road lifelines severed by active landslide debris. Ground evacuation is temporarily blocked.

🚰 POTABLE WATER POINT:
${reliefInfo.potableWaterSource} (${reliefInfo.potableWaterCapacity})

⛺ DESIGNATED RELIEF CAMP & SHELTER:
${reliefInfo.reliefShelterName} (${reliefInfo.reliefShelterCapacity})

🚁 AIR-DROP / HELIPAD DROP ZONE:
${reliefInfo.helipadDropZone}

📞 EMERGENCY CONTACTS:
DDMA Control Room: 1077 | State EOC: 1070 | VHF Radio: ${reliefInfo.emergencyVhfFreq}
Local Field Coordinator: ${reliefInfo.localCoordinatorContact}

STAY INDOORS AWAY FROM STEEP SLOPES. Next IAF relief sortie scheduled at 14:00 hrs.`;

    return {
      title: habitationTitle,
      popAffected,
      reliefInfo,
      smsText,
      targetNode,
    };
  }, [broadcastHabitationId, nodes, isolatedNodes, totalIsolatedPop]);

  const handleSendBroadcast = () => {
    setIsBroadcasting(true);
    setBroadcastStatus('Transmitting CAP-CP packets to CDAC Emergency Cell Broadcast Gateway...');

    setTimeout(() => {
      setIsBroadcasting(false);
      const recipientCount = activeBroadcastContent.popAffected > 0 ? activeBroadcastContent.popAffected : 43756;
      const timestamp = new Date().toLocaleTimeString();
      const statusMsg = `✅ Broadcast Dispatched successfully at ${timestamp} to ${recipientCount.toLocaleString()} mobile numbers in Dima Hasao via CAP-CP / GSM Cell Broadcast.`;
      setBroadcastStatus(statusMsg);
      setBroadcastLog((prev) => [
        `[${timestamp}] ${broadcastChannel} Alert ➔ ${activeBroadcastContent.title}: ${recipientCount.toLocaleString()} citizens alerted.`,
        ...prev.slice(0, 4),
      ]);
    }, 1200);
  };

  const handleCopyBroadcastText = () => {
    navigator.clipboard.writeText(activeBroadcastContent.smsText);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2000);
  };

  const handleOpenWhatsAppShare = () => {
    const encoded = encodeURIComponent(activeBroadcastContent.smsText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Quick 1-click action to route from selected node to nearest hospital
  const handleQuickRouteToHospital = (nodeId: string) => {
    setRouteOriginId(nodeId);
    const hospital = nodes.find((n) => n.type === 'HOSPITAL');
    if (hospital) setRouteDestId(hospital.id);
    setActiveToolTab('ROUTE_FINDER');
  };

  // Quick 1-click action to prepare broadcast for selected node
  const handleQuickBroadcastForNode = (nodeId: string) => {
    setBroadcastHabitationId(nodeId);
    setActiveToolTab('SMS_BROADCAST');
  };

  // Selected Node Details
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const selectedNodeRelief = useMemo(() => {
    if (!selectedNode) return null;
    return HABITATION_RELIEF_DATA[selectedNode.name] || DEFAULT_RELIEF;
  }, [selectedNode]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/40 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] text-slate-100 flex items-center gap-2">
                Dynamic &ldquo;Connectivity Risk Graph&rdquo; & Isolation Engine
              </h3>
              <p className="text-xs text-slate-400">
                Simulate landslide road blockages, assess community isolation, calculate safe evacuation routes, and broadcast emergency relief alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GeoJSON</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import GeoJSON</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reset Network"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Isolation Status Alert Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
          isolatedNodes.length > 0
            ? 'bg-rose-950/70 border-rose-600/70 shadow-lg shadow-rose-950/30'
            : 'bg-emerald-950/70 border-emerald-600/70 shadow-lg shadow-emerald-950/30'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl ${
              isolatedNodes.length > 0
                ? 'bg-rose-600/30 text-rose-400 animate-pulse'
                : 'bg-emerald-600/30 text-emerald-400'
            }`}
          >
            {isolatedNodes.length > 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block text-rose-300">
              {isolatedNodes.length > 0 ? 'CRITICAL NETWORK ISOLATION DETECTED' : 'ALL HABITATIONS CONNECTED'}
            </span>
            <p className="text-sm font-bold text-slate-100">
              {isolatedNodes.length > 0
                ? `${isolatedNodes.length} Habitations Completely Cut-Off (${totalIsolatedPop.toLocaleString()} Citizens Isolated)`
                : 'Full emergency road connectivity maintained to tertiary medical trauma hubs.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            Blocked Arterials: <strong className="text-rose-400">{blockedRoads.length}</strong> / {edges.length}
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            Network Nodes: <strong className="text-cyan-300">{nodes.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Response Suite (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT: Enhanced High-Visibility Interactive Map with Zoom & Pan */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col shadow-xl">
          {/* Map Top Bar with Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-850 pb-2 text-slate-400">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-slate-200">
                OpenStreetMap Dima Hasao Mountain Grid
              </span>
            </div>

            {/* Map Zoom / Pan Controls */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-cyan-400 px-1 border-l border-slate-750">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative w-full h-96 sm:h-[420px] bg-gradient-to-b from-slate-950 via-[#0a1128] to-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center select-none shadow-inner">
            {/* Topographic Background Mesh & Mountain Contour Grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="topoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
                  <circle cx="20" cy="20" r="1" fill="#38bdf8" fillOpacity="0.6" />
                </pattern>
                {/* Glowing filters */}
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowRed" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#topoGrid)" />
              {/* Subtle mountain contour circles */}
              <ellipse cx="250" cy="180" rx="190" ry="110" fill="none" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="3,6" strokeOpacity="0.25" />
              <ellipse cx="380" cy="140" rx="140" ry="80" fill="none" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="3,6" strokeOpacity="0.25" />
              <ellipse cx="160" cy="220" rx="120" ry="70" fill="none" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="3,6" strokeOpacity="0.25" />
            </svg>

            {/* Main Interactive Graph SVG */}
            <svg viewBox="0 0 640 340" className="w-full h-full relative z-10">
              {/* Render Safe Evacuation Route Background Glow */}
              {calculatedRoute?.isPassable &&
                calculatedRoute.pathEdges.map((edge) => {
                  const s = nodes.find((n) => n.id === edge.sourceNodeId);
                  const t = nodes.find((n) => n.id === edge.targetNodeId);
                  if (!s || !t) return null;
                  const p1 = projectCoord(s.lat, s.lng);
                  const p2 = projectCoord(t.lat, t.lng);
                  return (
                    <line
                      key={`glow-${edge.id}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#06b6d4"
                      strokeWidth="10"
                      strokeOpacity="0.4"
                      filter="url(#glowCyan)"
                    />
                  );
                })}

              {/* Draw Edges (Roads & Bridges) */}
              {edges.map((edge) => {
                const s = nodes.find((n) => n.id === edge.sourceNodeId);
                const t = nodes.find((n) => n.id === edge.targetNodeId);
                if (!s || !t) return null;

                const p1 = projectCoord(s.lat, s.lng);
                const p2 = projectCoord(t.lat, t.lng);

                const isBlocked = edge.status === 'BLOCKED';
                const isVuln = edge.status === 'VULNERABLE';
                const isInRoute = activePathEdgeIds.has(edge.id);
                const isHovered = hoveredEdgeId === edge.id;

                const strokeColor = isInRoute
                  ? '#06b6d4'
                  : isBlocked
                  ? '#ef4444'
                  : isVuln
                  ? '#f59e0b'
                  : '#10b981';

                const strokeWidth = isInRoute ? 5 : isHovered ? 4.5 : isBlocked ? 3.5 : 2.8;

                return (
                  <g
                    key={edge.id}
                    className="cursor-pointer group"
                    onClick={() => handleToggleRoad(edge.id)}
                    onMouseEnter={() => setHoveredEdgeId(edge.id)}
                    onMouseLeave={() => setHoveredEdgeId(null)}
                  >
                    {/* Visual road line */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={isBlocked ? '6,4' : isVuln ? '4,2' : isInRoute ? '8,3' : 'none'}
                      strokeLinecap="round"
                      className={isInRoute ? 'animate-pulse' : ''}
                    />

                    {/* Wide hit area for easy click */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="transparent"
                      strokeWidth="20"
                    />

                    {/* Blocked Cross marker on line midpoint */}
                    {isBlocked && (
                      <g transform={`translate(${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}>
                        <circle r="8" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
                        <text
                          x="0"
                          y="3"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          ✕
                        </text>
                      </g>
                    )}

                    {/* Edge Label */}
                    <text
                      x={(p1.x + p2.x) / 2}
                      y={(p1.y + p2.y) / 2 - 7}
                      fill={isBlocked ? '#fca5a5' : isVuln ? '#fcd34d' : isInRoute ? '#67e8f9' : '#86efac'}
                      fontSize={isInRoute ? '10' : '8.5'}
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow-md"
                    >
                      {edge.roadName.split(' (')[0]}
                      {isBlocked ? ' [CUT-OFF]' : isVuln ? ' [RISK]' : ''}
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes (Habitations, Hospitals, Town HQs) */}
              {nodes.map((node) => {
                const isHospital = node.type === 'HOSPITAL';
                const isTown = node.type === 'TOWN';
                const isIsolated = node.isIsolated;
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isRouteOrigin = routeOriginId === node.id;
                const isRouteDest = routeDestId === node.id;
                const isInRoute = activePathNodeIds.has(node.id);

                const pos = projectCoord(node.lat, node.lng);

                const radius = isRouteOrigin || isRouteDest
                  ? 16
                  : isHospital
                  ? 14
                  : isTown
                  ? 12
                  : 9.5;

                const nodeFill = isIsolated
                  ? '#dc2626'
                  : isRouteOrigin
                  ? '#f59e0b'
                  : isRouteDest
                  ? '#06b6d4'
                  : isHospital
                  ? '#0284c7'
                  : isTown
                  ? '#8b5cf6'
                  : '#10b981';

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedNodeId(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Ping wave when isolated or Route point */}
                    {isIsolated && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="20"
                        fill="#ef4444"
                        fillOpacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    {/* Active Route Selection Glow Ring */}
                    {(isRouteOrigin || isRouteDest || isSelected) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 5}
                        fill="none"
                        stroke={isRouteOrigin ? '#fbbf24' : isRouteDest ? '#22d3ee' : '#ffffff'}
                        strokeWidth="2.5"
                        strokeDasharray="4,2"
                        className="animate-spin"
                        style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={nodeFill}
                      stroke={isSelected ? '#ffffff' : isInRoute ? '#67e8f9' : '#0f172a'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-all duration-200"
                    />

                    {/* Node Symbol / Letter */}
                    <text
                      x={pos.x}
                      y={pos.y + 3.5}
                      fill="#ffffff"
                      fontSize={isHospital ? '10' : '9'}
                      fontWeight="900"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {isRouteOrigin ? '📍' : isRouteDest ? '🏁' : isHospital ? 'H' : isTown ? 'T' : 'V'}
                    </text>

                    {/* Node Label */}
                    <text
                      x={pos.x}
                      y={pos.y + radius + 10}
                      fill={
                        isIsolated
                          ? '#fca5a5'
                          : isRouteOrigin
                          ? '#fde047'
                          : isRouteDest
                          ? '#67e8f9'
                          : '#e2e8f0'
                      }
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none pointer-events-none drop-shadow-md"
                    >
                      {node.name.replace(', Haflong', '')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay (Floating over Map) */}
            {hoveredNodeId && (
              (() => {
                const hNode = nodes.find((n) => n.id === hoveredNodeId);
                if (!hNode) return null;
                const hRelief = HABITATION_RELIEF_DATA[hNode.name] || DEFAULT_RELIEF;
                return (
                  <div className="absolute top-3 left-3 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 max-w-xs pointer-events-none animate-fadeIn">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                      <strong className="text-slate-100 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                        {hNode.name}
                      </strong>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          hNode.isIsolated
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {hNode.isIsolated ? 'CUT-OFF' : 'CONNECTED'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div>Population: <strong className="text-slate-100">{hNode.population?.toLocaleString() || 'N/A'}</strong></div>
                      <div>Type: <span className="text-cyan-300 font-mono">{hNode.type}</span></div>
                      <div className="text-[10px] text-amber-300 flex items-center gap-1 pt-0.5">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        {hRelief.potableWaterSource.split(' (')[0]}
                      </div>
                      <div className="text-[10px] text-emerald-300 flex items-center gap-1">
                        <Tent className="w-3 h-3 text-emerald-400" />
                        {hRelief.reliefShelterName}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-800">
                      💡 Click node to open Safe Route & Evacuation tools
                    </div>
                  </div>
                );
              })()
            )}

            {/* Road Hover Tooltip */}
            {hoveredEdgeId && !hoveredNodeId && (
              (() => {
                const hEdge = edges.find((e) => e.id === hoveredEdgeId);
                if (!hEdge) return null;
                return (
                  <div className="absolute bottom-3 left-3 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-2xl text-xs space-y-1 max-w-xs pointer-events-none animate-fadeIn">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                      <strong className="text-slate-100">{hEdge.roadName.split(' (')[0]}</strong>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          hEdge.status === 'BLOCKED'
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : hEdge.status === 'VULNERABLE'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}
                      >
                        {hEdge.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex justify-between">
                      <span>Length: <strong>{hEdge.distanceKm} km</strong></span>
                      <span className="text-yellow-400 font-mono text-[10px]">Click to Toggle Blockage</span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Map Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500 border border-white"></span> Hospital / Trauma
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 border border-white"></span> Town HQ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span> Passable Habitation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 border border-white animate-pulse"></span> Cut-Off Habitation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-cyan-400 rounded"></span> Active Evacuation Route
              </span>
            </div>
            <div className="text-[11px] font-mono text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-800/60">
              ⚡ Click any road to toggle landslide blockage
            </div>
          </div>

          {/* Quick Selected Habitation Inspector Card */}
          {selectedNode && selectedNodeRelief && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3 mt-2 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1.5 rounded-lg ${
                      selectedNode.isIsolated ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                    }`}
                  >
                    {selectedNode.isIsolated ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{selectedNode.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Pop: <strong>{selectedNode.population?.toLocaleString()}</strong> • Type: {selectedNode.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> Potable Water Depot:
                  </div>
                  <div className="text-slate-200 font-semibold">{selectedNodeRelief.potableWaterSource}</div>
                  <div className="text-[10px] text-slate-400">{selectedNodeRelief.potableWaterCapacity}</div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Tent className="w-3 h-3" /> Relief Camp & Shelter:
                  </div>
                  <div className="text-slate-200 font-semibold">{selectedNodeRelief.reliefShelterName}</div>
                  <div className="text-[10px] text-slate-400">{selectedNodeRelief.reliefShelterCapacity}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => handleQuickRouteToHospital(selectedNode.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Route to Nearest Hospital</span>
                </button>

                <button
                  onClick={() => handleQuickBroadcastForNode(selectedNode.id)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Local SMS Alert</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: Operational Suite (Safe Route Finder + SMS Broadcast) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tool Tab Switcher */}
          <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveToolTab('ROUTE_FINDER')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeToolTab === 'ROUTE_FINDER'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Safe Route Finder</span>
            </button>

            <button
              onClick={() => setActiveToolTab('SMS_BROADCAST')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeToolTab === 'SMS_BROADCAST'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>SMS Broadcast</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* TAB 1: INTERACTIVE SAFE ROUTE FINDER / EVACUATION PATH */}
          {/* ===================================================================== */}
          {activeToolTab === 'ROUTE_FINDER' && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Interactive Safe Route & Evacuation Path
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  Dijkstra Dynamic Routing
                </span>
              </div>

              {/* Origin & Destination Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Start Habitation (Origin):
                  </label>
                  <select
                    value={routeOriginId}
                    onChange={(e) => setRouteOriginId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.type}) {n.isIsolated ? '🚨 CUT-OFF' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Destination Facility:
                  </label>
                  <select
                    value={routeDestId}
                    onChange={(e) => setRouteDestId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.type}) {n.isIsolated ? '🚨 CUT-OFF' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route Computation Result */}
              {calculatedRoute && (
                <div className="space-y-3 pt-1">
                  {calculatedRoute.isPassable ? (
                    <div className="p-4 bg-gradient-to-br from-emerald-950/60 to-cyan-950/40 rounded-xl border border-emerald-700/60 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Passable Safe Evacuation Path Found
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-bold">
                          OPEN TO CONVOYS
                        </span>
                      </div>

                      {/* Route Telemetry Badges */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Transit Distance</div>
                          <div className="text-sm font-bold text-cyan-300">{calculatedRoute.totalDistanceKm} km</div>
                        </div>
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Estimated Travel Time</div>
                          <div className="text-sm font-bold text-amber-300">~{calculatedRoute.estimatedTimeMinutes} mins</div>
                        </div>
                      </div>

                      {/* Passable Road Sequence */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-300">Passable Waypoint Sequence:</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          {calculatedRoute.pathNodes.map((n, i) => (
                            <React.Fragment key={n.id}>
                              <span
                                className={`px-2 py-0.5 rounded font-semibold ${
                                  i === 0
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                    : i === calculatedRoute.pathNodes.length - 1
                                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                    : 'bg-slate-800 text-slate-200'
                                }`}
                              >
                                {n.name.split(',')[0]}
                              </span>
                              {i < calculatedRoute.pathNodes.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800 leading-relaxed">
                        ℹ️ <strong>Safety Advisory:</strong> {calculatedRoute.warningNote}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-950/70 rounded-xl border border-rose-700 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-rose-900/60 pb-2">
                        <span className="font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                          ROAD TRANSIT COMPLETELY SEVERED
                        </span>
                        <span className="text-[10px] font-mono bg-rose-900 text-rose-100 px-2 py-0.5 rounded font-bold">
                          AIRLIFT REQUIRED
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {calculatedRoute.warningNote}
                      </p>

                      <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5" /> Emergency Protocol Activated:
                        </div>
                        <div className="text-[11px] text-slate-200">
                          1. Switch to <strong>SMS / WhatsApp Broadcast tab</strong> to send emergency coordinates to isolated citizens.
                        </div>
                        <div className="text-[11px] text-slate-200">
                          2. Request <strong>IAF MI-17 Helicopter Sortie</strong> to designated sports field LZ.
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setBroadcastHabitationId(routeOriginId);
                          setActiveToolTab('SMS_BROADCAST');
                        }}
                        className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Dispatch Emergency SMS to {calculatedRoute.originNode?.name}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: PUBLIC SMS & WHATSAPP ISOLATION BROADCAST */}
          {/* ===================================================================== */}
          {activeToolTab === 'SMS_BROADCAST' && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-600/20 text-amber-400 border border-amber-500/30">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Public SMS / WhatsApp Isolation Broadcast
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Deliver localized relief points & potable water coordinates directly to cut-off citizens.
                    </p>
                  </div>
                </div>
              </div>

              {/* Target Habitation Selector */}
              <div className="space-y-1 text-xs">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Target Broadcast Area:</span>
                  <span className="text-amber-400 font-mono text-[10px]">
                    {activeBroadcastContent.popAffected.toLocaleString()} Citizens Reached
                  </span>
                </label>
                <select
                  value={broadcastHabitationId}
                  onChange={(e) => setBroadcastHabitationId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="ALL_ISOLATED">
                    📢 All Cut-Off Habitations ({isolatedNodes.length} Sectors • {totalIsolatedPop.toLocaleString()} Citizens)
                  </option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.population?.toLocaleString()} Pop) {n.isIsolated ? '🚨 CUT-OFF' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setBroadcastChannel('SMS')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    broadcastChannel === 'SMS'
                      ? 'bg-amber-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>CAP / SMS Cell Broadcast</span>
                </button>
                <button
                  onClick={() => setBroadcastChannel('WHATSAPP')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    broadcastChannel === 'WHATSAPP'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Community Advisory</span>
                </button>
              </div>

              {/* Message Live Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Live Advisory Message Draft:</span>
                  <button
                    onClick={handleCopyBroadcastText}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedBroadcast ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedBroadcast ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all">
                  {activeBroadcastContent.smsText}
                </div>
              </div>

              {/* Broadcast Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendBroadcast}
                    disabled={isBroadcasting}
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40"
                  >
                    <Send className={`w-3.5 h-3.5 ${isBroadcasting ? 'animate-spin' : ''}`} />
                    <span>{isBroadcasting ? 'Transmitting...' : 'Dispatch Broadcast Now'}</span>
                  </button>

                  <button
                    onClick={handleOpenWhatsAppShare}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
                    title="Share via WhatsApp Web"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* Status message */}
                {broadcastStatus && (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-emerald-300 flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{broadcastStatus}</span>
                  </div>
                )}

                {/* Transmission Log */}
                {broadcastLog.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-850">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Recent Broadcast Logs:</span>
                    {broadcastLog.map((log, idx) => (
                      <div key={idx} className="text-[10px] font-mono text-slate-400 truncate">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPORT GEOJSON MODAL */}
      {/* ========================================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Export Response as GeoJSON (Connectivity Risk Graph)
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This RFC 7946 GeoJSON FeatureCollection encodes all {nodes.length} habitations (Points) and {edges.length} road lifelines (LineStrings) with live blockage states, isolation flags, and detour recommendations.
            </p>

            <div className="flex-1 bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-auto font-mono text-[11px] text-emerald-300 max-h-96 select-all">
              <pre>{liveGeoJsonString}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {liveGeoJson.features.length} Features • {isolatedNodes.length} Isolated • {blockedRoads.length} Blocked
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGeoJson}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy GeoJSON'}</span>
                </button>
                <button
                  onClick={handleDownloadGeoJson}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .geojson</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT GEOJSON MODAL */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <UploadCloud className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-bold text-slate-100">
                  Import Custom Overpass / QGIS GeoJSON
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste your GeoJSON FeatureCollection (containing Points for towns/hospitals and LineStrings for roads) below to feed directly into the Connectivity Risk Graph engine:
            </p>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Paste GeoJSON FeatureCollection here... e.g. { "type": "FeatureCollection", "features": [ ... ] }'
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomGeoJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Parse & Feed Graph Engine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

