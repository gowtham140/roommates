import { useCallback, useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import { deleteRoom, getMyRooms, updateRoom } from "../../API/roomsAPI";
import { useAuth } from "../../context/authContext";
import { canManageRooms } from "../../utils/userTypes";
import RoomImage from "../../components/rooms/RoomImage";
import useLoadEffect from "../../hooks/useLoadEffect";

const ADMIN_BLOCKED = ["BLOCKED", "BLOCKED_BY_USER"];

const MyRooms = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadRooms = useCallback(() => {
    let active = true;
    setError("");
    setLoading(true);

    getMyRooms()
      .then((data) => {
        if (active) setRooms(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load your rooms.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useLoadEffect(loadRooms);

  const handleStatus = async (room) => {
    const nextStatus = room.status === "ACTIVE" ? "RENTED" : "ACTIVE";
    setBusyId(room.id);

    const payload = {
      title: room.title,
      description: room.description,
      location: room.location,
      rent: room.rent,
      deposit: room.deposit,
      roomType: room.roomType,
      sharing: room.sharing,
      gender: room.gender,
      food: room.food,
      foodPreference: room.foodPreference,
      availableFrom: room.availableFrom,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      imageUrls: Array.isArray(room.imageUrls) ? room.imageUrls : [],
      status: nextStatus,
      latitude: room.latitude ?? null,
      longitude: room.longitude ?? null,
    };

    try {
      const updated = await updateRoom(room.id, payload);
      setRooms((current) =>
        current.map((item) =>
          item.id === room.id
            ? { ...item, ...updated, status: updated?.status || nextStatus }
            : item
        )
      );
      setSnackbar({
        open: true,
        message: `Room marked as ${nextStatus.toLowerCase()}.`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to update room status.",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setBusyId(deleteTarget.id);

    try {
      await deleteRoom(deleteTarget.id);
      setRooms((current) => current.filter((room) => room.id !== deleteTarget.id));
      setSnackbar({
        open: true,
        message: "Room deleted successfully.",
        severity: "success",
      });
      setDeleteTarget(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to delete this room.",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!authLoading && (!user || !canManageRooms(user))) {
    return <Navigate to={user ? "/rooms" : "/login"} replace state={{ from: "/my-rooms" }} />;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}
            >
              Your listings
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "30px", md: "38px" },
                fontWeight: 700,
                color: "#17233C",
                mb: 1,
              }}
            >
              My rooms
            </Typography>
            <Typography sx={{ fontSize: "15px", color: "#667085" }}>
              Manage availability, edit details or remove listings.
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/post-room"
            variant="contained"
            startIcon={<AddRounded />}
            sx={primaryButtonStyles}
          >
            Post a room
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#3730E8" }} />
          </Box>
        ) : error ? (
          <Paper
            elevation={0}
            sx={{ borderRadius: "18px", border: "1px solid #D7E5EB", p: 4 }}
          >
            <Alert
              severity="error"
              sx={{ borderRadius: "12px", maxWidth: 560 }}
              action={
                <Button color="inherit" size="small" onClick={loadRooms}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Paper>
        ) : rooms.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: "18px",
              border: "1px solid #D7E5EB",
              backgroundColor: "#FFFFFF",
              p: 5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "22px", fontWeight: 700, color: "#17233C", mb: 1 }}
            >
              You have not posted a room yet
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "#667085", mb: 3 }}>
              List your space and start connecting with roommates.
            </Typography>
            <Button
              component={RouterLink}
              to="/post-room"
              variant="contained"
              startIcon={<AddRounded />}
              sx={primaryButtonStyles}
            >
              Post a room
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {rooms.map((room) => (
              <Grid key={room.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #D7E5EB",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Box sx={{ position: "relative", height: 185 }}>
                    <RoomImage
                      src={room.imageUrls?.[0]}
                      alt={room.title}
                      height="100%"
                    />
                    <Chip
                      label={
                        ADMIN_BLOCKED.includes(room.status)
                          ? "Blocked by admin"
                          : room.status || "ACTIVE"
                      }
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        backgroundColor: ADMIN_BLOCKED.includes(room.status)
                          ? "#FEE4E2"
                          : room.status === "RENTED"
                          ? "#FFF3E0"
                          : "#E4F8F4",
                        color: ADMIN_BLOCKED.includes(room.status)
                          ? "#B42318"
                          : room.status === "RENTED"
                          ? "#B35B00"
                          : "#0F9D8A",
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      p: 2,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      "&:last-child": { pb: 2 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#17233C",
                        mb: 0.5,
                      }}
                    >
                      {room.title}
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#667085", mb: 1.5 }}>
                      {room.location || "Location not specified"}
                    </Typography>
                    <Typography sx={{ fontSize: "21px", fontWeight: 800, color: "#17233C", mb: 1.5 }}>
                      ₹{Number(room.rent || 0).toLocaleString("en-IN")}
                      <Typography component="span" sx={{ fontSize: "12px", fontWeight: 500, color: "#667085", ml: 0.5 }}>
                        / month
                      </Typography>
                    </Typography>

                    <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 2 }}>
                      <SmallChip label={room.roomType || "Room"} />
                      <SmallChip label={room.sharing || "Shared"} />
                      <SmallChip label={room.gender || "ANY"} />
                    </Box>

                    <Box
                      sx={{
                        mt: "auto",
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr" },
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/post-room?edit=${room.id}`)}
                        disabled={busyId === room.id || ADMIN_BLOCKED.includes(room.status)}
                        sx={smallButtonStyles}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleStatus(room)}
                        disabled={busyId === room.id || ADMIN_BLOCKED.includes(room.status)}
                        sx={{
                          ...smallButtonStyles,
                          borderColor: "#B8E5DE",
                          color: "#0F9D8A",
                          "&:hover": {
                            borderColor: "#0F9D8A",
                            backgroundColor: "#F3FCFA",
                          },
                        }}
                      >
                        {busyId === room.id ? (
                          <CircularProgress size={17} color="inherit" />
                        ) : ADMIN_BLOCKED.includes(room.status) ? (
                          "Blocked by admin"
                        ) : room.status === "ACTIVE" ? (
                          "Mark as Rented"
                        ) : (
                          "Mark as Active"
                        )}
                      </Button>
                      <Button
                        variant="text"
                        color="error"
                        onClick={() => setDeleteTarget(room)}
                        disabled={busyId === room.id || ADMIN_BLOCKED.includes(room.status)}
                        sx={{
                          gridColumn: "1 / -1",
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#17233C" }}>
          Delete this room?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: "14px", color: "#667085" }}>
            {deleteTarget?.title} will be permanently removed from your
            listings. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{ color: "#667085", textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={busyId === deleteTarget?.id}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, boxShadow: "none" }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

const SmallChip = ({ label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      height: 26,
      backgroundColor: "#F3F7FA",
      color: "#49657D",
      fontSize: "11px",
      fontWeight: 600,
    }}
  />
);

const primaryButtonStyles = {
  height: 48,
  px: 2.5,
  borderRadius: "11px",
  backgroundColor: "#3730E8",
  textTransform: "none",
  fontSize: "14px",
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
};

const smallButtonStyles = {
  height: 42,
  borderRadius: "10px",
  borderColor: "#BDD3DF",
  color: "#1D3553",
  textTransform: "none",
  fontWeight: 700,
  fontSize: "13px",
  "&:hover": { borderColor: "#3730E8", color: "#3730E8" },
};

export default MyRooms;
