"""Harvest CPDB (NewClimate) structured policies from the versioned Zenodo snapshot.

The live site export (climatepolicydatabase.org/policies/export) sits behind a Drupal
antibot/JS gate and returns HTML, not CSV — so we use the Zenodo CSV (CC-BY-4.0,
DOI 10.5281/zenodo.15432946), which is also better for reproducibility.
Override CPDB_URL to pin a newer Zenodo version. The `cpdb-api` pip package is dead (2023).
"""
import io
import os
import requests
import pandas as pd
import common

URL = os.environ.get(
    "CPDB_URL",
    "https://zenodo.org/records/15432946/files/ClimatePolicyDatabase_v2024.csv?download=1",
)
OUT = "cpdb_raw.csv"
UA = {"User-Agent": "ZJU-CMIC-policy-monitor"}


def fetch():
    common.ensure_data_dir()
    try:
        resp = requests.get(URL, timeout=300, headers=UA)
        resp.raise_for_status()
        df = pd.read_csv(io.BytesIO(resp.content), sep=None, engine="python")
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
