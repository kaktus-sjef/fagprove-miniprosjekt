import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { auth } from "../../firebase/firebase";

import "./protectedroute.css";

function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    userProfile,
    loading,
    profileLoading,
    authError
  } = useAuth();
  const location = useLocation();
  const currentUser = user ?? auth.currentUser;

  if (loading || profileLoading) {
    return <p className="protected-route-loading">Laster...</p>;
  }

  if (!currentUser || !currentUser.emailVerified) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  const hasAdminAccess =
    userProfile?.role === "admin" && userProfile.roleVerified === true;

  if (!hasAdminAccess) {
    return (
      <main className="protected-route-message">
        <section>
          <h1>Tilgang venter på godkjenning</h1>
          <p>
            Brukeren din må verifiseres av en administrator før du kommer videre.
          </p>

          {authError && <span>{authError}</span>}
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;
