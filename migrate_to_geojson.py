from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017")
db = client["SafeScapeDB"]
collection = db["crime_collection"]

for doc in collection.find():
    if "Latitude" in doc and "Longitude" in doc:
        collection.update_one(
            {"_id": doc["_id"]},
            {
                "$set": {
                    "crime_type": doc.get("Crime_Type", "Unknown"),
                    "area_name": doc.get("Area_Name"),
                    "police_station": doc.get("Police_Station"),
                    "incident_time": datetime.fromisoformat(
                        doc["Crime_Date"].replace("Z", "")
                    ),
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

print("✅ Migration complete")
