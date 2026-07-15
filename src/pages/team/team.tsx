import { useEffect, useMemo, useState } from "react";

import {
  FaEllipsisH,
  FaHandshake,
  FaHeadset,
  FaLaptopCode,
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaMinus,
  FaPlus,
  FaRegTrashAlt,
  FaShieldAlt,
  FaTimes,
  FaUserCog,
  FaUsers
} from "react-icons/fa";
import { FaCoins } from "react-icons/fa6";
import { FaPeopleGroup, FaUserCheck } from "react-icons/fa6";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import {
  deleteTeam,
  createTeam,
  getAllTeams,
  TeamInput,
  TeamProfile
} from "../../services/teamService";
import {
  getAllUsers,
  UserProfile
} from "../../services/userService";

import "./team.css";
import "../Dashboard/dashboard.css";

type TeamFormState = TeamInput;

const fallbackTeams: TeamProfile[] = [
  { id: "admin", name: "Administrasjon", description: "Administrasjon og drift", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null },
  { id: "security", name: "Sikkerhet", description: "Sikkerhet og tilgangsstyring", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null },
  { id: "accounting", name: "Økonomi", description: "Økonomi og fakturering", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null },
  { id: "it", name: "IT", description: "Teknisk drift og support", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null },
  { id: "customerservice", name: "Kundeservice", description: "Kundestøtte og oppfølging", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null },
  { id: "sales", name: "Salg", description: "Salg og forretningsutvikling", lead: "", status: "active", avatarUrl: "", createdAt: null, updatedAt: null }
];

const emptyForm: TeamFormState = {
  name: "",
  description: "",
  lead: "",
  status: "active",
  avatarUrl: ""
};

