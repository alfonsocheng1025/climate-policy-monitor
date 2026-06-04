"""Harvest Climate Watch (WRI) structured content via the public JSON REST API.

Verified live 2026-06: https://www.climatewatchdata.org/api/v1/data/{dataset}
Fetches ALL pages of ALL content datasets (NDC, LTS, net-zero) — they share one shape
(id/iso_code3/indicator_name/value/sector). CC-BY-4.0. Each row tagged with _dataset;
normalize stores the full row in `raw`.
"""
import os
import requests
import pandas as pd
import common

ROOT = "https://www.climatewatchdata.org/api/v1/data"
DATASETS = [d.strip() for d in
            os.environ.get("CW_DATASETS", "ndc_content,lts_content,net_zero_content").split(",")
            if d.strip()]
OUT = "climatewatch_raw.csv"
PER_PAGE = 500
MAX_PAGES = int(os.environ.get("CW_MAX_PAGES", "2000"))  # safety ceiling; stops on short/empty page
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def _paginate(ds, rows):
    page = 1
    while page <= MAX_PAGES:
        r = requests.get(f"{ROOT}/{ds}", params={"page": page, "per_page": PER_PAGE},
                         timeout=120, headers=UA)
        r.raise_for_status()
        payload = r.json()
        data = payload.get("data", payload) if isinstance(payload, dict) else payload
        if not data:
            break
        for row in data:
            if isinstance(row, dict):
                row["_dataset"] = ds
        rows.extend(data)
        if len(data) < PER_PAGE:
            break
        meta = (payload.get("meta") or {}) if isinstance(payload, dict) else {}
        if meta.get("page") and meta.get("total_pages") and meta["page"] >= meta["total_pages"]:
            break
        page += 1


def fetch():
    common.ensure_data_dir()
    rows = []
    try:
        for ds in DATASETS:
            before = len(rows)
            _paginate(ds, rows)
            print(f"[ClimateWatch] {ds}: +{len(rows) - before} rows")
        df = pd.json_normalize(rows)
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("Climate Watch", len(df), message="datasets: " + ", ".join(DATASETS))
        print(f"[ClimateWatch] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        if rows:
            pd.json_normalize(rows).to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("Climate Watch", len(rows), "partial" if rows else "error", str(e))
        print(f"[ClimateWatch] {'partial' if rows else 'FAILED'}: {e}")
        return None


if __name__ == "__main__":
    fetch()
