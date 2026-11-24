import { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import L from "leaflet";
import { createOsmMap, createRoomIcon } from "../../utils/osm";

const MapView = ({ latitude, longitude, label, userPosition, height = 280 }) => {
  const [mapNode, setMapNode] = useState(null);
  const userLatitude = userPosition?.latitude;
  const userLongitude = userPosition?.longitude;

  useEffect(() => {
    if (latitude == null || longitude == null || !mapNode) return undefined;

    const position = { lat: Number(latitude), lng: Number(longitude) };
    const map = createOsmMap(mapNode, position, 15);
    L.marker(position, {
      title: label || "Room location",
      icon: createRoomIcon(),
    }).addTo(map);

    const hasUser =
      userLatitude != null &&
      userLongitude != null &&
      Number.isFinite(Number(userLatitude)) &&
      Number.isFinite(Number(userLongitude));

    if (hasUser) {
      const userLatLng = { lat: Number(userLatitude), lng: Number(userLongitude) };
      L.circleMarker(userLatLng, {
        radius: 7,
        color: "#3730E8",
        weight: 2,
        fillColor: "#FFFFFF",
        fillOpacity: 1,
      })
        .bindTooltip("You")
        .addTo(map);
      L.polyline([userLatLng, position], {
        color: "#3730E8",
        weight: 2,
        dashArray: "5 7",
        opacity: 0.75,
      }).addTo(map);
      map.fitBounds(L.latLngBounds([userLatLng, position]).pad(0.25), { animate: false });
    }

    return () => {
      map.remove();
    };
  }, [latitude, longitude, label, userLatitude, userLongitude, mapNode]);

  if (latitude == null || longitude == null) {
    return (
      <Alert severity="info" sx={{ borderRadius: "12px" }}>
        The owner has not pinned this room on the map yet.
      </Alert>
    );
  }

  return (
    <Box
      ref={setMapNode}
      sx={{
        height,
        borderRadius: "14px",
        border: "1px solid #D7E5EB",
        backgroundColor: "#E8EEF4",
        overflow: "hidden",
        position: "relative",
        zIndex: 0,
      }}
    />
  );
};

export default MapView;
