import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import { getRoom } from "../../API/roomsAPI";
import { resolveImageUrl } from "../../API/app-config";
import { useAuth } from "../../context/authContext";
import { getSavedRoomIds, removeSavedRoom } from "../../utils/savedRooms";

const formatRent = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString("en-IN")}` : "—";
};

const LikedRooms = () => {
  const { user, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return undefined;

    let active = true;
    const ids = getSavedRoomIds(user.id);

    Promise.all(
      ids.map(async (id) => {
        try {
          return await getRoom(id);
        } catch {
          return null;
        }
      })
    )
      .then((results) => {
        if (active) setRooms(results.filter(Boolean));
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load liked rooms.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleRemove = (roomId) => {
    removeSavedRoom(user?.id, roomId);
    setRooms((current) => current.filter((room) => String(room.id) !== String(roomId)));
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: "/liked-rooms" }} />;
  }

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F5FAFC", py: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}>
            Saved for later
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: "30px", md: "38px" }, fontWeight: 700, color: "#17233C", mb: 1 }}>
            Liked rooms
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#667085" }}>
            Rooms you saved while browsing. Review them here and open details when you are ready.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: "20px", border: "1px solid #D7E5EB", backgroundColor: "#FFFFFF", p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#3730E8" }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {error}
            </Alert>
          ) : rooms.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2, borderRadius: "18px", backgroundColor: "#FFECEE", color: "#E53935", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FavoriteRounded />
              </Box>
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#17233C", mb: 0.8 }}>
                No liked rooms yet
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#667085", mb: 2 }}>
                Save rooms while searching to compare them later.
              </Typography>
              <Button component={RouterLink} to="/rooms" variant="contained" sx={{ borderRadius: "11px", textTransform: "none", fontWeight: 700, px: 3 }}>
                Find rooms
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {rooms.map((room) => {
                const image = resolveImageUrl(room.imageUrls?.[0]);
                return (
                  <Grid key={room.id} size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E3EBF0", overflow: "hidden", height: "100%" }}>
                      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, height: "100%" }}>
                        <Box
                          component={image ? "img" : "div"}
                          src={image || undefined}
                          alt={room.title || "Room"}
                          sx={{ width: { xs: "100%", sm: 180 }, height: { xs: 180, sm: "auto" }, minHeight: { sm: 170 }, objectFit: "cover", backgroundColor: "#EAF2F5", flexShrink: 0 }}
                        />
                        <CardContent sx={{ flex: 1, p: 2, "&:last-child": { pb: 2 } }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#17233C", lineHeight: 1.3 }}>
                              {room.title || "Room"}
                            </Typography>
                            <IconButton aria-label="Remove liked room" onClick={() => handleRemove(room.id)} sx={{ color: "#E53935", mt: -0.5, mr: -1 }}>
                              <FavoriteRounded fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#667085", mb: 1 }}>
                            <LocationOnOutlined sx={{ fontSize: 16 }} />
                            <Typography sx={{ fontSize: "13px" }}>{room.location || "Location not specified"}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                            <Chip size="small" label={formatRent(room.rent)} sx={{ backgroundColor: "#EEF4FF", color: "#3730E8", fontWeight: 700 }} />
                            {room.roomType && <Chip size="small" label={room.roomType} sx={{ backgroundColor: "#F5F7FA" }} />}
                          </Box>
                          <Button component={RouterLink} to={`/rooms/${room.id}`} sx={{ textTransform: "none", fontWeight: 700, color: "#3730E8", px: 0 }}>
                            View details
                          </Button>
                        </CardContent>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default LikedRooms;
