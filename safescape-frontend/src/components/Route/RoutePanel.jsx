import React, { useState } from "react";
import { fetchSafeRouteByAddress } from "../../services/routeApi";
import SafetyScore from "../Common/SafetyScore";
import "./RoutePanel.css";

function RoutePanel({ onRouteFound }) {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFindRoute = async () => {
    try {
      setError("");
      setLoading(true);

      if (!startAddress || !endAddress) {
        setError("Please enter both start and destination addresses.");
        return;
      }

      const data = await fetchSafeRouteByAddress({
        start_address: startAddress,
        end_address: endAddress,
      });

      // backend returns: { safest_route, all_routes }
      setRouteInfo(data.safest_route);

      // send safest route to map
      onRouteFound(data.safest_route);
    } catch (err) {
      console.error(err);
      setError("Failed to compute safest route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="route-panel">
      <h3>🚦 Safest Route</h3>
      <p className="route-description">
        Enter locations by name to find the safest route based on crime data.
      </p>

      <div className="route-input-group">
        <label>Start Location</label>
        <input
          placeholder="e.g. Viman Nagar, Pune"
          value={startAddress}
          onChange={(e) => setStartAddress(e.target.value)}
        />
      </div>

      <div className="route-input-group">
        <label>Destination</label>
        <input
          placeholder="e.g. Swargate Bus Stand, Pune"
          value={endAddress}
          onChange={(e) => setEndAddress(e.target.value)}
        />
      </div>

      <button onClick={handleFindRoute} disabled={loading}>
        {loading ? "Calculating safest route..." : "Find Safest Route"}
      </button>

      {error && <p className="route-error">{error}</p>}

      {routeInfo && (
        <div className="route-summary">
          <SafetyScore score={routeInfo.safety_score} />
          <p>📏 Distance: {routeInfo.distance_km} km</p>
          <p>⏱ Duration: {routeInfo.duration_minutes} min</p>
        </div>
      )}
    </div>
  );
}

export default RoutePanel;
