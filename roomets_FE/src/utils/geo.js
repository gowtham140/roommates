export const CHENNAI_CENTER = { latitude: 13.0827, longitude: 80.2707 };

const POSITION_CACHE_MS = 120000;
let cachedPosition = null;
let cachedAt = 0;
let cachedError = null;
let cachedErrorAt = 0;

export function getCurrentPosition({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedPosition && Date.now() - cachedAt < POSITION_CACHE_MS) {
    return Promise.resolve(cachedPosition);
  }
  if (!forceRefresh && cachedError && Date.now() - cachedErrorAt < POSITION_CACHE_MS) {
    return Promise.reject(cachedError);
  }

  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        cachedPosition = next;
        cachedAt = Date.now();
        cachedError = null;
        cachedErrorAt = 0;
        resolve(next);
      },
      (error) => {
        const messages = {
          1: "Location permission denied. Enable location access in your browser settings.",
          2: "Location is unavailable. Use HTTPS or localhost and try again.",
          3: "Location request timed out. Please try again.",
        };
          cachedError = new Error(messages[error?.code] || "Unable to get your current location.");
          cachedErrorAt = Date.now();
          reject(cachedError);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function distanceKm(from, to) {
  if (!from || !to) return null;
  const latitude1 = Number(from.latitude);
  const longitude1 = Number(from.longitude);
  const latitude2 = Number(to.latitude);
  const longitude2 = Number(to.longitude);
  if ([latitude1, longitude1, latitude2, longitude2].some((value) => !Number.isFinite(value))) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(latitude2 - latitude1);
  const deltaLongitude = toRadians(longitude2 - longitude1);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(kilometers) {
  if (kilometers == null) return "";
  if (kilometers < 1) return `${Math.max(50, Math.round((kilometers * 1000) / 50) * 50)} m away`;
  return `${kilometers.toFixed(1)} km away`;
}
