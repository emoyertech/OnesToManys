from __future__ import annotations

from flask import Blueprint, jsonify

from .db import get_connection
from .responses import not_found
from .services import row_to_dict

relationships_bp = Blueprint("relationships", __name__)


@relationships_bp.get("/dealerships/<int:dealership_id>/cars")
def list_cars_for_dealership(dealership_id: int):
    conn = get_connection()

    dealership = conn.execute(
        "SELECT id, name, city, state FROM dealerships WHERE id = ?", (dealership_id,)
    ).fetchone()
    if dealership is None:
        conn.close()
        return not_found("Dealership not found")

    rows = conn.execute(
        """
        SELECT id, make, model, year, price, vin, dealership_id
        FROM cars
        WHERE dealership_id = ?
        ORDER BY id
        """,
        (dealership_id,),
    ).fetchall()
    conn.close()

    return jsonify(
        {
            "dealership": row_to_dict(dealership),
            "cars": [row_to_dict(row) for row in rows],
        }
    )


@relationships_bp.get("/dealerships/<int:dealership_id>/cars/<int:car_id>")
def get_car_for_dealership(dealership_id: int, car_id: int):
    conn = get_connection()
    row = conn.execute(
        """
        SELECT id, make, model, year, price, vin, dealership_id
        FROM cars
        WHERE id = ? AND dealership_id = ?
        """,
        (car_id, dealership_id),
    ).fetchone()
    conn.close()

    if row is None:
        return not_found("Car not found for this dealership")

    return jsonify(row_to_dict(row))
