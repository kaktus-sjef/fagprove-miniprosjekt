import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

import { ReactNode } from "react";


interface Props {
    children: ReactNode;
}


function ProtectedRoute({ children }: Props) {

    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Laster...</div>;
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;

}


export default ProtectedRoute;