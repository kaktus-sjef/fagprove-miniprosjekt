import {
  FaHandshake,
  FaHeadset,
  FaLaptopCode,
  FaShieldAlt,
  FaUserCog
} from "react-icons/fa";
import { FaCoins, FaPeopleGroup } from "react-icons/fa6";

import { TeamColor, TeamIcon, TeamProfile } from "../services/teamService";
import { formatLegacyTeam } from "./formatters";

export const teamColorOptions: Array<{ value: TeamColor; label: string }> = [
  { value: "red", label: "Rød" },
  { value: "purple", label: "Lilla" },
  { value: "green", label: "Grønn" },
  { value: "blue", label: "Blå" },
  { value: "orange", label: "Oransje" },
  { value: "pink", label: "Rosa" },
  { value: "teal", label: "Teal" }
];

export const teamIconOptions: Array<{ value: TeamIcon; label: string }> = [
  { value: "admin", label: "Administrasjon" },
  { value: "security", label: "Sikkerhet" },
  { value: "accounting", label: "Økonomi" },
  { value: "it", label: "IT" },
  { value: "customerservice", label: "Kundeservice" },
  { value: "sales", label: "Salg" },
  { value: "team", label: "Team" }
];

function getTeamKey(team?: Pick<TeamProfile, "id" | "name"> | string | null) {
  if (!team) return "";
  if (typeof team === "string") return team.toLowerCase();

  return `${team.id} ${team.name}`.toLowerCase();
}

function getColorFromTeamKey(key: string): TeamColor {
  if (key.includes("økonomi") || key.includes("konomi") || key.includes("accounting")) return "green";
  if (key.includes("administrasjon") || key.includes("admin")) return "red";
  if (key.includes("sikkerhet") || key.includes("security")) return "purple";
  if (key.includes("it")) return "blue";
  if (key.includes("kundeservice") || key.includes("customer")) return "orange";
  if (key.includes("salg") || key.includes("sales")) return "pink";

  return "teal";
}

function findTeam(team?: string | null, teams: TeamProfile[] = []) {
  return teams.find((item) => item.id === team || item.name === team);
}

export function getTeamLabel(team?: string | null, teams: TeamProfile[] = []) {
  return findTeam(team, teams)?.name ?? formatLegacyTeam(team);
}

export function getTeamTheme(team: TeamProfile) {
  return `team-theme-${team.color ?? getColorFromTeamKey(getTeamKey(team))}`;
}

export function getTeamMemberAvatarTheme(team: TeamProfile) {
  const color = team.color === "teal"
    ? getColorFromTeamKey(getTeamKey(team))
    : team.color ?? getColorFromTeamKey(getTeamKey(team));

  return `user-avatar-${color}`;
}

export function getUserAvatarThemeByTeam(team?: string | null, teams: TeamProfile[] = []) {
  if (!team) return "";

  const databaseTeam = findTeam(team, teams);
  const color = databaseTeam?.color ?? getColorFromTeamKey(`${team} ${databaseTeam?.name ?? ""}`.toLowerCase());

  return `user-avatar-${color}`;
}

export function renderTeamIconByValue(icon: TeamIcon, className = "team-avatar-icon") {
  switch (icon) {
    case "admin":
      return FaUserCog({ className });
    case "security":
      return FaShieldAlt({ className });
    case "accounting":
      return FaCoins({ className });
    case "it":
      return FaLaptopCode({ className });
    case "customerservice":
      return FaHeadset({ className });
    case "sales":
      return FaHandshake({ className });
    default:
      return FaPeopleGroup({ className });
  }
}

export function renderTeamIcon(team: TeamProfile) {
  if (team.icon) return renderTeamIconByValue(team.icon);

  const key = getTeamKey(team);

  if (key.includes("økonomi") || key.includes("konomi") || key.includes("accounting")) {
    return renderTeamIconByValue("accounting");
  }

  if (key.includes("administrasjon") || key.includes("admin")) return renderTeamIconByValue("admin");
  if (key.includes("sikkerhet") || key.includes("security")) return renderTeamIconByValue("security");
  if (key.includes("it")) return renderTeamIconByValue("it");
  if (key.includes("kundeservice") || key.includes("customer")) return renderTeamIconByValue("customerservice");
  if (key.includes("salg") || key.includes("sales")) return renderTeamIconByValue("sales");

  return renderTeamIconByValue("team");
}
