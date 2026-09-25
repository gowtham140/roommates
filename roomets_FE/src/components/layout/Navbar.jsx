import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Container,
} from "@mui/material";

import {
  HomeOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";

import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Find Rooms",
      path: "/rooms",
    },
    {
      label: "How It Works",
      path: "/how-it-works",
    },
    {
      label: "Safety",
      path: "/safety",
    },
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        color: "#17233C",
        borderBottom: "1px solid #E8ECF2",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: "64px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >

          {/* Logo */}
          <Box
            component={NavLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              textDecoration: "none",
              color: "inherit",
            }}
          >

            {/* Logo Icon */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "11px",
                backgroundColor: "#3730E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HomeOutlined
                sx={{
                  color: "#ffffff",
                  fontSize: 21,
                }}
              />
            </Box>

            {/* Brand */}
            <Box>
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                RoomMate Finder
              </Typography>

              <Typography
                sx={{
                  fontSize: "9px",
                  color: "#667085",
                  mt: 0.3,
                }}
              >
                Direct. Verified. Chennai.
              </Typography>
            </Box>

          </Box>

          {/* Navigation */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: "center",
              marginLeft: "auto",
              marginRight: 4,
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#43516A",
                  borderRadius: "10px",
                  px: 1.6,
                  py: 1,

                  "&.active": {
                    backgroundColor: "#EEF4FF",
                    color: "#304A73",
                  },

                  "&:hover": {
                    backgroundColor: "#F5F7FA",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          {/* Right Section */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >

            {/* Chennai */}
            <Chip
              icon={
                <LocationOnOutlined
                  sx={{
                    fontSize: "16px !important",
                  }}
                />
              }
              label="Chennai"
              size="small"
              sx={{
                backgroundColor: "#EFFAF7",
                color: "#008A78",
                fontWeight: 600,
                marginTop: "8px",
                borderRadius: "18px",
                px: 0.5,
              }}
            />

            {/* Login */}
            <Button
              component={NavLink}
              to="/login"
              variant="outlined"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#17233C",
                borderColor: "#C9D2E1",
                borderRadius: "11px",
                px: 2,
                py: 0.8,

                "&:hover": {
                  borderColor: "#3730E8",
                  backgroundColor: "#F8F9FF",
                },
              }}
            >
              Login
            </Button>

            {/* Sign Up */}
            <Button
              component={NavLink}
              to="/register"
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "#3730E8",
                borderRadius: "11px",
                px: 2,
                py: 0.9,
                boxShadow: "none",

                "&:hover": {
                  backgroundColor: "#2E27C9",
                  boxShadow: "none",
                },
              }}
            >
              Sign Up
            </Button>

          </Stack>

        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;