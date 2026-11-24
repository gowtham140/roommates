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
  Typography,
} from "@mui/material";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import { getSentEnquiries } from "../../API/enquiriesAPI";
import { useAuth } from "../../context/authContext";

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

const statusPalette = (status) => {
  const normalized = String(status || "NEW").toUpperCase();
  if (normalized === "CLOSED") {
    return { backgroundColor: "#EEF1F4", color: "#475467" };
  }
  if (normalized === "CONTACTED") {
    return { backgroundColor: "#EEF0FF", color: "#3730E8" };
  }
  return { backgroundColor: "#FFF3E0", color: "#B35B00" };
};

const MyApplications = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(() => {
    let active = true;
    getSentEnquiries()
      .then((data) => {
        if (active) setApplications(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load your applications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadApplications(), [loadApplications]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace state={{ from: "/my-applications" }} />;
  }

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", backgroundColor: "#F5FAFC", py: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#0F9D8A", fontSize: "14px", fontWeight: 700, mb: 0.8 }}>
            Room seeker
          </Typography>
          <Typography
            component="h1"
            sx={{ fontSize: { xs: "30px", md: "38px" }, fontWeight: 700, color: "#17233C", mb: 1 }}
          >
            My applications
          </Typography>
          <Typography sx={{ fontSize: "15px", color: "#667085" }}>
            Track every room you have enquired about and follow its status.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ borderRadius: "20px", border: "1px solid #D7E5EB", backgroundColor: "#FFFFFF", p: { xs: 2, sm: 3 } }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#3730E8" }} />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              sx={{ borderRadius: "12px" }}
              action={
                <Button color="inherit" size="small" onClick={loadApplications}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : applications.length === 0 ? (
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
              <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#17233C", mb: 0.8 }}>
                No applications yet
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "#667085", mb: 2 }}>
                Browse rooms and send an enquiry to get started.
              </Typography>
              <Button
                component={RouterLink}
                to="/rooms"
                variant="contained"
                sx={{ borderRadius: "11px", textTransform: "none", fontWeight: 700, px: 3 }}
              >
                Find rooms
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {applications.map((application) => (
                <Card
                  key={application.id}
                  elevation={0}
                  sx={{ borderRadius: "14px", border: "1px solid #E3EBF0", backgroundColor: "#FFFFFF" }}
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
                          {application.roomTitle || "Room enquiry"}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: "#667085", mt: 0.3 }}>
                          Sent {formatDate(application.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={String(application.status || "NEW").toUpperCase()}
                        sx={{ ...statusPalette(application.status), fontWeight: 700 }}
                      />
                    </Box>

                    <Typography sx={{ fontSize: "14px", lineHeight: 1.6, color: "#475467", mb: 1.5 }}>
                      {application.message || "No message provided."}
                    </Typography>

                    <Button
                      component={RouterLink}
                      to={`/rooms/${application.roomId}`}
                      sx={{ textTransform: "none", fontWeight: 700, color: "#3730E8" }}
                    >
                      View room
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MyApplications;
