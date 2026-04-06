# Run Guide (Commented Flask API)

Run these commands from the `OnesToManys` project root directory.

If you are currently in `guides/`, run `cd ..` first.

## 1) Install dependencies

pip install -r requirements.txt

## 2) Create a fresh database

sqlite3 catalog.db < schema.sql
sqlite3 catalog.db < seed.sql

## 3) Start the API server

python app.py

The server runs at:

- <http://localhost:8000>
- <http://localhost:8000/ui>

## 4) Run the curl test script (optional)

chmod +x curl_tests.sh
./curl_tests.sh

For relationship endpoint checks, run:

chmod +x curl_tests_relationships.sh
./curl_tests_relationships.sh

## Notes

- The API and SQL are designed to align with:
  - master table: dealerships
  - detail table: cars
- `curl_tests.sh` validates core CRUD behavior.
- `curl_tests_relationships.sh` validates one-to-many relationship endpoints.
- The unified UI is served by the same Flask process at `/ui`.
