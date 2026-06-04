"""Harvest Climate Watch (WRI) NDC content via the public JSON REST API.

Verified live 2026-06: https://www.climatewatchdata.org/api/v1/data/ndc_content
Paginated; CC-BY-4.0. Column names vary — normalize.py maps defensively.
"""
import os
import requests
import pandas as pd
import common

BASE = "https://www.climatewatchdata.org/api/v1/data/ndc_content"
OUT = "climatewatch_raw.csv"
PER_PAGE = 500
MAX_PAGES = int(os.environ.get("CW_MAX_PAGES", "40"))
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    rows = []
    try:
        page = 1
        while page <= MAX_PAGES:
            r = requests.get(BASE, params={"page": page, "per_page": PER_PAGE},
                             timeout=120, headers=UA)
            r.raise_for_status()
            payload = r.json()
            data = payload.get("data", payload) if isinstance(payload, dict) else payload
            if not data:
                break
            rows.extend(data)
            meta = (payload.get("meta") or {}) if isinstance(payload, dict) else {}
            if meta.get("page") and meta.get("total_pages") and meta["page"] >= meta["total_pages"]:
                break
            page += 1
        df = pd.json_normalize(rows)
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("Climate Watch", len(df))
        print(f"[ClimateWatch] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        if rows:
            pd.json_normalize(rows).to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("Climate Watch", len(rows),
                            "partial" if rows else "error", str(e))
        print(f"[ClimateWatch] {'partial' if rows else 'FAILED'}: {e}")
        return None


if __name__ == "__main__":
    fetch()
