import { useState } from "react";
import { Box } from "@mui/material";
import HomeRounded from "@mui/icons-material/HomeRounded";
import { resolveImageUrl } from "../../API/app-config";

const RoomImage = ({ src, alt, height = 220, sx }) => {
  const [brokenSrc, setBrokenSrc] = useState(null);
  const resolvedSrc = resolveImageUrl(src);
  const isBroken = !resolvedSrc || brokenSrc === resolvedSrc;

  if (isBroken) {
    return (
      <Box
        sx={{
          height,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #DFF7F2 0%, #DCE5FF 100%)",
          color: "#0F9D8A",
          ...sx,
        }}
      >
        <HomeRounded sx={{ fontSize: 54, opacity: 0.75 }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={resolvedSrc}
      alt={alt || "Room"}
      onError={() => setBrokenSrc(resolvedSrc)}
      sx={{
        height,
        width: "100%",
        objectFit: "cover",
        display: "block",
        ...sx,
      }}
    />
  );
};

export default RoomImage;
