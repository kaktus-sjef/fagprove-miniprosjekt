import { useEffect, useMemo, useRef, useState } from "react";

import {
  FaEllipsisH,
  FaLongArrowAltDown,
  FaLongArrowAltUp,
  FaMinus,
  FaPen,
  FaPlus,
  FaRegTrashAlt,
  FaUsers
} from "react-icons/fa";
import { FaPeopleGroup, FaUserCheck } from "react-icons/fa6";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import DataTable, { DataTableColumn } from "../../components/dataTable/dataTable";
import FormModal, { FormModalField } from "../../components/formModal/formModal";
import StatCards, { StatCardOption } from "../../components/statCards/statCards";
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
  const firstTeamFieldRef = useRef<HTMLInputElement | null>(null);
  const teamDetailRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!isModalOpen) return;

    // UU: Start fokus i skjemaet slik at tab-rekkefolgen blir riktig i modalen.
    const focusTimer = window.setTimeout(() => {
      firstTeamFieldRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, [isModalOpen, editingTeam]);

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
  const teamStats: StatCardOption[] = [
    {
      id: "total-teams",
      title: "Totale team",
      value: totalTeams,
      description: "Registrert totalt",
      icon: FaPeopleGroup({ className: "icon" }),
      trendIcon: FaMinus({ className: "icon" }),
      variant: "total",
      trend: "neutral",
      ariaLabel: `Totale team ${totalTeams}. Registrert totalt ${totalTeams}.`
    },
    {
      id: "active-teams",
      title: "Aktive team",
      value: activeTeams,
      description: "Aktive nå",
      icon: FaUserCheck({ className: "icon" }),
      trendIcon: FaLongArrowAltUp({ className: "icon" }),
      variant: "active",
      trend: "positive",
      ariaLabel: `Aktive team ${activeTeams}. Aktive nå ${activeTeams}.`
    },
    {
      id: "inactive-teams",
      title: "Deaktiverte team",
      value: inactiveTeams,
      description: "Deaktiverte nå",
      icon: FaUsers({ className: "icon" }),
      trendIcon: FaLongArrowAltDown({ className: "icon" }),
      variant: "inactive",
      trend: "negative",
      ariaLabel: `Deaktiverte team ${inactiveTeams}. Deaktiverte nå ${inactiveTeams}.`
    }
  ];

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

  const handleSelectTeam = (team: TeamProfile) => {
    setSelectedTeamId(team.id);

    // UU: Når en rad åpnes med tastatur, flyttes fokus til team-oversikten.
    window.setTimeout(() => {
      teamDetailRef.current?.focus();
    }, 0);
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

  const teamModalFields: FormModalField<TeamFormState>[] = [
    {
      name: "name",
      id: "team-name",
      label: "Teamnavn *",
      placeholder: "Salg",
      inputRef: firstTeamFieldRef
    },
    {
      name: "description",
      id: "team-description",
      label: "Beskrivelse",
      placeholder: "Salg og forretningsutvikling"
    },
    {
      name: "lead",
      id: "team-lead",
      label: "Ansvarlig",
      placeholder: "Ikke satt"
    },
    {
      name: "avatarUrl",
      id: "team-avatar",
      label: "Avatar URL",
      type: "url",
      placeholder: "Valgfritt"
    },
    {
      name: "status",
      id: "team-status",
      label: "Status",
      options: [
        { value: "active", label: "Aktiv" },
        { value: "inactive", label: "Deaktivert" }
      ]
    }
  ];

  const teamAvatarChoices = (
    <>
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
    </>
  );

  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Team" />

        <div className="admin-body">
          <StatCards ariaLabel="Teamstatistikk" cards={teamStats} className="team-analytics" />

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
                {FaPlus({ className: "icon", style: { color: "white" } })}
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
              tableLabel="Teamtabell"
              selectedRowId={selectedTeam?.id}
              onRowClick={handleSelectTeam}
              getRowAriaLabel={(team) => `Åpne team ${team.name}. ${team.description || "Ingen beskrivelse"}. Status ${formatTeamStatus(team.status)}.`}
            />
          </section>

          {selectedTeam && (
            <section
              className="team-detail-panel"
              ref={teamDetailRef}
              tabIndex={-1}
              aria-label={`Teamoversikt for ${selectedTeam.name}`}
            >
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
                  tableLabel={`Medlemmer i ${selectedTeam.name}`}
                />
              </div>
            </section>
          )}
        </div>
      </section>

      <FormModal
        isOpen={isModalOpen}
        title={editingTeam ? "Rediger team" : "Nytt team"}
        description={editingTeam ? "Oppdater informasjonen for teamet." : "Legg til et nytt team i databasen."}
        titleId="team-modal-title"
        onClose={closeModal}
        className="team-modal"
        onSubmit={handleSubmitTeam}
        values={form}
        fields={teamModalFields}
        onFieldChange={updateFormField}
        formClassName="team-form"
        saving={saving}
        error={formError}
        extraContent={teamAvatarChoices}
        submitLabel={saving ? "Lagrer..." : editingTeam ? "Lagre endringer" : "Legg til team"}
      />
    </main>
  );
}

export default Team;