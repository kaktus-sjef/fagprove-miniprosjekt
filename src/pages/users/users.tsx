import { useEffect, useMemo, useState } from "react";

import { FaPen, FaPlus, FaTimes } from "react-icons/fa";

import Header from "../../components/header/header";
import Sidebar from "../../components/sidebar/sidebar";
import SearchBar from "../../components/searchBar/searchBar";
import {
  createManagedUserProfile,
  getAllUsers,
  ManageUserInput,
  updateManagedUserProfile,
  UserProfile,
  UserRole
} from "../../services/userService";

import "../adminShared/adminPages.css";
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

function getInitials(name: string) {
  const parts = name.trim().split(" ");

  if (!name.trim()) return "?";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function formatDate(dateValue: any) {
  if (!dateValue) return "Ikke registrert";

  if (dateValue.toDate) {
    return dateValue.toDate().toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  return "Ikke registrert";
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

function formatBoolean(value: boolean) {
  return value ? "Ja" : "Nei";
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
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      setUsers(await getAllUsers());
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

      const searchableValues: Record<string, string> = {
        all: [
          user.name,
          user.email,
          user.phone,
          user.team,
          formatRole(user.role),
          formatStatus(user.status),
          formatBoolean(user.emailVerified),
          formatBoolean(user.roleVerified),
          formatDate(user.createdAt),
          formatDate(user.lastLogin)
        ].join(" "),
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        team: user.team ?? "",
        role: formatRole(user.role),
        status: formatStatus(user.status)
      };

      const matchesSearch =
        !searchValue ||
        searchableValues[searchField]?.toLowerCase().includes(searchValue);

      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, searchField, roleFilter, statusFilter]);

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
      } else {
        await createManagedUserProfile(form);
      }

      await fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
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
                <p>Viser {filteredUsers.length} av {users.length} brukere</p>
              </div>
            </div>

            <div className="admin-toolbar">
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
                  { value: "phone", label: "Telefon" },
                  { value: "team", label: "Team" },
                  { value: "role", label: "Rolle" },
                  { value: "status", label: "Status" }
                ]}
              />

              <select
                className="admin-select"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="">Alle roller</option>
                <option value="admin">Administrator</option>
                <option value="user">Bruker</option>
                <option value="tester">Tester</option>
                <option value="waiting">Venter</option>
              </select>

              <select
                className="admin-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Alle statuser</option>
                <option value="active">Aktive</option>
                <option value="inactive">Inaktive</option>
              </select>

              <button
                type="button"
                className="primary-action-button"
                onClick={openCreateModal}
              >
                {FaPlus({ className: "icon" })}
                Legg til bruker
              </button>
            </div>

            {error && <p className="table-error">{error}</p>}

            <div className="dashboard-table users-full-table">
              <table>
                <thead>
                  <tr>
                    <th>Navn</th>
                    <th>E-post</th>
                    <th>E-post verifisert</th>
                    <th>Telefon</th>
                    <th>Team</th>
                    <th>Rolle</th>
                    <th>Rolle verifisert</th>
                    <th>Status</th>
                    <th>Opprettet</th>
                    <th>Sist pålogget</th>
                    <th>Handlinger</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} className="empty-table-cell">
                        Henter brukere...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="empty-table-cell">
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

                        <td>{user.email || "Ikke registrert"}</td>

                        <td>
                          <span className={`status-badge ${user.emailVerified ? "active" : "inactive"}`}>
                            {formatBoolean(user.emailVerified)}
                          </span>
                        </td>

                        <td>{user.phone || "Ikke registrert"}</td>
                        <td>{user.team || "Ikke satt"}</td>

                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {formatRole(user.role)}
                          </span>
                        </td>

                        <td>
                          <span className={`status-badge ${user.roleVerified ? "active" : "inactive"}`}>
                            {formatBoolean(user.roleVerified)}
                          </span>
                        </td>

                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {formatStatus(user.status)}
                          </span>
                        </td>

                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.lastLogin)}</td>
                        <td>
                          <button
                            type="button"
                            className="action-button"
                            onClick={() => openEditModal(user)}
                            aria-label={`Rediger ${user.name || user.email}`}
                          >
                            {FaPen({ className: "icon" })}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                  {editingUser
                    ? "Oppdater brukerprofilen."
                    : "Opprett en ny brukerprofil."}
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
                  <option value="admin">Administrasjon</option>
                  <option value="security">Sikkerhet</option>
                  <option value="accounting">Økonomi</option>
                  <option value="it">IT</option>
                  <option value="customerservice">Kundeservice</option>
                  <option value="sales">Salg</option>
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
