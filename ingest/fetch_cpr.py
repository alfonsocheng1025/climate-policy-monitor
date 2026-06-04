"""Tier A — Climate Policy Radar / CCLW from the open Hugging Face dataset.

CPR has NO public API (2026); the open corpus is passage-level Parquet on Hugging Face:
  ClimatePolicyRadar/all-document-text-data  (CC-BY-4.0, ~3.6 GB, lagged ~6 months)
We stream and aggregate passages to document level. Real fields are nested under
`document_metadata.*` (verified 2026-06). For MVP we cap at CPR_MAX_DOCS documents;
full-corpus ingest (downloading parquet shards) is a later optimization.
Requires: pip install datasets.
"""
import os
import pandas as pd
import common

MAX_DOCS = int(os.environ.get("CPR_MAX_DOCS", "200"))
HARD_PASSAGES = int(os.environ.get("CPR_MAX_PASSAGES", "150000"))
OUT = "cpr_raw.csv"
CAT_MAP = {"Legislative": "law", "Executive": "policy", "Litigation": "litigation"}


def _first(v):
    if isinstance(v, (list, tuple)) and v:
        return v[0]
    return v


def fetch():
    common.ensure_data_dir()
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
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
            if i >= HARD_PASSAGES:
                break
            did = row.get("document_id")
            if not did:
                continue
            if did not in docs:
                if len(docs) >= MAX_DOCS:
                    break
                geo = row.get("document_metadata.geographies")
                docs[did] = {
                    "document_id": did,
                    "document_title": (row.get("document_metadata.family_title")
                                       or row.get("document_metadata.document_title")),
                    "geographies": _first(geo),
                    "publication_ts": row.get("document_metadata.publication_ts"),
                    "source_url": row.get("document_metadata.source_url"),
                    "category": row.get("document_metadata.category"),
                    "_text": [],
                }
            t = row.get("text_block.text")
            if t:
                docs[did]["_text"].append(str(t))
        for d in docs.values():
            d["full_text"] = "\n".join(d.pop("_text"))[:200000]
            d["record_type"] = CAT_MAP.get(d.pop("category", None), "policy")
        df = pd.DataFrame(list(docs.values()))
        df.to_csv(common.raw_path(OUT), index=False)
        common.record_fetch("CPR/CCLW", len(df), "partial", f"capped at {MAX_DOCS} docs")
        print(f"[CPR] saved {len(df)} documents")
        return df
    except Exception as e:  # noqa: BLE001
        common.record_fetch("CPR/CCLW", 0, "error", str(e))
        print(f"[CPR] FAILED: {e}")
        return None


if __name__ == "__main__":
    fetch()
