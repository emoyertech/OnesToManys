from __future__ import annotations

import sqlite3
from typing import Any


def row_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return {key: row[key] for key in row.keys()}


def fetch_export_payload(conn: sqlite3.Connection) -> dict[str, Any]:
    dealership_rows = conn.execute(
        "SELECT id, name, city, state FROM dealerships ORDER BY id"
    ).fetchall()
    car_rows = conn.execute(
        "SELECT id, make, model, year, price, vin, dealership_id FROM cars ORDER BY id"
    ).fetchall()
    dealerships = [row_to_dict(row) for row in dealership_rows]
    cars = [row_to_dict(row) for row in car_rows]
    return {
        "dealerships": dealerships,
        "cars": cars,
        "counts": {"dealerships": len(dealerships), "cars": len(cars)},
    }


def validate_import_payload(payload: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], str | None]:
    dealerships_raw = payload.get("dealerships")
    cars_raw = payload.get("cars")

    if not isinstance(dealerships_raw, list):
        return [], [], "Field 'dealerships' must be an array"
    if not isinstance(cars_raw, list):
        return [], [], "Field 'cars' must be an array"

    dealerships: list[dict[str, Any]] = []
    seen_dealership_ids: set[int] = set()
    for i, item in enumerate(dealerships_raw):
        if not isinstance(item, dict):
            return [], [], f"dealerships[{i}] must be an object"
        did = item.get("id")
        name = item.get("name")
        city = item.get("city")
        state = item.get("state")
        if not isinstance(did, int):
            return [], [], f"dealerships[{i}].id must be an integer"
        if did in seen_dealership_ids:
            return [], [], f"Duplicate dealership id in import payload: {did}"
        if not isinstance(name, str) or not name.strip():
            return [], [], f"dealerships[{i}].name must be a non-empty string"
        if city is not None and not isinstance(city, str):
            return [], [], f"dealerships[{i}].city must be a string when provided"
        if state is not None and not isinstance(state, str):
            return [], [], f"dealerships[{i}].state must be a string when provided"
        seen_dealership_ids.add(did)
        dealerships.append({"id": did, "name": name.strip(), "city": city, "state": state})

    cars: list[dict[str, Any]] = []
    seen_car_ids: set[int] = set()
    for i, item in enumerate(cars_raw):
        if not isinstance(item, dict):
            return [], [], f"cars[{i}] must be an object"
        cid = item.get("id")
        make = item.get("make")
        model = item.get("model")
        year = item.get("year")
        price = item.get("price")
        vin = item.get("vin")
        dealership_id = item.get("dealership_id")

        if not isinstance(cid, int):
            return [], [], f"cars[{i}].id must be an integer"
        if cid in seen_car_ids:
            return [], [], f"Duplicate car id in import payload: {cid}"
        if not isinstance(make, str) or not make.strip():
            return [], [], f"cars[{i}].make must be a non-empty string"
        if not isinstance(model, str) or not model.strip():
            return [], [], f"cars[{i}].model must be a non-empty string"
        if year is not None and not isinstance(year, int):
            return [], [], f"cars[{i}].year must be an integer when provided"
        if price is not None and not isinstance(price, (int, float)):
            return [], [], f"cars[{i}].price must be numeric when provided"
        if vin is not None and not isinstance(vin, str):
            return [], [], f"cars[{i}].vin must be a string when provided"
        if not isinstance(dealership_id, int):
            return [], [], f"cars[{i}].dealership_id must be an integer"
        if dealership_id not in seen_dealership_ids:
            return [], [], f"cars[{i}].dealership_id references unknown dealership id {dealership_id}"

        seen_car_ids.add(cid)
        cars.append(
            {
                "id": cid,
                "make": make.strip(),
                "model": model.strip(),
                "year": year,
                "price": price,
                "vin": vin,
                "dealership_id": dealership_id,
            }
        )

    return dealerships, cars, None
