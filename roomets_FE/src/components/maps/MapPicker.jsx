import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import MyLocationRounded from "@mui/icons-material/MyLocationRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { CHENNAI_CENTER, getCurrentPosition } from "../../utils/geo";
import { createOsmMap, createRoomIcon, reverseGeocodeOsm, searchPlace } from "../../utils/osm";

const MapPicker = ({ open, initial, onClose, onSelect }) => {
  const [mapNode, setMapNode] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const placeMarkerRef = useRef(null);

  const initialLatitude = initial?.latitude;
  const initialLongitude = initial?.longitude;

  const [selected, setSelected] = useState(initial || null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!open || !mapNode) return undefined;

    let active = true;
    const hasInitial =
      initialLatitude != null &&
      initialLongitude != null &&
      Number.isFinite(Number(initialLatitude)) &&
      Number.isFinite(Number(initialLongitude));
    const center = hasInitial
      ? { lat: Number(initialLatitude), lng: Number(initialLongitude) }
      : { lat: CHENNAI_CENTER.latitude, lng: CHENNAI_CENTER.longitude };

    const map = createOsmMap(mapNode, center, hasInitial ? 15 : 13);
    mapRef.current = map;

    const placeMarker = async (position, { reverse = true } = {}) => {
      markerRef.current?.remove();
      const marker = L.marker(position, {
        draggable: true,
        title: "Selected location",
        icon: createRoomIcon(),
      }).addTo(map);
      marker.on("dragend", () => placeMarker(marker.getLatLng()));
      markerRef.current = marker;

      const coordinates = { latitude: position.lat, longitude: position.lng };
      setSelected((previous) => ({ location: previous?.location || "", ...coordinates }));
      if (!reverse) return;

      setWorking(true);
      try {
        const address = await reverseGeocodeOsm(position);
        if (!active) return;
        setSelected((previous) => ({
          ...previous,
          ...coordinates,
          location:
            address ||
            previous?.location ||
            `Picked location (${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)})`,
        }));
      } finally {
        if (active) setWorking(false);
      }
    };
    placeMarkerRef.current = placeMarker;

    const handleMapClick = (event) => placeMarker(event.latlng);
    map.on("click", handleMapClick);

    if (hasInitial) placeMarker(center, { reverse: false });

    return () => {
      active = false;
      map.off("click", handleMapClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      placeMarkerRef.current = null;
    };
  }, [open, mapNode, initialLatitude, initialLongitude]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setWorking(true);
    setMessage("");
    try {
      const result = await searchPlace(query);
      if (!result) {
        setMessage("No matching place found. Try a different search.");
        return;
      }
      mapRef.current?.setView(result.position, 16);
      setQuery(result.label);
      placeMarkerRef.current?.(result.position);
    } catch (error) {
      setMessage(error?.message || "Place search failed. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  const handleUseMyLocation = async () => {
    setWorking(true);
    setMessage("");
    try {
      const position = await getCurrentPosition();
      const latLng = { lat: position.latitude, lng: position.longitude };
      mapRef.current?.setView(latLng, 16);
      placeMarkerRef.current?.(latLng);
    } catch (error) {
      setMessage(error?.message || "Unable to get your current location.");
    } finally {
      setWorking(false);
    }
  };

  const updateCoordinate = (field, value) => {
    const next = { location: selected?.location || "", ...selected, [field]: Number(value) };
    setSelected(next);
    if (Number.isFinite(next.latitude) && Number.isFinite(next.longitude)) {
      placeMarkerRef.current?.({ lat: next.latitude, lng: next.longitude }, { reverse: false });
    }
  };

  const confirm = () => {
    if (!Number.isFinite(Number(selected?.latitude)) || !Number.isFinite(Number(selected?.longitude))) {
      setMessage("Choose a point on the map, use your location, or enter valid coordinates.");
      return;
    }
    onSelect({
      location:
        selected.location?.trim() ||
        `Picked location (${Number(selected.latitude).toFixed(4)}, ${Number(selected.longitude).toFixed(4)})`,
      latitude: Number(selected.latitude),
      longitude: Number(selected.longitude),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setMessage("");
        onClose();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Choose location on OpenStreetMap</DialogTitle>
      <DialogContent dividers>
        {message && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search area, landmark or address in Chennai"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearch();
            }}
          />
          <Button
            variant="outlined"
            startIcon={<SearchRounded />}
            onClick={handleSearch}
            disabled={working || !mapNode}
            sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            startIcon={<MyLocationRounded />}
            onClick={handleUseMyLocation}
            disabled={working || !mapNode}
            sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
          >
            My location
          </Button>
        </Box>

        <Box
          ref={setMapNode}
          sx={{
            height: 360,
            borderRadius: "14px",
            backgroundColor: "#E8EEF4",
            overflow: "hidden",
            position: "relative",
            zIndex: 0,
          }}
        />

        <Typography sx={{ fontSize: 13, color: "#667085", mt: 1.5 }}>
          Click the map to drop a pin, or drag the pin to fine-tune the exact spot.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr 1fr" }, gap: 1.5, mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Location name"
            value={selected?.location || ""}
            onChange={(event) =>
              setSelected((previous) => ({ ...previous, location: event.target.value }))
            }
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Latitude"
            value={selected?.latitude ?? ""}
            onChange={(event) => updateCoordinate("latitude", event.target.value)}
            inputProps={{ step: "any" }}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Longitude"
            value={selected?.longitude ?? ""}
            onChange={(event) => updateCoordinate("longitude", event.target.value)}
            inputProps={{ step: "any" }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={confirm}
          disabled={working}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Use this location
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MapPicker;
