# Relationships Checklist (Dealership -> Cars)

This checklist is tailored to your current model:

- Master: dealerships
- Detail: cars

## Goal

Add and validate the one-to-many relationship behavior, then prepare for export/import.

## What should exist for relationship work

1. Relationship endpoints

- GET /dealerships/{dealershipId}/cars
- GET /dealerships/{dealershipId}/cars/{carId}

1. Relationship validation behavior

- If dealership does not exist, return 404.
- If car exists but belongs to a different dealership, return 404 for scoped endpoint.
- Keep FK enforcement on in SQLite (`PRAGMA foreign_keys = ON`).

1. Manual testing with GUI API client

- Create a Postman or Insomnia collection.
- Include happy path and error path requests.
- Save screenshots or exported collection in `guides/`.
- Collection artifact added: `guides/OnesToManys_Relationships_Postman_Collection.json`.

1. Data dump/load support (relationship requirement in your README)

- Add endpoint(s) or scripts for JSON export/import.
- Suggested endpoints:
  - GET /export/json
  - POST /import/json
- Keep SQL schema+seed scripts as baseline reproducible setup.

## Current status in this repo

- `app.py`: runs the modular app with CRUD, relationship, and UI routes.
- Route modules live under `routes/`.

## Suggested next implementation order

1. Add `/export/json` returning dealerships + cars.
2. Add `/import/json` to reload data safely with FK checks.
3. Add a `curl` section in `curl_tests.sh` for export/import.
4. Add a short run note in `guides/RUN_PHASE1.md` or a new `guides/RUN_RELATIONSHIPS.md`.

Current implementation note: export/import curl coverage is in `curl_tests_relationships.sh`.
