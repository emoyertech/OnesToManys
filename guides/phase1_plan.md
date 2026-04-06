# Foundation Plan (Dealership Database)

## Goal

Build a 3-tier backend foundation for a master-detail dealership app using:

- Master: dealerships
- Detail: cars
- Stack target: REST API + relational database (SQLite-friendly SQL)

## Deliverables

1. Schema SQL file: [schema.sql](schema.sql)
2. Seed SQL file: [seed.sql](seed.sql)
3. Endpoint map and test commands: [endpoint_map.md](endpoint_map.md)
4. Working CRUD for both tables (dealerships and cars)

## Data Objects

### Dealership (master)

- id (integer, primary key)
- name (text, required)
- city (text)
- state (text)

### Car (detail)

- id (integer, primary key)
- make (text, required)
- model (text, required)
- year (integer)
- price (real)
- vin (text)
- dealership_id (integer, required, foreign key to dealerships.id)

## Foundation Steps

1. Create database tables from [schema.sql](schema.sql)
2. Load synthetic data from [seed.sql](seed.sql)
3. Implement CRUD endpoints for dealerships
4. Implement CRUD endpoints for cars
5. Validate with curl:

- GET all dealerships
- GET all cars
- POST new dealership/car
- PUT update dealership/car
- DELETE dealership/car

## Definition of Done

- Schema loads without SQL errors
- Seed data loads successfully
- CRUD endpoints return expected responses and status codes
- Curl verification completed for dealerships and cars
