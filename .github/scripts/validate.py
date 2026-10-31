"""Run NEXT HMI's /api/config/validate on one project folder; exit 1 on any diagnostic.

Run from a next-hmi checkout's backend/ with PYTHONPATH=. — one project per
process, because the backend's module caches leak between projects.
"""
import sys
import tempfile
from pathlib import Path

import core.storage as storage
import core.validation.structure as structure
import services.widget_compiler as widget_compiler
from api.config_api import router
from core.exceptions import register_exception_handlers
from fastapi import FastAPI
from fastapi.testclient import TestClient
from services.datasource_manager import datasource_manager

root = Path(sys.argv[1]).resolve()
build = Path(tempfile.mkdtemp())
widget_compiler.WIDGET_BUILD_DIR = build
structure.WIDGET_SCHEMAS_PATH = build / "widget-schemas.json"
structure._manifest_cache = None
assert widget_compiler.regenerate_widget_schemas(src_dir=root / "custom-widgets")
datasource_manager.datasources = {}
storage._active_project_path = lambda: root
app = FastAPI()
register_exception_handlers(app)
app.include_router(router)
with TestClient(app) as c:
    resp = c.get("/api/config/validate")
assert resp.status_code == 200, resp.text
diags = resp.json()["diagnostics"]
print(f"{root.name}: {len(diags) or 'clean'}{' diagnostics' if diags else ''}")
for d in diags:
    print(f"  {d.get('severity')} {d['artifactKind']} {d.get('artifactId')} {d['code']} {d.get('sourcePath', '')}: {d['message']}")
sys.exit(1 if diags else 0)
