import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import SearchBar from "../../components/searchBar/searchBar";

import "./dashboard.css";

import {
  FaEllipsisH,
  FaFilter,
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaUsers,
  FaMinus 
} from "react-icons/fa";

import { FaUserCheck, FaUserMinus } from "react-icons/fa6";

import {
  getAllUsers,
  UserProfile
} from "../../services/userService";

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (!name.trim()) return "?";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatDate(dateValue: any) {
  if (!dateValue) return FaMinus({ className: "icon missing-value-icon" });

  if (dateValue.toDate) {
    return dateValue.toDate().toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return FaMinus({ className: "missing-value-icon " });
}

function formatRole(role: string) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "user":
      return "Bruker";
    case "tester":
      return "Tester";
    case "waiting":
      return "Venter";
    default:
      return role;
  }
}

function formatStatus(status: string) {
  return status === "active" ? "Aktiv" : "Inaktiv";
}

function formatTeam(team?: string | null) {
  switch (team) {
    case "admin":
      return "Administrasjon";
    case "security":
      return "Sikkerhet";
    case "accounting":
      return "Økonomi";
    case "it":
      return "IT";
    case "customerservice":
      return "Kundeservice";
    case "sales":
      return "Salg";
    default:
      return team || "Ikke satt";
  }
}

function Dashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [teamFilter, setTeamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers();

      setUsers(data);
    } catch (error) {
      console.error("Kunne ikke hente brukere:", error);
      setError("Kunne ikke hente brukere fra databasen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.trim().toLowerCase();

      const searchableValues: Record<string, string> = {
        all: [
          user.name,
          user.email,
          formatTeam(user.team),
          formatRole(user.role),
          formatStatus(user.status)
        ].join(" "),
        name: user.name ?? "",
        email: user.email ?? "",
        team: formatTeam(user.team),
        role: formatRole(user.role),
        status: formatStatus(user.status)
      };

      const matchesSearch =
        !searchValue ||
        searchableValues[searchField]?.toLowerCase().includes(searchValue);

      const matchesTeam =
        !teamFilter || user.team === teamFilter;

      const matchesStatus =
        !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesTeam && matchesStatus;
    });
  }, [users, search, searchField, teamFilter, statusFilter]);

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const inactiveUsers = users.filter((user) => user.status === "inactive").length;

  return (
    <main className="dashboard-content">
      <Sidebar />

      <section className="dashboard-section">
        <Header title="Oversikt" />

        <section className="dashboard-analytics">
          <div className="analytics-card stat-total">
            <div className="icon-box stat-icon-total">
              {FaUsers({ className: "icon" })}
            </div>

            <ul className="analytics-list">
              <li>Totale brukere</li>
              <li>
                <h3>{totalUsers}</h3>
              </li>
              <li className="analytics-change change-neutral">
                {FaMinus({ className: "icon" })}
                {totalUsers}
                <p>Registrert totalt</p>
              </li>
            </ul>
          </div>

          <div className="analytics-card stat-active">
            <div className="icon-box stat-icon-active">
              {FaUserCheck({ className: "icon" })}
            </div>

            <ul className="analytics-list">
              <li>Aktive brukere</li>
              <li>
                <h3>{activeUsers}</h3>
              </li>
              <li className="analytics-change change-positive">
                {FaLongArrowAltUp({ className: "icon" })}
                {activeUsers}
                <p>Aktive nå</p>
              </li>
            </ul>
          </div>

          <div className="analytics-card stat-inactive">
            <div className="icon-box stat-icon-inactive">
              {FaUserMinus({ className: "icon" })}
            </div>

            <ul className="analytics-list">
              <li>Inaktive brukere</li>
              <li>
                <h3>{inactiveUsers}</h3>
              </li>
              <li className="analytics-change change-negative">
                {FaLongArrowAltDown({ className: "icon" })}
                {inactiveUsers}
                <p>Inaktive nå</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="dashboard-content-section">
          <div className="users-table-header">
            <div>
              <h2>Brukere</h2>
              <p>Viser {filteredUsers.length} av {totalUsers} brukere</p>
            </div>
          </div>

          <div className="dashboard-filter">
            <SearchBar
              className="dashboard-search"
              placeholder="Søk etter bruker..."
              value={search}
              onChange={setSearch}
              selectedOption={searchField}
              onOptionChange={setSearchField}
              options={[
                { value: "all", label: "Alle felt" },
                { value: "name", label: "Navn" },
                { value: "email", label: "E-post" },
                { value: "team", label: "Gruppe" },
                { value: "role", label: "Rolle" },
                { value: "status", label: "Status" }
              ]}
            />

            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
            >
              <option value="">Alle grupper</option>
              <option value="admin">Administrasjon</option>
              <option value="security">Sikkerhet</option>
              <option value="accounting">Økonomi</option>
              <option value="it">IT</option>
              <option value="customerservice">Kundeservice</option>
              <option value="sales">Salg</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value=""> {FaFilter({ className: "icon" })} Alle statuser</option>
              <option value="active">Aktive</option>
              <option value="inactive">Inaktive</option>
            </select>

           
          </div>

          {error && <p className="table-error">{error}</p>}

          <div className="dashboard-table">
            <table>
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>E-post</th>
                  <th>Team</th>
                  <th>Rolle</th>
                  <th>Status</th>
                  <th>Sist pålogget</th>
                  <th>Handlinger</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="empty-table-cell">
                      Henter brukere...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-table-cell">
                      Ingen brukere funnet.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td>
                        <div className="user-cell">
                          <div className="table-avatar">
                            {getInitials(user.name)}
                          </div>

                          <span>{user.name || "Ukjent bruker"}</span>
                        </div>
                      </td>

                      <td>{user.email}</td>

                      <td>{formatTeam(user.team)}</td>

                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {formatRole(user.role)}
                        </span>
                      </td>

                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {formatStatus(user.status)}
                        </span>
                      </td>

                      <td>{formatDate(user.lastLogin)}</td>

                      <td>
                        <button
                          type="button"
                          className="action-button"
                          aria-label={`Handlinger for ${user.name || user.email}`}
                        >
                          {FaEllipsisH({ className: "icon" })}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
