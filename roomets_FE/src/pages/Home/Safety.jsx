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
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import {
  VerifiedOutlined,
  ShieldOutlined,
  BlockOutlined,
  ReportOutlined,
} from "@mui/icons-material";

import { useState } from "react";
import { submitReport } from "../../API/reportsAPI";

const Safety = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate behaviour");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const openReportDialog = (reason) => {
    setReportReason(reason);
    setReportDetails("");
    setReportOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!reportReason || !reportDetails.trim()) {
      setSnackbar({
        open: true,
        message: "Please choose a reason and add a few details.",
        severity: "error",
      });
      return;
    }

    setReportSubmitting(true);

    try {
      await submitReport({
        reason: reportReason,
        details: reportDetails.trim(),
      });

      setReportOpen(false);
      setSnackbar({
        open: true,
        message: "Thank you. Your report has been submitted.",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Unable to submit your report.",
        severity: "error",
      });
    } finally {
      setReportSubmitting(false);
    }
  };

  const safetyFeatures = [
    {
      icon: <VerifiedOutlined />,
      title: "Verified accounts",
      description:
        "Verification unlocks connection actions and gives community members added confidence.",
      color: "#00A896",
    },
    {
      icon: <ShieldOutlined />,
      title: "Privacy protection",
      description:
        "Never expose exact address publicly. Contact details stay protected before a mutual connection.",
      color: "#3737E8",
    },
    {
      icon: <BlockOutlined />,
      title: "No broker policy",
      description:
        "This space is designed for direct, respectful roommate connections — not broker listings.",
      color: "#00A896",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: {
          xs: 5,
          md: 6,
        },
      }}
    >
      <Container maxWidth="lg">
        {/* =====================================================
            HERO
        ===================================================== */}

        <Box
          sx={{
            maxWidth: 780,
            mb: 3.5,
          }}
        >
          {/* Badge */}

          <Chip
            label="Trust centre"
            size="small"
            sx={{
              backgroundColor: "#E2F8F4",
              color: "#008A78",
              fontWeight: 700,
              fontSize: "13px",
              borderRadius: "18px",
              mb: 1.5,
            }}
          />

          {/* Heading */}

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: "32px",
                sm: "38px",
                md: "32px",
              },

              lineHeight: 1.15,

              fontWeight: 700,

              color: "#142A4A",

              maxWidth: 700,

              mb: 1,
            }}
          >
            Safety and trust, built into every connection
          </Typography>

          {/* Description */}

          <Typography
            sx={{
              fontSize: "15.5px",

              lineHeight: 1.55,

              color: "#49657D",

              maxWidth: 760,
            }}
          >
            RoomMate Finder keeps public browsing useful while
            protecting contact details, exact addresses, and
            private decisions.
          </Typography>
        </Box>

        {/* =====================================================
            SAFETY FEATURE CARDS
        ===================================================== */}

        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          {safetyFeatures.map((feature) => (
            <Grid
              key={feature.title}
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <SafetyCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            </Grid>
          ))}
        </Grid>

        {/* =====================================================
            SAFETY CHECKLIST
        ===================================================== */}

        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#FFFFFF",

            border: "1px solid #D7E5EB",

            borderRadius: "20px",

            p: {
              xs: 3,
              md: 3,
            },

            boxShadow:
              "0 10px 28px rgba(40, 80, 100, 0.05)",
          }}
        >
          {/* Title */}

          <Typography
            sx={{
              fontSize: {
                xs: "23px",
                md: "24px",
              },

              fontWeight: 700,

              color: "#142A4A",

              mb: 1.8,
            }}
          >
            A simple safety checklist
          </Typography>

          {/* Checklist */}

          <Grid
            container
            columnSpacing={5}
            rowSpacing={1.3}
          >
            {/* Left column */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <ChecklistItem>
                Keep exact addresses private until comfortable.
              </ChecklistItem>
            </Grid>

            {/* Right column */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <ChecklistItem>
                Meet in a public place before moving ahead.
              </ChecklistItem>
            </Grid>

            {/* Left column */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <ChecklistItem>
                Use respectful, clear communication.
              </ChecklistItem>
            </Grid>

            {/* Right column */}

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <ChecklistItem>
                Report behaviour that feels inappropriate.
              </ChecklistItem>
            </Grid>
          </Grid>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <Box
            sx={{
              display: "flex",

              gap: 1.5,

              mt: 2.5,

              flexWrap: "wrap",
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ReportOutlined />}
              onClick={() => openReportDialog("Inappropriate behaviour")}
              sx={{
                height: 49,

                borderRadius: "11px",

                borderColor: "#FFB8B8",

                color: "#D92727",

                backgroundColor: "#FFF8F8",

                textTransform: "none",

                fontSize: "14px",

                fontWeight: 700,

                "&:hover": {
                  borderColor: "#F28B8B",

                  backgroundColor: "#FFF1F1",
                },
              }}
            >
              Report a user
            </Button>

            <Button
              variant="outlined"
              onClick={() => openReportDialog("Block request")}
              sx={{
                height: 49,

                borderRadius: "11px",

                borderColor: "#BDD3DF",

                color: "#1D3553",

                backgroundColor: "#FFFFFF",

                textTransform: "none",

                fontSize: "14px",

                fontWeight: 700,

                "&:hover": {
                  borderColor: "#91B3C3",

                  backgroundColor: "#F8FBFC",
                },
              }}
            >
              Block a user
            </Button>
          </Box>
        </Paper>

        <Dialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "20px" } }}
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#17233C" }}>
            Submit a report
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: "14px", color: "#667085", mb: 2 }}>
              Tell us what happened. Reports are reviewed privately by our
              support team.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="report-reason-label">Reason</InputLabel>
              <Select
                labelId="report-reason-label"
                label="Reason"
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                sx={{ borderRadius: "11px" }}
              >
                <MenuItem value="Inappropriate behaviour">
                  Inappropriate behaviour
                </MenuItem>
                <MenuItem value="Fake or misleading listing">
                  Fake or misleading listing
                </MenuItem>
                <MenuItem value="Harassment">Harassment</MenuItem>
                <MenuItem value="Block request">Block request</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Details"
              placeholder="Describe the issue..."
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "11px" },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setReportOpen(false)}
              sx={{ color: "#667085", textTransform: "none", fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleReportSubmit}
              disabled={reportSubmitting}
              startIcon={
                reportSubmitting ? (
                  <CircularProgress size={17} color="inherit" />
                ) : null
              }
              sx={{
                height: 44,
                px: 2.5,
                borderRadius: "11px",
                backgroundColor: "#3730E8",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#2F30D1", boxShadow: "none" },
              }}
            >
              Submit report
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
      </Container>
    </Box>
  );
};


