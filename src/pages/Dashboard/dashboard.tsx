import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../components/sidebar/sidebar";
import Header from "../../components/header/header";
import SearchBar from "../../components/searchBar/searchBar";
import FilterSelect from "../../components/filterSelect/filterSelect";
import StatCards, { StatCardOption } from "../../components/statCards/statCards";
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
  const userStats: StatCardOption[] = [
    {
      id: "total-users",
      title: "Totale brukere",
      value: totalUsers,
      description: "Registrert totalt",
      icon: FaUsers({ className: "icon" }),
      trendIcon: FaMinus({ className: "icon" }),
      variant: "total",
      trend: "neutral",
      ariaLabel: `Totale brukere ${totalUsers}. Registrert totalt ${totalUsers}.`
    },
    {
      id: "active-users",
      title: "Aktive brukere",
      value: activeUsers,
      description: "Aktive nå",
      icon: FaUserCheck({ className: "icon" }),
      trendIcon: FaLongArrowAltUp({ className: "icon" }),
      variant: "active",
      trend: "positive",
      ariaLabel: `Aktive brukere ${activeUsers}. Aktive nå ${activeUsers}.`
    },
    {
      id: "inactive-users",
      title: "Deaktiverte brukere",
      value: inactiveUsers,
      description: "Deaktiverte nå",
      icon: FaUserMinus({ className: "icon" }),
      trendIcon: FaLongArrowAltDown({ className: "icon" }),
      variant: "inactive",
      trend: "negative",
      ariaLabel: `Deaktiverte brukere ${inactiveUsers}. Deaktiverte nå ${inactiveUsers}.`
    }
  ];

  return (
    <main className="dashboard-content">
      <Sidebar />

      <section className="dashboard-section">
        <Header title="Oversikt" />

        <StatCards ariaLabel="Brukerstatistikk" cards={userStats} />

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




