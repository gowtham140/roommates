import { useState } from "react";
import { Box, Button, Container, Typography, Grid, Paper } from "@mui/material";

import VerifiedIcon from "@mui/icons-material/Verified";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import homelogo from "../../assets/home.png"

import { useNavigate } from "react-router-dom";
import RoomFilters from "../../components/rooms/RoomFilters";
import { createRoomFilterValues, toRoomFilterQuery } from "../../components/rooms/roomFilterUtils";

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (values) => {
    const search = toRoomFilterQuery(values).toString();
    navigate(search ? `/rooms?${search}` : "/rooms");
  };

  return (
    <Box
      sx={{
        backgroundColor: "#F5FAFC",
        minHeight: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          pt: {
            xs: 5,
            md: 6,
          },

          pb: 8,
        }}
      >
        {/* ================= HERO ================= */}

        <Grid
          container
          spacing={{
            xs: 4,
            md: 3,
          }}
          alignItems="center"
        >
          {/* ================= LEFT ================= */}

          <Grid size={{ xs: 12, md: 7 }}>
            {/* Badge */}

            <Box
              sx={{
                display: "inline-flex",

                backgroundColor: "#E2F8F4",

                color: "#008A78",

                borderRadius: "20px",

                px: 1.5,

                py: 0.7,

                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                Chennai's roommate community
              </Typography>
            </Box>

            {/* Heading */}

            <Typography
              component="h1"
              sx={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",

                fontSize: {
                  xs: "34px",
                  sm: "42px",
                  md: "54px",
                },

                lineHeight: 1.02,

                letterSpacing: "-1.5px",

                fontWeight: 700,

                color: "#12294C",

                maxWidth: "680px",

                overflowWrap: "break-word",

                mb: 2,
              }}
            >
              Find the Right Roommate.
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                <br />
              </Box>
              Live Better.
            </Typography>

            {/* Description */}

            <Typography
              sx={{
                fontSize: "17px",

                lineHeight: 1.55,

                color: "#49657D",

                maxWidth: "600px",

                mb: 3,
              }}
            >
              Find compatible roommates in Chennai —
              directly with people, with no brokers.
            </Typography>

            {/* ================= SEARCH FILTER ================= */}

            <RoomSearchBox
              onSearch={handleSearch}
            />

            {/* ================= BUTTONS ================= */}

            {/* <Box
              sx={{
                display: "flex",

                gap: 1.5,

                mt: 2,

                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleSearch()}
                sx={{
                  height: 49,

                  px: 2.2,

                  borderRadius: "11px",

                  backgroundColor: "#3737E8",

                  textTransform: "none",

                  fontSize: "14px",

                  fontWeight: 700,

                  boxShadow: "none",

                  "&:hover": {
                    backgroundColor: "#2F30D1",

                    boxShadow: "none",
                  },
                }}
              >
                Find My Roommate
              </Button>

              <Button
                variant="outlined"
                onClick={() => handleSearch()}
                sx={{
                  height: 49,

                  px: 2.2,

                  borderRadius: "11px",

                  borderColor: "#BBD1DD",

                  color: "#1D3553",

                  backgroundColor: "#FFFFFF",

                  textTransform: "none",

                  fontSize: "14px",

                  fontWeight: 600,

                  "&:hover": {
                    borderColor: "#91B3C3",

                    backgroundColor: "#FFFFFF",
                  },
                }}
              >
                Browse Without Login
              </Button>
            </Box> */}
          </Grid>

          {/* ================= RIGHT IMAGE ================= */}

          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <HeroImage />
          </Grid>
        </Grid>

        {/* ================= TRUST CARDS ================= */}

        <TrustCards />

        {/* ================= MATCH SECTION ================= */}

        <Box
          sx={{
            mt: 7,
          }}
        >
          <Box
            sx={{
              display: "flex",

              alignItems: "flex-end",

              justifyContent: "space-between",

              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#008A78",

                  fontSize: "14px",

                  fontWeight: 700,

                  mb: 1,
                }}
              >
                Fresh Chennai matches
              </Typography>

              <Typography
                sx={{
                  color: "#142A4A",

                  fontSize: {
                    xs: "27px",
                    md: "30px",
                  },

                  fontWeight: 700,
                }}
              >
                Meet people who match your rhythm
              </Typography>
            </Box>

            <Button
              onClick={() => navigate("/rooms")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                display: {
                  xs: "none",
                  sm: "flex",
                },

                textTransform: "none",

                backgroundColor: "#E7F0FF",

                color: "#303FD9",

                borderRadius: "12px",

                px: 2,

                py: 1.2,

                fontWeight: 700,

                "&:hover": {
                  backgroundColor: "#DDEAFF",
                },
              }}
            >
              See all matches
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;


/* =====================================================
   SEARCH BOX
===================================================== */

const RoomSearchBox = ({ onSearch }) => {
  const [values, setValues] = useState(() => createRoomFilterValues());

  const updateFilter = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",

        maxWidth: "680px",

        backgroundColor: "#FFFFFF",

        border: "1px solid #D7E5EB",

        borderRadius: "18px",

        p: 2,

        boxShadow:
          "0 12px 30px rgba(40, 80, 100, 0.06)",
      }}
    >
      <RoomFilters
        values={values}
        onChange={updateFilter}
        onClear={() => setValues(createRoomFilterValues())}
        onSubmit={() => onSearch(values)}
        submitLabel="Search"
      />
    </Paper>
  );
};


