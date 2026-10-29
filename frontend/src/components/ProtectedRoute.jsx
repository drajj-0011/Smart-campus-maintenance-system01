import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// only logged in users (and allowed roles) can open the page
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectedRoute;
