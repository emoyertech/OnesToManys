from __future__ import annotations

from flask import Blueprint, jsonify, request

from .db import get_connection
from .responses import bad_request, not_found
from .services import row_to_dict

dealerships_bp = Blueprint("dealerships", __name__)


@dealerships_bp.get("/dealerships")
def list_dealerships():
    conn = get_connection()
    rows = conn.execute("SELECT id, name, city, state FROM dealerships ORDER BY id").fetchall()
    conn.close()
    return jsonify([row_to_dict(row) for row in rows])


@dealerships_bp.get("/dealerships/<int:dealership_id>")
def get_dealership(dealership_id: int):
    conn = get_connection()
    row = conn.execute(
        "SELECT id, name, city, state FROM dealerships WHERE id = ?",
        (dealership_id,),
    ).fetchone()
    conn.close()

    if row is None:
        return not_found("Dealership not found")

    return jsonify(row_to_dict(row))


@dealerships_bp.post("/dealerships")
def create_dealership():
    payload = request.get_json(silent=True) or {}

    name = payload.get("name")
    city = payload.get("city")
    state = payload.get("state")
    if not name or not isinstance(name, str):
        return bad_request("Field 'name' is required and must be a string")

    conn = get_connection()
    cursor = conn.execute(
        "INSERT INTO dealerships (name, city, state) VALUES (?, ?, ?)",
        (name.strip(), city, state),
    )
    conn.commit()

    new_row = conn.execute(
        "SELECT id, name, city, state FROM dealerships WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    conn.close()

    return jsonify(row_to_dict(new_row)), 201


@dealerships_bp.put("/dealerships/<int:dealership_id>")
def update_dealership(dealership_id: int):
    payload = request.get_json(silent=True) or {}

    name = payload.get("name")
    city = payload.get("city")
    state = payload.get("state")
    if not name or not isinstance(name, str):
        return bad_request("Field 'name' is required and must be a string")

    conn = get_connection()
    existing = conn.execute("SELECT id FROM dealerships WHERE id = ?", (dealership_id,)).fetchone()
    if existing is None:
        conn.close()
        return not_found("Dealership not found")

    conn.execute(
        "UPDATE dealerships SET name = ?, city = ?, state = ? WHERE id = ?",
        (name.strip(), city, state, dealership_id),
    )
    conn.commit()

    updated = conn.execute(
        "SELECT id, name, city, state FROM dealerships WHERE id = ?",
        (dealership_id,),
    ).fetchone()
    conn.close()

    return jsonify(row_to_dict(updated))


@dealerships_bp.delete("/dealerships/<int:dealership_id>")
def delete_dealership(dealership_id: int):
    conn = get_connection()
    existing = conn.execute("SELECT id FROM dealerships WHERE id = ?", (dealership_id,)).fetchone()
    if existing is None:
        conn.close()
        return not_found("Dealership not found")

    # Delete dependent cars first so dealership deletion always succeeds.
    removed_cars = conn.execute(
        "DELETE FROM cars WHERE dealership_id = ?",
        (dealership_id,),
    ).rowcount
    conn.execute("DELETE FROM dealerships WHERE id = ?", (dealership_id,))
    conn.commit()

    conn.close()
    return jsonify({"message": "Dealership deleted", "removed_cars": removed_cars})
