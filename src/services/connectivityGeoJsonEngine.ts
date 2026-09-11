import { ConnectivityGraphNode, ConnectivityGraphEdge } from '../types';
import { dimaHasaoGeoJSON } from '../data/dimaHasaoGeoJSON';

export interface GeoJsonExportOptions {
  includeTelemetry?: boolean;
  includeDetours?: boolean;
  blockedEdgeIds?: string[];
  isolatedNodeIds?: string[];
}

/**
 * Parses a standard GeoJSON FeatureCollection into Nodes and Edges
 * suitable for the Connectivity Risk Graph engine.
 */
export function parseGeoJsonToConnectivityGraph(geoJson: any = dimaHasaoGeoJSON): {
  nodes: ConnectivityGraphNode[];
  edges: ConnectivityGraphEdge[];
} {
  if (!geoJson || !Array.isArray(geoJson.features)) {
    return { nodes: [], edges: [] };
  }

  const nodes: ConnectivityGraphNode[] = [];
  const edges: ConnectivityGraphEdge[] = [];

  // 1. Extract Point features as Graph Nodes
  geoJson.features.forEach((feat: any, idx: number) => {
    const props = feat.properties || {};
    const geom = feat.geometry || {};

    if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
      const [lng, lat] = geom.coordinates;
      const isHospital = props.amenity === 'hospital' || props.type === 'HOSPITAL';
      const isTown = props.place === 'town' || props.type === 'TOWN';

      const nodeType: 'VILLAGE' | 'TOWN' | 'HOSPITAL' | 'EOC_HQ' | 'HELIPAD' | 'RELIEF_CAMP' =
        isHospital ? 'HOSPITAL' : isTown ? 'TOWN' : 'VILLAGE';

      nodes.push({
        id: feat.id || props['@id'] || `node-${idx}`,
        name: props.name || props['name:en'] || `Habitation ${idx + 1}`,
        type: nodeType,
        state: (props.state as any) || 'Assam',
        population: Number(props.population) || (nodeType === 'HOSPITAL' ? 0 : nodeType === 'TOWN' ? 18000 : 3500),
        lat: Number(lat),
        lng: Number(lng),
        isIsolated: false,
      });
    }
  });

  // 2. Extract LineString features as Graph Edges
  geoJson.features.forEach((feat: any, idx: number) => {
    const props = feat.properties || {};
    const geom = feat.geometry || {};

    if (geom.type === 'LineString' && Array.isArray(geom.coordinates) && geom.coordinates.length >= 2) {
      const coords = geom.coordinates;
      const startCoord = coords[0];
      const endCoord = coords[coords.length - 1];

      // Match closest source & target nodes if not explicitly specified
      let sourceNode = nodes.find((n) => n.name === props.sourceNode) || findClosestNode(startCoord[1], startCoord[0], nodes);
      let targetNode = nodes.find((n) => n.name === props.targetNode) || findClosestNode(endCoord[1], endCoord[0], nodes, sourceNode?.id);

      if (!sourceNode && nodes.length > 0) sourceNode = nodes[idx % nodes.length];
      if (!targetNode && nodes.length > 1) targetNode = nodes[(idx + 1) % nodes.length];

      if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
        const roadRef = props.ref || props.name || `Corridor-${idx + 1}`;
        const isLifeline = props.highway === 'trunk' || props.highway === 'primary' || Boolean(props.isBridge);

        edges.push({
          id: feat.id || props['@id'] || `edge-${idx}`,
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          roadName: props.name || `${roadRef} (${sourceNode.name} - ${targetNode.name})`,
          distanceKm: props.lengthKm || Math.round(calculateHaversineDistance(sourceNode.lat, sourceNode.lng, targetNode.lat, targetNode.lng) * 10) / 10 || 12.5,
          status: 'OPEN',
          isLifeline,
          clearanceETAHours: props.landslideRisk === 'CRITICAL' ? 14 : props.landslideRisk === 'HIGH' ? 8 : 4,
          alternateDetourDistanceKm: isLifeline ? 42 : 18,
        });
      }
    }
  });

  return { nodes, edges };
}

/**
 * Calculates network isolation by running BFS from all Tertiary Care Hospitals / EOC HQs.
 */
