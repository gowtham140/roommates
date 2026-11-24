import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { canManageRooms, isAdmin, isSeeker } from "../../utils/userTypes";

const RoleRoute = ({ allowed }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(user.userType)) {
    const fallback = isAdmin(user)
      ? "/admin"
      : canManageRooms(user)
      ? "/my-rooms"
      : isSeeker(user)
      ? "/rooms"
      : "/";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
