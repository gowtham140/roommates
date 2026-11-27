import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";

import AppLayout from "../components/layout/AppLayout";
import AdminRoute from "../components/layout/AdminRoute";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RoleRoute from "../components/layout/RoleRoute";
import { USER_TYPES } from "../utils/userTypes";

const Register = lazy(() => import("../pages/auth/Register"));
const Login = lazy(() => import("../pages/auth/Login"));
const Profile = lazy(() => import("../pages/auth/Profile"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Home = lazy(() => import("../pages/Home/Home"));
const HowItWorks = lazy(() => import("../pages/Home/HowItWorks"));
const Safety = lazy(() => import("../pages/Home/Safety"));
const FindRooms = lazy(() => import("../pages/Home/FindRooms"));
const RoomDetail = lazy(() => import("../pages/Home/RoomDetail"));
const PostRoom = lazy(() => import("../pages/Home/PostRoom"));
const MyRooms = lazy(() => import("../pages/Home/MyRooms"));
const MyEnquiries = lazy(() => import("../pages/Enquiries/MyEnquiries"));
const LikedRooms = lazy(() => import("../pages/Seeker/LikedRooms"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminFeedback = lazy(() => import("../pages/Admin/AdminFeedback"));
const Feedback = lazy(() => import("../pages/Feedback/Feedback"));

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
      <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: "#17233C", mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: "#475467" }}>
        {subtitle}
      </Typography>
    </Box>
  </Container>
);

const ROOM_MANAGER_TYPES = [USER_TYPES.OWNER];
const SEEKER_TYPES = [USER_TYPES.SEEKER];
const ENQUIRY_TYPES = [USER_TYPES.OWNER, USER_TYPES.SEEKER];
const FEEDBACK_TYPES = [USER_TYPES.OWNER, USER_TYPES.SEEKER];

const AppRoutes = () => (
  <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<FindRooms />} />
        <Route path="rooms/:id" element={<RoomDetail />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="safety" element={<Safety />} />
        <Route path="liked-rooms" element={<LikedRooms />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allowed={ROOM_MANAGER_TYPES} />}>
            <Route path="post-room" element={<PostRoom />} />
            <Route path="my-rooms" element={<MyRooms />} />
          </Route>
          <Route element={<RoleRoute allowed={ENQUIRY_TYPES} />}>
            <Route path="enquiries" element={<MyEnquiries />} />
          </Route>
          <Route element={<RoleRoute allowed={SEEKER_TYPES} />}>
            <Route path="my-applications" element={<Navigate to="/enquiries" replace />} />
          </Route>
          <Route element={<RoleRoute allowed={FEEDBACK_TYPES} />}>
            <Route path="feedback" element={<Feedback />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/feedback" element={<AdminFeedback />} />
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
