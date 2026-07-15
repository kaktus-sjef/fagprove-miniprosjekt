import { useEffect, useMemo, useState } from "react";

import {
  FaEllipsisH,
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaMinus,
  FaPen,
  FaPlus,
  FaRegTrashAlt,
  FaTimes,
  FaUsers
} from "react-icons/fa";
import { FaPeopleGroup, FaUserCheck } from "react-icons/fa6";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import DataTable, { DataTableColumn } from "../../components/dataTable/dataTable";
import {
  deleteTeam,
  createTeam,
  getAllTeams,
  TeamInput,
  TeamProfile,
  updateTeam
} from "../../services/teamService";
import {
  getAllUsers,
  UserProfile
} from "../../services/userService";
import { getInitials, formatTeamStatus } from "../../utils/formatters";
import {
  getTeamMemberAvatarTheme,
  getTeamTheme,
  renderTeamIcon,
  renderTeamIconByValue,
  teamColorOptions,
  teamIconOptions
} from "../../utils/teamDisplay";

import "./team.css";
import "../Dashboard/dashboard.css";

type TeamFormState = TeamInput;

const emptyForm: TeamFormState = {
  name: "",
  description: "",
  lead: "",
  status: "active",
  color: "teal",
  icon: "team",
  avatarUrl: ""
};

function getFormFromTeam(team: TeamProfile): TeamFormState {
  return {
    name: team.name ?? "",
    description: team.description ?? "",
    lead: team.lead ?? "",
    status: team.status,
    color: team.color ?? "teal",
    icon: team.icon ?? "team",
    avatarUrl: team.avatarUrl ?? ""
  };
}

function getTeamMembers(team: TeamProfile, users: UserProfile[]) {
  return users.filter((user) => {
    const userTeam = user.team?.toLowerCase();

    return userTeam === team.id.toLowerCase() || userTeam === team.name.toLowerCase();
  });
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
  const [editingTeam, setEditingTeam] = useState<TeamProfile | null>(null);
  const [form, setForm] = useState<TeamFormState>(emptyForm);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [teamData, userData] = await Promise.all([
        getAllTeams(),
        getAllUsers()
      ]);

      setTeams(teamData);
      setUsers(userData);
      setSelectedTeamId((current) => {
        if (current && teamData.some((team) => team.id === current)) return current;
        return teamData[0]?.id || "";
      });
    } catch (error) {
      console.error("Kunne ikke hente team:", error);
      setError("Kunne ikke hente team fra databasen.");
      setTeams([]);
      setSelectedTeamId("");
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

  const memberColumns: DataTableColumn<UserProfile>[] = selectedTeam
    ? [
        {
          key: "name",
          label: "Navn",
          render: (member) => (
            <div className="member-name">
              <div className={`member-avatar ${getTeamMemberAvatarTheme(selectedTeam)}`}>
                {getInitials(member.name)}
              </div>
              <span>{member.name || "Ukjent bruker"}</span>
            </div>
          )
        },
        {
          key: "email",
          label: "E-post",
          render: (member) => member.email || "Ikke registrert"
        },
        {
          key: "role",
          label: "Rolle",
          render: (member) => member.role
        }
      ]
    : [];

  const teamColumns: DataTableColumn<TeamProfile>[] = [
    {
      key: "team",
      label: "Team",
      render: (team) => (
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
      )
    },
    {
      key: "members",
      label: "Medlemmer",
      render: (team) => getTeamMembers(team, users).length
    },
    {
      key: "lead",
      label: "Ansvarlig",
      render: (team) => team.lead || "Ikke satt"
    },
    {
      key: "status",
      label: "Status",
      render: (team) => (
        <span className={`admin-badge ${team.status === "active" ? "success" : "muted"}`}>
          {formatTeamStatus(team.status)}
        </span>
      )
    },
    {
      key: "actions",
      label: "Handlinger",
      render: (team) => (
        <div className="actions-menu" onClick={(event) => event.stopPropagation()}>
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
                className="actions-dropdown-item"
                onClick={() => openEditModal(team)}
              >
                {FaPen({ className: "icon" })}
                Rediger team
              </button>

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
      )
    }
  ];

  const openCreateModal = () => {
    setEditingTeam(null);
    setForm(emptyForm);
    setFormError("");
    setOpenActionsFor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (team: TeamProfile) => {
    setEditingTeam(team);
    setForm(getFormFromTeam(team));
    setFormError("");
    setOpenActionsFor(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingTeam(null);
    setForm(emptyForm);
    setFormError("");
  };

  const updateFormField = (field: keyof TeamFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmitTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Teamnavn mÃ¥ fylles ut.");
      return;
    }

    try {
      setSaving(true);

      if (editingTeam) {
        await updateTeam(editingTeam.id, form);
      } else {
        await createTeam(form);
      }

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
                <li>Deaktiverte team</li>
                <li><h3>{inactiveTeams}</h3></li>
                <li className="analytics-change change-negative">
                  {FaLongArrowAltDown({ className: "icon" })}
                  {inactiveTeams}
                  <p>Deaktiverte nå</p>
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
            <DataTable
              rows={teams}
              columns={teamColumns}
              getRowKey={(team) => team.id}
              loading={loading}
              loadingText="Henter team..."
              emptyText="Ingen team funnet. Legg til et nytt team for å fylle databasen."
              className="admin-table team-table"
              selectedRowId={selectedTeam?.id}
              onRowClick={(team) => setSelectedTeamId(team.id)}
            />
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
                  <div>
                    <h2>{selectedTeam.name}</h2>
                    <span className={`admin-badge ${selectedTeam.status === "active" ? "success" : "muted"}`}>
                      {formatTeamStatus(selectedTeam.status)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="team-detail-edit-button"
                    onClick={() => openEditModal(selectedTeam)}
                    aria-label={`Rediger ${selectedTeam.name}`}
                  >
                    {FaPen({ className: "icon" })}
                  </button>
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
                <h3>Medlemmer</h3>

                <DataTable
                  rows={selectedMembers}
                  columns={memberColumns}
                  getRowKey={(member) => member.uid}
                  emptyText="Ingen medlemmer i dette teamet enda."
                  className="admin-table team-members-table"
                />
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
                <h2 id="team-modal-title">
                  {editingTeam ? "Rediger team" : "Nytt team"}
                </h2>
                <p>
                  {editingTeam ? "Oppdater informasjonen for teamet." : "Legg til et nytt team i databasen."}
                </p>
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

            <form className="team-form" onSubmit={handleSubmitTeam}>
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
                  <option value="inactive">Deaktivert</option>
                </select>
              </div>

              <div className="form-field avatar-choice-field">
                <label>Farge</label>
                <div className="team-choice-row">
                  {teamColorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`team-choice-button color-choice team-theme-${color.value} ${form.color === color.value ? "selected" : ""}`}
                      onClick={() => updateFormField("color", color.value)}
                      aria-label={`Velg ${color.label}`}
                    >
                      <span className="color-choice-dot" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field avatar-choice-field">
                <label>Ikon</label>
                <div className="team-choice-row">
                  {teamIconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      className={`team-choice-button icon-choice team-theme-${form.color || "teal"} ${form.icon === icon.value ? "selected" : ""}`}
                      onClick={() => updateFormField("icon", icon.value)}
                      aria-label={`Velg ${icon.label}`}
                    >
                      {renderTeamIconByValue(icon.value, "team-avatar-icon")}
                    </button>
                  ))}
                </div>
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
                  {saving ? "Lagrer..." : editingTeam ? "Lagre endringer" : "Legg til team"}
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




