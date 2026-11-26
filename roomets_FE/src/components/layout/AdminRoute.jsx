import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { isAdmin } from "../../utils/userTypes";

const AdminRoute = () => {
  const { user } = useAuth();
  return isAdmin(user) ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
