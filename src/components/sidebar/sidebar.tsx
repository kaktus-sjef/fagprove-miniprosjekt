import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <h2>Administrasjon</h2>
            </div>

            <nav className="sidebar-nav">

                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Oversikt
                </NavLink>

                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Brukere
                </NavLink>

                <NavLink
                    to="/roles"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Roller
                </NavLink>

                <NavLink
                    to="/groups"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Grupper
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Innstillinger
                </NavLink>

            </nav>

        </aside>
    );
}

export default Sidebar;