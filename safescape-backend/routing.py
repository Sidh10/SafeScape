# routing.py
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from db import get_database
from models import AddressRouteRequest
from geo.geo_processing import get_candidate_routes, segment_route_polyline
from geo.geocoding import geocode_address
from crud import get_crimes_near_segment
from scoring import segment_risk, route_safety_score
from config import settings

router = APIRouter(tags=["Routing"], prefix="/route")


@router.post("/safe_route_by_address")
async def get_safest_route_by_address(
    request: AddressRouteRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # -----------------------------
    # STEP 1: GEOCODE ADDRESSES
    # -----------------------------
    start_lat, start_lon = geocode_address(request.start_address)
    end_lat, end_lon = geocode_address(request.end_address)

    # -----------------------------
    # STEP 2: FETCH CANDIDATE ROUTES (ORS)
    # -----------------------------
    routes = get_candidate_routes(
        (start_lat, start_lon),
        (end_lat, end_lon)
    )

    if not routes:
        return {"error": "No route found"}

    enriched_routes = []

    # -----------------------------
    # STEP 3: COMPUTE RISK PER ROUTE
    # -----------------------------
    for route in routes:
        segments = segment_route_polyline(route["polyline"])
        segment_risks = []

        for lon, lat in segments:
            crimes = await get_crimes_near_segment(
                db=db,
                longitude=lon,
                latitude=lat,
                radius_meters=settings.ROUTE_BUFFER_METERS,
                time_of_travel=request.time_of_travel
            )

            segment_risks.append(segment_risk(crimes))

        total_risk = sum(segment_risks)

        # -----------------------------
        # STEP 4: ABSOLUTE SAFETY SCORE
        # -----------------------------
        enriched_routes.append({
            "polyline": route["polyline"],
            "distance_km": round(route["distance_km"], 2),
            "duration_minutes": round(route["duration_minutes"], 1),
            "raw_risk": round(total_risk, 3),
            "segments_sampled": len(segment_risks),
            "safety_score": route_safety_score(segment_risks)
        })

    # -----------------------------
    # STEP 5: PICK SAFEST ROUTE
    # -----------------------------
    safest_route = max(enriched_routes, key=lambda r: r["safety_score"])

    return {
        "safest_route": safest_route,
        "all_routes": enriched_routes
    }
