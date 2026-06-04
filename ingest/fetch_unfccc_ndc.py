"""Tier B (real-time) — UNFCCC NDC Registry via the openclimatedata mirror.

Verified 2026-06: github.com/openclimatedata/ndcs — a daily-refreshed CSV mirror of
the official UNFCCC NDC Registry (public-domain registry content). Diffing this CSV
between runs (new doc_ids -> first_seen_at) is the real-time signal for new/updated NDCs.
Columns: Code,Party,Title,FileType,Language,Version,Status,SubmissionDate,EncodedAbsUrl,OriginalFilename
"""
import os
import io
import requests
import pandas as pd
import common

URL = os.environ.get(
    "NDCS_URL",
    "https://raw.githubusercontent.com/openclimatedata/ndcs/main/data/ndcs.csv",
)
OUT = "unfccc_ndcs_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=120, headers=UA)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("UNFCCC NDC Registry", len(df))
        print(f"[UNFCCC-NDC] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("UNFCCC NDC Registry", 0, "error", str(e))
        print(f"[UNFCCC-NDC] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
