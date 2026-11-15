import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router";

function AdminRoute() {
  const { userInfo } = useSelector((state) => state.auth);

  return userInfo?.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}

export default AdminRoute;