function getInitials(name: string) {
  const trimmedName = name.trim();
  const parts = trimmedName.split(" ");

  if (!trimmedName) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function getTeamMembers(team: TeamProfile, users: UserProfile[]) {
  return users.filter((user) => {
    const userTeam = user.team?.toLowerCase();

    return userTeam === team.id.toLowerCase() || userTeam === team.name.toLowerCase();
  });
}

function formatStatus(status: string) {
  return status === "active" ? "Aktiv" : "Inaktiv";
}

function getTeamTheme(team: TeamProfile) {
  const key = `${team.id} ${team.name}`.toLowerCase();

  if (key.includes("økonomi") || key.includes("konomi") || key.includes("accounting")) {
    return "team-theme-green";
  }

  if (key.includes("administrasjon") || key.includes("admin")) {
    return "team-theme-red";
  }

  if (key.includes("sikkerhet") || key.includes("security")) {
    return "team-theme-purple";
  }

  if (key.includes("it")) {
    return "team-theme-blue";
  }

  if (key.includes("kundeservice") || key.includes("customer")) {
    return "team-theme-orange";
  }

  if (key.includes("salg") || key.includes("sales")) {
    return "team-theme-pink";
  }

  return "team-theme-teal";
}

function renderTeamIcon(team: TeamProfile) {
  const key = `${team.id} ${team.name}`.toLowerCase();
  const iconClassName = "team-avatar-icon";

  if (key.includes("økonomi") || key.includes("konomi") || key.includes("accounting")) {
    return FaCoins({ className: iconClassName });
  }

  if (key.includes("administrasjon") || key.includes("admin")) {
    return FaUserCog({ className: iconClassName });
  }

  if (key.includes("sikkerhet") || key.includes("security")) {
    return FaShieldAlt({ className: iconClassName });
  }

  if (key.includes("it")) {
    return FaLaptopCode({ className: iconClassName });
  }

  if (key.includes("kundeservice") || key.includes("customer")) {
    return FaHeadset({ className: iconClassName });
  }

  if (key.includes("salg") || key.includes("sales")) {
    return FaHandshake({ className: iconClassName });
  }

  return FaPeopleGroup({ className: iconClassName });
}

function Team() {
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<TeamFormState>(emptyForm);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teamData, userData] = await Promise.all([
        getAllTeams(),
        getAllUsers()
      ]);

      const visibleTeams = teamData.length > 0 ? teamData : fallbackTeams;
      setTeams(visibleTeams);
      setUsers(userData);
      setSelectedTeamId((current) => current || visibleTeams[0]?.id || "");
    } catch (error) {
      console.error("Kunne ikke hente team:", error);
      setError("Kunne ikke hente team fra databasen.");
      setTeams(fallbackTeams);
      setSelectedTeamId((current) => current || fallbackTeams[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const selectedTeam = useMemo(() => {
    return teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  }, [teams, selectedTeamId]);

  const selectedMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return getTeamMembers(selectedTeam, users);
  }, [selectedTeam, users]);

  const totalTeams = teams.length;
  const activeTeams = teams.filter((team) => team.status === "active").length;
  const inactiveTeams = teams.filter((team) => team.status === "inactive").length;

  const openCreateModal = () => {
    setForm(emptyForm);
    setFormError("");
    setOpenActionsFor(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setForm(emptyForm);
    setFormError("");
  };

  const updateFormField = (field: keyof TeamFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleCreateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Teamnavn må fylles ut.");
      return;
    }

    try {
      setSaving(true);
      await createTeam(form);
      await fetchPageData();
      closeModal();
    } catch (error) {
      console.error("Kunne ikke lagre team:", error);
      setFormError("Kunne ikke lagre teamet.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async (team: TeamProfile) => {
    try {
      setOpenActionsFor(null);
      await deleteTeam(team.id);
      await fetchPageData();
    } catch (error) {
      console.error("Kunne ikke slette team:", error);
      setError("Kunne ikke slette teamet.");
    }
  };

  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Team" />

        <div className="admin-body">
          <section className="dashboard-analytics team-analytics">
            <div className="analytics-card stat-total">
              <div className="icon-box stat-icon-total">
                {FaPeopleGroup({ className: "icon" })}
              </div>

              <ul className="analytics-list">
                <li>Totale team</li>
                <li><h3>{totalTeams}</h3></li>
                <li className="analytics-change change-neutral">
                  {FaMinus({ className: "icon" })}
                  {totalTeams}
                  <p>Registrert totalt</p>
                </li>
              </ul>
            </div>

            <div className="analytics-card stat-active">
              <div className="icon-box stat-icon-active">
                {FaUserCheck({ className: "icon" })}
              </div>

              <ul className="analytics-list">
                <li>Aktive team</li>
                <li><h3>{activeTeams}</h3></li>
                <li className="analytics-change change-positive">
                  {FaLongArrowAltUp({ className: "icon" })}
                  {activeTeams}
                  <p>Aktive nå</p>
                </li>
              </ul>
            </div>

            <div className="analytics-card stat-inactive">
              <div className="icon-box stat-icon-inactive">
                {FaUsers({ className: "icon" })}
              </div>

              <ul className="analytics-list">
                <li>Inaktive team</li>
                <li><h3>{inactiveTeams}</h3></li>
                <li className="analytics-change change-negative">
                  {FaLongArrowAltDown({ className: "icon" })}
                  {inactiveTeams}
                  <p>Inaktive nå</p>
                </li>
              </ul>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Team</h2>
                <p>Oversikt over grupper og ansvarlige.</p>
              </div>

              <button
                type="button"
                className="primary-action-button"
                onClick={openCreateModal}
              >
                {FaPlus({ className: "icon" })}
                Nytt team
              </button>
            </div>

            {error && <p className="table-error">{error}</p>}

            <div className="admin-table team-table">
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Medlemmer</th>
                    <th>Ansvarlig</th>
                    <th>Status</th>
                    <th>Handlinger</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="empty-table-cell">
                        Henter team...
                      </td>
                    </tr>
                  ) : (
                    teams.map((team) => {
                      const members = getTeamMembers(team, users);

                      return (
                        <tr
                          key={team.id}
                          className={selectedTeam?.id === team.id ? "selected-row" : ""}
                          onClick={() => setSelectedTeamId(team.id)}
                        >
                          <td>
                            <div className="team-name-cell">
                              <div className={`team-avatar ${getTeamTheme(team)}`}>
                                {team.avatarUrl ? (
                                  <img src={team.avatarUrl} alt="" />
                                ) : (
                                  renderTeamIcon(team)
                                )}
                              </div>

                              <div>
                                <strong>{team.name}</strong>
                                <p>{team.description || "Ingen beskrivelse"}</p>
                              </div>
                            </div>
                          </td>

                          <td>{members.length}</td>
                          <td>{team.lead || "Ikke satt"}</td>
                          <td>
                            <span className={`admin-badge ${team.status === "active" ? "success" : "muted"}`}>
                              {formatStatus(team.status)}
                            </span>
                          </td>
                          <td onClick={(event) => event.stopPropagation()}>
                            <div className="actions-menu">
                              <button
                                type="button"
                                className="action-button"
                                onClick={() => setOpenActionsFor(openActionsFor === team.id ? null : team.id)}
                                aria-expanded={openActionsFor === team.id}
                                aria-label={`Handlinger for ${team.name}`}
                              >
                                {FaEllipsisH({ className: "icon" })}
                              </button>

                              {openActionsFor === team.id && (
                                <div className="actions-dropdown">
                                  <button
                                    type="button"
                                    className="actions-dropdown-item danger"
                                    onClick={() => handleDeleteTeam(team)}
                                  >
                                    {FaRegTrashAlt({ className: "icon" })}
                                    Slett team
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {selectedTeam && (
            <section className="team-detail-panel">
              <aside className="team-detail-summary">
                <div className={`team-detail-avatar ${getTeamTheme(selectedTeam)}`}>
                  {selectedTeam.avatarUrl ? (
                    <img src={selectedTeam.avatarUrl} alt="" />
                  ) : (
                    renderTeamIcon(selectedTeam)
                  )}
                </div>

                <div className="team-detail-title">
                  <h2>{selectedTeam.name}</h2>
                  <span className={`admin-badge ${selectedTeam.status === "active" ? "success" : "muted"}`}>
                    {formatStatus(selectedTeam.status)}
                  </span>
                </div>

                <p>{selectedTeam.description || "Ingen beskrivelse lagt inn."}</p>

                <div className="team-detail-stats">
                  <div>
                    <strong>{selectedMembers.length}</strong>
                    <span>Medlemmer</span>
                  </div>

                  <div>
                    <strong>{selectedTeam.lead || "Ikke satt"}</strong>
                    <span>Ansvarlig</span>
                  </div>
                </div>
              </aside>

              <div className="team-detail-content">
                <div className="team-detail-tabs">
                  <button type="button" className="active">Medlemmer</button>
                  <button type="button">Detaljer</button>
                  <button type="button">Innstillinger</button>
                </div>

                <div className="team-members-list">
                  <div className="team-members-header">
                    <span>Navn</span>
                    <span>E-post</span>
                    <span>Rolle</span>
                  </div>

                  {selectedMembers.length === 0 ? (
                    <p className="empty-detail-state">Ingen medlemmer i dette teamet enda.</p>
                  ) : (
                    selectedMembers.map((member) => (
                      <div className="team-member-row" key={member.uid}>
                        <div className="member-name">
                          <div className="member-avatar">{getInitials(member.name)}</div>
                          <span>{member.name || "Ukjent bruker"}</span>
                        </div>
                        <span>{member.email || "Ikke registrert"}</span>
                        <span>{member.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-modal-title"
          >
            <div className="team-modal-header">
              <div>
                <h2 id="team-modal-title">Nytt team</h2>
                <p>Legg til et nytt team i databasen.</p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeModal}
                aria-label="Lukk"
              >
                {FaTimes({ className: "icon" })}
              </button>
            </div>

            <form className="team-form" onSubmit={handleCreateTeam}>
              <div className="form-field">
                <label htmlFor="team-name">Teamnavn *</label>
                <input
                  id="team-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Salg"
                />
              </div>

              <div className="form-field">
                <label htmlFor="team-description">Beskrivelse</label>
                <input
                  id="team-description"
                  type="text"
                  value={form.description}
                  onChange={(event) => updateFormField("description", event.target.value)}
                  placeholder="Salg og forretningsutvikling"
                />
              </div>

              <div className="form-field">
                <label htmlFor="team-lead">Ansvarlig</label>
                <input
                  id="team-lead"
                  type="text"
                  value={form.lead}
                  onChange={(event) => updateFormField("lead", event.target.value)}
                  placeholder="Ikke satt"
                />
              </div>

              <div className="form-field">
                <label htmlFor="team-avatar">Avatar URL</label>
                <input
                  id="team-avatar"
                  type="url"
                  value={form.avatarUrl}
                  onChange={(event) => updateFormField("avatarUrl", event.target.value)}
                  placeholder="Valgfritt"
                />
              </div>

              <div className="form-field">
                <label htmlFor="team-status">Status</label>
                <select
                  id="team-status"
                  value={form.status}
                  onChange={(event) => updateFormField("status", event.target.value)}
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                </select>
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Avbryt
                </button>

                <button
                  type="submit"
                  className="primary-action-button"
                  disabled={saving}
                >
                  {saving ? "Lagrer..." : "Legg til team"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Team;
