import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export function createRoomIcon() {
  return L.icon({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const TILE_PROVIDERS = [
  {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: OSM_ATTRIBUTION,
    subdomains: "abc",
  },
  {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
    attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    subdomains: "abcd",
  },
  {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: `${OSM_ATTRIBUTION} &copy; HOT`,
    subdomains: "abc",
  },
];

export function createOsmMap(element, position, zoom = 13) {
  const map = L.map(element, { zoomControl: true, attributionControl: true }).setView(position, zoom, {
    animate: false,
  });
  let providerIndex = 0;
  let tileErrors = 0;
  let tileLayer = createTileLayer(providerIndex);
  tileLayer.addTo(map);

  function createTileLayer(index) {
    const provider = TILE_PROVIDERS[index];
    const layer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19,
      subdomains: provider.subdomains,
    });
    layer.on("tileerror", () => {
      tileErrors += 1;
      if (tileErrors < 3 || providerIndex >= TILE_PROVIDERS.length - 1) return;
      tileErrors = 0;
      map.removeLayer(layer);
      providerIndex += 1;
      tileLayer = createTileLayer(providerIndex);
      tileLayer.addTo(map);
    });
    return layer;
  }

  map.whenReady(() => {
    if (map._mapPane) map.invalidateSize();
  });

  return map;
}

export async function searchPlace(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "in");
  url.searchParams.set("q", query.trim());

  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!response.ok) throw new Error("Place search failed. Please try again.");
  const results = await response.json();
  if (!results.length) return null;

  const place = results[0];
  return {
    position: { lat: Number(place.lat), lng: Number(place.lon) },
    label: place.display_name,
  };
}

export async function reverseGeocodeOsm(position) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(position.lat));
  url.searchParams.set("lon", String(position.lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!response.ok) return "";
  const result = await response.json();
  return result.display_name || "";
}
