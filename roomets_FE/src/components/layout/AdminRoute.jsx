import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const AdminRoute = () => {
  const { user } = useAuth();
  return user?.userType === "1" ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
