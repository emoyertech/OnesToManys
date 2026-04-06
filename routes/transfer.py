from __future__ import annotations

import json
import sqlite3

from flask import Blueprint, jsonify, request

from .db import get_connection
from .responses import bad_request
from .services import fetch_export_payload, validate_import_payload

transfer_bp = Blueprint("transfer", __name__)


def _apply_import_payload(payload: dict[str, object]):
    dealerships, cars, err = validate_import_payload(payload)
    if err:
        return bad_request(err)

    conn = get_connection()
    try:
        conn.execute("BEGIN")
        conn.execute("DELETE FROM cars")
        conn.execute("DELETE FROM dealerships")

        conn.executemany(
            "INSERT INTO dealerships (id, name, city, state) VALUES (?, ?, ?, ?)",
            [(d["id"], d["name"], d["city"], d["state"]) for d in dealerships],
        )
        conn.executemany(
            "INSERT INTO cars (id, make, model, year, price, vin, dealership_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                (
                    c["id"],
                    c["make"],
                    c["model"],
                    c["year"],
                    c["price"],
                    c["vin"],
                    c["dealership_id"],
                )
                for c in cars
            ],
        )
        conn.commit()
    except sqlite3.IntegrityError as exc:
        conn.rollback()
        conn.close()
        return bad_request(f"Import failed due to data integrity rules: {exc}")

    result = fetch_export_payload(conn)
    conn.close()
    return jsonify({"message": "Import completed", "counts": result["counts"]})


@transfer_bp.get("/export/json")
def export_json():
    conn = get_connection()
    payload = fetch_export_payload(conn)
    conn.close()
    return jsonify(payload)


@transfer_bp.post("/import/json")
def import_json():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return bad_request("JSON body must be an object with 'dealerships' and 'cars' arrays")
    return _apply_import_payload(payload)


@transfer_bp.post("/import/file")
def import_file():
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        return bad_request("Upload a JSON file named 'file'")

    raw = upload.read()
    if not raw:
        return bad_request("Uploaded file is empty")

    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return bad_request("Uploaded file must contain valid JSON")

    if not isinstance(payload, dict):
        return bad_request("Uploaded JSON must be an object with 'dealerships' and 'cars' arrays")

    return _apply_import_payload(payload)