/* =====================================================
   HERO IMAGE
===================================================== */

const HeroImage = () => {
  return (
    <Box
      sx={{
        position: "relative",

        height: 410,

        ml: 1,

        mt: 1,

        borderRadius: "32px",

        backgroundColor: "rgb(204 251 241 / var(--tw-bg-opacity, 1))",

        transform: "rotate(2deg)",

        p: 1.5,
      }}
    >
      <Box
        component="img"
        src= {homelogo}
        alt="Chennai city"
        sx={{
          width: "100%",

          height: "100%",

          objectFit: "cover",

          borderRadius: "25px",

          transform: "rotate(-2deg)",
        }}
      />

      {/* Overlay */}

      <Paper
        elevation={3}
        sx={{
          position: "absolute",

          left: 22,

          right: 22,

          bottom: 24,

          borderRadius: "18px",

          px: 2,

          py: 1.8,

          transform: "rotate(-2deg)",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",

            fontWeight: 700,

            color: "#142A4A",

            mb: 0.5,
          }}
        >
          No Broker. Direct Connections. Verified Users.
        </Typography>

        <Typography
          sx={{
            fontSize: "13px",

            lineHeight: 1.45,

            color: "#49657D",
          }}
        >
          A privacy-first way to find the person you can
          share a home with.
        </Typography>
      </Paper>
    </Box>
  );
};


/* =====================================================
   TRUST CARDS
===================================================== */

const TrustCards = () => {
  const cards = [
    {
      icon: <VerifiedIcon />,
      title: "Verified Users",
    },
    {
      icon: <HandshakeOutlinedIcon />,
      title: "No Brokers",
    },
    {
      icon: <SecurityOutlinedIcon />,
      title: "Privacy First",
    },
    {
      icon: <ForumOutlinedIcon />,
      title: "Direct Connections",
    },
  ];

  return (
    <Grid
      container
      spacing={1.5}
      sx={{
        mt: 4.5,
      }}
    >
      {cards.map((card) => (
        <Grid
          key={card.title}
          size={{
            xs: 6,
            md: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              minHeight: 56,

              height: "100%",

              display: "flex",

              alignItems: "flex-start",

              py: 1,

              px: { xs: 1.25, sm: 2 },

              borderRadius: "16px",

              border: "1px solid #D7E5EB",

              backgroundColor: "#FFFFFF",

              boxShadow:
                "0 8px 20px rgba(40, 80, 100, 0.04)",
            }}
          >
            <Box
              sx={{
                color: "#00A996",

                display: "flex",

                mr: { xs: 1, sm: 1.5 },

                "& svg": {
                  fontSize: 23,
                },
              }}
            >
              {card.icon}
            </Box>

            <Typography
              sx={{
                fontSize: { xs: "12px", sm: "13px" },

                lineHeight: 1.3,

                fontWeight: 700,

                color: "#314A66",
              }}
            >
              {card.title}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
