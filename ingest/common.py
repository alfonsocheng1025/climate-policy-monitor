"""Shared helpers for the ingest pipeline.

Defines the unified `records` schema column order, DB connection, safe CSV reads,
a record builder, and a small fetch manifest used to populate `harvest_runs`.
Run scripts as `python ingest/<script>.py` from the repo root — Python puts the
script's own dir on sys.path, so `import common` resolves to this file.
"""
import os
import json
import datetime
import pandas as pd

HERE = os.path.dirname(__file__)
DATA = os.path.abspath(os.path.join(HERE, "..", "data"))
MANIFEST = os.path.join(DATA, "_harvest_manifest.json")
NORMALIZED = os.path.join(DATA, "records_normalized.csv")

# Canonical data columns for the `records` table (see db/schema.sql).
# first_seen_at / last_updated_at are managed by the DB, not inserted here.
COLUMNS = [
    "doc_id", "record_type", "country_iso", "subnational", "title", "title_en",
    "sector", "policy_instrument", "status", "decision_date", "submission_date", "version",
    "metric_name", "metric_value", "metric_unit", "metric_year",
    "concepts", "full_text", "source_url", "source_pdf_url",
    "source", "license", "retrieved_at",
]

RECORD_TYPES = {"law", "policy", "ndc", "net_zero", "carbon_price", "litigation", "stringency_score"}


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def ensure_data_dir():
    os.makedirs(DATA, exist_ok=True)


def raw_path(name):
    return os.path.join(DATA, name)


def safe_read_csv(name, **kw):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        return pd.DataFrame()
    try:
        return pd.read_csv(p, dtype=str, keep_default_na=False, na_values=[""], **kw)
    except Exception as e:  # noqa: BLE001
        print(f"[common] could not read {name}: {e}")
        return pd.DataFrame()


def record(**kw):
    """Build a normalized record dict with every column defaulted to None."""
    r = {c: None for c in COLUMNS}
    r["retrieved_at"] = now_iso()
    r.update({k: v for k, v in kw.items() if k in r})
    return r


def get_conn():
    import psycopg2
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise SystemExit("DATABASE_URL not set (see ingest/.env.example)")
    return psycopg2.connect(dsn)


# ---- fetch manifest: per-source fetch stats, merged into harvest_runs at load time ----
def record_fetch(source, fetched, status="ok", message=""):
    ensure_data_dir()
    data = read_manifest()
    data[source] = {
        "fetched": int(fetched),
        "status": status,
        "message": str(message)[:500],
        "at": now_iso(),
    }
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[manifest] {source}: fetched={fetched} status={status}")


def read_manifest():
    if os.path.exists(MANIFEST):
        try:
            with open(MANIFEST, encoding="utf-8") as f:
                return json.load(f)
        except Exception:  # noqa: BLE001
            return {}
    return {}
