"""Harvest Net Zero Tracker via the Our World in Data mirror (CC-BY).

The OWID grapher CSV is the dependable automation path (the zerotracker.net direct
download is registration-gated). Covers countries, regions, cities, companies.
"""
import os
import io
import requests
import pandas as pd
import common

URL = os.environ.get(
    "NETZERO_URL",
    "https://ourworldindata.org/grapher/net-zero-targets.csv"
    "?v=1&csvType=full&useColumnShortNames=true",
)
OUT = "netzero_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=180, headers=UA)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("Net Zero Tracker", len(df))
        print(f"[NetZero] saved {len(df)} rows")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("Net Zero Tracker", 0, "error", str(e))
        print(f"[NetZero] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
