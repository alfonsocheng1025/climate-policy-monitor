"""Harvest the World Bank Carbon Pricing Dashboard (carbon taxes + ETS).

Annual .xlsx; the filename is date-stamped (e.g. data_05_2026.xlsx), so set
WB_CARBON_URL to the current file shown on the dashboard's Download page.
License: CC-BY-4.0. Requires openpyxl.
"""
import os
import io
import requests
import pandas as pd
import common

URL = os.environ.get(
    "WB_CARBON_URL",
    "https://carbonpricingdashboard.worldbank.org/sites/default/files/"
    "carbon-pricing-dashboard-data/data_05_2026.xlsx",
)
OUT = "worldbank_carbon_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=300, headers=UA)
        resp.raise_for_status()
        xls = pd.ExcelFile(io.BytesIO(resp.content))
        # Heuristic: the data sheet is the one with the most rows.
        sheet = max(xls.sheet_names, key=lambda s: xls.parse(s).shape[0])
        df = xls.parse(sheet)
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("World Bank", len(df), message=f"sheet={sheet}")
        print(f"[WorldBank] saved {len(df)} rows from sheet '{sheet}'")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("World Bank", 0, "error", str(e))
        print(f"[WorldBank] FAILED (check WB_CARBON_URL date): {e}")
        return None


if __name__ == "__main__":
    fetch()
