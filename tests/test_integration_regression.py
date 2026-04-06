from __future__ import annotations

import importlib
import io
import sqlite3
import tempfile
import unittest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from routes import create_app

SCHEMA_PATH = PROJECT_ROOT / "schema.sql"
SEED_PATH = PROJECT_ROOT / "seed.sql"


def _prepare_database(target_db: Path) -> None:
    conn = sqlite3.connect(target_db)
    try:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        conn.executescript(SEED_PATH.read_text(encoding="utf-8"))
        conn.commit()
    finally:
        conn.close()


def _prepare_fake_react_dist(target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "index.html").write_text(
        "<html><body><h1>Unified Workspace Placeholder</h1></body></html>",
        encoding="utf-8",
    )


class IntegrationRegressionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)

        temp_root = Path(self.temp_dir.name)
        self.db_path = temp_root / "catalog.db"
        self.react_dist = temp_root / "react-dist"

        _prepare_database(self.db_path)
        _prepare_fake_react_dist(self.react_dist)

        self.app = create_app()
        self.app.config.update(
            TESTING=True,
            DATABASE_PATH=str(self.db_path),
            REACT_DIST=str(self.react_dist),
        )
        self.client = self.app.test_client()

    def test_core_modules_import_cleanly(self) -> None:
        modules = [
            "app",
            "routes",
            "routes.db",
            "routes.responses",
            "routes.cars",
            "routes.dealerships",
            "routes.home",
            "routes.relationships",
            "routes.transfer",
            "routes.services",
        ]
        for module_name in modules:
            with self.subTest(module=module_name):
                imported = importlib.import_module(module_name)
                self.assertIsNotNone(imported)

    def test_entrypoints_keep_ui_routes(self) -> None:
        import app

        required_routes = {
            "/",
            "/ui",
            "/react",
            "/react/<path:asset_path>",
        }

        rules = {rule.rule for rule in app.app.url_map.iter_rules()}
        self.assertTrue(required_routes.issubset(rules))

    def test_ui_pages_are_served(self) -> None:
        vanilla = self.client.get("/ui")
        try:
            self.assertEqual(vanilla.status_code, 200)
            self.assertIn("Dealership and Cars Studio", vanilla.get_data(as_text=True))
        finally:
            vanilla.close()

        react = self.client.get("/react")
        try:
            self.assertEqual(react.status_code, 200)
            self.assertIn("Dealership and Cars Studio", react.get_data(as_text=True))
        finally:
            react.close()

    def test_crud_and_relationship_endpoints_work_together(self) -> None:
        dealerships = self.client.get("/dealerships")
        self.assertEqual(dealerships.status_code, 200)
        dealership_payload = dealerships.get_json()
        self.assertIsInstance(dealership_payload, list)
        self.assertGreater(len(dealership_payload), 0)

        cars = self.client.get("/cars")
        self.assertEqual(cars.status_code, 200)
        car_payload = cars.get_json()
        self.assertIsInstance(car_payload, list)
        self.assertGreater(len(car_payload), 0)

        relationship = self.client.get("/dealerships/1/cars")
        self.assertEqual(relationship.status_code, 200)
        relationship_payload = relationship.get_json()
        self.assertIn("dealership", relationship_payload)
        self.assertIn("cars", relationship_payload)

    def test_export_and_import_round_trip(self) -> None:
        exported = self.client.get("/export/json")
        self.assertEqual(exported.status_code, 200)
        payload = exported.get_json()

        imported = self.client.post("/import/json", json=payload)
        self.assertEqual(imported.status_code, 200)
        summary = imported.get_json()
        self.assertEqual(summary.get("counts"), payload.get("counts"))

    def test_import_file_upload_round_trip(self) -> None:
        exported = self.client.get("/export/json")
        self.assertEqual(exported.status_code, 200)
        payload = exported.get_json()

        file_data = io.BytesIO(exported.get_data())
        uploaded = self.client.post(
            "/import/file",
            data={"file": (file_data, "catalog.json")},
            content_type="multipart/form-data",
        )
        self.assertEqual(uploaded.status_code, 200)
        summary = uploaded.get_json() or {}
        self.assertEqual(summary.get("counts"), payload.get("counts"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
