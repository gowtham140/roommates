import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import {
  VerifiedOutlined,
  ShieldOutlined,
  BlockOutlined,
  ReportOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

const Safety = () => {
  const navigate = useNavigate();

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
              onClick={() => {
                // Later connect this to report modal/API
                console.log("Report user");
              }}
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
              onClick={() => {
                // Later connect this to block modal/API
                console.log("Block user");
              }}
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