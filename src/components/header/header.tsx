import "./header.css";

import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { FaRegBell } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";

import { auth } from "../../firebase/firebase";
import { useAuth } from "../../context/authContext";
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

        <button className="icon-button" aria-label="Varsler">
          {FaRegBell({ className: "icon" })}
        </button>

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
