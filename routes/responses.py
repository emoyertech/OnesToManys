from __future__ import annotations

from flask import jsonify


def bad_request(message: str):
    return jsonify({"error": message}), 400


def not_found(message: str):
    return jsonify({"error": message}), 404
