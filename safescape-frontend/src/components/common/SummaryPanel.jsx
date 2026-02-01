import React from "react";
import "./SummaryPanel.css";

function SummaryPanel({ crimes }) {
  if (!crimes || crimes.length === 0) {
    return (
      <div className="summary-panel">
        <h3>Summary</h3>
        <p>No crimes match the current filters.</p>
      </div>
    );
  }

  /* =========================
     Crimes by Type
  ========================= */
  const typeCounts = crimes.reduce((acc, crime) => {
    const type = crime.crime_type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  /* =========================
     Crimes by Area
  ========================= */
  const areaCounts = crimes.reduce((acc, crime) => {
    const area = crime.area_name || "Unknown";
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const topAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  /* =========================
     Date Coverage
  ========================= */
  const dates = crimes
    .map((c) => c.incident_time)
    .filter(Boolean)
    .map((d) => new Date(d));

  const firstDate =
    dates.length > 0
      ? new Date(Math.min(...dates)).toLocaleDateString()
      : "N/A";

  const lastDate =
    dates.length > 0
      ? new Date(Math.max(...dates)).toLocaleDateString()
      : "N/A";

  return (
    <div className="summary-panel">
      <h3>📊 Crime Summary</h3>

      <div className="summary-row">
        <div className="summary-card">
          <h4>Crimes by Type</h4>
          <ul>
            {Object.entries(typeCounts).map(([type, count]) => (
              <li key={type}>
                <span className="summary-label">{type}</span>
                <span className="summary-value">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-card">
          <h4>Top Areas</h4>
          <ul>
            {topAreas.map(([area, count]) => (
              <li key={area}>
                <span className="summary-label">{area}</span>
                <span className="summary-value">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="summary-card">
          <h4>Date Coverage</h4>
          <p>
            From <strong>{firstDate}</strong>
            <br />
            To <strong>{lastDate}</strong>
          </p>
          <p className="summary-note">
            Based on currently visible crimes
          </p>
        </div>
      </div>
    </div>
  );
}

export default SummaryPanel;
