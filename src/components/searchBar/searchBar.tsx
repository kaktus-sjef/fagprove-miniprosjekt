import { useState } from "react";
import { IoIosSearch } from "react-icons/io";

import "./searchBar.css";

export type SearchOption = {
  value: string;
  label: string;
};

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options?: SearchOption[];
  selectedOption?: string;
  onOptionChange?: (value: string) => void;
  className?: string;
}

function SearchBar({
  value,
  onChange,
  placeholder = "Søk...",
  options,
  selectedOption,
  onOptionChange,
  className = ""
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const [internalOption, setInternalOption] = useState(options?.[0]?.value ?? "");

  const inputValue = value ?? internalValue;
  const optionValue = selectedOption ?? internalOption;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setInternalOption(nextValue);
    onOptionChange?.(nextValue);
  };

  return (
    <div className={`search-control ${className}`.trim()}>
      <div className="search-box">
        {IoIosSearch({ className: "icon" })}

        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
        />
      </div>

      {options && options.length > 0 && (
        <select
          className="search-option"
          value={optionValue}
          onChange={handleOptionChange}
          aria-label="Velg søketype"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default SearchBar;
