import { useState } from "react";
import { FaEllipsisH, FaMinus, FaPen } from "react-icons/fa";

import DataTable, { DataTableColumn } from "../dataTable/dataTable";
import { TeamProfile } from "../../services/teamService";
import { UserProfile } from "../../services/userService";
import {
  formatBoolean,
  formatRole,
  formatUserStatus,
  getInitials
} from "../../utils/formatters";
import {
  getTeamLabel,
  getUserAvatarThemeByTeam
} from "../../utils/teamDisplay";

import "./userTable.css";

export type UserTableColumn =
  | "name"
  | "email"
  | "emailVerified"
  | "phone"
  | "team"
  | "role"
  | "roleVerified"
  | "status"
  | "createdAt"
  | "lastLogin"
  | "actions";

interface UserTableProps {
  users: UserProfile[];
  teams: TeamProfile[];
  columns: UserTableColumn[];
  loading?: boolean;
  onEditUser?: (user: UserProfile) => void;
  className?: string;
}

const columnLabels: Record<UserTableColumn, string> = {
  name: "Navn",
  email: "E-post",
  emailVerified: "E-post verifisert",
  phone: "Telefon",
  team: "Team",
  role: "Rolle",
  roleVerified: "Rolle verifisert",
  status: "Status",
  createdAt: "Opprettet",
  lastLogin: "Sist pålogget",
  actions: "Handlinger"
};

function formatDate(dateValue: any) {
  if (!dateValue?.toDate) return emptyValue();

  return dateValue.toDate().toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function emptyValue() {
  return FaMinus({ className: "missing-value-icon" });
}

// UU: Brukes på handling-knappen, siden tab-fokus ellers bare ville lest opp navnet.
function getUserScreenReaderText(user: UserProfile, teams: TeamProfile[]) {
  return [
    `Navn ${user.name || "Ukjent bruker"}`,
    `E-post ${user.email || "ikke registrert"}`,
    `Team ${getTeamLabel(user.team, teams)}`,
    `Rolle ${formatRole(user.role)}`,
    `Status ${formatUserStatus(user.status)}`
  ].join(". ");
}

function UserTable({
  users,
  teams,
  columns,
  loading = false,
  onEditUser,
  className = ""
}: UserTableProps) {
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);

  const tableColumns: DataTableColumn<UserProfile>[] = columns.map((column) => ({
    key: column,
    label: columnLabels[column],
    render: (user) => renderCell(user, column)
  }));

  function renderCell(user: UserProfile, column: UserTableColumn) {
    switch (column) {
      case "name":
        return (
          <div className="user-cell">
            <div className={`table-avatar ${getUserAvatarThemeByTeam(user.team, teams)}`}>
              {getInitials(user.name)}
            </div>

            <span>{user.name || "Ukjent bruker"}</span>
          </div>
        );
      case "email":
        return user.email || emptyValue();
      case "emailVerified":
        return (
          <span className={`status-badge ${user.emailVerified ? "active" : "inactive"}`}>
            {formatBoolean(user.emailVerified)}
          </span>
        );
      case "phone":
        return user.phone || emptyValue();
      case "team":
        return getTeamLabel(user.team, teams);
      case "role":
        return (
          <span className={`role-badge ${user.role}`}>
            {formatRole(user.role)}
          </span>
        );
      case "roleVerified":
        return (
          <span className={`status-badge ${user.roleVerified ? "active" : "inactive"}`}>
            {formatBoolean(user.roleVerified)}
          </span>
        );
      case "status":
        return (
          <span className={`status-badge ${user.status}`}>
            {formatUserStatus(user.status)}
          </span>
        );
      case "createdAt":
        return formatDate(user.createdAt);
      case "lastLogin":
        return formatDate(user.lastLogin);
      case "actions":
        return (
          <div className="actions-menu">
            <button
              type="button"
              className="action-button"
              onClick={() => setOpenActionsFor(openActionsFor === user.uid ? null : user.uid)}
              aria-expanded={openActionsFor === user.uid}
              aria-label={`Handlinger. ${getUserScreenReaderText(user, teams)}`}
            >
              {FaEllipsisH({ className: "icon" })}
            </button>

            {openActionsFor === user.uid && onEditUser && (
              <div className="actions-dropdown">
                <button
                  type="button"
                  className="actions-dropdown-item"
                  onClick={() => onEditUser(user)}
                >
                  {FaPen({ className: "icon" })}
                  Rediger
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <DataTable
      rows={users}
      columns={tableColumns}
      getRowKey={(user) => user.uid}
      loading={loading}
      loadingText="Henter brukere..."
      emptyText="Ingen brukere funnet."
      className={`dashboard-table user-table ${className}`.trim()}
    />
  );
}

export default UserTable;

