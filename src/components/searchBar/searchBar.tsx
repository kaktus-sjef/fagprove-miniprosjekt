import { useState } from "react";
import { IoIosSearch } from "react-icons/io";

import "./searchBar.css";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchBar({
  value,
  onChange,
  placeholder = "Søk...",
  className = ""
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const inputValue = value ?? internalValue;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    onChange?.(nextValue);
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
    </div>
  );
}

export default SearchBar;

