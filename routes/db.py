from __future__ import annotations

import sqlite3

from flask import current_app


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(current_app.config["DATABASE_PATH"])
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
