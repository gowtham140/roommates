import { useCallback, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  CalendarTodayOutlined,
  LocationOnOutlined,
  LockRounded,
  PersonOutlineRounded,
  SendRounded,
} from "@mui/icons-material";
import { getRoom } from "../../API/roomsAPI";
import { sendEnquiry } from "../../API/enquiriesAPI";
import MapView from "../../components/maps/MapView";
import useLoadEffect from "../../hooks/useLoadEffect";
import useUserLocation from "../../hooks/useUserLocation";
import RoomImage from "../../components/rooms/RoomImage";
import { distanceKm, formatDistance } from "../../utils/geo";
import { useAuth } from "../../context/authContext";
import { isOwner as isOwnerRole, isSeeker } from "../../utils/userTypes";

const RoomDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { position: userPosition } = useUserLocation();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentEnquiry, setSentEnquiry] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadRoom = useCallback(() => {
    if (!id || reloadKey == null) return undefined;

    let active = true;
    setError("");
    setLoading(true);
    setRoom(null);

    getRoom(id)
      .then((data) => {
        if (active) {
          setRoom(data || null);
          setSelectedImage(null);
          setSentEnquiry(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Unable to load this room.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  useLoadEffect(loadRoom);

  const handleEnquiry = async (event) => {
    event.preventDefault();

    if (!message.trim()) {
      setSnackbar({
        open: true,
        message: "Please write a message before sending.",
        severity: "error",
      });
      return;
    }

    setSending(true);

    try {
      const enquiry = await sendEnquiry(room.id, message.trim());
      setSentEnquiry(enquiry);
      setMessage("");
      setSnackbar({
        open: true,
        message: "Your enquiry has been sent to the owner.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to send your enquiry.",
        severity: "error",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#F5FAFC",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#3730E8" }} />
      </Box>
    );
  }

  const notFound = /not found|404/i.test(error) || (!error && !room);

  if (error || !room) {
    return (
      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "#F5FAFC",
          py: 6,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              border: "1px solid #D7E5EB",
              backgroundColor: "#FFFFFF",
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "24px", fontWeight: 700, color: "#17233C", mb: 1 }}
            >
              {notFound ? "Room not found" : "Unable to load room"}
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#667085", mb: 3 }}>
              {notFound
                ? "This listing may have been removed or the link may be incorrect."
                : error}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center" }}>
              <Button
                component={RouterLink}
                to="/rooms"
                variant="contained"
                sx={primaryButtonStyles}
              >
                Browse rooms
              </Button>
              {!notFound && (
                <Button
                  onClick={() => setReloadKey((key) => key + 1)}
                  variant="outlined"
                  sx={{
                    borderRadius: "11px",
                    borderColor: "#BDD3DF",
                    color: "#1D3553",
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Retry
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  const images = Array.isArray(room.imageUrls) ? room.imageUrls : [];
  const mainImage =
    selectedImage && images.includes(selectedImage) ? selectedImage : images[0];
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const isListingOwner = Boolean(
    user &&
      isOwnerRole(user) &&
      room.ownerId != null &&
      String(user.id) === String(room.ownerId)
  );
  const canEnquire = isSeeker(user);
  const contactUnlocked = sentEnquiry &&
    ["CONTACTED", "CONFIRMED"].includes(String(sentEnquiry.status || "").toUpperCase());

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          component={RouterLink}
          to="/rooms"
          startIcon={<ArrowBackRounded />}
          sx={{
            mb: 2,
            color: "#667085",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Back to rooms
        </Button>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid #D7E5EB",
                backgroundColor: "#FFFFFF",
              }}
            >
              <RoomImage src={mainImage} alt={room.title} height={390} />

              {images.length > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    p: 1.5,
                    overflowX: "auto",
                  }}
                >
                  {images.map((image, index) => (
                    <Box
                      key={`${image}-${index}`}
                      component="button"
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      sx={{
                        p: 0,
                        m: 0,
                        border:
                          image === mainImage
                            ? "3px solid #3730E8"
                            : "3px solid transparent",
                        borderRadius: "12px",
                        overflow: "hidden",
                        width: 92,
                        height: 72,
                        flexShrink: 0,
                        cursor: "pointer",
                        backgroundColor: "#F5FAFC",
                      }}
                    >
                      <RoomImage
                        src={image}
                        alt={`${room.title} ${index + 1}`}
                        height="100%"
                        sx={{ borderRadius: "8px" }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: "1px solid #D7E5EB",
                backgroundColor: "#FFFFFF",
                p: { xs: 2.5, sm: 3 },
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 1.2,
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "26px", sm: "30px" },
                    fontWeight: 700,
                    color: "#17233C",
                    lineHeight: 1.2,
                  }}
                >
                  {room.title}
                </Typography>
                {room.status && (
                  <Chip
                    label={room.status}
                    size="small"
                    sx={{
                      backgroundColor: "#E4F8F4",
                      color: "#0F9D8A",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 2 }}>
                <LocationOnOutlined sx={{ fontSize: 18, color: "#0F9D8A" }} />
                <Typography sx={{ fontSize: "14px", color: "#667085" }}>
                  {room.location || "Location not specified"}
                </Typography>
              </Box>

              {room.latitude != null && room.longitude != null && (
                <Box sx={{ mb: 2 }}>
                  {user ? (
                    <>
                      <MapView
                        latitude={room.latitude}
                        longitude={room.longitude}
                        label={room.title}
                        userPosition={userPosition}
                      />
                      {userPosition && (
                        <Typography sx={{ fontSize: 13, color: "#0F9D8A", fontWeight: 700, mt: 1 }}>
                          {formatDistance(distanceKm(userPosition, room))} from you
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}>
                      <Box
                        aria-hidden="true"
                        sx={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}
                      >
                        <MapView
                          latitude={room.latitude}
                          longitude={room.longitude}
                          label={room.title}
                        />
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          textAlign: "center",
                          backgroundColor: "rgba(245, 250, 252, 0.35)",
                          px: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            backgroundColor: "#FFFFFF",
                            color: "#3730E8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 6px 18px rgba(30, 70, 90, 0.12)",
                          }}
                        >
                          <LockRounded />
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#17233C" }}>
                          Exact location is hidden
                        </Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#49657D" }}>
                          Log in to view the map and distance.
                        </Typography>
                        <Button
                          component={RouterLink}
                          to="/login"
                          state={{ from: `/rooms/${id}` }}
                          variant="contained"
                          size="small"
                          sx={{ ...primaryButtonStyles, height: 36, mt: 0.5 }}
                        >
                          Log in to view
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.6,
                  pb: 2,
                  borderBottom: "1px solid #EDF1F4",
                }}
              >
                <Typography sx={{ fontSize: "30px", fontWeight: 800, color: "#17233C" }}>
                  ₹{Number(room.rent || 0).toLocaleString("en-IN")}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#667085" }}>
                  / month
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", my: 2 }}>
                <DetailChip label={`Deposit ₹${Number(room.deposit || 0).toLocaleString("en-IN")}`} />
                <DetailChip label={room.roomType || "Room"} />
                <DetailChip label={room.sharing || "Shared"} />
                <DetailChip label={room.gender || "ANY"} />
                <DetailChip
                  label={room.food ? `Food: ${room.foodPreference || "Provided"}` : "No food"}
                />
                <DetailChip
                  icon={<CalendarTodayOutlined />}
                  label={room.availableFrom ? `From ${room.availableFrom}` : "Immediate"}
                />
              </Box>

              {amenities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#31516D", mb: 1 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap" }}>
                    {amenities.map((amenity) => (
                      <Chip
                        key={amenity}
                        label={amenity}
                        size="small"
                        sx={{
                          backgroundColor: "#EEF8F6",
                          color: "#0F9D8A",
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#31516D", mb: 0.8 }}>
                About this room
              </Typography>
              <Typography sx={{ fontSize: "14px", lineHeight: 1.65, color: "#667085", whiteSpace: "pre-line" }}>
                {room.description || "No description provided."}
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: "1px solid #D7E5EB",
                backgroundColor: "#FFFFFF",
                p: { xs: 2.5, sm: 3 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    backgroundColor: "#EEF0FF",
                    color: "#3730E8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PersonOutlineRounded />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#667085" }}>
                    Listed by
                  </Typography>
                  <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#17233C" }}>
                    {room.ownerName || "Room owner"}
                  </Typography>
                </Box>
              </Box>

              {isListingOwner ? (
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                  <Button
                    component={RouterLink}
                    to="/my-rooms"
                    variant="contained"
                    sx={primaryButtonStyles}
                  >
                    Manage my rooms
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`/post-room?edit=${room.id}`}
                    variant="outlined"
                    sx={secondaryButtonStyles}
                  >
                    Edit listing
                  </Button>
                </Box>
              ) : !user ? (
                <Box>
                  <Typography sx={{ fontSize: "14px", color: "#667085", mb: 1.5 }}>
                    Log in to contact the owner and send an enquiry.
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/login"
                    state={{ from: `/rooms/${id}` }}
                    variant="contained"
                    fullWidth
                    startIcon={<SendRounded />}
                    sx={primaryButtonStyles}
                  >
                    Login to enquire
                  </Button>
                </Box>
              ) : !canEnquire ? (
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                  Only room seekers can send enquiries. Use My Rooms to manage your listings.
                </Alert>
              ) : user.seekingClosed ? (
                <Alert severity="info" sx={{ borderRadius: "12px" }}>
                  Your room seeking is closed. Reopen it from your profile to send new enquiries.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleEnquiry}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#31516D", mb: 1 }}>
                    Send an enquiry
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Introduce yourself and ask about the room..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    sx={fieldStyles}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={sending}
                    startIcon={
                      sending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SendRounded />
                      )
                    }
                    sx={{ ...primaryButtonStyles, mt: 1.5 }}
                  >
                    Send enquiry
                  </Button>

                  {sentEnquiry && (
                    <Alert severity="success" sx={{ borderRadius: "12px", mt: 1.5 }}>
                      {contactUnlocked
                        ? `Owner's contact: ${sentEnquiry.ownerPhone || "Not provided."}`
                        : "Enquiry sent. The owner's contact is shared after they respond."}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const DetailChip = ({ label, icon }) => (
  <Chip
    icon={icon}
    label={label}
    size="small"
    sx={{
      height: 30,
      borderRadius: "8px",
      backgroundColor: "#F3F7FA",
      color: "#49657D",
      fontSize: "12px",
      fontWeight: 600,
      "& .MuiChip-icon": { color: "#0F9D8A", fontSize: 16 },
    }}
  />
);

const primaryButtonStyles = {
  height: 48,
  borderRadius: "11px",
  backgroundColor: "#3730E8",
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
};

const secondaryButtonStyles = {
  height: 48,
  borderRadius: "11px",
  borderColor: "#BDD3DF",
  color: "#1D3553",
  textTransform: "none",
  fontWeight: 700,
  "&:hover": { borderColor: "#3730E8", color: "#3730E8" },
};

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "11px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#BDD3DF" },
    "&:hover fieldset": { borderColor: "#91B3C3" },
    "&.Mui-focused fieldset": { borderColor: "#3730E8", borderWidth: "1.5px" },
  },
  "& .MuiOutlinedInput-input": { fontSize: "14px", color: "#17233C" },
};

export default RoomDetail;
