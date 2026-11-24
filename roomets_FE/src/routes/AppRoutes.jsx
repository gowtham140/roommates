import { Route, Routes } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

import AppLayout from "../components/layout/AppLayout";
import AdminRoute from "../components/layout/AdminRoute";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Profile from "../pages/auth/Profile";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Home from "../pages/Home/Home";
import HowItWorks from "../pages/Home/HowItWorks";
import Safety from "../pages/Home/Safety";
import FindRooms from "../pages/Home/FindRooms";
import RoomDetail from "../pages/Home/RoomDetail";
import PostRoom from "../pages/Home/PostRoom";
import MyRooms from "../pages/Home/MyRooms";
import MyEnquiries from "../pages/Enquiries/MyEnquiries";
import MyApplications from "../pages/Seeker/MyApplications";
import LikedRooms from "../pages/Seeker/LikedRooms";
import AdminDashboard from "../pages/Admin/AdminDashboard";

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
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#17233C", mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: "#475467" }}>
        {subtitle}
      </Typography>
    </Box>
  </Container>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path="rooms" element={<FindRooms />} />
      <Route path="rooms/:id" element={<RoomDetail />} />
      <Route path="how-it-works" element={<HowItWorks />} />
      <Route path="safety" element={<Safety />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="post-room" element={<PostRoom />} />
        <Route path="my-rooms" element={<MyRooms />} />
        <Route path="enquiries" element={<MyEnquiries />} />
        <Route path="my-applications" element={<MyApplications />} />
        <Route path="liked-rooms" element={<LikedRooms />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>

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

export default AppRoutes;
