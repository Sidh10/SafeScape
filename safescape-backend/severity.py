# severity.py
# Single source of truth for crime severity, shared by the API (crime.py)
# and the data migration (migrate_to_geojson.py).

SEVERITY_MAP = {
    "Theft": 2,
    "Cheating": 2,
    "Fraud": 3,
    "Vandalism": 3,
    "Burglary": 3,
    "Assault": 4,
    "Domestic Violence": 4,
    "Robbery": 5,
    "Kidnapping": 5,
    "Sexual Assault": 6,
    "Shooting": 7,
    "Murder": 10,
}

# Used for any crime type not listed above
DEFAULT_SEVERITY = 1