export function calculateNetworkIsolation(
  nodes: ConnectivityGraphNode[],
  edges: ConnectivityGraphEdge[]
): {
  updatedNodes: ConnectivityGraphNode[];
  isolatedCount: number;
  isolatedPopulation: number;
  blockedCount: number;
} {
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));

  edges.forEach((e) => {
    if (e.status !== 'BLOCKED') {
      adj[e.sourceNodeId]?.push(e.targetNodeId);
      adj[e.targetNodeId]?.push(e.sourceNodeId);
    }
  });

  const hospitalIds = nodes.filter((n) => n.type === 'HOSPITAL').map((n) => n.id);
  const reachableFromHospital = new Set<string>();
  const queue = [...hospitalIds];
  hospitalIds.forEach((id) => reachableFromHospital.add(id));

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adj[curr] || [];
    neighbors.forEach((nbr) => {
      if (!reachableFromHospital.has(nbr)) {
        reachableFromHospital.add(nbr);
        queue.push(nbr);
      }
    });
  }

  const updatedNodes = nodes.map((n) => ({
    ...n,
    isIsolated: !reachableFromHospital.has(n.id) && n.type !== 'HOSPITAL',
  }));

  const isolatedNodes = updatedNodes.filter((n) => n.isIsolated);
  const isolatedPopulation = isolatedNodes.reduce((sum, n) => sum + (n.population || 0), 0);
  const blockedCount = edges.filter((e) => e.status === 'BLOCKED').length;

  return {
    updatedNodes,
    isolatedCount: isolatedNodes.length,
    isolatedPopulation,
    blockedCount,
  };
}

/**
 * Exports the live Connectivity Risk Graph state as standard RFC 7946 GeoJSON FeatureCollection
 * to feed directly into external GIS, QGIS, ArcGIS, or the Connectivity Risk Graph engine.
 */
export function exportConnectivityRiskGraphToGeoJson(
  nodes: ConnectivityGraphNode[],
  edges: ConnectivityGraphEdge[],
  options: GeoJsonExportOptions = {}
) {
  const features: any[] = [];

  // Export Nodes as Points with Isolation Telemetry
  nodes.forEach((node) => {
    features.push({
      type: 'Feature',
      id: node.id,
      properties: {
        id: node.id,
        name: node.name,
        type: node.type,
        state: node.state,
        population: node.population,
        isIsolated: Boolean(node.isIsolated),
        connectivityStatus: node.isIsolated ? 'CUT_OFF' : 'CONNECTED',
        nearestHospitalAccess: node.isIsolated ? 'UNREACHABLE_BY_ROAD' : 'DIRECT_ROAD_ACCESS',
        recommendedEmergencyAction: node.isIsolated
          ? 'Dispatch IAF Helicopter Air-Drop / SDRF Rescue Boat'
          : 'Normal Ground Transit Active',
        exportedAt: new Date().toISOString(),
      },
      geometry: {
        type: 'Point',
        coordinates: [node.lng, node.lat],
      },
    });
  });

  // Export Edges as LineStrings with Blockage & Clearance ETA
  edges.forEach((edge) => {
    const s = nodes.find((n) => n.id === edge.sourceNodeId);
    const t = nodes.find((n) => n.id === edge.targetNodeId);

    if (s && t) {
      features.push({
        type: 'Feature',
        id: edge.id,
        properties: {
          id: edge.id,
          roadName: edge.roadName,
          sourceNodeName: s.name,
          targetNodeName: t.name,
          distanceKm: edge.distanceKm,
          status: edge.status,
          isLifeline: edge.isLifeline,
          clearanceETAHours: edge.clearanceETAHours || 6,
          alternateDetourDistanceKm: edge.alternateDetourDistanceKm || 25,
          passable: edge.status !== 'BLOCKED',
          colorCode: edge.status === 'BLOCKED' ? '#ef4444' : edge.status === 'VULNERABLE' ? '#f59e0b' : '#10b981',
          exportedAt: new Date().toISOString(),
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [s.lng, s.lat],
            [t.lng, t.lat],
          ],
        },
      });
    }
  });

  return {
    type: 'FeatureCollection',
    metadata: {
      generatedBy: 'NER-LandslideWatch Connectivity Risk Engine',
      crs: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      timestamp: new Date().toISOString(),
      totalNodes: nodes.length,
      totalEdges: edges.length,
      isolatedNodesCount: nodes.filter((n) => n.isIsolated).length,
      blockedEdgesCount: edges.filter((e) => e.status === 'BLOCKED').length,
    },
    features,
  };
}

// Helpers
function findClosestNode(lat: number, lng: number, nodes: ConnectivityGraphNode[], excludeId?: string): ConnectivityGraphNode | null {
  let closest: ConnectivityGraphNode | null = null;
  let minDist = Infinity;

  for (const n of nodes) {
    if (excludeId && n.id === excludeId) continue;
    const d = calculateHaversineDistance(lat, lng, n.lat, n.lng);
    if (d < minDist) {
      minDist = d;
      closest = n;
    }
  }

  return closest;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
