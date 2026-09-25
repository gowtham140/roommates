import { Routes, Route } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

import AppLayout from "../components/layout/AppLayout";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

const Page = ({ title, subtitle }) => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    <Box
      sx={{
        backgroundColor: "#F8FAFC",
        border: "1px solid #E8ECF2",
        borderRadius: 4,
        p: 5,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#17233C",
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#475467",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  </Container>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>

        {/* Home */}
        <Route
          index
          element={
            <Page
              title="Home"
              subtitle="Welcome to RoomMate Finder."
            />
          }
        />

        {/* Find Rooms */}
        <Route
          path="rooms"
          element={
            <Page
              title="Find Rooms"
              subtitle="Browse verified room listings in Chennai."
            />
          }
        />

        {/* How It Works */}
        <Route
          path="how-it-works"
          element={
            <Page
              title="How It Works"
              subtitle="A simple, transparent process to find a trusted room."
            />
          }
        />

        {/* Safety */}
        <Route
          path="safety"
          element={
            <Page
              title="Safety"
              subtitle="Verified listings and safer room searches for everyone."
            />
          }
        />

        {/* Login */}
        <Route
          path="login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="register"
          element={<Register />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <Page
              title="Page Not Found"
              subtitle="The page you are looking for does not exist."
            />
          }
        />

      </Route>
    </Routes>
  );
};

export default AppRoutes;