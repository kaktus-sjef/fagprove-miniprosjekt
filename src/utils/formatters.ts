export function getInitials(name: string) {
  const trimmedName = name.trim();
  const parts = trimmedName.split(" ");

  if (!trimmedName) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

export function formatRole(role: string) {
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

export function formatUserStatus(status: string) {
  return status === "active" ? "Aktiv" : "Deaktivert";
}

export function formatTeamStatus(status: string) {
  return status === "active" ? "Aktiv" : "Deaktivert";
}

export function formatBoolean(value: boolean) {
  return value ? "Ja" : "Nei";
}

export function formatLegacyTeam(team?: string | null) {
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
