import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FeedbackOutlined from "@mui/icons-material/FeedbackOutlined";
import { getAdminFeedback } from "../../API/feedbackAPI";
import useLoadEffect from "../../hooks/useLoadEffect";

const ROLE_LABELS = { 1: "Admin", 2: "Owner", 3: "Seeker" };

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};

const roleLabel = (value) => ROLE_LABELS[value] || value || "-";

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");

    getAdminFeedback()
      .then((rows) => {
        if (active) setFeedback(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Unable to load feedback.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useLoadEffect(load);

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid #E8ECF2", overflow: "hidden" }}>
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            background: "linear-gradient(120deg, #17233C 0%, #303FD9 100%)",
            color: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
            <FeedbackOutlined sx={{ fontSize: 30 }} />
            <Box>
              <Typography component="h1" sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
                Feedback
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#DCE5FF", mt: 0.4 }}>
                Review suggestions from owners and seekers
              </Typography>
            </Box>
          </Box>
        </Box>

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={load}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : feedback.length === 0 ? (
          <Box sx={{ py: 7, px: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#17233C", mb: 1 }}>
              No feedback yet
            </Typography>
            <Typography sx={{ fontSize: 14, color: "#667085" }}>
              Owner and seeker suggestions will appear here.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#31516D" }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#31516D" }}>From</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#31516D" }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#31516D" }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#31516D" }}>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feedback.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ color: "#667085", whiteSpace: "nowrap" }}>
                          {formatDate(row.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#17233C" }}>
                            {row.userName || "Unknown user"}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "#667085" }}>{row.email || "-"}</Typography>
                        </TableCell>
                        <TableCell sx={{ color: "#49657D" }}>{roleLabel(row.userType)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.category || "Feedback"}
                            sx={{ backgroundColor: "#EEF4FF", color: "#3730E8", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: "#344054", maxWidth: 480, whiteSpace: "pre-wrap" }}>
                          {row.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box sx={{ display: { xs: "grid", md: "none" }, gap: 1.5, p: 2 }}>
              {feedback.map((row) => (
                <Paper
                  key={row.id}
                  elevation={0}
                  sx={{ borderRadius: "14px", border: "1px solid #D7E5EB", p: 2 }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#17233C" }}>
                      {row.userName || "Unknown user"}
                    </Typography>
                    <Chip
                      size="small"
                      label={row.category || "Feedback"}
                      sx={{ backgroundColor: "#EEF4FF", color: "#3730E8", fontWeight: 700 }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#667085", mb: 1.2 }}>
                    {roleLabel(row.userType)} · {formatDate(row.createdAt)}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "#344054", whiteSpace: "pre-wrap" }}>
                    {row.message}
                  </Typography>
                  {row.email && (
                    <Typography sx={{ fontSize: 12, color: "#667085", mt: 1.2 }}>{row.email}</Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AdminFeedback;
