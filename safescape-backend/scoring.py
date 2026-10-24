# scoring.py
from math import exp

# -----------------------------
# Scoring constants
# -----------------------------
# BASELINE_SEGMENT_RISK  Risk of a sampled point with no crimes nearby.
#                        Nowhere is perfectly safe, so a crime-free route
#                        scores 100 * exp(-0.3 / 5) ~= 94, not 100.
# TIME_BAND_MATCH_WEIGHT Multiplier for a crime that happened in the same
#                        time band (late night / evening / day) as the trip.
# DENSITY_STEP           Each extra crime at a point adds 10% to that point's
#                        risk (clustered crimes are worse than isolated ones).
# RISK_SCALE             Mean per-point risk at which the safety score falls
#                        to 100 * e^-1 ~= 37. For reference: one daytime theft
#                        at a point scores 2 * 1.1 = 2.2; one late-night
#                        robbery in the trip's time band scores
#                        5 * 1.5 * 1.5 * 1.1 ~= 12.4.
BASELINE_SEGMENT_RISK = 0.3
TIME_BAND_MATCH_WEIGHT = 1.5
DENSITY_STEP = 0.1
RISK_SCALE = 5.0


# -----------------------------
# Time bands
# -----------------------------
def time_band(hour):
    if hour >= 22 or hour <= 5:
        return "late_night"
    if 18 <= hour < 22:
        return "evening"
    return "day"


# -----------------------------
# Time-based risk weighting
# -----------------------------
def time_weight(incident_time):
    """
    Amplifies crime severity based on time of occurrence
    """
    band = time_band(incident_time.hour)

    if band == "late_night":
        return 1.5
    if band == "evening":
        return 1.2
    return 1.0


# -----------------------------
# Segment-level risk
# -----------------------------
def segment_risk(crimes):
    """
    Computes risk for ONE route segment
    crimes: list of Mongo crime documents
    """
    if not crimes:
        return BASELINE_SEGMENT_RISK

    total = 0.0

    for crime in crimes:
        severity = crime.get("severity_score", 2)
        incident_time = crime["incident_time"]

        weight = time_weight(incident_time)
        if crime.get("time_band_match"):
            weight *= TIME_BAND_MATCH_WEIGHT

        total += severity * weight

    # Density amplification (clustered crimes are worse)
    density_penalty = 1 + DENSITY_STEP * len(crimes)

    return total * density_penalty


# -----------------------------
# Absolute route safety score
# -----------------------------
def route_safety_score(segment_risks):
    """
    Converts a route's per-segment risks into a SAFETY score (0–100)
    Higher = safer. Depends only on this route, never on the other
    candidates, so a single route can still score high.

    Uses the mean risk per sampled point so the score does not depend
    on how many points the polyline happened to be sampled into.
    """
    if not segment_risks:
        return 100.0

    mean_risk = sum(segment_risks) / len(segment_risks)

    return round(100 * exp(-mean_risk / RISK_SCALE), 1)
