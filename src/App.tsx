import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/authContext";

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;