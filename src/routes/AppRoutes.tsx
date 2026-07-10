import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/login/login";
import Dashboard from "../pages/Dashboard/dashboard";
import ProtectedRoute from "../components/auth/protectedroute";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;