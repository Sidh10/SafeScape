import React, { useEffect, useState } from "react";

import CrimeMap from "./components/map/CrimeMap";
import CrimeFilter from "./components/Filters/CrimeFilter";
import RoutePanel from "./components/Route/RoutePanel";
import SummaryPanel from "./components/common/SummaryPanel";

import { fetchCrimes } from "./services/CrimeApi";
import "./App.css";

function App() {
  const [allCrimes, setAllCrimes] = useState([]);
  const [filteredCrimes, setFilteredCrimes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);

  /* Fetch crimes */
  useEffect(() => {
    const loadCrimes = async () => {
      try {
        const data = await fetchCrimes();
        setAllCrimes(data);
        setFilteredCrimes(data);
      } catch (err) {
        setError("Failed to load crime data");
      } finally {
        setLoading(false);
      }
    };
    loadCrimes();
  }, []);

  /* Apply filters */
  useEffect(() => {
    if (selectedTypes.length === 0) {
      setFilteredCrimes(allCrimes);
    } else {
      setFilteredCrimes(
        allCrimes.filter((c) =>
          selectedTypes.includes(c.crime_type || "Unknown")
        )
      );
    }
  }, [selectedTypes, allCrimes]);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <h1>🗺️ SafeScape v2.0</h1>
        <p>Interactive Crime Mapping & Safety Routing for Pune</p>
      </header>

      {/* MAIN DASHBOARD */}
      <div className="main-layout">
        {/* MAP */}
        <div className="map-container">
          {loading && <p style={{ padding: 12 }}>Loading map…</p>}

          {!loading && !error && (
            <CrimeMap
              crimes={filteredCrimes}
              routeData={routeData}
              showHeatmap={showHeatmap}   // ✅ FIX
            />
          )}

          {!loading && error && (
            <p style={{ color: "red", padding: 12 }}>{error}</p>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="side-panel">
          <SummaryPanel crimes={filteredCrimes} />

          <CrimeFilter
            selectedTypes={selectedTypes}
            onChange={setSelectedTypes}
          />

          <RoutePanel onRouteFound={setRouteData} />

          <button
            className="toggle-btn"
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            {showHeatmap ? "📍 Show Markers" : "🔥 Show Heatmap"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
