import { FaFilter } from "react-icons/fa";

import { TeamProfile } from "../../services/teamService";

import "./filterSelect.css";

type FilterType = "role" | "status" | "team";

interface FilterSelectProps {
  type: FilterType;
  value: string;
  onChange: (value: string) => void;
  teams?: TeamProfile[];
  className?: string;
}

const filterLabels: Record<FilterType, string> = {
  role: "Filtrer på rolle",
  status: "Filtrer på status",
  team: "Filtrer på team"
};

function getOptions(type: FilterType, teams: TeamProfile[] = []) {
  if (type === "role") {
    return [
      { value: "", label: "Alle roller" },
      { value: "admin", label: "Administrator" },
      { value: "user", label: "Bruker" },
      { value: "tester", label: "Tester" },
      { value: "waiting", label: "Venter" }
    ];
  }

  if (type === "team") {
    return [
      { value: "", label: "Alle team" },
      ...teams.map((team) => ({
        value: team.id,
        label: team.name
      }))
    ];
  }

  return [
    { value: "", label: "Alle statuser" },
    { value: "active", label: "Aktive" },
    { value: "inactive", label: "Deaktiverte" }
  ];
}

function FilterSelect({
  type,
  value,
  onChange,
  teams = [],
  className = ""
}: FilterSelectProps) {
  const options = getOptions(type, teams);
  const label = filterLabels[type];

  const handleValueChange = (nextValue: string) => {
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <label className={`filter-select ${className}`.trim()}>
      {FaFilter({ className: "filter-select-icon" })}

      <select
        value={value}
        onChange={(event) => handleValueChange(event.target.value)}
        onBlur={(event) => handleValueChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default FilterSelect;
