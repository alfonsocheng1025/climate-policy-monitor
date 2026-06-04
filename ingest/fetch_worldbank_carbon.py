"""Harvest the World Bank Carbon Pricing Dashboard.

Captures the three policy/instrument sheets — Compliance_Gen Info (ETS + carbon taxes),
Crediting_Detail (carbon-crediting mechanisms), and Cooperative Approaches (Paris Art.6
agreements). The .xlsx filename is date-stamped, so we auto-resolve the current link
from the About page. Override with WB_CARBON_URL. License: CC-BY-4.0. Requires openpyxl.
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
SHEETS = ["Compliance_Gen Info", "Crediting_Detail", "Cooperative Approaches"]
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
    return path if path.startswith("http") else HOST + (path if path.startswith("/") else "/" + path)


def _header_row(raw):
    """Find the real header row (banner/notes sit above it)."""
    for i in range(min(14, len(raw))):
        if raw.iloc[i].notna().sum() >= 4:
            return i
    return 0


def fetch():
    common.ensure_data_dir()
    try:
        url = _resolve_url()
        resp = requests.get(url, timeout=300, headers=UA)
        resp.raise_for_status()
        xls = pd.ExcelFile(io.BytesIO(resp.content))
        frames = []
        for s in SHEETS:
            if s not in xls.sheet_names:
                continue
            raw = xls.parse(s, header=None)
            df = xls.parse(s, header=_header_row(raw)).dropna(how="all")
            df["_sheet"] = s
            frames.append(df)
        out = pd.concat(frames, ignore_index=True, sort=False) if frames else pd.DataFrame()
        out.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("World Bank", len(out), message="sheets: " + ", ".join(SHEETS))
        print(f"[WorldBank] saved {len(out)} rows from {len(frames)} sheets")
        return out
    except Exception as e:  # noqa: BLE001
        common.record_fetch("World Bank", 0, "error", str(e))
        print(f"[WorldBank] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
