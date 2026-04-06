# Run Guide (Relationships)

Run these commands from the OnesToManys project root directory.

## 1) Install dependencies

pip install -r requirements.txt

## 2) Create a fresh database

sqlite3 catalog.db < schema.sql
sqlite3 catalog.db < seed.sql

## 3) Start the API server

python app.py

The server runs at:

- <http://localhost:8000>

## 4) Run relationship curl tests

chmod +x curl_tests_relationships.sh
./curl_tests_relationships.sh

## Capabilities verified

- CRUD for dealerships and cars
- Relationship endpoints:
  - GET /dealerships/{dealershipId}/cars
  - GET /dealerships/{dealershipId}/cars/{carId}
- Data export/import:
  - GET /export/json
  - POST /import/json
