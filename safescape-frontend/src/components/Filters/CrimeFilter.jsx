import React from "react";
import "./CrimeFilter.css";

const CRIME_TYPES = [
  "Robbery",
  "Theft",
  "Assault",
  "Fraud",
  "Cheating",
  "Sexual Assault",
  "Unknown",
];

function CrimeFilter({ selectedTypes, onChange }) {
  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <div className="crime-filter">
      <div className="filter-header">
        <h4>🎯 Filter by Crime Type</h4>
        {selectedTypes.length > 0 && (
          <button className="clear-btn" onClick={clearAll}>
            Clear
          </button>
        )}
      </div>

      <div className="filter-chips">
        {CRIME_TYPES.map((type) => {
          const active = selectedTypes.includes(type);
          return (
            <button
              key={type}
              className={`chip ${active ? "active" : ""}`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CrimeFilter;
