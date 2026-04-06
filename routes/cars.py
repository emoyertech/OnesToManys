from __future__ import annotations

from flask import Blueprint, abort, jsonify, render_template, request

from .db import get_connection
from .responses import bad_request, not_found
from .services import row_to_dict

cars_bp = Blueprint("cars", __name__)


def _load_all_cars() -> list[object]:
    conn = get_connection()
    try:
        return conn.execute(
            """
            SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
                   d.name AS dealership_name
            FROM cars c
            JOIN dealerships d ON c.dealership_id = d.id
            ORDER BY c.id
            """
        ).fetchall()
    finally:
        conn.close()


@cars_bp.get("/cars")
def list_cars():
    conn = get_connection()
    rows = conn.execute(
        """
        SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
               d.name AS dealership_name
        FROM cars c
        JOIN dealerships d ON c.dealership_id = d.id
        ORDER BY c.id
        """
    ).fetchall()
    conn.close()
    return jsonify([row_to_dict(row) for row in rows])


@cars_bp.get("/cars/<int:car_id>")
def get_car(car_id: int):
    conn = get_connection()
    row = conn.execute(
        """
        SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
               d.name AS dealership_name
        FROM cars c
        JOIN dealerships d ON c.dealership_id = d.id
        WHERE c.id = ?
        """,
        (car_id,),
    ).fetchone()
    conn.close()

    if row is None:
        return not_found("Car not found")

    return jsonify(row_to_dict(row))


@cars_bp.get("/cars/<int:car_id>/view")
def view_car(car_id: int):
    conn = get_connection()
    try:
        row = conn.execute(
            """
            SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
                   d.name AS dealership_name, d.city AS dealership_city, d.state AS dealership_state
            FROM cars c
            JOIN dealerships d ON c.dealership_id = d.id
            WHERE c.id = ?
            """,
            (car_id,),
        ).fetchone()

        if row is None:
            abort(404)

        return render_template("car_detail.html", car=row_to_dict(row))
    finally:
        conn.close()


@cars_bp.get("/cars/directory")
def car_directory_page():
    return render_template("car_directory.html", cars=_load_all_cars())


@cars_bp.post("/cars")
def create_car():
    payload = request.get_json(silent=True) or {}

    make = payload.get("make")
    model = payload.get("model")
    year = payload.get("year")
    price = payload.get("price")
    vin = payload.get("vin")
    dealership_id = payload.get("dealership_id")

    if not make or not isinstance(make, str):
        return bad_request("Field 'make' is required and must be a string")
    if not model or not isinstance(model, str):
        return bad_request("Field 'model' is required and must be a string")
    if year is not None and not isinstance(year, int):
        return bad_request("Field 'year' must be an integer when provided")
    if price is not None and not isinstance(price, (int, float)):
        return bad_request("Field 'price' must be numeric when provided")
    if not isinstance(dealership_id, int):
        return bad_request("Field 'dealership_id' is required and must be an integer")

    conn = get_connection()
    dealership_exists = conn.execute(
        "SELECT id FROM dealerships WHERE id = ?", (dealership_id,)
    ).fetchone()
    if dealership_exists is None:
        conn.close()
        return bad_request("dealership_id does not reference an existing dealership")

    cursor = conn.execute(
        """
        INSERT INTO cars (make, model, year, price, vin, dealership_id)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (make.strip(), model.strip(), year, price, vin, dealership_id),
    )
    conn.commit()

    new_row = conn.execute(
        """
        SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
               d.name AS dealership_name
        FROM cars c
        JOIN dealerships d ON c.dealership_id = d.id
        WHERE c.id = ?
        """,
        (cursor.lastrowid,),
    ).fetchone()
    conn.close()

    return jsonify(row_to_dict(new_row)), 201


@cars_bp.put("/cars/<int:car_id>")
def update_car(car_id: int):
    payload = request.get_json(silent=True) or {}

    make = payload.get("make")
    model = payload.get("model")
    year = payload.get("year")
    price = payload.get("price")
    vin = payload.get("vin")
    dealership_id = payload.get("dealership_id")

    if not make or not isinstance(make, str):
        return bad_request("Field 'make' is required and must be a string")
    if not model or not isinstance(model, str):
        return bad_request("Field 'model' is required and must be a string")
    if year is not None and not isinstance(year, int):
        return bad_request("Field 'year' must be an integer when provided")
    if price is not None and not isinstance(price, (int, float)):
        return bad_request("Field 'price' must be numeric when provided")
    if not isinstance(dealership_id, int):
        return bad_request("Field 'dealership_id' is required and must be an integer")

    conn = get_connection()
    car_exists = conn.execute("SELECT id FROM cars WHERE id = ?", (car_id,)).fetchone()
    if car_exists is None:
        conn.close()
        return not_found("Car not found")

    dealership_exists = conn.execute(
        "SELECT id FROM dealerships WHERE id = ?", (dealership_id,)
    ).fetchone()
    if dealership_exists is None:
        conn.close()
        return bad_request("dealership_id does not reference an existing dealership")

    conn.execute(
        """
        UPDATE cars
        SET make = ?, model = ?, year = ?, price = ?, vin = ?, dealership_id = ?
        WHERE id = ?
        """,
        (make.strip(), model.strip(), year, price, vin, dealership_id, car_id),
    )
    conn.commit()

    updated = conn.execute(
        """
        SELECT c.id, c.make, c.model, c.year, c.price, c.vin, c.dealership_id,
               d.name AS dealership_name
        FROM cars c
        JOIN dealerships d ON c.dealership_id = d.id
        WHERE c.id = ?
        """,
        (car_id,),
    ).fetchone()
    conn.close()

    return jsonify(row_to_dict(updated))


@cars_bp.delete("/cars/<int:car_id>")
def delete_car(car_id: int):
    conn = get_connection()
    existing = conn.execute("SELECT id FROM cars WHERE id = ?", (car_id,)).fetchone()
    if existing is None:
        conn.close()
        return not_found("Car not found")

    conn.execute("DELETE FROM cars WHERE id = ?", (car_id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Car deleted"})
