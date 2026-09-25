import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import {
  SearchRounded,
  VisibilityOutlined,
  SendOutlined,
  KeyOutlined,
} from "@mui/icons-material";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <SearchRounded />,
      title: "Search Rooms",
      description:
        "Search available rooms and vacant beds by location, budget, room type, and move-in date.",
    },
    {
      number: "02",
      icon: <VisibilityOutlined />,
      title: "View Details",
      description:
        "Explore room photos, rent, deposit, amenities, preferences, and availability.",
    },
    {
      number: "03",
      icon: <SendOutlined />,
      title: "Apply",
      description:
        "Send an application directly to the room provider with your verified profile.",
    },
    {
      number: "04",
      icon: <KeyOutlined />,
      title: "Connect & Move In",
      description:
        "The provider reviews your profile, accepts your application, and you finalize the move.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#F5FAFC",
        py: {
          xs: 6,
          md: 8,
        },
      }}
    >
      <Container maxWidth="lg">

        {/* Hero */}
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 800,
            mx: "auto",
            mb: 7,
          }}
        >
          <Chip
            label="Simple. Direct. Verified."
            sx={{
              backgroundColor: "#E2F8F4",
              color: "#008A78",
              fontWeight: 700,
              mb: 2,
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily:
                "Georgia, 'Times New Roman', serif",
              fontSize: {
                xs: "40px",
                md: "56px",
              },
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#12294C",
              mb: 2,
            }}
          >
            How RoomMate Finder
            <br />
            Works
          </Typography>

          <Typography
            sx={{
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#49657D",
            }}
          >
            Find vacant rooms directly from owners and
            existing tenants, apply with your verified
            profile, and connect without brokers.
          </Typography>
        </Box>

        {/* Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              textAlign: "center",
              color: "#008A78",
              fontSize: "14px",
              fontWeight: 700,
              mb: 1,
            }}
          >
            For room seekers
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#142A4A",
            }}
          >
            Find your next room
          </Typography>
        </Box>

        {/* Steps */}
        <Grid container spacing={2.5}>
          {steps.map((step) => (
            <Grid
              key={step.number}
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #D7E5EB",
                  borderRadius: "18px",
                  backgroundColor: "#FFFFFF",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",

                  "&:hover": {
                    transform: "translateY(-4px)",
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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#EEF2FF",
                        color: "#3737E8",
                      }}
                    >
                      {step.icon}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#A0AFBD",
                      }}
                    >
                      {step.number}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#142A4A",
                      mb: 1,
                    }}
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "14px",
                      lineHeight: 1.6,
                      color: "#667A90",
                    }}
                  >
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
};

export default HowItWorks;