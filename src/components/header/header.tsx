import "./header.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { FaRegBell } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";

import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/authContext";
import {
  ActivityLogEntry,
  getRecentActivities,
  getUnreadActivityCount
} from "../../services/activityLogService";
import { getWaitingRoleUsers } from "../../services/userService";
import SearchBar from "../searchBar/searchBar";

interface HeaderProps {
  title: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentActivities, setRecentActivities] = useState<ActivityLogEntry[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [waitingRoleCount, setWaitingRoleCount] = useState(0);

  const displayName =
    userProfile?.name ||
    user?.displayName ||
    "Administrator";

  const roleText =
    userProfile?.role === "waiting"
      ? "Venter på rolle"
      : userProfile?.role ?? "Administrator";

  const handleUserMenuChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target.value === "logout") {
      await signOut(auth);
      navigate("/");
    }
  };

  const notificationCount = useMemo(() => {
    return unreadCount + waitingRoleCount;
  }, [unreadCount, waitingRoleCount]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [activities, unreadActivities, waitingUsers] = await Promise.all([
          getRecentActivities(5),
          getUnreadActivityCount(),
          getWaitingRoleUsers()
        ]);

        setRecentActivities(activities);
        setUnreadCount(unreadActivities);
        setWaitingRoleCount(waitingUsers.length);
      } catch (error) {
        console.error("Kunne ikke hente varsler:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <p>Velkommen, {displayName}</p>
      </div>

      <div className="header-right">
        <SearchBar
          placeholder="Søk..."
          options={[
            { value: "all", label: "Alt" },
            { value: "users", label: "Brukere" },
            { value: "teams", label: "Team" }
          ]}
        />

        <div className="notification-menu">
          <button
            className="icon-button"
            aria-label="Varsler"
            onClick={() => setNotificationsOpen((current) => !current)}
          >
            {FaRegBell({ className: "icon" })}
            {notificationCount > 0 && (
              <span className="notification-badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <strong>Varsler</strong>
                <button type="button" onClick={() => navigate("/activity-log")}>
                  Se alle
                </button>
              </div>

              {waitingRoleCount > 0 && (
                <button
                  type="button"
                  className="notification-item warning"
                  onClick={() => navigate("/roles")}
                >
                  <strong>{waitingRoleCount} venter på rolle</strong>
                  <span>Gå til Roller for å godkjenne tilgang.</span>
                </button>
              )}

              {recentActivities.length === 0 ? (
                <p className="notification-empty">Ingen nye hendelser.</p>
              ) : (
                recentActivities.map((activity) => (
                  <button
                    type="button"
                    className="notification-item"
                    key={activity.id}
                    onClick={() => navigate("/activity-log")}
                  >
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="icon-button" aria-label="Hjelp">
          {GoQuestion({ className: "icon" })}
        </button>

        <div className="user-menu">
          <div className="user-avatar">
            {getInitials(displayName)}
          </div>

          <select defaultValue="" onChange={handleUserMenuChange}>
            <option value="" disabled>
              {displayName} · {roleText}
            </option>
            <option value="profile">Min profil</option>
            <option value="logout">Logg ut</option>
          </select>
        </div>
      </div>
    </header>
  );
}

export default Header;
