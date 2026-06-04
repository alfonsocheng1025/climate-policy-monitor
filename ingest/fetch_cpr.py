"""Harvest Climate Policy Radar / CCLW from the open Hugging Face dataset.

CPR has NO public API yet (2026); the open corpus is Parquet on Hugging Face:
  ClimatePolicyRadar/all-document-text-data  (CC-BY-4.0, ~3.6 GB, lagged ~6 months)

For MVP we *stream* a capped number of passage rows and aggregate them to document
level. Full-corpus ingest is a later optimization. Requires `pip install datasets`.
Exact column names should be verified against a first real run.
"""
import os
import pandas as pd
import common

MAX_ROWS = int(os.environ.get("CPR_MAX_ROWS", "20000"))  # passages, not documents
OUT = "cpr_raw.csv"


def _first(v):
    if isinstance(v, (list, tuple)) and v:
        return v[0]
    return v


def fetch():
    common.ensure_data_dir()
    try:
        from datasets import load_dataset
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", f"datasets not installed: {e}")
        print("[CPR] `datasets` not installed; skipping (pip install datasets)")
        return None
    try:
        ds = load_dataset("ClimatePolicyRadar/all-document-text-data",
                          split="train", streaming=True)
        docs = {}
        for i, row in enumerate(ds):
            if i >= MAX_ROWS:
                break
            did = row.get("document_id") or row.get("document_name")
            if not did:
                continue
            d = docs.setdefault(did, {
                "document_id": did,
                "document_title": row.get("document_title") or row.get("document_name"),
                "geographies": _first(row.get("geographies") or row.get("geography_iso")),
                "publication_ts": row.get("publication_ts") or row.get("document_date"),
                "source_url": row.get("document_source_url") or row.get("source_url"),
                "_text": [],
            })
            txt = row.get("text_block.text") or row.get("text") or ""
            if txt:
                d["_text"].append(str(txt))
        for d in docs.values():
            d["full_text"] = "\n".join(d.pop("_text"))[:200000]
        df = pd.DataFrame(list(docs.values()))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("CPR/CCLW", len(df), "partial", f"capped at {MAX_ROWS} passages")
        print(f"[CPR] saved {len(df)} documents (from <= {MAX_ROWS} passages)")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", str(e))
        print(f"[CPR] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
