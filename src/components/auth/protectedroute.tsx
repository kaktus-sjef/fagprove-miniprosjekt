import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { auth } from "../../firebase/firebase";

function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const currentUser = user ?? auth.currentUser;

  if (!currentUser) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
