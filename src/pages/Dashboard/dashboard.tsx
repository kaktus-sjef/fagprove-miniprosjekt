import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import SearchBar from "../../components/searchBar/searchBar";
import FilterSelect from "../../components/filterSelect/filterSelect";
import UserTable from "../../components/userTable/userTable";

import "./dashboard.css";

import {
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
import {
  getAllTeams,
  TeamProfile
} from "../../services/teamService";
import {
  formatRole,
  formatUserStatus
} from "../../utils/formatters";
import {
  getTeamLabel
} from "../../utils/teamDisplay";

function Dashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const [userData, teamData] = await Promise.all([
        getAllUsers(),
        getAllTeams()
      ]);

      setUsers(userData);
      setTeams(teamData);
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

      const selectedTeam = teams.find((team) => team.id === teamFilter);
      const matchesTeam =
        !teamFilter || user.team === teamFilter || user.team === selectedTeam?.name;

      const matchesStatus =
        !statusFilter || user.status === statusFilter;

      const searchableText = [
        user.name,
        user.email,
        getTeamLabel(user.team, teams),
        formatRole(user.role),
        formatUserStatus(user.status)
      ].join(" ");

      const matchesSearch =
        !searchValue || searchableText.toLowerCase().includes(searchValue);

      return matchesTeam && matchesStatus && matchesSearch;
    });
  }, [users, teams, search, teamFilter, statusFilter]);

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
              <li>Deaktiverte brukere</li>
              <li>
                <h3>{inactiveUsers}</h3>
              </li>
              <li className="analytics-change change-negative">
                {FaLongArrowAltDown({ className: "icon" })}
                {inactiveUsers}
                <p>Deaktiverte nå</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="dashboard-content-section">
          <div className="users-table-header">
            <div>
              <h2>Brukere</h2>
            </div>
          </div>

          <div className="dashboard-filter">
            <SearchBar
              className="dashboard-search"
              placeholder="Søk etter bruker..."
              value={search}
              onChange={setSearch}
            />

            <FilterSelect
              type="team"
              value={teamFilter}
              onChange={setTeamFilter}
              teams={teams}
            />

            <FilterSelect
              type="status"
              value={statusFilter}
              onChange={setStatusFilter}
            />

           
          </div>

          {error && <p className="table-error">{error}</p>}
          <UserTable
            users={filteredUsers}
            teams={teams}
            loading={loading}
            columns={["name", "email", "team", "role", "status", "lastLogin", "actions"]}
          />
        </section>
      </section>
    </main>
  );
}

export default Dashboard;




