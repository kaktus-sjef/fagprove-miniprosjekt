import { useEffect, useMemo, useState } from "react";

import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import SearchBar from "../../components/searchBar/searchBar";
import FilterSelect from "../../components/filterSelect/filterSelect";
import UserTable from "../../components/userTable/userTable";
import {
  createManagedUserProfile,
  getAllUsers,
  ManageUserInput,
  updateManagedUserProfile,
  UserProfile,
  UserRole
} from "../../services/userService";
import { logActivity } from "../../services/activityLogService";
import {
  getAllTeams,
  TeamProfile
} from "../../services/teamService";
import {
  formatBoolean,
  formatRole,
  formatUserStatus
} from "../../utils/formatters";
import {
  getTeamLabel
} from "../../utils/teamDisplay";

import "./users.css";
import "../Dashboard/dashboard.css";

type UserFormState = ManageUserInput;

const emptyForm: UserFormState = {
  name: "",
  email: "",
  phone: "",
  team: "",
  role: "user",
  status: "active"
};

function formatDate(dateValue: any) {
  if (!dateValue) return FaMinus({ className: "missing-value-icon " });

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

function getFormFromUser(user: UserProfile): UserFormState {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    team: user.team ?? "",
    role: user.role,
    status: user.status
  };
}

function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

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
      setError("Kunne ikke hente brukere.");
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

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      const searchableText = [
        user.name,
        user.email,
        user.phone,
        getTeamLabel(user.team, teams),
        formatRole(user.role),
        formatUserStatus(user.status),
        formatBoolean(user.emailVerified),
        formatBoolean(user.roleVerified),
        formatDate(user.createdAt),
        formatDate(user.lastLogin)
      ].join(" ");

      const matchesSearch =
        !searchValue || searchableText.toLowerCase().includes(searchValue);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, teams, search, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setForm(getFormFromUser(user));
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
  };

  const updateFormField = (
    field: keyof UserFormState,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmitUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Navn må fylles ut.");
      return;
    }

    if (!form.role) {
      setFormError("Rolle må velges.");
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        await updateManagedUserProfile(editingUser.uid, form);

        // AKTIVITETSLOGG + ROLLE-GODKJENNING: Logger når en ventende bruker får tildelt rolle.
        if (editingUser.role === "waiting" && form.role !== "waiting") {
          void logActivity({
            type: "role_assigned",
            level: "success",
            title: "Rolle godkjent",
            description: `${form.name} ble godkjent som ${formatRole(form.role)}.`,
            targetId: editingUser.uid,
            targetName: form.name
          }).catch((error) => {
            console.error("Kunne ikke logge rolle-godkjenning:", error);
          });
        }
      } else {
        await createManagedUserProfile(form);
      }

      await fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Kunne ikke lagre bruker:", error);
      setFormError("Kunne ikke lagre brukeren.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-page">
      <Sidebar />

      <section className="admin-main">
        <Header title="Brukere" />

        <div className="admin-body">
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <h2>Brukere</h2>
              </div>
            </div>

            <div className="admin-toolbar">
              <SearchBar
                className="dashboard-search"
                placeholder="Søk etter bruker..."
                value={search}
                onChange={setSearch}
              />

              <FilterSelect
                type="role"
                value={roleFilter}
                onChange={setRoleFilter}
              />

              <FilterSelect
                type="status"
                value={statusFilter}
                onChange={setStatusFilter}
              />

              <button
                type="button"
                className="primary-action-button"
                onClick={openCreateModal}
              >
                {FaPlus({ className: "icon", style: { color: "white" } })}
                Legg til bruker
              </button>
            </div>

            {error && <p className="table-error">{error}</p>}
            <UserTable
              users={filteredUsers}
              teams={teams}
              loading={loading}
              onEditUser={openEditModal}
              className="users-full-table"
              columns={[
                "name",
                "email",
                "emailVerified",
                "phone",
                "team",
                "role",
                "roleVerified",
                "status",
                "createdAt",
                "lastLogin",
                "actions"
              ]}
            />
          </section>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-modal-title"
          >
            <div className="user-modal-header">
              <div>
                <h2 id="user-modal-title">
                  {editingUser ? "Rediger bruker" : "Legg til bruker"}
                </h2>
                <p>
                  {editingUser ? "Oppdater brukerprofilen." : "Opprett en ny brukerprofil."}
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

            <form className="user-form" onSubmit={handleSubmitUser}>
              <div className="form-field">
                <label htmlFor="user-name">Navn *</label>
                <input
                  id="user-name"
                  type="text"
                  value={form.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Ola Nordmann"
                />
              </div>

              <div className="form-field">
                <label htmlFor="user-email">E-post</label>
                <input
                  id="user-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateFormField("email", event.target.value)}
                  placeholder="epost@firma.no"
                />
              </div>

              <div className="form-field">
                <label htmlFor="user-phone">Telefon</label>
                <input
                  id="user-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateFormField("phone", event.target.value)}
                  placeholder="Valgfritt"
                />
              </div>

              <div className="form-field">
                <label htmlFor="user-team">Team</label>
                <select
                  id="user-team"
                  value={form.team}
                  onChange={(event) => updateFormField("team", event.target.value)}
                >
                  <option value="">Ikke satt</option>
                  {form.team && !teams.some((team) => team.id === form.team || team.name === form.team) && (
                    <option value={form.team}>{getTeamLabel(form.team, teams)}</option>
                  )}
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="user-role">Rolle *</label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(event) => updateFormField("role", event.target.value as UserRole)}
                >
                  <option value="admin">Administrator</option>
                  <option value="user">Bruker</option>
                  <option value="tester">Tester</option>
                  <option value="waiting">Venter</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="user-status">Status</label>
                <select
                  id="user-status"
                  value={form.status}
                  onChange={(event) => updateFormField("status", event.target.value)}
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktivert</option>
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
                  {saving ? "Lagrer..." : editingUser ? "Lagre endringer" : "Legg til bruker"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default Users;



