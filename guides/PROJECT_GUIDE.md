# OnesToManys Living Project Guide

This guide tracks the current dealership database project. Update it when schema, routes, UI, or import/export behavior changes.

## Current Snapshot

- Project: OnesToManys dealership database
- Domain model: Dealership (master) -> Car (detail)
- Stack: Flask + SQLite + unified workspace UI
- Current focus: keep the dealership experience consistent across docs and pages

## What the app does

The app manages a master-detail dealership dataset:

- One dealership can have many cars.
- Each car belongs to one dealership.
- Users can create, edit, update, delete, inspect relationships, import JSON, and export JSON.

## Core routes

- `GET /dealerships`
- `GET /dealerships/<id>`
- `POST /dealerships`
- `PUT /dealerships/<id>`
- `DELETE /dealerships/<id>`
- `GET /cars`
- `GET /cars/<id>`
- `POST /cars`
- `PUT /cars/<id>`
- `DELETE /cars/<id>`
- `GET /dealerships/<id>/cars`
- `GET /dealerships/<id>/cars/<car_id>`
- `GET /export/json`
- `POST /import/json`
- `POST /import/file`

## Data model

- Dealerships: `id`, `name`, `city`, `state`
- Cars: `id`, `make`, `model`, `year`, `price`, `vin`, `dealership_id`

## Frontend entry points

- `/` renders the dealership landing page
- `/ui` renders the unified dealership workspace
- `/react` also renders the same workspace for compatibility

## Verification checklist

- Schema loads without errors
- Seed data loads without errors
- CRUD works for dealerships and cars
- Relationship endpoints return the expected cars for a dealership
- JSON export and file import round trip correctly
- UI pages show dealership-only wording

## Notes

Keep terminology consistent: dealership, car, inventory, relationship, import, export. Avoid generic course labels or non-dealership examples in user-facing text.
