import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

/* ===============================
   Fix default marker icons
================================ */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ===============================
   Crime colors
================================ */
const crimeColors = {
  Robbery: "#d32f2f",
  Theft: "#f57c00",
  Assault: "#c62828",
  Fraud: "#7b1fa2",
  Cheating: "#7b1fa2",
  Sexual_Assault: "#ad1457",
  Unknown: "#607d8b",
};

/* ===============================
   🔑 FIX LEAFLET RESIZE (CRITICAL)
================================ */
function FixLeafletResize() {
  const map = useMap();

  useEffect(() => {
    // Force Leaflet to recalculate size AFTER layout settles
    setTimeout(() => map.invalidateSize(), 0);
    setTimeout(() => map.invalidateSize(), 300);
  }, [map]);

  return null;
}

/* ===============================
   Fit route inside view (SAFE)
================================ */
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length < 2) return;

    setTimeout(() => {
      map.fitBounds(L.latLngBounds(points), {
        padding: [60, 60],
      });
    }, 200);
  }, [points, map]);

  return null;
}

/* ===============================
   Heatmap Layer
================================ */
function HeatmapLayer({ crimes }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (!map || !crimes?.length) return;

    const points = crimes
      .filter(c => c.location?.coordinates?.length === 2)
      .map(c => {
        const [lon, lat] = c.location.coordinates.map(Number);
        if (isNaN(lat) || isNaN(lon)) return null;
        return [lat, lon, c.severity_score || 1];
      })
      .filter(Boolean);

    if (!points.length) return;

    heatRef.current = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
      }
    };
  }, [crimes, map]);

  return null;
}

/* ===============================
   MAIN MAP COMPONENT
================================ */
function CrimeMap({ crimes = [], routeData, showHeatmap }) {
  const puneCenter = [18.5204, 73.8567];

  /* Decode ORS polyline */
  const routeLatLngs = routeData?.polyline
    ? polyline.decode(routeData.polyline)
    : [];

  /* Force resize after route changes */
  useEffect(() => {
    if (routeLatLngs.length > 1) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 200);
    }
  }, [routeLatLngs]);

  return (
    <MapContainer
      center={puneCenter}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      {/* 🔑 MUST BE FIRST */}
      <FixLeafletResize />

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* 🔥 HEATMAP */}
      {showHeatmap && <HeatmapLayer crimes={crimes} />}

      {/* 🔴 CRIME MARKERS */}
      {!showHeatmap &&
        crimes.map((crime) => {
          if (!crime.location?.coordinates?.length) return null;

          const [lon, lat] = crime.location.coordinates.map(Number);
          if (isNaN(lat) || isNaN(lon)) return null;

          const type = crime.crime_type || "Unknown";
          const color = crimeColors[type] || crimeColors.Unknown;
          const severity = crime.severity_score ?? "N/A";

          return (
            <CircleMarker
              key={crime._id || `${lat}-${lon}-${type}`}
              center={[lat, lon]}
              radius={7}
              color={color}
              fillColor={color}
              fillOpacity={0.85}
            >
              <Popup>
                <div style={{ minWidth: 220 }}>
                  <h4 style={{ margin: "0 0 6px", color }}>
                    🚨 {type}
                  </h4>

                  <p style={{ margin: "4px 0" }}>
                    <strong>🚓 Police Station:</strong>{" "}
                    {crime.police_station || "N/A"}
                  </p>

                  {crime.incident_time && (
                    <p style={{ margin: "4px 0" }}>
                      <strong>🕒 Time:</strong>{" "}
                      {new Date(crime.incident_time).toLocaleString()}
                    </p>
                  )}

                  <p style={{ margin: "6px 0" }}>
                    <strong>⚠ Severity:</strong>{" "}
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          severity >= 7
                            ? "#b71c1c"
                            : severity >= 4
                            ? "#f57c00"
                            : "#2e7d32",
                      }}
                    >
                      {severity}
                    </span>
                  </p>

                  <hr style={{ margin: "8px 0" }} />

                  <small style={{ color: "#555" }}>
                    Stay alert in this area
                  </small>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

      {/* 🟢 SAFEST ROUTE */}
      {routeLatLngs.length > 1 && (
        <>
          <Polyline
            positions={routeLatLngs}
            pathOptions={{
              color: "#2e7d32",
              weight: 6,
            }}
          />

          <Marker position={routeLatLngs[0]}>
            <Popup>Start</Popup>
          </Marker>

          <Marker position={routeLatLngs[routeLatLngs.length - 1]}>
            <Popup>Destination</Popup>
          </Marker>

          <FitBounds points={routeLatLngs} />
        </>
      )}
    </MapContainer>
  );
}

export default CrimeMap;
