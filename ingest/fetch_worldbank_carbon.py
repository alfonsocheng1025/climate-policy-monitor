"""Harvest the World Bank Carbon Pricing Dashboard (carbon taxes + ETS).

The downloadable .xlsx filename is date-stamped (e.g. download_data_05_2026.xlsx) and
changes each release, so we auto-resolve the current link from the dashboard's About
page. Override with WB_CARBON_URL to pin a specific file. License: CC-BY-4.0.
"""
import os
import io
import re
import requests
import pandas as pd
import common

HOST = "https://carbonpricingdashboard.worldbank.org"
ABOUT = HOST + "/about"
OUT = "worldbank_carbon_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def _resolve_url():
    env = os.environ.get("WB_CARBON_URL")
    if env:
        return env
    html = requests.get(ABOUT, timeout=60, headers=UA).text
    hits = re.findall(r'[^"\'()\s]+\.xlsx', html)
    cands = [h for h in hits if "data" in h.lower()] or hits
    if not cands:
        raise RuntimeError("no .xlsx link found on World Bank About page")
    path = cands[0]
    if path.startswith("http"):
        return path
    return HOST + (path if path.startswith("/") else "/" + path)


def fetch():
    common.ensure_data_dir()
    try:
        url = _resolve_url()
        resp = requests.get(url, timeout=300, headers=UA)
        resp.raise_for_status()
        xls = pd.ExcelFile(io.BytesIO(resp.content))
        # The "Compliance_Gen Info" sheet has one row per instrument (name/type/status/price).
        sheet = ("Compliance_Gen Info" if "Compliance_Gen Info" in xls.sheet_names
                 else max(xls.sheet_names, key=lambda s: xls.parse(s, header=None).shape[0]))
        # Find the real header row (banner/notes sit above it).
        probe = xls.parse(sheet, header=None, nrows=12)
        hdr = 0
        for i in range(len(probe)):
            if any(str(x).strip() == "Instrument name" for x in probe.iloc[i].tolist()):
                hdr = i
                break
        df = xls.parse(sheet, header=hdr).dropna(how="all")
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("World Bank", len(df), message=f"{url.split('/')[-1]} sheet={sheet}")
        print(f"[WorldBank] saved {len(df)} rows from '{sheet}'")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("World Bank", 0, "error", str(e))
        print(f"[WorldBank] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
