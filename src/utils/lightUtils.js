export function kelvinToColor(kelvin) {
  const k = Math.max(2700, Math.min(6500, kelvin));
  if (k <= 2700) return { r: 255, g: 197, b: 90 };
  if (k <= 3500) {
    const t = (k - 2700) / 800;
    return {
      r: 255,
      g: Math.round(197 + t * (228 - 197)),
      b: Math.round(90 + t * (170 - 90)),
    };
  }
  if (k <= 4000) {
    const t = (k - 3500) / 500;
    return {
      r: 255,
      g: Math.round(228 + t * (244 - 228)),
      b: Math.round(170 + t * (220 - 170)),
    };
  }
  if (k <= 5000) {
    const t = (k - 4000) / 1000;
    return {
      r: Math.round(255 + t * (240 - 255)),
      g: Math.round(244 + t * (248 - 244)),
      b: Math.round(220 + t * (255 - 220)),
    };
  }
  const t = (k - 5000) / 1500;
  return {
    r: Math.round(240 + t * (200 - 240)),
    g: Math.round(248 + t * (225 - 248)),
    b: 255,
  };
}

export function kelvinToRgbString(kelvin) {
  const { r, g, b } = kelvinToColor(kelvin);
  return `rgb(${r}, ${g}, ${b})`;
}

export function kelvinToHex(kelvin) {
  const { r, g, b } = kelvinToColor(kelvin);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function lumensToGlowSize(lumens, cellSize) {
  const minLumens = 200;
  const maxLumens = 5000;
  const minSize = cellSize * 1.2;
  const maxSize = cellSize * 6;
  const t = (lumens - minLumens) / (maxLumens - minLumens);
  return Math.round(minSize + t * (maxSize - minSize));
}

export const ROOM_TARGETS = {
  'Living Room': 20,
  'Bedroom': 20,
  'Kitchen': 50,
  'Bathroom': 70,
  'Office': 50,
  'Garage': 50,
};

// Recommended Kelvin temperature ranges per room type [min, max]
export const ROOM_KELVIN_RANGES = {
  'Living Room': [2700, 3000],
  'Bedroom': [2700, 3000],
  'Kitchen': [4000, 5000],
  'Bathroom': [3000, 4000],
  'Office': [4000, 5000],
  'Garage': [4000, 5000],
};

export function getLightingStatus(density, targetDensity) {
  const ratio = density / targetDensity;
  if (ratio < 0.8) return 'under';
  if (ratio <= 1.2) return 'ideal';
  return 'over';
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}
