"""Harvest OECD CAPMF policy stringency via the SDMX REST API (csvfilewithlabels).

Verified dataflow 2026-06: OECD.ENV.EPI,DSD_CAPMF@DF_CAPMF,1.0
Rate limit ~20 calls/hour/IP — pull broad slices in one request and cache locally.
"""
import os
import io
import requests
import pandas as pd
import common

START = os.environ.get("CAPMF_START", "2000")
END = os.environ.get("CAPMF_END", "2023")
URL = (
    "https://sdmx.oecd.org/public/rest/data/"
    "OECD.ENV.EPI,DSD_CAPMF@DF_CAPMF,1.0/all"
    f"?startPeriod={START}&endPeriod={END}"
    "&format=csvfilewithlabels&dimensionAtObservation=AllDimensions"
)
OUT = "oecd_capmf_raw.csv"


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=300)
        resp.raise_for_status()
        df = pd.read_csv(io.StringIO(resp.text))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("OECD CAPMF", len(df), message=f"{START}-{END}")
        print(f"[OECD-CAPMF] saved {len(df)} rows ({START}-{END})")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("OECD CAPMF", 0, "error", str(e))
        print(f"[OECD-CAPMF] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
