import { useCallback, useEffect, useState } from "react";
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
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import {
  getReceivedEnquiries,
  getSentEnquiries,
  updateEnquiryStatus,
} from "../../API/enquiriesAPI";
import { useAuth } from "../../context/authContext";
import { canManageRooms } from "../../utils/userTypes";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyEnquiries = () => {
  const { user, loading: authLoading } = useAuth();
  const ownerView = canManageRooms(user);

  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadEnquiries = useCallback(() => {
    if (!user) return undefined;

    let active = true;
    const request = ownerView ? getReceivedEnquiries() : getSentEnquiries();

    request
      .then((data) => {
        if (!active) return;
        if (ownerView) {
          setReceived(Array.isArray(data) ? data : []);
        } else {
          setSent(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.message || "Unable to load your enquiries.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, ownerView]);

  useEffect(() => loadEnquiries(), [loadEnquiries]);

  const handleStatus = async (enquiry, status) => {
    setBusyId(enquiry.id);

    try {
      const updated = await updateEnquiryStatus(enquiry.id, status);
      setReceived((current) =>
        current.map((item) =>
          item.id === enquiry.id
            ? { ...item, ...updated, status: updated?.status || status }
            : item
        )
      );
      setSnackbar({
        open: true,
        message: `Enquiry marked as ${status.toLowerCase()}.`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to update enquiry status.",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: "/enquiries" }} />;
  }

  const items = ownerView ? received : sent;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}
          >
            {ownerView ? "Room management" : "Your enquiries"}
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
            {ownerView ? "Enquiry requests" : "My enquiries"}
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#667085" }}>
            {ownerView
              ? "Review enquiries from seekers and manage their status."
              : "Track the rooms you have enquired about."}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: "20px",
            border: "1px solid #D7E5EB",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              borderBottom: "1px solid #EDF1F4",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#17233C" }}>
              {ownerView ? "Received requests" : "Sent enquiries"}
            </Typography>
            <Chip
              size="small"
              label={items.length}
              sx={{ backgroundColor: "#EEF4FF", color: "#304A73", fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "#3730E8" }} />
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{ borderRadius: "12px" }}
                action={
                  <Button color="inherit" size="small" onClick={loadEnquiries}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "18px",
                    backgroundColor: "#E4F8F4",
                    color: "#0F9D8A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { fontSize: 28 },
                  }}
                >
                  <MailOutlineRounded />
                </Box>
                <Typography
                  sx={{ fontSize: "18px", fontWeight: 700, color: "#17233C", mb: 0.8 }}
                >
                  {ownerView ? "No enquiry requests yet" : "No enquiries yet"}
                </Typography>
                <Typography sx={{ fontSize: "14px", color: "#667085", mb: 2 }}>
                  {ownerView
                    ? "Enquiries from seekers will appear here."
                    : "Browse rooms and send an enquiry to get started."}
                </Typography>
                {!ownerView && (
                  <Button
                    component={RouterLink}
                    to="/rooms"
                    variant="contained"
                    sx={primaryButtonStyles}
                  >
                    Find rooms
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {items.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    received={ownerView}
                    busy={busyId === enquiry.id}
                    onStatus={handleStatus}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Paper>
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

const EnquiryCard = ({ enquiry, received, busy, onStatus }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: "14px",
      border: "1px solid #E3EBF0",
      backgroundColor: "#FFFFFF",
    }}
  >
    <CardContent sx={{ p: 2.2, "&:last-child": { pb: 2.2 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#17233C" }}>
            {enquiry.roomTitle || "Room enquiry"}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.3 }}>
            {formatDate(enquiry.createdAt)}
          </Typography>
        </Box>
        <StatusChip status={enquiry.status} />
      </Box>

      <Typography sx={{ fontSize: "14px", lineHeight: 1.6, color: "#475467", mb: 1.5 }}>
        {enquiry.message || "No message provided."}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          borderTop: "1px solid #EDF1F4",
          pt: 1.4,
        }}
      >
        <Info label="Seeker" value={enquiry.seekerName || "—"} />
        <Info label="Seeker phone" value={enquiry.seekerPhone || "—"} />
        <Info label="Owner phone" value={enquiry.ownerPhone || "—"} />
        {enquiry.seekerWorkingDetails && <Info label="Working" value={enquiry.seekerWorkingDetails} />}
        {enquiry.seekerHobbyPreferences && <Info label="Hobbies / preferences" value={enquiry.seekerHobbyPreferences} />}
        {enquiry.seekerSeekingClosed && <Info label="Seeking status" value="Closed" />}
      </Box>

      {received && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.8 }}>
          {enquiry.status === "NEW" && (
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => onStatus(enquiry, "CONTACTED")}
              sx={primaryButtonStyles}
            >
              {busy ? <CircularProgress size={17} color="inherit" /> : "Mark as contacted"}
            </Button>
          )}
          {(enquiry.status === "CONTACTED" || enquiry.status === "NEW") && (
            <Button
              variant="contained"
              disabled={busy}
              onClick={() => onStatus(enquiry, "CONFIRMED")}
              sx={{ ...primaryButtonStyles, backgroundColor: "#0F9D8A", "&:hover": { backgroundColor: "#0B8676", boxShadow: "none" } }}
            >
              {busy ? <CircularProgress size={17} color="inherit" /> : "Confirm & close seeking"}
            </Button>
          )}
          {enquiry.status === "CONTACTED" && (
            <Button
              variant="outlined"
              disabled={busy}
              onClick={() => onStatus(enquiry, "CLOSED")}
              sx={{
                height: 42,
                borderRadius: "11px",
                borderColor: "#BDD3DF",
                color: "#1D3553",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
              }}
            >
              {busy ? <CircularProgress size={17} color="inherit" /> : "Close enquiry"}
            </Button>
          )}
          <Button
            component={RouterLink}
            to={`/rooms/${enquiry.roomId}`}
            variant="text"
            sx={{ textTransform: "none", fontWeight: 700, color: "#3730E8" }}
          >
            View room
          </Button>
        </Box>
      )}
    </CardContent>
  </Card>
);

const StatusChip = ({ status }) => {
  const normalized = String(status || "NEW").toUpperCase();
  const palette =
    normalized === "CONFIRMED"
      ? { backgroundColor: "#E4F8F4", color: "#0F766E" }
      : normalized === "CLOSED"
      ? { backgroundColor: "#EEF1F4", color: "#475467" }
      : normalized === "CONTACTED"
      ? { backgroundColor: "#EEF0FF", color: "#3730E8" }
      : { backgroundColor: "#FFF3E0", color: "#B35B00" };

  return (
    <Chip
      label={normalized}
      size="small"
      sx={{ ...palette, fontWeight: 700 }}
    />
  );
};

const Info = ({ label, value }) => (
  <Box>
    <Typography sx={{ fontSize: "11px", color: "#8A98A8" }}>{label}</Typography>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#31516D" }}>
      {value}
    </Typography>
  </Box>
);

const primaryButtonStyles = {
  height: 42,
  px: 2,
  borderRadius: "11px",
  backgroundColor: "#3730E8",
  textTransform: "none",
  fontSize: "13px",
  fontWeight: 700,
  boxShadow: "none",
  "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
};

export default MyEnquiries;