/* ============================================================
   SAFETY CARD
============================================================ */

const SafetyCard = ({
  icon,
  title,
  description,
  color,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid #D7E5EB",

        borderRadius: "18px",

        backgroundColor: "#FFFFFF",

        boxShadow:
          "0 10px 25px rgba(40, 80, 100, 0.04)",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          boxShadow:
            "0 12px 28px rgba(40, 80, 100, 0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        {/* Icon */}

        <Box
          sx={{
            color,

            display: "flex",

            mb: 1.7,

            "& svg": {
              fontSize: 25,
            },
          }}
        >
          {icon}
        </Box>

        {/* Title */}

        <Typography
          sx={{
            fontSize: "25px",

            lineHeight: 1.2,

            fontWeight: 700,

            color: "#142A4A",

            mb: 1,
          }}
        >
          {title}
        </Typography>

        {/* Description */}

        <Typography
          sx={{
            fontSize: "15px",

            lineHeight: 1.45,

            color: "#49657D",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};


/* ============================================================
   CHECKLIST ITEM
============================================================ */

const ChecklistItem = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "flex-start",

        gap: 1,

        color: "#3B4E68",
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "15px",

          lineHeight: 1.5,

          color: "#3B4E68",

          fontWeight: 500,
        }}
      >
        ✓
      </Typography>

      <Typography
        component="span"
        sx={{
          fontSize: "15px",

          lineHeight: 1.5,

          color: "#3B4E68",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
};

export default Safety;