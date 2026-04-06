from __future__ import annotations

from pathlib import Path

from flask import Flask

from .cars import cars_bp
from .dealerships import dealerships_bp
from .home import home_bp
from .relationships import relationships_bp
from .transfer import transfer_bp

BASE_DIR = Path(__file__).resolve().parent.parent


def create_app() -> Flask:
    # Keep Flask templates in the shared templates folder.
    app = Flask(
        __name__,
        template_folder=str(BASE_DIR / "templates"),
        static_folder=str(BASE_DIR / "static"),
        static_url_path="/static",
    )
    app.config["DATABASE_PATH"] = str(BASE_DIR / "catalog.db")
    app.config["REACT_DIST"] = str(BASE_DIR / "react" / "dist")

    app.register_blueprint(home_bp)
    app.register_blueprint(dealerships_bp)
    app.register_blueprint(cars_bp)
    app.register_blueprint(relationships_bp)
    app.register_blueprint(transfer_bp)
    return app
