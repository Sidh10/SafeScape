# crud.py
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import datetime

from config import settings
from scoring import time_band


async def get_crimes_near_segment(
    db: AsyncIOMotorDatabase,
    longitude: float,
    latitude: float,
    radius_meters: int,
    time_of_travel: Optional[datetime] = None
):
    query = {
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]
                },
                "$maxDistance": radius_meters
            }
        }
    }

    crime_docs = await db[settings.COLLECTION_NAME].find(query).limit(100).to_list(100)

    # Tag crimes that happened in the same time band as the trip,
    # so scoring can weigh them more heavily
    if time_of_travel is not None:
        travel_band = time_band(time_of_travel.hour)
        for doc in crime_docs:
            incident_time = doc.get("incident_time")
            doc["time_band_match"] = (
                incident_time is not None
                and time_band(incident_time.hour) == travel_band
            )

    return crime_docs
