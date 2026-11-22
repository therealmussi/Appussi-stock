export const ROAD_X = [-180, -90, 0, 90, 180];
export const ROAD_Z = [-180, -135, -90, -45, 45, 90, 135, 180];
export const ROAD_HALF = 7;
export const LANE = 3.5;
export const RIVER_HALF = 24;
export const QUAI_OUT = 38;
export const MAP_LIMIT = 236;
export const MAP_RANGE = 250;
export const DAY_LENGTH = 300;

export const BRIDGE_X = ROAD_X;

export const PARK = { cx: -135, cz: 112.5, x1: -173, z1: 97, x2: -97, z2: 128 };
export const PLAZA = { cx: 135, cz: -67.5, r: 34 };
export const EIFFEL = { x: -135, z: 112.5 };
export const ARC = { x: 135, z: -67.5 };
export const REFUGE = { x: -122, z: 112 };

export const VEHICLE_TYPES = {
  compact: {
    key: 'compact', name: 'Citroën Amie', maxSpeed: 27, accel: 15, brake: 26, reverseMax: 9,
    grip: 7.5, handbrakeGrip: 1.6, steer: 2.6, radius: 2.0, camDist: 9, camHeight: 3.2,
    engineBase: 55, engineGain: 5.5, width: 1.9, height: 1.3, length: 4.1, cabPos: 0.15,
    colors: [0xc0392b, 0x2980b9, 0x27ae60, 0xe0e0e0, 0xf1c40f, 0x2c2c34]
  },
  sport: {
    key: 'sport', name: 'Bugatti Riviera', maxSpeed: 39, accel: 23, brake: 30, reverseMax: 11,
    grip: 9.0, handbrakeGrip: 1.9, steer: 2.25, radius: 2.1, camDist: 10.5, camHeight: 3.0,
    engineBase: 75, engineGain: 8.0, width: 2.0, height: 1.05, length: 4.5, cabPos: -0.35,
    colors: [0xd42a2a, 0x111111, 0xf6f6f6, 0xffa500]
  },
  van: {
    key: 'van', name: 'Furgone Bagagère', maxSpeed: 20, accel: 9.5, brake: 22, reverseMax: 8,
    grip: 6.2, handbrakeGrip: 1.4, steer: 1.9, radius: 2.45, camDist: 11.5, camHeight: 4.0,
    engineBase: 45, engineGain: 4.0, width: 2.2, height: 2.3, length: 5.2, cabPos: 1.1,
    colors: [0x8890a0, 0x7a5c3a, 0x4a6d8c]
  },
  police: {
    key: 'police', name: 'Gendarmerie', maxSpeed: 33, accel: 19, brake: 30, reverseMax: 10,
    grip: 8.8, handbrakeGrip: 2.0, steer: 2.5, radius: 2.1, camDist: 10, camHeight: 3.2,
    engineBase: 60, engineGain: 6.5, width: 2.0, height: 1.35, length: 4.6, cabPos: 0,
    colors: [0x10135a]
  }
};

export const PED_COLORS = [0x6a4fbd, 0x30729b, 0x9b3030, 0x30965a, 0xb59a2f, 0x555a66, 0x8f5560];

export const COURIER_DEPOTS = [
  { x: 0, z: 168 }, { x: -180, z: -60 }, { x: 180, z: 60 },
  { x: 0, z: -168 }, { x: 90, z: 168 }, { x: -180, z: 168 }
];

export const RACE_CHECKPOINTS = [
  { x: -90, z: -45 }, { x: 0, z: -45 }, { x: 0, z: 90 },
  { x: 90, z: 90 }, { x: 90, z: -90 }, { x: 0, z: -90 }
];
export const RACE_GRID = { x: -90, z: 67.5, heading: Math.PI };

export const MISSION_SPOTS = [
  { type: 'courier', x: 0, z: 120, label: 'Corriere Espresso' },
  { type: 'race', x: -90, z: 67.5, label: 'Corsa Clandestina' },
  { type: 'getaway', x: 180, z: 135, label: 'Fuga dalla Gendarmerie' }
];
