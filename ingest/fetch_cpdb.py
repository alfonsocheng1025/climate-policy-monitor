"""Harvest CPDB (NewClimate) structured policies via the direct CSV export.

The `cpdb-api` pip package is unmaintained (last release 2023) — the CSV export is
the stable path. Verified 2026-06: https://climatepolicydatabase.org  (CC-BY-4.0)
"""
import io
import requests
import pandas as pd
import common

URL = "https://climatepolicydatabase.org/policies/export?page&_format=csv"
OUT = "cpdb_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=300, headers=UA)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("CPDB", len(df))
        print(f"[CPDB] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPDB", 0, "error", str(e))
        print(f"[CPDB] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
