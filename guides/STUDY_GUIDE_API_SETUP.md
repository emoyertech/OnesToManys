# Study Guide: Dealership Database API Setup

This guide explains the dealership database pattern used in OnesToManys.

## Big Picture

A typical setup has three layers:

1. Database layer
- Stores dealership and car records.

2. API layer
- Handles create, read, update, and delete requests.

3. Client layer
- curl, Postman, or a UI that calls the API.

For this project:
- Master table: dealerships
- Detail table: cars
- Relationship: one dealership has many cars

## Core Terms

- Table: collection of rows for one entity.
- Row: one record in a table.
- Primary key: unique row identifier.
- Foreign key: reference to another table's primary key.
- One-to-many: one parent row maps to many child rows.
- Schema: SQL structure definition.
- Seed data: starter records for testing.

## Setup Checklist

1. Define the domain
- Dealerships are the parent records.
- Cars are the child records.

2. Design the schema
- Create a dealerships table.
- Create a cars table with a foreign key to dealerships.
- Decide FK behavior for deletes and updates.

3. Seed test data
- Include dealerships with multiple cars.
- Include at least one dealership with no cars.

4. Build API routes
- CRUD for dealerships.
- CRUD for cars.
- Relationship routes for dealership cars.

5. Test the API
- GET all dealerships
- GET all cars
- POST dealership
- POST car
- PUT dealership
- PUT car
- DELETE car
- DELETE dealership

## SQL Practice

Be comfortable with:
- SELECT
- WHERE
- JOIN
- ORDER BY
- COUNT and GROUP BY

Example join:

```sql
SELECT c.make, c.model, d.name AS dealership_name
FROM cars c
JOIN dealerships d ON c.dealership_id = d.id;
```

## Quick Reference

Build order:
1. Domain
2. Schema
3. Seed
4. Routes
5. Validation
6. curl tests
7. Documentation
