import { NavLink } from "react-router-dom";
import "./sidebar.css";
import { FiHome } from "react-icons/fi";
import { FaUsers, FaUserShield, FaSitemap } from "react-icons/fa";
import { TbReport } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";



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
                    {FiHome({})}
                    Oversikt
                </NavLink>

                <NavLink
                    to="/users"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    {FaUsers({})}
                    Brukere
                </NavLink>

                <NavLink
                    to="/roles"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    {FaUserShield({})}
                    Roller
                </NavLink>

                <NavLink
                    to="/team"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    {FaSitemap({})}
                    Team
                </NavLink>

                <NavLink
                    to="/activity-log"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    {TbReport({})}
                    Aktivitetslogg
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    {IoSettingsOutline({})}
                    Innstillinger
                </NavLink>

            </nav>

        </aside>
    );
}

export default Sidebar;
