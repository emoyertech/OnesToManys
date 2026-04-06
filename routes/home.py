from __future__ import annotations

from flask import Blueprint, abort, render_template

from .db import get_connection


def _load_home_context() -> dict[str, object]:
    conn = get_connection()
    try:
        total_dealerships = conn.execute(
            "SELECT COUNT(*) AS total FROM dealerships"
        ).fetchone()["total"]
        dealerships = conn.execute(
            "SELECT id, name, city, state FROM dealerships ORDER BY RANDOM() LIMIT 5"
        ).fetchall()
        return {
            "dealerships": dealerships,
            "total_dealerships": total_dealerships,
        }
    finally:
        conn.close()


def _load_all_dealerships() -> list[object]:
    conn = get_connection()
    try:
        return conn.execute(
            "SELECT id, name, city, state FROM dealerships ORDER BY name, id"
        ).fetchall()
    finally:
        conn.close()

home_bp = Blueprint("home", __name__)


@home_bp.get("/dealerships/<int:dealership_id>/view")
def dealership_detail_page(dealership_id: int):
    conn = get_connection()
    try:
        dealership = conn.execute(
            "SELECT id, name, city, state FROM dealerships WHERE id = ?",
            (dealership_id,),
        ).fetchone()
        if dealership is None:
            abort(404)

        cars = conn.execute(
            """
            SELECT id, make, model, year, price, vin
            FROM cars
            WHERE dealership_id = ?
            ORDER BY id
            """,
            (dealership_id,),
        ).fetchall()

        return render_template(
            "dealership_detail.html",
            dealership=dealership,
            cars=cars,
        )
    finally:
        conn.close()


@home_bp.get("/dealerships/directory")
def dealership_directory_page():
    return render_template(
        "dealership_directory.html",
        dealerships=_load_all_dealerships(),
    )


@home_bp.get("/")
def home_page():
    return render_template("home.html", **_load_home_context())


@home_bp.get("/ui")
def ui_page():
    return render_template("ui/index.html")


@home_bp.get("/react")
@home_bp.get("/react/<path:asset_path>")
def react_page(asset_path: str | None = None):
    # Keep the UI unified: both routes surface the same workspace page.
    # asset_path is accepted for backward compatibility but not used.
    return render_template("ui/index.html")
