import sys
from pathlib import Path
from datetime import datetime, time

from pymongo import MongoClient

# Share the severity map with the backend API
sys.path.insert(0, str(Path(__file__).resolve().parent / "safescape-backend"))
from severity import SEVERITY_MAP, DEFAULT_SEVERITY


def parse_crime_date(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        value = value.strip().replace("Z", "")
        try:
            return datetime.fromisoformat(value)
        except ValueError:
            return datetime.strptime(value, "%m/%d/%Y")
    return None


def parse_crime_time(value):
    if isinstance(value, time):
        return value
    if isinstance(value, datetime):
        return value.time()
    if isinstance(value, str):
        value = value.strip()
        for fmt in ("%H:%M:%S", "%H:%M"):
            try:
                return datetime.strptime(value, fmt).time()
            except ValueError:
                pass
    return None


client = MongoClient("mongodb://localhost:27017")
db = client["SafeScapeDB"]
collection = db["crime_collection"]

migrated = 0
skipped = 0
missing_time = 0
unknown_types = set()

for doc in collection.find():
    if "Latitude" not in doc or "Longitude" not in doc:
        skipped += 1
        continue

    crime_date = parse_crime_date(doc.get("Crime_Date"))
    if crime_date is None:
        skipped += 1
        continue

    crime_time = parse_crime_time(doc.get("Crime_Time"))
    if crime_time is None:
        missing_time += 1
        crime_time = time(0, 0)

    crime_type = doc.get("Crime_Type", "Unknown")
    if crime_type not in SEVERITY_MAP:
        unknown_types.add(crime_type)

    collection.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "crime_type": crime_type,
                "severity_score": SEVERITY_MAP.get(crime_type, DEFAULT_SEVERITY),
                "area_name": doc.get("Area_Name"),
                "police_station": doc.get("Police_Station"),
                "incident_time": datetime.combine(crime_date.date(), crime_time),
                "location": {
                    "type": "Point",
                    "coordinates": [
                        float(doc["Longitude"]),
                        float(doc["Latitude"])
                    ]
                }
            }
        }
    )
    migrated += 1

print(f"✅ Migration complete: {migrated} migrated, {skipped} skipped")
if missing_time:
    print(f"⚠️ {missing_time} documents had no parseable Crime_Time (set to 00:00)")
if unknown_types:
    print(f"⚠️ Crime types not in SEVERITY_MAP: {sorted(unknown_types)}")
