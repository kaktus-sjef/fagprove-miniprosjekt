import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/login/login";
import Dashboard from "../pages/Dashboard/dashboard";
import Users from "../pages/users/users";
import Roles from "../pages/roles/roles";
import Team from "../pages/team/team";
import ActivityLog from "../pages/activityLog/activityLog";
import Settings from "../pages/settings/settings";
import ProtectedRoute from "../components/auth/protectedroute";

function protectedPage(page: React.ReactNode) {
  return (
    <ProtectedRoute>
      {page}
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
        <Route path="/users" element={protectedPage(<Users />)} />
        <Route path="/roles" element={protectedPage(<Roles />)} />
        <Route path="/team" element={protectedPage(<Team />)} />
        <Route path="/groups" element={<Navigate to="/team" replace />} />
        <Route path="/activity-log" element={protectedPage(<ActivityLog />)} />
        <Route path="/settings" element={protectedPage(<Settings />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
