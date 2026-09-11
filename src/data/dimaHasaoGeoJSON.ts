// GeoJSON FeatureCollection for Dima Hasao & Eastern Himalayan Highway Corridors
// Extracted from OpenStreetMap (Overpass Turbo) for Landslide Connectivity Risk Analysis

export const dimaHasaoGeoJSON = {
  type: "FeatureCollection",
  generator: "overpass-turbo",
  timestamp: "2026-08-31T07:46:36Z",
  features: [
    // --- NODES (TOWNS, HOSPITALS, VILLAGES) ---
    {
      type: "Feature",
      id: "node/245729854",
      properties: {
        "@id": "node/245729854",
        name: "Haflong",
        place: "town",
        type: "TOWN",
        population: 43756,
        district: "Dima Hasao",
        state: "Assam",
        importance: "District Headquarters"
      },
      geometry: { type: "Point", coordinates: [93.017599, 25.1645049] }
    },
    {
      type: "Feature",
      id: "node/7540578881",
      properties: {
        "@id": "node/7540578881",
        name: "Holy Spirit Hospital, Haflong",
        amenity: "hospital",
        type: "HOSPITAL",
        beds: 120,
        district: "Dima Hasao",
        state: "Assam",
        emergencyContact: "108"
      },
      geometry: { type: "Point", coordinates: [93.0128173, 25.1672497] }
    },
    {
      type: "Feature",
      id: "node/10222800618",
      properties: {
        "@id": "node/10222800618",
        name: "Haflong Civil Hospital",
        amenity: "hospital",
        type: "HOSPITAL",
        beds: 200,
        district: "Dima Hasao",
        state: "Assam",
        isTraumaCenter: true
      },
      geometry: { type: "Point", coordinates: [93.0111217, 25.1821635] }
    },
    {
      type: "Feature",
      id: "node/245730074",
      properties: {
        "@id": "node/245730074",
        name: "Mahur",
        place: "town",
        type: "TOWN",
        population: 18420,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.1133862, 25.1830797] }
    },
    {
      type: "Feature",
      id: "node/245731951",
      properties: {
        "@id": "node/245731951",
        name: "Maibong",
        place: "town",
        type: "TOWN",
        population: 14200,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.1332922, 25.3021275] }
    },
    {
      type: "Feature",
      id: "node/245734459",
      properties: {
        "@id": "node/245734459",
        name: "Langting",
        place: "town",
        type: "TOWN",
        population: 9600,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.1136328, 25.4972313] }
    },
    {
      type: "Feature",
      id: "node/6301170168",
      properties: {
        "@id": "node/6301170168",
        name: "Umrangso",
        place: "town",
        type: "TOWN",
        population: 10376,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [92.7342802, 25.5078273] }
    },
    {
      type: "Feature",
      id: "node/2081915203",
      properties: {
        "@id": "node/2081915203",
        name: "Jatinga",
        place: "village",
        type: "VILLAGE",
        population: 4850,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.0217299, 25.1309773] }
    },
    {
      type: "Feature",
      id: "node/6244305246",
      properties: {
        "@id": "node/6244305246",
        name: "Harangajao",
        place: "village",
        type: "VILLAGE",
        population: 6200,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [92.8571534, 25.1166986] }
    },
    {
      type: "Feature",
      id: "node/4281853611",
      properties: {
        "@id": "node/4281853611",
        name: "Laisong",
        place: "village",
        type: "VILLAGE",
        population: 3100,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.2981468, 25.2062516] }
    },
    {
      type: "Feature",
      id: "node/6240693696",
      properties: {
        "@id": "node/6240693696",
        name: "Gunjong",
        place: "village",
        type: "VILLAGE",
        population: 3400,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.0101466, 25.3175912] }
    },
    {
      type: "Feature",
      id: "node/2081915944",
      properties: {
        "@id": "node/2081915944",
        name: "Mupa",
        place: "village",
        type: "VILLAGE",
        population: 2800,
        district: "Dima Hasao",
        state: "Assam"
      },
      geometry: { type: "Point", coordinates: [93.1196532, 25.3743929] }
    },

    // --- HIGHWAY WAYS (LINESTRINGS) ---
    {
      type: "Feature",
      id: "way/239060064",
      properties: {
        "@id": "way/239060064",
        ref: "NH27",
        highway: "trunk",
        surface: "asphalt",
        name: "NH-27 East-West Arterial Corridor",
        sourceNode: "Harangajao",
        targetNode: "Jatinga",
        lengthKm: 28.4,
        landslideRisk: "CRITICAL"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [93.0026293, 25.107198],
          [93.0024628, 25.1073426],
          [93.001893, 25.1093331],
          [93.0014779, 25.1124246],
          [92.9988036, 25.1112243],
          [92.9976863, 25.1086006],
          [92.9958999, 25.1106587],
          [92.994208, 25.1075854]
        ]
      }
    },
    {
      type: "Feature",
      id: "way/311653434",
      properties: {
        "@id": "way/311653434",
        ref: "NH627",
        highway: "trunk",
        name: "NH-627 Haflong-Mahur Spine",
        sourceNode: "Jatinga",
        targetNode: "Haflong",
        lengthKm: 14.8,
        landslideRisk: "HIGH"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [93.0172661, 25.2153092],
          [93.018817, 25.2139503],
          [93.0210672, 25.2148183],
          [93.023267, 25.218241],
          [93.0237318, 25.222659],
          [93.0249283, 25.2269651],
          [93.0287552, 25.2273609],
          [93.0336669, 25.2289596],
          [93.0335113, 25.2321199],
          [93.032169, 25.2390651],
          [93.0278506, 25.2468855],
          [93.0280888, 25.2537245],
          [93.0255255, 25.258679],
          [93.0214602, 25.2701161],
          [93.0165435, 25.2746366],
          [93.0126754, 25.2851438]
        ]
      }
    },
    {
      type: "Feature",
      id: "way/384539362",
      properties: {
        "@id": "way/384539362",
        ref: "NH627",
        bridge: "yes",
        bridgeName: "Diyung Bridge",
        name: "Diyung Bridge (NH-627)",
        sourceNode: "Haflong",
        targetNode: "Mahur",
        lengthKm: 0.95,
        isBridge: true,
        landslideRisk: "CRITICAL"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [93.0222697, 25.2008893],
          [93.0225171, 25.2012866],
          [93.0227994, 25.2017406]
        ]
      }
    },
    {
      type: "Feature",
      id: "way/608668187",
      properties: {
        "@id": "way/608668187",
        ref: "SH37",
        highway: "primary",
        name: "SH-37 Mahur-Maibong Highland Pass",
        sourceNode: "Mahur",
        targetNode: "Maibong",
        lengthKm: 22.1,
        landslideRisk: "HIGH"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [93.1167507, 25.1783792],
          [93.1188418, 25.1769941],
          [93.1232782, 25.1770912],
          [93.1265934, 25.1788584],
          [93.1319108, 25.1780367],
          [93.1365913, 25.1783353],
          [93.1415856, 25.1757622],
          [93.1477225, 25.1733615],
          [93.1533632, 25.1724123],
          [93.1594813, 25.1700164],
          [93.1573637, 25.1700698]
        ]
      }
    },
    {
      type: "Feature",
      id: "way/311651805",
      properties: {
        "@id": "way/311651805",
        highway: "primary",
        name: "SH-021 Umrangso-Langting Mountain Link",
        sourceNode: "Umrangso",
        targetNode: "Langting",
        lengthKm: 34.6,
        landslideRisk: "MODERATE"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [92.6348405, 25.5301562],
          [92.6338341, 25.5322853],
          [92.6288478, 25.5358252],
          [92.6214023, 25.5360919],
          [92.6140852, 25.5280422],
          [92.6061757, 25.5190884],
          [92.5934292, 25.5142744],
          [92.5804382, 25.5111844],
          [92.564159, 25.5073195],
          [92.5452029, 25.4928804],
          [92.520078, 25.4913096],
          [92.5103679, 25.4814003],
          [92.4930314, 25.4845526],
          [92.4815664, 25.4819124],
          [92.4748461, 25.4833313]
        ]
      }
    },
    {
      type: "Feature",
      id: "way/667660345",
      properties: {
        "@id": "way/667660345",
        ref: "Nc-M-1",
        highway: "secondary",
        name: "Nc-M-1 Maibong-Laisong Rural Route",
        sourceNode: "Maibong",
        targetNode: "Laisong",
        lengthKm: 19.3,
        landslideRisk: "MODERATE"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [93.29629, 25.424805],
          [93.300662, 25.4259508],
          [93.3058923, 25.4265903],
          [93.3105647, 25.4263965],
          [93.3155537, 25.4284604],
          [93.3228493, 25.4340753],
          [93.3288735, 25.4387937],
          [93.3395272, 25.43564],
          [93.3475739, 25.4339445]
        ]
      }
    }
  ]
};
